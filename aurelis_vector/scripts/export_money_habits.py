"""Export review subtitles and YouTube chapter text from the rendered timeline."""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def stamp(seconds):
    ms=round(seconds*1000)
    return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'

def main():
    t=json.loads((ROOT/'work/money_habits/timing.json').read_text())
    out=ROOT/'out'; out.mkdir(exist_ok=True)
    groups=[]
    for b in t['beats']:
        words=[c for c in t['captions'] if b['startFrame']<=c['startFrame']<b['endFrame']]
        group=[]
        for w in words:
            if group and (len(' '.join(c['word'] for c in group))+len(w['word'])>70 or w['startFrame']-group[0]['startFrame']>120):
                groups.append(group);group=[]
            group.append(w)
            if w['word'].endswith(('.', '?', '!')):
                groups.append(group);group=[]
        if group: groups.append(group)
    subtitles=[]
    for i,g in enumerate(groups):
        start=g[0]['startFrame']/t['fps']; end=g[-1]['endFrame']/t['fps']
        subtitles.append(f"{i+1}\n{stamp(start)} --> {stamp(max(end,start+.05))}\n{' '.join(w['word'] for w in g)}\n")
    (out/'money_habits.en.srt').write_text('\n'.join(subtitles))
    lines=['# Money habits - long-form review','',
           'Title: 15 Money Traps That Can Keep You Broke','',
           'Master: money_habits.mp4',
           f"Runtime: {t['totalFrames']/t['fps']:.2f} seconds; 1920 x 1080; 30 fps.",
           'Narration: approved script v2, unchanged apart from excluding the nonspoken Closing label.',
           'Voice: local Kokoro bf_emma. Music and effects: original procedural synthesis.',
           'Visuals: original SVG art and the existing Aurelis guide. New supporting person and shared desk scenes.',
           'No upload or schedule has been performed. Headphone/phone listening remains a human review step.',
           '', '## Chapters','']
    for b in t['beats']:
        if b['data']['shot']==0:
            seconds=int(b['startFrame']/t['fps'])
            lines.append(f"{seconds//60:02}:{seconds%60:02} {b['data']['title']}")
    lines+=['','## Sources','',
            'Claim-level sources and interpretation notes: ../scripts/money_habits_longform.md',
            'Statistics retain their original years and U.S. scope. Fee growth is hypothetical.',
            '', '## Review scope','',
            'Automated measurements do not establish perceived voice delivery or music quality.',
            'Check the final encoded video on headphones and a phone before publication.',
            'The new desk scenes show discussion and document holding; they do not implement a complete ownership-changing handover.',
            'This 15-minute edition keeps the full script. A 10-12-minute cut would require editorial shortening.']
    (out/'money_habits-review.md').write_text('\n'.join(lines)+'\n')
    print(f'Exported {len(groups)} subtitle cues and 17 chapters')

if __name__=='__main__': main()
