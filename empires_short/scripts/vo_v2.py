"""V2 voiceover: Kokoro TTS -> atempo -> faster-whisper -> public/vo/<ep>/{vo.wav, words.json, transcript.txt}.

Usage: python scripts/vo_v2.py <episode> <voice> <lang a|b> <atempo> "<spoken text>" ["<caption text>"]
  spoken text  = what Kokoro reads (may use phonetic spellings)
  caption text = what words.json shows (defaults to the spoken text; must have the same word count)
atempo is applied BEFORE Whisper so the timings match the audio the video plays.
Input words are aligned to Whisper's words with difflib; unmatched words are interpolated.
"""
import difflib, json, os, re, subprocess, sys

import numpy as np
import soundfile as sf
from faster_whisper import WhisperModel
from kokoro import KPipeline

ep, voice, lang, tempo, spoken = sys.argv[1:6]
caption = sys.argv[6] if len(sys.argv) > 6 else spoken
out = os.path.join(os.path.dirname(__file__), "..", "public", "vo", ep)
os.makedirs(out, exist_ok=True)
words = caption.split()
if len(words) != len(spoken.split()):
    sys.exit("caption text and spoken text need the same word count")

pipe = KPipeline(lang_code=lang)
audio = np.concatenate([a for _, _, a in pipe(spoken, voice=voice)])
raw = os.path.join(out, "raw.wav")
sf.write(raw, audio, 24000)
wav = os.path.join(out, "vo.wav")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-af", f"atempo={tempo}", "-ar", "44100", wav], check=True)
os.remove(raw)

model = WhisperModel("small", device="cpu", compute_type="int8")
segs, _ = model.transcribe(wav, word_timestamps=True, language="en")
ww = [(w.word.strip(), float(w.start), float(w.end)) for s in segs for w in s.words if w.word.strip()]
open(os.path.join(out, "transcript.txt"), "w").write(" ".join(w for w, _, _ in ww) + "\n")

norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
a = [norm(w) for w in spoken.split()]
b = [norm(w) for w, _, _ in ww]
times = [None] * len(a)
for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
    for k in range(blk.size):
        times[blk.a + k] = ww[blk.b + k][1:]
# interpolate unmatched runs between their matched neighbours
i = 0
while i < len(times):
    if times[i] is None:
        j = i
        while j < len(times) and times[j] is None:
            j += 1
        lo = times[i - 1][1] if i else 0.0
        hi = times[j][0] if j < len(times) else (ww[-1][2] if ww else lo + 0.3 * (j - i))
        step = (hi - lo) / (j - i)
        for k in range(i, j):
            times[k] = (round(lo + step * (k - i), 3), round(lo + step * (k - i + 1), 3))
        i = j
    else:
        i += 1
res = [{"w": w, "s": round(s, 3), "e": round(e, 3)} for w, (s, e) in zip(words, times)]
json.dump(res, open(os.path.join(out, "words.json"), "w"))
dur = sf.info(wav).duration
matched = sum(1 for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks() for _ in range(blk.size))
print(f"VO {ep}: {dur:.2f}s, {len(words)} words, {len(words) / res[-1]['e']:.2f} w/s spoken, whisper matched {matched}/{len(a)}")
