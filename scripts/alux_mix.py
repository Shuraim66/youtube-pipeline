#!/usr/bin/env python3
"""Alux test audio: narration + existing music bed (assets/audio/aurelis_bed.wav).
Bed: looped to length, level set so that DURING SPEECH it sits ~22 dB below the voice (sidechain-ducked), then the mix gets a
two-pass loudnorm to -14 LUFS / -1.5 dBTP. Output: empires_short/public/audio/alux_test/narration_mix.wav
Usage: python scripts/alux_mix.py"""
import json, re, subprocess, sys, wave
from pathlib import Path
import numpy as np

R = Path(__file__).resolve().parent.parent / "empires_short"
VO = R / "public/audio/alux_test/narration_trap2.wav"
BED = R.parent / "assets/audio/aurelis_bed.wav"                   # 53.5 s music bed (tracked asset; the old experiments/ copy was lost)
OUT = R / "public/audio/alux_test/narration_mix.wav"
TIM = json.loads((R / "experiments/alux_test/beats_timing.json").read_text())
TOTAL = TIM["total"] + 1.0
TMP = Path("/tmp/cl_scratch/mix"); TMP.mkdir(parents=True, exist_ok=True)
TARGET_DB = -22.0                                  # bed level relative to the voice during speech

def ff(*a):
    r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *a], capture_output=True, text=True)
    if r.returncode: sys.exit(r.stderr)

def load(p):
    with wave.open(str(p)) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        return x.reshape(-1, w.getnchannels()).mean(1), w.getframerate()

def speech_rms_db(p):
    x, sr = load(p); acc = []
    for w in TIM["words"]:
        seg = x[int(w["s"] * sr):int(w["e"] * sr)]
        if len(seg): acc.append(seg)
    s = np.concatenate(acc); return 20 * np.log10(np.sqrt((s ** 2).mean()) + 1e-9)

ff("-i", str(VO), "-af", f"apad=whole_dur={TOTAL},aformat=sample_rates=44100:channel_layouts=stereo", "-t", str(TOTAL), "-c:a", "pcm_s16le", str(TMP / "vo.wav"))
ff("-i", str(BED), "-i", str(BED), "-filter_complex",
   f"[0][1]acrossfade=d=2,atrim=0:{TOTAL},afade=t=in:d=1.5,afade=t=out:st={TOTAL - 2.5}:d=2.5,aformat=sample_rates=44100:channel_layouts=stereo[b]", "-map", "[b]", "-c:a", "pcm_s16le", str(TMP / "bed.wav"))

def duck(gain_db):
    ff("-i", str(TMP / "bed.wav"), "-i", str(TMP / "vo.wav"), "-filter_complex",
       f"[0]volume={gain_db}dB[b];[b][1]sidechaincompress=threshold=0.03:ratio=6:attack=25:release=450:makeup=1[d]", "-map", "[d]", "-c:a", "pcm_s16le", str(TMP / "bed_duck.wav"))
    return speech_rms_db(TMP / "bed_duck.wav") - speech_rms_db(TMP / "vo.wav")

g = -13.0
for _ in range(3):                                  # converge the speech-time bed-vs-voice difference onto the target
    d = duck(g); print(f"bed gain {g:+.1f} dB -> bed during speech is {d:+.1f} dB vs voice")
    if abs(d - TARGET_DB) < 0.5: break
    g += TARGET_DB - d
ff("-i", str(TMP / "vo.wav"), "-i", str(TMP / "bed_duck.wav"), "-filter_complex", "amix=inputs=2:normalize=0:duration=longest", "-c:a", "pcm_s16le", str(TMP / "mix_raw.wav"))

I, TP, LRA = -14.0, -1.5, 11.0                      # two-pass loudnorm
p1 = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(TMP / "mix_raw.wav"), "-af", f"loudnorm=I={I}:TP={TP}:LRA={LRA}:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", p1, re.S).group(0))
print("pass 1 measured:", {k: m[k] for k in ("input_i", "input_tp", "input_lra", "input_thresh")})
ff("-i", str(TMP / "mix_raw.wav"), "-af", f"loudnorm=I={I}:TP={TP}:LRA={LRA}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample=44100",
   "-c:a", "pcm_s16le", str(OUT))
chk = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(OUT), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
print("final:", re.findall(r"\s+I:\s+(-?[\d.]+) LUFS", chk)[-1], "LUFS,", re.findall(r"Peak:\s+(-?[\d.]+) dBFS", chk)[-1], "dBTP; speech bed offset after norm unchanged (linear gain)")
print("wrote", OUT)
