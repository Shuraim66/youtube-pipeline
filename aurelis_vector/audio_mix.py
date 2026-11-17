"""Original procedural score + restrained foley. CPU only, no fetched samples.

Writes separate stems for review, then ducks the music against the dry narrator.
Final programme loudness is measured/normalized by build.py AFTER this mix.
"""
import json
import math
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SR = 48000


def hz(midi):
    return 440 * 2 ** ((midi - 69) / 12)


def stereo(mono, pan=0):
    angle = (np.clip(pan, -1, 1) + 1) * np.pi / 4
    return np.column_stack((mono * np.cos(angle), mono * np.sin(angle))).astype(np.float32)


def add(dest, sound, when, gain=1):
    offset = round(when * SR)
    first = max(0, -offset)
    offset = max(offset, 0)
    count = min(len(sound) - first, len(dest) - offset)
    if count > 0:
        dest[offset:offset+count] += sound[first:first+count] * gain


def fade(sound, attack=.015, release=.1):
    a = min(len(sound), max(1, round(attack * SR)))
    r = min(len(sound), max(1, round(release * SR)))
    sound[:a] *= np.linspace(0, 1, a)
    sound[-r:] *= np.linspace(1, 0, r)
    return sound


def pluck(midi, duration=2.3):
    t = np.arange(round(duration*SR), dtype=np.float32) / SR
    out = np.zeros_like(t)
    for harmonic, weight in [(1, 1), (2, .22), (3, .075), (4, .025)]:
        out += weight*np.sin(2*np.pi*hz(midi)*harmonic*t)*np.exp(-t*(1.8+harmonic*.6))
    return fade(out, .008, .22)


def make_music(timing):
    duration = timing["totalFrames"] / timing["fps"]
    bed = np.zeros((round(duration*SR), 2), dtype=np.float32)
    beat = 60 / 76
    bar = beat * 4
    # Original repeating Dm9 / Bbmaj7 / Fadd9 / Csus2 harmony and sparse ostinato.
    chords = [(50, 57, 60, 64), (46, 53, 57, 62), (48, 53, 57, 60), (48, 55, 60, 62)]
    for section, when in enumerate(np.arange(0, duration, bar*2)):
        current = next((b for b in timing['beats'] if b['startFrame']/timing['fps'] <= when < b['endFrame']/timing['fps']), timing['beats'][-1])
        scene = current['scene'].removeprefix('rothschild-')
        density = 4 if scene in ('office','insight','end') else 8
        if scene.startswith('money-'):
            chapter = current.get('data', {}).get('chapter', 0)
            density = 4 if chapter in (0, 6, 8, 12, 16) else 8
        chord = chords[section % len(chords)]
        length = min(bar*2+1, duration-when)
        t = np.arange(round(length*SR), dtype=np.float32)/SR
        for j, note in enumerate(chord):
            env = np.minimum(t/.7, 1)*np.minimum((length-t)/.9, 1)
            # Close stereo detuning; mono sum remains usable on phone speakers.
            left = np.sin(2*np.pi*hz(note)*.9992*t)+.12*np.sin(4*np.pi*hz(note)*t)
            right = np.sin(2*np.pi*hz(note)*1.0008*t)+.12*np.sin(4*np.pi*hz(note)*t)
            pad = np.column_stack((left*env, right*env)).astype(np.float32)
            add(bed, pad, when, .08 if scene.startswith('money-') and chapter in (0, 12, 16) else .12)
        patterns = [[0,2,1,3,0,1,2,1],[0,1,3,2,1,3,2,0],[2,1,0,3,2,3,1,0]]
        for k in range(density):
            note = chord[patterns[section%3][k]]+12
            sound = stereo(pluck(note), -.35 if k % 2 == 0 else .35)
            position = when+k*beat*(8/density)
            add(bed, sound, position, .32 if k % 2 == 0 else .19)
            add(bed, sound[:, ::-1], position+.19, .045)
        add(bed, stereo(pluck(chord[0]-12, 3.2)), when, .16)
        if scene in ('markets','adapt'):
            for pulse in range(1,4):
                add(bed, stereo(pluck(chord[0]-12, .8)), when+pulse*beat*2, .10)
    # Quiet harmonic resolution supports the final brand hold.
    outro = timing["beats"][-1]["startFrame"] / timing["fps"]
    for j, note in enumerate([50, 57, 62, 65]):
        add(bed, stereo(pluck(note, 3.8), (j-1.5)*.2), outro+j*.17, .17)
    # A musical reduction on the lesson is smooth, not a hard audio cut.
    for b in timing["beats"]:
        if b["scene"].endswith("insight"):
            lo = round(b["startFrame"]/timing["fps"]*SR)
            hi = round(b["endFrame"]/timing["fps"]*SR)
            level = np.ones(hi-lo, dtype=np.float32)*.65
            ramp = min(round(.4*SR), (hi-lo)//2)
            level[:ramp] = np.linspace(1, .65, ramp)
            level[-ramp:] = np.linspace(.65, 1, ramp)
            bed[lo:hi] *= level[:, None]
            # A brief breath before the lesson; smooth fades prevent clicks.
            gate_start, gate_end = max(0,lo-round(.23*SR)), min(len(bed),lo+round(.12*SR))
            n = gate_end-gate_start
            if n > 4:
                gate = np.interp(np.linspace(0,1,n),[0,.3,.7,1],[1,.025,.025,1])
                bed[gate_start:gate_end] *= gate[:,None]
        # Clear space for the key amount rather than accenting every spoken word.
        amount = b.get('data',{}).get('motion',{}).get('amount')
        if amount:
            lo=round((b['startFrame']+amount['start'])/timing['fps']*SR)
            hi=min(len(bed),round((b['startFrame']+amount['end'])/timing['fps']*SR))
            if hi>lo:
                bed[lo:hi] *= (1-.3*np.sin(np.linspace(0,np.pi,hi-lo)))[:,None]
    for channel in range(2):
        bed[:, channel] = fade(bed[:, channel], .35, 1.0)
    rms = float(np.sqrt(np.mean(bed**2)))
    bed *= 10**(-30/20) / max(rms, 1e-9)
    return bed


def make_effect(kind, pitch=0):
    durations = {"ping": .48, "tick": .16, "pen": .65, "paper": .6,
                 "brass": .6, "ink": .6, "resolve": 1.35}
    duration = durations[kind]
    t = np.arange(round(duration*SR), dtype=np.float32)/SR
    rng = np.random.default_rng(7401+list(durations).index(kind))
    if kind in ("ping", "tick", "resolve"):
        base = hz((74 if kind == "ping" else 69 if kind == "tick" else 62)+pitch)
        sound = np.sin(2*np.pi*base*t)*np.exp(-t*(10 if kind == "tick" else 6))
        sound += .15*np.sin(2*np.pi*base*2*t)*np.exp(-t*16)
        if kind == "resolve":
            sound += .45*np.sin(2*np.pi*base*1.5*t)*np.exp(-t*3)
    else:
        noise = rng.normal(0, 1, len(t)).astype(np.float32)
        low, high = (650, 4300) if kind == "paper" else ((1400, 5200) if kind == "pen" else (250, 2700))
        noise = sosfilt(butter(2, [low, high], btype="bandpass", fs=SR, output="sos"), noise)
        envelope = np.sin(np.pi*t/duration)**2
        if kind in ("paper", "pen"):
            envelope *= .28+.72*np.sin(2*np.pi*(13 if kind == "pen" else 6)*t)**4
        sound = noise*envelope
        if kind == "brass":
            sound += .025*np.sin(2*np.pi*hz(62)*t)*envelope
    sound = fade(sound, .008, .045)
    return (sound / max(float(np.max(np.abs(sound))), 1e-9)).astype(np.float32)


def make_effects(timing):
    count = round(timing["totalFrames"]/timing["fps"]*SR)
    effects = np.zeros((count, 2), dtype=np.float32)
    for event in timing.get("soundEvents", []):
        sample = make_effect(event["kind"], event.get("pitch", 0))
        add(effects, stereo(sample, event.get("pan", 0)),
            event["frame"]/timing["fps"], 10**(event["gainDb"]/20))
    # All stems end cleanly if a cue happens close to the composition boundary.
    for channel in range(2):
        effects[:, channel] = fade(effects[:, channel], .005, .08)
    return effects


def run(args):
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *args], check=True)


