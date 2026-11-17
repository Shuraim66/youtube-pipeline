#!/usr/bin/env python3
"""Render the 11-second code-only Atari sample (AtariSample composition).

No hosted APIs or AI models: visuals are React/SVG/three.js in Remotion; the audio is
the first 11 s of the existing Atari mix (narration + music + SFX), trimmed with a short
fade. Output: out/atari-sample.mp4.
"""
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
WORK = ROOT / 'work' / 'atari_sample'
SECONDS = 11.0


def main():
    WORK.mkdir(parents=True, exist_ok=True)
    silent = WORK / 'silent.mp4'
    subprocess.run(['npx', 'remotion', 'render', 'AtariSample', str(silent), '--gl=angle', '--log=error'],
                   cwd=ROOT, check=True)
    source = ROOT / 'out' / 'atari-short-plates.mp4'  # existing mix; no voice model is run
    out = ROOT / 'out' / 'atari-sample.mp4'
    subprocess.run([
        'ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', str(silent), '-i', str(source),
        '-filter_complex', f'[1:a]atrim=0:{SECONDS},asetpts=PTS-STARTPTS,afade=t=out:st={SECONDS - 0.3}:d=0.3[a]',
        '-map', '0:v:0', '-map', '[a]', '-t', str(SECONDS), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k',
        '-movflags', '+faststart', str(out),
    ], check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-i', str(out), '-f', 'null', '-'], check=True)
    print(f'Built {out}')


if __name__ == '__main__':
    main()
