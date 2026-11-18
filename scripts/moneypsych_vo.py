#!/usr/bin/env python3
"""Kokoro narration for the Money Psychology video: one wav per beat (bf_emma, speed 1.12, atempo 1.06, 0.24 s gap; same settings as AluxTest,
which matches AluxTest line_00 to 2 ms), concatenated to empires_short/public/audio/moneypsych/narration.wav.
Writes out/aurelis_moneypsych_v2/vo_beats.json (beat i, text, spoken, start, dur) and keeps per-beat wavs (skips existing) in out/aurelis_moneypsych_v2/audio/.
Usage: python scripts/moneypsych_vo.py [--force]"""
import json, re, subprocess, sys
from pathlib import Path
import numpy as np, soundfile as sf

sys.path.insert(0, str(Path(__file__).resolve().parent))
import moneypsych_plan as P

ROOT = Path(__file__).resolve().parent.parent
OUT = P.OUT; AUD = OUT / "audio"; AUD.mkdir(parents=True, exist_ok=True)
PUB = ROOT / "empires_short/public/audio/moneypsych"; PUB.mkdir(parents=True, exist_ok=True)
SR, GAP, SPEED, ATEMPO = 24000, 0.24, 1.12, 1.06

PRON = [("$50,000 to $150,000", "fifty thousand dollars to one hundred and fifty thousand dollars"), ("$400", "four hundred dollars"),
        ("66,465", "sixty-six thousand, four hundred and sixty-five"), ("35,000", "thirty-five thousand"),
        ("11.4%", "eleven point four percent"), ("17.9%", "seventeen point nine percent"), ("16.4%", "sixteen point four percent"),
        ("3.5% to 13.6%", "three point five percent to thirteen point six percent"), ("63%", "sixty-three percent"), ("37%", "thirty-seven percent"),
        ("86%", "eighty-six percent"), ("13-point", "thirteen-point"), ("1991 to 1996", "nineteen ninety-one to nineteen ninety-six"),
        ("1979", "nineteen seventy-nine"), ("1992", "nineteen ninety-two"), ("2011", "twenty eleven"), ("2015", "twenty fifteen"),
        ("2013", "twenty thirteen"), ("2000", "two thousand"), ("2001", "two thousand and one"), ("2004", "two thousand and four"),
        ("2025", "twenty twenty-five"), ("2026", "twenty twenty-six"), ("50 and over", "fifty and over"), ("40 months", "forty months"),
        ("401(k)", "four oh one K")]


NAMES = {"Kuhn": "Koon", "Kooreman": "Koreman", "Soetevent": "Sootevent", "Kapteyn": "Kaptine", "Skiba": "Skeeba", "Odean": "Odeen", "Shea": "Shay",
         "Thaler": "Thayler", "Brigitte": "Brizheet", "Prelec": "Prelek"}     # spoken-only respellings (first pass was mis-heard by Whisper)


NAMES_IPA = {"Kapteyn": "kæptˈIn", "Skiba": "skˈibɑ"}   # user listening notes: "kap-TINE", "SKEE-bah" (misaki: I = /aɪ/)        # name -> IPA, e.g. {"Kuhn": "kˈun"}; filled in from the user's listening notes. Kokoro/misaki reads "[Kuhn](/kˈun/)" as that phoneme string.


def spoken(t):
    for a, b in PRON:
        t = t.replace(a, b)
    for a, b in NAMES.items():
        if a not in NAMES_IPA: t = re.sub(rf"\b{a}\b", b, t)
    for a, ipa in NAMES_IPA.items():
        t = re.sub(rf"\b{a}\b", f"[{a}](/{ipa}/)", t)
    return t


def main():
    from kokoro import KPipeline
    force = "--force" in sys.argv
    pipe = KPipeline(lang_code="b", repo_id="hexgrad/Kokoro-82M")
    beats, chunks, t = [], [], 0.0
    for i, (sec, text, *_r) in enumerate(P.B, 1):
        f = AUD / f"line_{i:03d}.wav"; sp = spoken(text)
        if force or not f.exists():
            a = np.concatenate([x for _, _, x in pipe(sp, voice="bf_emma", speed=SPEED)])
            sf.write("/tmp/_mp_raw.wav", a, SR)
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "/tmp/_mp_raw.wav", "-af", f"atempo={ATEMPO}", "-ar", str(SR), str(f)], check=True)
        a, sr = sf.read(f); assert sr == SR
        a = np.concatenate([a, np.zeros(int(GAP * SR))])
        beats.append({"i": i, "sec": sec, "text": text, "spoken": sp, "start": round(t, 3), "dur": round(len(a) / SR, 3)})
        chunks.append(a); t += len(a) / SR
        print(i, round(t, 1), flush=True)
    sf.write(PUB / "narration.wav", np.concatenate(chunks), SR)
    json.dump({"total": round(t, 3), "beats": beats}, open(OUT / "vo_beats.json", "w"), indent=1)
    print("TOTAL", round(t, 2), "s =", f"{int(t // 60)}:{t % 60:04.1f}")


if __name__ == "__main__":
    main()
