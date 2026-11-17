"""Create exact-scene audio excerpts and a phone-size storyboard for review."""
import argparse
import json
import subprocess
from pathlib import Path


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('video',type=Path)
    p.add_argument('--work',type=Path,required=True)
    args=p.parse_args()
    timeline=json.loads((args.work/'timing.json').read_text())
    folder=args.video.parent/(args.video.stem+'-review')
    folder.mkdir(exist_ok=True)
    lines=['# Rothschild studio review','',f'[Full video](../{args.video.name})','',
           'Listen to the final encoded mix below. These excerpts preserve its level and timing.',
           'Subjective listening has not been performed by the agent.','']
    for b in timeline['beats']:
        scene=b['scene'].removeprefix('rothschild-')
        if scene not in ('office','transaction','insight','adapt'):
            continue
        path=folder/f'{scene}.m4a'
        subprocess.run(['ffmpeg','-y','-hide_banner','-loglevel','error','-i',str(args.video),
                        '-ss',str(b['startFrame']/timeline['fps']),'-t',str((b['endFrame']-b['startFrame'])/timeline['fps']),
                        '-vn','-c:a','aac','-b:a','192k',str(path)],check=True)
        lines.append(f'- [{scene.title()} — {b["startFrame"]/timeline["fps"]:.2f}s]({path.name}): {b["vo"]}')
    frames=[round(b['startFrame']+.7*(b['endFrame']-b['startFrame'])) for b in timeline['beats']]
    select='+'.join(f'eq(n,{f})' for f in frames)
    subprocess.run(['ffmpeg','-y','-hide_banner','-loglevel','error','-i',str(args.video),
                    '-vf',f"select='{select}',scale=270:480,tile=4x2",'-frames:v','1',str(folder/'storyboard.jpg')],check=True)
    lines+=['','![Scene samples](storyboard.jpg)','',
            'Check the singular and plural name, the pause before the amount, the lesson cadence,',
            'speech clarity over paper/pen sounds, and the ending on headphones and a phone speaker.']
    (folder/'README.md').write_text('\n'.join(lines)+'\n')
    print(folder/'README.md')


if __name__=='__main__':
    main()
