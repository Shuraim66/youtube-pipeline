#!/usr/bin/env python3
"""Whisper word timings for "Aurelis Test 30" (adapted from oldmoney_whisper.py; faster-whisper small)."""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import muse30_plan as P

ROOT = Path(__file__).resolve().parent.parent
OUT = P.OUT
WAV = ROOT / "empires_short/public/audio/muse30/narration.wav"


def main():
    from faster_whisper import WhisperModel
    model = WhisperModel("small", device="cpu", compute_type="int8")
    segments, _ = model.transcribe(str(WAV), word_timestamps=True, language="en", vad_filter=True)
    words = []
    for seg in segments:
        for w in seg.words or []:
            words.append({"w": w.word, "s": round(w.start, 3), "e": round(w.end, 3)})
    print("transcribed words:", len(words))
    (OUT / "whisper_words.json").write_text(json.dumps({"words": words}))


if __name__ == "__main__":
    main()
