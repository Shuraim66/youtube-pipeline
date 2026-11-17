#!/usr/bin/env python3
"""Build the Atari Short — "How Empires Die" series, retention-first, Aurelis/Alux brand.

Retention mechanics (vs the Pan Am Short, ~10% stayed-to-watch): an open-loop paradox
hook answered at the end; frame 0 already in motion with a hard-on hook; a visual event
every ~1-1.5 s keyed to spoken words; impact/whoosh SFX; no end card, and the last frames
dissolve into frame 0 (loop). Runtime is set by the narration.
Looks: default = code-drawn vector (`AtariShort`); `--variant plates` = the same Short over
AI-illustrated scene plates (`AtariShortPlates`, see gen_scene_plates.py) -> out/atari-short-plates.mp4.
"""
import json
import subprocess
import sys
from pathlib import Path

from voice_direction import synthesize
from render_video import render

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent
WORK = ROOT / 'work' / 'atari_short'
SFX = REPO / 'assets' / 'sfx'
FPS = 30
TAIL = 0.5  # seconds after the last word: loop dissolve back into the hook frame
IMPACTS = {'atari-flop': 'flopped.', 'atari-loss': 'lost'}  # boom lands on these words


def captions_from_alignment(alignment):
    chars = alignment['characters']
    starts = alignment['character_start_times_seconds']
    ends = alignment['character_end_times_seconds']
    output = []
    i = 0
    while i < len(chars):
        if chars[i].isspace():
            i += 1
            continue
        start = i
        while i < len(chars) and not chars[i].isspace():
            i += 1
        output.append({
            'word': ''.join(chars[start:i]),
            'startFrame': round(starts[start] * FPS),
            'endFrame': round(ends[i - 1] * FPS),
        })
    return output


def sfx_cues(timing):
    """(file, seconds, gain) cues: boom on frame 0, reversed whoosh into the rewind,
    whoosh on every other cut, booms on the flop and the loss."""
    cues = [('boom', 0.0, 0.55)]
    for beat in timing['beats'][1:]:
        t = max(0.0, beat['startFrame'] / FPS - 0.12)
        cues.append(('rewind' if beat['scene'] == 'atari-buy' else 'whoosh', t, 0.5))
    for beat in timing['beats']:
        word = IMPACTS.get(beat['scene'])
        if word:
            hit = next(c for c in timing['captions']
                       if c['startFrame'] >= beat['startFrame'] and c['word'] == word)
            cues.append(('boom', hit['startFrame'] / FPS, 0.6))
    return cues


def main():
    WORK.mkdir(parents=True, exist_ok=True)
    beats = json.loads((ROOT / 'scripts' / 'atari_short.json').read_text())
    direction = json.loads((ROOT / 'scripts' / 'atari_short.delivery.json').read_text())
    align_path, voice_path = synthesize(beats, direction, WORK, 'bf_emma')
    alignment = json.loads(Path(align_path).read_text())
    voice_duration = float(alignment['audioDuration'])
    if voice_duration > 30:
        raise ValueError(f'Narration too long for a sub-30s Short: {voice_duration:.2f}s')
    total = round((voice_duration + TAIL) * FPS)

    windows = alignment['beatWindows']
    timed_beats = []
    for index, beat in enumerate(beats):
        start, end = windows[index]
        timed_beats.append({
            **beat,
            'startFrame': round(start * FPS),
            'endFrame': total if index == len(beats) - 1 else round(end * FPS),
        })
    timing = {
        'composition': 'AtariShort', 'fps': FPS, 'totalFrames': total,
        'voDuration': voice_duration, 'beats': timed_beats,
        'captions': captions_from_alignment(alignment),
    }
    (ROOT / 'src' / 'atariShortTiming.json').write_text(json.dumps(timing, indent=2) + '\n')
    (WORK / 'timing.json').write_text(json.dumps(timing, indent=2) + '\n')
    if '--timing-only' in sys.argv:
        print(f'Timing written: VO {voice_duration:.2f}s, {total} frames')
        return

    # --variant plates: same timing/audio over AI-illustrated scene plates (option A test).
    plates = '--variant' in sys.argv and sys.argv[sys.argv.index('--variant') + 1] == 'plates'
    suffix = '-plates' if plates else ''
    render_dir = WORK / ('plates' if plates else '.')
    render_dir.mkdir(parents=True, exist_ok=True)
    silent = render(ROOT, render_dir, 'atari_short',
                    {**timing, 'composition': 'AtariShortPlates' if plates else 'AtariShort'})

    # Rewind SFX = reversed whoosh, pitched down.
    rewind = WORK / 'rewind.wav'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(SFX / 'whoosh.wav'),
                    '-af', 'areverse,asetrate=44100*0.8,aresample=48000', str(rewind)], check=True)
    files = {'boom': SFX / 'boom.wav', 'whoosh': SFX / 'whoosh.wav', 'rewind': rewind}
    cues = sfx_cues(timing)
    duration = total / FPS
    music = ROOT / 'work' / 'money_habits-v2' / 'audio' / 'music.wav'
    inputs = ['-i', silent, '-i', voice_path, '-i', str(music)]
    chains, labels = [], []
    for n, (name, t, gain) in enumerate(cues):
        inputs += ['-i', str(files[name])]
        ms = round(t * 1000)
        chains.append(f'[{n + 3}:a]aresample=48000,aformat=channel_layouts=stereo,'
                      f'volume={gain},adelay={ms}|{ms}[s{n}]')
        labels.append(f'[s{n}]')
    graph = ';'.join([
        f'[1:a]aresample=48000,aformat=channel_layouts=stereo,apad,atrim=duration={duration}[voice]',
        f'[2:a]atrim=start=0:duration={duration},aresample=48000,aformat=channel_layouts=stereo,'
        f'volume=0.11,afade=t=in:d=0.05[music]',
        *chains,
        f'[voice][music]{"".join(labels)}amix=inputs={2 + len(labels)}:duration=first:normalize=0,'
        'loudnorm=I=-14:TP=-2.0:LRA=11[audio]',
    ])
    output = ROOT / 'out' / f'atari-short{suffix}.mp4'
    subprocess.run([
        'ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', *inputs,
        '-filter_complex', graph, '-map', '0:v:0', '-map', '[audio]', '-t', f'{duration}',
        '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-ac', '2',
        '-movflags', '+faststart', str(output),
    ], check=True)
    probe = subprocess.run([
        'ffprobe', '-v', 'error', '-show_entries',
        'stream=codec_type,width,height,r_frame_rate,channels:format=duration',
        '-of', 'json', str(output),
    ], check=True, capture_output=True, text=True)
    info = json.loads(probe.stdout)
    video = next(s for s in info['streams'] if s['codec_type'] == 'video')
    audio = next(s for s in info['streams'] if s['codec_type'] == 'audio')
    if (video['width'], video['height'], video['r_frame_rate'], audio['channels']) != (1080, 1920, '30/1', 2):
        raise ValueError(f'Unexpected Short video format: {video}')
    subprocess.run(['ffmpeg', '-v', 'error', '-i', str(output), '-f', 'null', '-'], check=True)
    print(f'Built {output} ({float(info["format"]["duration"]):.2f}s; VO {voice_duration:.2f}s; {len(cues)} SFX cues)')


if __name__ == '__main__':
    main()
