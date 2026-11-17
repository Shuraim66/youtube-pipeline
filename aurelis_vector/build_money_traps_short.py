#!/usr/bin/env python3
"""Build a 30-second vertical Aurelis Short that points to the money-habits episode."""
import json
import subprocess
from pathlib import Path

from voice_direction import synthesize
from render_video import render

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent
WORK = ROOT / 'work' / 'money_traps_short'
FPS = 30
TOTAL = 900


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


def main():
    WORK.mkdir(parents=True, exist_ok=True)
    beats = json.loads((ROOT / 'scripts' / 'money_traps_short.json').read_text())
    direction = json.loads((ROOT / 'scripts' / 'money_traps_short.delivery.json').read_text())
    align_path, voice_path = synthesize(beats, direction, WORK, 'bf_emma')
    alignment = json.loads(Path(align_path).read_text())
    voice_duration = float(alignment['audioDuration'])
    if voice_duration > 29.3:
        raise ValueError(f'Narration is too long for the 30-second Short: {voice_duration:.2f}s')

    windows = alignment['beatWindows']
    timed_beats = []
    for index, beat in enumerate(beats):
        start, end = windows[index]
        timed_beats.append({
            **beat,
            'startFrame': round(start * FPS),
            'endFrame': TOTAL if index == len(beats) - 1 else round(end * FPS),
        })
    timing = {
        'composition': 'MoneyLeaksShort', 'fps': FPS, 'totalFrames': TOTAL,
        'voDuration': voice_duration, 'beats': timed_beats,
        'captions': captions_from_alignment(alignment),
    }
    timing_path = ROOT / 'src' / 'moneyLeaksShortTiming.json'
    timing_path.write_text(json.dumps(timing, indent=2) + '\n')
    (WORK / 'timing.json').write_text(json.dumps(timing, indent=2) + '\n')

    silent = render(ROOT, WORK, 'money_traps_short', timing)
    music = ROOT / 'work' / 'money_habits-v2' / 'audio' / 'music.wav'
    output = ROOT / 'out' / 'money-traps-short.mp4'
    output.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run([
        'ffmpeg', '-y', '-hide_banner', '-loglevel', 'error',
        '-i', silent, '-i', voice_path, '-i', str(music),
        '-filter_complex',
        '[1:a]aresample=48000,aformat=channel_layouts=stereo,apad,atrim=duration=30[voice];'
        '[2:a]atrim=start=0:duration=30,aresample=48000,volume=0.09,'
        'afade=t=out:st=27:d=3[music];'
        '[voice][music]amix=inputs=2:duration=longest:normalize=0,'
        # Leave extra headroom for AAC true-peak overshoot after encoding.
        'loudnorm=I=-14:TP=-2.0:LRA=11[audio]',
        '-map', '0:v:0', '-map', '[audio]', '-t', '30',
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
    duration = float(info['format']['duration'])
    audio = next(s for s in info['streams'] if s['codec_type'] == 'audio')
    if (video['width'], video['height'], video['r_frame_rate'], audio['channels']) != (1080, 1920, '30/1', 2):
        raise ValueError(f'Unexpected Short video format: {video}')
    if abs(duration - 30) > 0.08:
        raise ValueError(f'Expected a 30-second Short, got {duration:.3f}s')
    subprocess.run(['ffmpeg', '-v', 'error', '-i', str(output), '-f', 'null', '-'], check=True)
    print(f'Built {output} ({duration:.2f}s, 1080x1920/30fps; VO {voice_duration:.2f}s)')


if __name__ == '__main__':
    main()
