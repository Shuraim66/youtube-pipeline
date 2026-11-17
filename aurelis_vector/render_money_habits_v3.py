"""Render the Rothschild-art-direction edition with approved v2 timing and audio."""
import json
import subprocess
from pathlib import Path
from render_video import render

ROOT=Path(__file__).resolve().parent

def main():
    source=ROOT/'work/money_habits-v2'
    work=ROOT/'work/money_habits-v3'
    work.mkdir(exist_ok=True)
    timing=json.loads((source/'timing.json').read_text())
    original=json.loads((ROOT/'work/money_habits/timing.json').read_text())
    assert timing['beats']==original['beats'] and timing['captions']==original['captions']
    assert timing['visualShots']==json.loads((ROOT/'src/moneyStoryboard.json').read_text())
    assert timing['soundEvents']==json.loads((source/'audio/cue-sheet.json').read_text())
    timing['composition']='MoneyHabitsV3'
    (work/'timing.json').write_text(json.dumps(timing,indent=2)+'\n')
    silent=render(ROOT,work,'money_habits-v3',timing,60)
    output=ROOT/'out/money_habits-v3.mp4'
    # Stream-copy the audited AAC programme; this edition changes visuals only.
    subprocess.run(['ffmpeg','-y','-hide_banner','-loglevel','error','-i',silent,
        '-i',str(ROOT/'out/money_habits-v2.mp4'),'-map','0:v:0','-map','1:a:0',
        '-c','copy','-t',str(timing['totalFrames']/timing['fps']),
        '-movflags','+faststart',str(output)],check=True)
    print(f'Finished: {output}',flush=True)

if __name__=='__main__':main()
