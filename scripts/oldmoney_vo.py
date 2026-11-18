#!/usr/bin/env python3
"""Kokoro narration for the Old Money video (copy of moneypsych_vo.py, same voice settings): one wav per beat (bf_emma, speed 1.12, atempo 1.06, 0.24 s gap; same settings as AluxTest,
which matches AluxTest line_00 to 2 ms), concatenated to empires_short/public/audio/moneypsych/narration.wav.
Writes out/aurelis_oldmoney/vo_beats.json (beat i, text, spoken, start, dur) and keeps per-beat wavs (skips existing) in out/aurelis_oldmoney/audio/.
Usage: python scripts/moneypsych_vo.py [--force]"""
import json, re, subprocess, sys
from pathlib import Path
import numpy as np, soundfile as sf

sys.path.insert(0, str(Path(__file__).resolve().parent))
import oldmoney_plan as P

ROOT = Path(__file__).resolve().parent.parent
OUT = P.OUT; AUD = OUT / "audio"; AUD.mkdir(parents=True, exist_ok=True)
PUB = ROOT / "empires_short/public/audio/oldmoney"; PUB.mkdir(parents=True, exist_ok=True)
SR, GAP, SPEED, ATEMPO = 24000, 0.24, 1.12, 1.06

PRON = [("22.36%", "twenty-two point three six percent"), ("1850 to 1940", "eighteen fifty to nineteen forty"), ("3,200", "thirty-two hundred"),
        ("2,500", "two thousand five hundred"), ("1,007", "one thousand and seven"), ("401(k)", "four oh one K"), ("10%'s", "ten percent's"),
        ("1.2", "one point two"), ("2022", "twenty twenty-two"), ("2024", "twenty twenty-four"), ("2025", "twenty twenty-five"), ("2026", "twenty twenty-six"),
        ("93%", "ninety-three percent"), ("72%", "seventy-two percent"), ("70%", "seventy percent"), ("90%", "ninety percent"), ("22%", "twenty-two percent"),
        ("37%", "thirty-seven percent"), ("86%", "eighty-six percent"), ("15%", "fifteen percent"), ("24%", "twenty-four percent"), ("43%", "forty-three percent"),
        ("52%", "fifty-two percent"), ("69%", "sixty-nine percent"), ("1%", "one percent"), ("about 31", "about thirty-one"), ("Caring.com", "Caring dot com"), ("YouGov", "You Gov")]


NAMES = {}


NAMES_IPA = {}


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
    for i, bb in enumerate(P.B, 1):
        sec, text = bb["sec"], bb["text"]
        f = AUD / f"line_{i:03d}.wav"; sp = spoken(text)
        if force or not f.exists():
            a = np.concatenate([x for _, _, x in pipe(sp, voice="bf_emma", speed=SPEED)])
            sf.write(str(OUT / "_raw.wav"), a, SR)
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(OUT / "_raw.wav"), "-af", f"atempo={ATEMPO}", "-ar", str(SR), str(f)], check=True)
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
