#!/usr/bin/env python3
"""Kokoro voice per beat for "Aurelis Test 30" (adapted from oldmoney_vo.py). One wav per beat (plus a full file), saved to public/audio/muse30/narration.wav.
Per-beat durations recorded to out/aurelis_muse30/vo_beats.json. PRON fixes only the numbers the narration speaks."""
import json, sys, unicodedata
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import muse30_plan as P

ROOT = Path(__file__).resolve().parent.parent
OUT = P.OUT
PUB = ROOT / "empires_short/public/audio/muse30"
BEATS = [x["text"] for x in P.B]
NAMES = {}
NAMES_IPA = {}
PRON = [("1850 to 1940", "eighteen fifty to nineteen forty"), ("2022", "twenty twenty-two"),
        ("93%", "ninety-three percent"), ("70%", "seventy percent"), ("1%", "one percent")]


def speak(t):
    for a, b in PRON:
        t = t.replace(a, b)
    for a, b in NAMES_IPA.items():
        t = t.replace(a, b)
    for a, b in NAMES.items():
        t = t.replace(a, b)
    return t


def main():
    from kokoro import KPipeline
    import soundfile as sf
    OUT.mkdir(parents=True, exist_ok=True); PUB.mkdir(parents=True, exist_ok=True)
    kp = KPipeline(lang_code="b")
    data = {"beats": [], "sample_rate": 24000, "voice": "bf_emma", "speed": 1.12}
    all_chunks, gap = [], 0.24
    for i, text in enumerate(BEATS, 1):
        seg = kp(speak(text), voice="bf_emma", speed=1.12)
        chunks, pos = [], 0.0
        for _, _, audio in seg:
            chunks.append(audio); pos += audio.shape[0] / 24000.0
        beat_dur = pos + (gap if i < len(BEATS) else 0.0)
        start = sum(b["dur"] for b in data["beats"])
        all_chunks.extend(chunks)
        if i < len(BEATS):
            all_chunks.append(__import__("numpy").zeros(int(gap * 24000)))
        data["beats"].append({"i": i, "sec": P.B[i - 1]["sec"], "text": text, "spoken": speak(text),
                              "start": round(start, 3), "dur": round(beat_dur, 3), "speech_dur": round(pos, 3)})
        print(f"beat {i} ({P.B[i - 1]['sec']}): {pos:.2f} s speech, {beat_dur:.2f} s total")
    import numpy as np
    full = np.concatenate(all_chunks)
    sf.write(PUB / "narration.wav", full, 24000, subtype="PCM_16")
    (OUT / "vo_beats.json").write_text(json.dumps(data))
    print(f"narration.wav: {len(full) / 24000:.2f} s, {len(full)} samples")


if __name__ == "__main__":
    main()
