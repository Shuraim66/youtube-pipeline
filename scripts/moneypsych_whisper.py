#!/usr/bin/env python3
"""faster-whisper transcription of the Money Psychology narration -> out/aurelis_moneypsych_v2/whisper_words.json + transcript.txt"""
import json, sys
from pathlib import Path
from faster_whisper import WhisperModel
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "empires_short/out/aurelis_moneypsych_v2"
wav = ROOT / "empires_short/public/audio/moneypsych/narration.wav"
model = WhisperModel("small", device="cpu", compute_type="int8")
segs, info = model.transcribe(str(wav), word_timestamps=True, language="en", beam_size=5, condition_on_previous_text=False)
words, text = [], []
for s in segs:
    text.append(s.text.strip())
    for w in s.words:
        if w.word.strip():
            words.append({"w": w.word.strip(), "s": round(float(w.start), 3), "e": round(float(w.end), 3)})
    print(round(s.end, 1), flush=True)
json.dump({"duration": round(info.duration, 2), "words": words}, open(OUT / "whisper_words.json", "w"))
(OUT / "transcript.txt").write_text("\n".join(text) + "\n")
print("done", len(words), "words")
