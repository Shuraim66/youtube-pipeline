"""Audit a rendered review copy and its audio stems; writes a review report.

Usage: python audit_production.py out/rothschild-polished.mp4 --work work/rothschild
This measures engineering properties, not perceived musical quality.
"""
import argparse
import json
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf


def run(args):
    return subprocess.run(args, capture_output=True, text=True, check=True)


def db(samples):
    return float(20*np.log10(max(float(np.sqrt(np.mean(samples**2))), 1e-12)))


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('video', type=Path)
    parser.add_argument('--work', type=Path, required=True)
    args=parser.parse_args()
    info=json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(args.video)]).stdout)
    audio=next(s for s in info['streams'] if s['codec_type']=='audio')
    video=next(s for s in info['streams'] if s['codec_type']=='video')
    measured=run(['ffmpeg','-hide_banner','-nostats','-i',str(args.video),'-af',
                  'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json','-f','null','-']).stderr
    loudness=json.loads(measured[measured.rfind('{'):])
    stems={}
    for name in ['voice','music','ducked-music','effects']:
        samples,sr=sf.read(args.work/'audio'/f'{name}.wav',always_2d=True)
        stems[name]=samples
        assert sr==48000 and samples.shape[1]==2, name
        assert np.isfinite(samples).all() and np.max(np.abs(samples))<1, name
    count=min(len(x) for x in stems.values())
    mixed_effects=args.work/'audio'/'ducked-effects.wav'
    if mixed_effects.exists():
        samples,sr=sf.read(mixed_effects,always_2d=True)
        assert sr==48000 and samples.shape[1]==2
        assert np.isfinite(samples).all() and np.max(np.abs(samples))<1
        stems['effects']=samples
        count=min(count,len(samples))
    voice=stems['voice'][:count]
    windows=count//960
    envelope=np.sqrt(np.mean(voice[:windows*960].reshape(windows,960,2)**2,axis=(1,2)))
    speaking=np.repeat(envelope>.03,960)
    original=stems['music'][:len(speaking)][speaking]
    ducked=stems['ducked-music'][:len(speaking)][speaking]
    duck_reduction=db(ducked)-db(original)
    score=stems['ducked-music'][:count]+stems['effects'][:count]
    stereo_difference=db(score[:,0]-score[:,1])
    report={
        'file':str(args.video), 'width':video['width'], 'height':video['height'],
        'duration':float(info['format']['duration']), 'audioChannels':audio['channels'],
        'loudnessLUFS':float(loudness['input_i']), 'truePeakDbTP':float(loudness['input_tp']),
        'musicDuckingDuringSpeechDb':round(duck_reduction,2),
        'musicBelowVoiceDuringSpeechDb':round(db(ducked)-db(voice[:len(speaking)][speaking]),2),
        'stereoScoreSideSignalDb':round(stereo_difference,2),
        'effectsPeakDbFS':round(20*np.log10(np.max(np.abs(stems['effects']))),2),
        'mixQualityListeningReview':'Not established by these numerical checks',
    }
    assert audio['channels']==2, report
    assert abs(report['loudnessLUFS']+14)<=1, report
    assert report['truePeakDbTP']<=-1, report
    assert duck_reduction<-.5, report
    assert report['musicBelowVoiceDuringSpeechDb'] < -12, report
    assert stereo_difference>-65, report
    assert abs(float(video['duration'])-float(audio['duration']))<.1, report
    report['checks']='passed'
    args.video.with_suffix('.audit.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2))


if __name__=='__main__':
    main()
