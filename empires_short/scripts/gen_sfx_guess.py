"""Procedural SFX for the "Guess first" format (src/guess): ambient bed, countdown tick, reveal hit.
Separate from gen_sfx.py on purpose, so running it never rewrites the existing sounds. Own seed; writes only guess_*.wav."""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
from pathlib import Path

SR = 48000
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
rng = np.random.default_rng(11)

def save(name, x, peak=0.9):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    wavfile.write(OUT / f"{name}.wav", SR, (np.stack([x, x], axis=1) * 32767).astype(np.int16))

def env(n, a, r):
    e = np.ones(n)
    ai, ri = int(a * SR), int(r * SR)
    e[:ai] = np.linspace(0, 1, ai)
    e[-ri:] *= np.linspace(1, 0, ri) ** 2
    return e

# ---- "Guess first" format (src/guess): ambient bed, countdown tick, reveal hit ----
# bed: 28s low, dark, quiet drone (no melody) with a slow swell and a faint tension rise under the 3 s countdown (2.0–5.0 s)
n = int(28 * SR); t = np.arange(n) / SR
bed = sum(np.sin(2 * np.pi * f * t + ph) * a for f, ph, a in ((41.2, 0, 1.0), (41.9, 1.3, 0.7), (61.7, 0.4, 0.5), (82.4, 2.1, 0.35), (123.5, 0.9, 0.12)))
bed *= 0.8 + 0.2 * np.sin(2 * np.pi * t / 9)
air = sosfilt(butter(2, [200, 900], btype="band", fs=SR, output="sos"), rng.standard_normal(n)) * 0.05
rise = sosfilt(butter(2, [300, 1600], btype="band", fs=SR, output="sos"), rng.standard_normal(n)) * np.clip((t - 2.0) / 3.0, 0, 1) ** 2 * (t < 5.0) * 0.10
save("guess_bed", (bed + air + rise) * env(n, 0.05, 1.0), 0.35)

# tick: woody click, clearer and lower than tick.wav
n = int(0.14 * SR); t = np.arange(n) / SR
tk = np.sin(2 * np.pi * 880 * t) * np.exp(-t * 55) + 0.5 * np.sin(2 * np.pi * 1760 * t) * np.exp(-t * 90) + 0.25 * rng.standard_normal(n) * np.exp(-t * 400)
save("guess_tick", tk, 0.8)

# hit: sub drop + noise crack + low inharmonic tone tail
n = int(1.8 * SR); t = np.arange(n) / SR
sub = np.sin(2 * np.pi * np.cumsum(60 * np.exp(-t * 3.0) + 34) / SR) * np.exp(-t * 2.2)
crack = sosfilt(butter(2, 2500, btype="low", fs=SR, output="sos"), rng.standard_normal(n)) * np.exp(-t * 22)
tone = (np.sin(2 * np.pi * 196 * t) + 0.6 * np.sin(2 * np.pi * 293 * t) + 0.4 * np.sin(2 * np.pi * 415 * t)) * np.exp(-t * 3.2) * 0.35
save("guess_hit", np.tanh((sub * 1.3 + crack * 0.7 + tone) * 1.8), 0.95)
print("guess sfx ->", OUT)
