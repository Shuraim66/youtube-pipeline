"""Scene-directed local narration with native Kokoro token alignment.

Cache identity includes text, delivery settings, voice and implementation version.
No positional pairing with recognized words, pitch shifting or voice replacement.
"""
import hashlib
import json
import re
from pathlib import Path

import numpy as np
import soundfile as sf

VERSION = 2
SR = 24000


def cache_key(beats, direction, voice):
    payload = {'text': [b['vo'] for b in beats], 'direction': direction,
               'voice': voice, 'version': VERSION}
    return hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()


def token_alignment(text, tokens, duration):
    """Fail closed on text drift; interpolate characters only inside native tokens."""
    starts, ends = np.zeros(len(text)), np.zeros(len(text))
    cursor = 0
    for token in tokens:
        literal = token.text
        if not literal:
            continue
        pos = text.find(literal, cursor)
        if pos < 0 or text[cursor:pos].strip():
            raise ValueError(f'Native token mismatch near {text[cursor:cursor+40]!r}: {literal!r}')
        last = ends[cursor-1] if cursor else 0
        starts[cursor:pos] = ends[cursor:pos] = last
        a = token.start_ts if token.start_ts is not None else last
        b = token.end_ts if token.end_ts is not None else a
        a = max(last, min(a, duration))
        b = max(a, min(b, duration))
        starts[pos:pos+len(literal)] = np.linspace(a, b, len(literal), endpoint=False)
        ends[pos:pos+len(literal)] = np.linspace(a, b, len(literal)+1)[1:]
        cursor = pos+len(literal)
    if text[cursor:].strip():
        raise ValueError(f'Unaligned narration: {text[cursor:]!r}')
    starts[cursor:] = ends[cursor:] = ends[cursor-1] if cursor else 0
    return starts.tolist(), ends.tolist()


def token_alignment_alias(display, spoken, tokens, duration):
    """Align spoken aliases to the correctly spelled display transcript."""
    native_start, native_end = token_alignment(spoken, tokens, duration)
    display_words = list(re.finditer(r'\S+', display))
    spoken_words = list(re.finditer(r'\S+', spoken))
    if len(display_words) != len(spoken_words):
        raise ValueError(f'Alias changed word count: {display!r} -> {spoken!r}')
    starts, ends = np.zeros(len(display)), np.zeros(len(display))
    cursor = 0
    for dw, sw in zip(display_words, spoken_words):
        starts[cursor:dw.start()] = ends[cursor:dw.start()] = ends[cursor-1] if cursor else 0
        a = native_start[sw.start()]
        b = native_end[sw.end()-1]
        starts[dw.start():dw.end()] = np.linspace(a,b,dw.end()-dw.start(),endpoint=False)
        ends[dw.start():dw.end()] = np.linspace(a,b,dw.end()-dw.start()+1)[1:]
        cursor=dw.end()
    if cursor < len(display):
        starts[cursor:] = ends[cursor:] = ends[cursor-1] if cursor else 0
    return starts.tolist(), ends.tolist()


def apply_aliases(text, aliases):
    if not aliases:
        return text
    pattern = r'\b(?:'+'|'.join(re.escape(k) for k in sorted(aliases,key=len,reverse=True))+r')\b'
    return re.sub(pattern, lambda m: aliases[m.group()], text)


