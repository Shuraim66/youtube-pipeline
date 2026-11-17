"""Procedural SFX for Empire Shorts (no licensing): whoosh, impact, tick, glitch, drone."""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
from pathlib import Path

SR = 48000
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(7)

def save(name, x, peak=0.9):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    st = np.stack([x, x], axis=1) if x.ndim == 1 else x
    wavfile.write(OUT / f"{name}.wav", SR, (st * 32767).astype(np.int16))

def env(n, a, r):
    e = np.ones(n)
    ai, ri = int(a * SR), int(r * SR)
    e[:ai] = np.linspace(0, 1, ai)
    e[-ri:] *= np.linspace(1, 0, ri) ** 2
    return e

# whoosh: band-passed noise sweeping upward, 0.45s
n = int(0.45 * SR); t = np.arange(n) / SR
noise = rng.standard_normal(n)
out = np.zeros(n); blocks = 30
for b in range(blocks):
    s, e_ = b * n // blocks, (b + 1) * n // blocks
    f = 300 + (b / blocks) ** 1.5 * 5000
    sos = butter(2, [f, min(f * 2.2, 20000)], btype="band", fs=SR, output="sos")
    out[s:e_] = sosfilt(sos, noise)[s:e_]
save("whoosh", out * np.sin(np.pi * t / t[-1]) ** 1.5, 0.7)

# impact: sub drop + noise crack + tail
n = int(1.6 * SR); t = np.arange(n) / SR
freq = 70 * np.exp(-t * 2.2) + 32
sub = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t * 2.6)
crack = sosfilt(butter(2, 1800, btype="low", fs=SR, output="sos"), rng.standard_normal(n)) * np.exp(-t * 18)
save("impact", np.tanh((sub * 1.4 + crack * 0.6) * 2), 0.95)

# tick: short click
n = int(0.05 * SR); t = np.arange(n) / SR
save("tick", np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 160), 0.45)

# glitch: bit-crushed stutter
n = int(0.25 * SR); t = np.arange(n) / SR
g = np.sign(np.sin(2 * np.pi * 180 * t)) * (rng.random(n) > 0.4) * ((t * 40).astype(int) % 2)
g = np.round(g * 4) / 4 + sosfilt(butter(2, 3000, btype="high", fs=SR, output="sos"), rng.standard_normal(n)) * 0.3
save("glitch", g * env(n, 0.005, 0.05), 0.4)

# drone: 30s dark pad (detuned low saws, lowpassed, slow swell)
n = int(30 * SR); t = np.arange(n) / SR
pad = sum(((t * f) % 1 * 2 - 1) for f in (55, 55.4, 82.4, 110.3, 65.4))
pad = sosfilt(butter(4, 420, btype="low", fs=SR, output="sos"), pad)
pad *= (0.75 + 0.25 * np.sin(2 * np.pi * t / 7)) * env(n, 1.0, 1.5)
save("drone", pad, 0.5)
print("sfx ->", OUT)
