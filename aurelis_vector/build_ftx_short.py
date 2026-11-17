#!/usr/bin/env python3
"""Build the FTX Short ("How Empires Die"), code-only visuals (FtxShort composition).

Visuals: React/SVG + three.js in Remotion (no hosted image/video APIs). Narration: local
Kokoro via voice_direction (bf_emma). Retention mechanics as the Atari Short: hard-on
hook, an event every ~1-1.5 s keyed to words, SFX, no end card, loop dissolve to frame 0.
"""
import json
import subprocess
import sys
from pathlib import Path

from voice_direction import synthesize
from render_video import render

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent
WORK = ROOT / 'work' / 'ftx_short'
SFX = REPO / 'assets' / 'sfx'
FPS = 30
TAIL = 0.5  # seconds after the last word: loop dissolve back into the hook frame
IMPACTS = {'ftx-vault': 'missing.', 'ftx-bankrupt': 'Bankrupt', 'ftx-end': 'twenty-five'}  # boom lands on these words


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
    """(file, seconds, gain) cues: boom on frame 0, whoosh on every cut, booms on impact words."""
    cues = [('boom', 0.0, 0.55)]
    for beat in timing['beats'][1:]:
        t = max(0.0, beat['startFrame'] / FPS - 0.12)
        cues.append(('whoosh', t, 0.5))
    for beat in timing['beats']:
        word = IMPACTS.get(beat['scene'])
        if word:
            hit = next(c for c in timing['captions']
                       if c['startFrame'] >= beat['startFrame'] and c['word'] == word)
            cues.append(('boom', hit['startFrame'] / FPS, 0.6))
    return cues


def main():
    WORK.mkdir(parents=True, exist_ok=True)
    beats = json.loads((ROOT / 'scripts' / 'ftx_short.json').read_text())
    direction = json.loads((ROOT / 'scripts' / 'ftx_short.delivery.json').read_text())
    align_path, voice_path = synthesize(beats, direction, WORK, 'bf_emma')
    alignment = json.loads(Path(align_path).read_text())
    voice_duration = float(alignment['audioDuration'])
    if voice_duration > 32:
        raise ValueError(f'Narration too long for a ~30s Short: {voice_duration:.2f}s')
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
        'composition': 'FtxShort', 'fps': FPS, 'totalFrames': total,
        'voDuration': voice_duration, 'beats': timed_beats,
        'captions': captions_from_alignment(alignment),
    }
    (ROOT / 'src' / 'ftxShortTiming.json').write_text(json.dumps(timing, indent=2) + '\n')
    (WORK / 'timing.json').write_text(json.dumps(timing, indent=2) + '\n')
    if '--timing-only' in sys.argv:
        print(f'Timing written: VO {voice_duration:.2f}s, {total} frames')
        return

    silent = render(ROOT, WORK, 'ftx_short', timing)

    files = {'boom': SFX / 'boom.wav', 'whoosh': SFX / 'whoosh.wav'}
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
    output = ROOT / 'out' / f'ftx-short.mp4'
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