def synthesize(beats, direction, directory, voice='bf_emma'):
    directory = Path(directory)
    directory.mkdir(parents=True, exist_ok=True)
    key = cache_key(beats, direction, voice)
    manifest = directory/'delivery.json'
    if manifest.exists() and all((directory/name).exists() for name in ['vo.wav', 'vo.json']):
        if json.loads(manifest.read_text()).get('cacheKey') == key:
            return str(directory/'vo.json'), str(directory/'vo.wav')
    import torch
    from kokoro import KPipeline
    torch.set_num_threads(4)
    pipe = KPipeline(lang_code='b', repo_id='hexgrad/Kokoro-82M')
    chunks, characters, starts, ends, windows, deliveries = [], [], [], [], [], []
    count = 0
    for index, beat in enumerate(beats):
        settings = direction.get(beat['scene'], {})
        aliases = direction.get('ttsAliases', {})
        speed = float(settings.get('speed', 1.05))
        if not .85 <= speed <= 1.2:
            raise ValueError('Delivery speed must remain between .85 and 1.2')
        pieces = settings.get('phrases') or re.split(r'(?<=[.!?])\s+', beat['vo'])
        if ' '.join(pieces) != beat['vo']:
            raise ValueError(f'Delivery phrases changed script text: {beat["scene"]}')
        beat_start = count/SR
        for p_index, phrase in enumerate(pieces):
            if characters:
                characters.append(' '); starts.append(count/SR); ends.append(count/SR)
            spoken_phrase = apply_aliases(phrase, aliases)
            phrase_speeds = settings.get('phraseSpeeds', [speed]*len(pieces))
            if len(phrase_speeds) != len(pieces) or not all(.85<=s<=1.2 for s in phrase_speeds):
                raise ValueError('Provide one valid speed per delivery phrase')
            results = list(pipe(spoken_phrase, voice=voice, speed=phrase_speeds[p_index], split_pattern=None))
            if len(results) != 1:
                raise ValueError('Split delivery phrases to stay within Kokoro token capacity')
            result = results[0]
            samples = result.audio.detach().cpu().numpy().astype(np.float32)
            a, b = (token_alignment(phrase, result.tokens, len(samples)/SR)
                    if spoken_phrase == phrase else
                    token_alignment_alias(phrase, spoken_phrase, result.tokens, len(samples)/SR))
            characters.extend(phrase)
            starts.extend(count/SR+x for x in a)
            ends.extend(count/SR+x for x in b)
            chunks.append(samples); count += len(samples)
            gap = float(settings.get('phrasePause', .08)) if p_index < len(pieces)-1 else float(settings.get('pauseAfter', .12))
            if not 0 <= gap <= 1:
                raise ValueError('Narration pauses must be 0–1 seconds')
            silence = np.zeros(round(gap*SR), dtype=np.float32)
            chunks.append(silence); count += len(silence)
        windows.append([beat_start, count/SR])
        deliveries.append({'scene':beat['scene'], 'speed':speed, 'phrases':pieces, 'phraseSpeeds':phrase_speeds,
                           'start':beat_start, 'end':count/SR})
        print(f'[voice] {index+1}/{len(beats)} {beat["scene"]}: {count/SR-beat_start:.2f}s', flush=True)
    audio = np.concatenate(chunks)
    if ''.join(characters) != ' '.join(b['vo'] for b in beats):
        raise ValueError('Directed voice text differs from script')
    sf.write(directory/'vo.wav', audio, SR, subtype='PCM_24')
    alignment = {'characters':characters, 'character_start_times_seconds':starts,
                 'character_end_times_seconds':ends, 'beatWindows':windows,
                 'audioDuration':len(audio)/SR, 'alignmentMethod':'Kokoro native tokens'}
    (directory/'vo.json').write_text(json.dumps(alignment))
    manifest.write_text(json.dumps({'cacheKey':key,'voice':voice,'version':VERSION,
                                   'delivery':deliveries}, indent=2)+'\n')
    return str(directory/'vo.json'), str(directory/'vo.wav')


def acoustic_prominence(captions, path, fps):
    """Measure energy and duration as a salience proxy, not a linguistic stress detector.

    Editorial selection remains the gate: only chosen key phrases animate. The
    recorded measurements modulate their amplitude and survive voice revisions.
    """
    audio, sr = sf.read(path)
    if audio.ndim > 1:
        audio = audio.mean(axis=1)
    values = []
    for word in captions:
        lo, hi = round(word['startFrame']/fps*sr), round(word['endFrame']/fps*sr)
        sample = audio[lo:max(lo+1,hi)]
        rms = np.sqrt(np.mean(sample**2)) if len(sample) else 0
        energy = float(20*np.log10(max(rms, 1e-8)))
        duration = (hi-lo)/sr/max(1,len(re.sub(r'\W','',word['word'])))
        values.append((energy,duration))
    for i, word in enumerate(captions):
        local = np.array(values[max(0,i-5):i+6])
        e,d = values[i]
        z = .7*(e-np.median(local[:,0]))/max(3,np.std(local[:,0]))
        z += .3*(d-np.median(local[:,1]))/max(.02,np.std(local[:,1]))
        word['prominence'] = round(float(np.clip(.5+z*.2,0,1)),3)
        word['energyDb'] = round(e,2)
    return captions
