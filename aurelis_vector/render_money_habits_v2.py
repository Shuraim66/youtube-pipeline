"""Render the storyboard revision over the approved, unchanged narration.

Run scripts/storyboard_money_habits.py after editorial changes, then this script.
--reuse-audio is accepted only when its cue sheet matches the current storyboard.
"""
import argparse
import json
import subprocess
from pathlib import Path
from render_video import render
from audio_mix import build_mix
from build import loudness_filter

ROOT=Path(__file__).resolve().parent

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--reuse-audio',action='store_true')
    args=parser.parse_args()
    work=ROOT/'work/money_habits-v2'
    timing=json.loads((work/'timing.json').read_text())
    original=json.loads((ROOT/'work/money_habits/timing.json').read_text())
    assert timing['beats']==original['beats'] and timing['captions']==original['captions']
    assert timing['visualShots']==json.loads((ROOT/'src/moneyStoryboard.json').read_text())
    assert timing['composition']=='MoneyHabitsV2'
    mix=work/'audio/mix.wav';normalization=work/'normalization-filter.txt'
    if args.reuse_audio:
        assert json.loads((work/'audio/cue-sheet.json').read_text())==timing['soundEvents']
        assert mix.exists() and normalization.exists()
    else:
        build_mix(timing,str(ROOT/'work/money_habits/vo.wav'),work)
        normalization.write_text(loudness_filter(str(mix)))
    silent=render(ROOT,work,'money_habits-v2',timing,60)
    output=ROOT/'out/money_habits-v2.mp4'
    subprocess.run(['ffmpeg','-y','-hide_banner','-loglevel','error','-i',silent,'-i',str(mix),
        '-c:v','copy','-c:a','aac','-b:a','160k','-af',normalization.read_text(),
        '-ar','48000','-t',str(timing['totalFrames']/timing['fps']),'-movflags','+faststart',str(output)],check=True)
    print(f'Finished: {output}',flush=True)

if __name__=='__main__':main()