def build_mix(timing, narration, directory):
    directory = Path(directory) / "audio"
    directory.mkdir(parents=True, exist_ok=True)
    music, effects = make_music(timing), make_effects(timing)
    for name, samples in [("music", music), ("effects", effects)]:
        if not np.all(np.isfinite(samples)) or np.max(np.abs(samples)) >= 1:
            raise ValueError(f"Invalid or clipped {name} stem")
        sf.write(directory/f"{name}.wav", samples, SR, subtype="PCM_24")
    duration = timing["totalFrames"]/timing["fps"]
    # Keep narration centered and dry for intelligibility; spatial width lives in
    # the score/foley. No artificial room reverb or stereo duplication of the voice.
    run(["-i", str(narration), "-af",
         "highpass=f=70,loudnorm=I=-16:TP=-3:LRA=9,apad",
         "-ar", str(SR), "-ac", "2", "-t", str(duration), str(directory/"voice.wav")])
    run(["-i", str(directory/"music.wav"), "-i", str(directory/"voice.wav"),
         "-filter_complex",
         "[0:a][1:a]sidechaincompress=threshold=0.06:ratio=3:attack=20:release=320:knee=2:link=average[m]",
         "-map", "[m]", "-ar", str(SR), str(directory/"ducked-music.wav")])
    run(["-i", str(directory/"effects.wav"), "-i", str(directory/"voice.wav"),
         "-filter_complex",
         "[0:a]volume=2dB[e];[e][1:a]sidechaincompress=threshold=0.1:ratio=2:attack=8:release=160:knee=2:link=average[s]",
         "-map", "[s]", "-ar", str(SR), str(directory/"ducked-effects.wav")])
    run(["-i", str(directory/"voice.wav"), "-i", str(directory/"ducked-music.wav"),
         "-i", str(directory/"ducked-effects.wav"), "-filter_complex",
         "[0:a][1:a][2:a]amix=inputs=3:normalize=0:duration=longest[mix]",
         "-map", "[mix]", "-t", str(duration), "-ar", str(SR),
         "-c:a", "pcm_f32le", str(directory/"mix.wav")])
    (directory/"cue-sheet.json").write_text(json.dumps(timing.get("soundEvents", []), indent=2)+"\n")
    report = {"sampleRate": SR, "channels": 2, "duration": duration,
              "musicRmsDb": round(20*math.log10(float(np.sqrt(np.mean(music**2)))), 2),
              "sfxCount": len(timing.get("soundEvents", [])),
              "source": "Original procedural score and effects; no external recordings"}
    (directory/"mix-report.json").write_text(json.dumps(report, indent=2)+"\n")
    return str(directory/"mix.wav")
