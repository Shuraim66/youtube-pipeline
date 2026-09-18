"""Local voice for the v2 builders: Kokoro TTS + Whisper word timestamps ->
vo.mp3 + vo.json in ElevenLabs alignment format (characters / start / end times),
so the existing subs() + beat-timing code in the builders works UNCHANGED.
Usage: python kokoro_align.py "<full text>" <voice> <lang a|b> <out_dir>
"""
import sys, json, subprocess, os, re
import numpy as np
from kokoro import KPipeline
import soundfile as sf
from faster_whisper import WhisperModel

text = sys.argv[1]; voice = sys.argv[2]; lang = sys.argv[3]; outdir = sys.argv[4]
os.makedirs(outdir, exist_ok=True)

# 1) Kokoro TTS (full text)
pipe = KPipeline(lang_code=lang)
chunks = [audio for _, _, audio in pipe(text, voice=voice)]
audio = np.concatenate(chunks) if len(chunks) > 1 else chunks[0]
sf.write(outdir + "/vo.wav", audio, 24000)
subprocess.run(["ffmpeg", "-y", "-i", outdir + "/vo.wav", "-ar", "44100", outdir + "/vo.mp3"],
               check=True, stderr=subprocess.DEVNULL)

# 2) Whisper word timestamps
m = WhisperModel("small", device="cpu", compute_type="int8")
segs, _ = m.transcribe(outdir + "/vo.wav", word_timestamps=True)
wwords = [(float(w.start), float(w.end)) for s in segs for w in s.words if w.word.strip()]

# 3) Align input words (in order) to whisper words -> EL-format char arrays over the INPUT text
input_words = [(mt.start(), mt.end()) for mt in re.finditer(r"\S+", text)]
chars = list(text)
starts = [0.0] * len(chars); ends = [0.0] * len(chars)
for i, (s, e) in enumerate(input_words):
    if i < len(wwords):
        ws, we = wwords[i]
    elif wwords:
        ws = wwords[-1][1]; we = ws + 0.3
    else:
        ws = i * 0.3; we = ws + 0.3
    L = max(1, e - s)
    for j in range(s, e):
        starts[j] = ws + (we - ws) * ((j - s) / L)
        ends[j]   = ws + (we - ws) * ((j - s + 1) / L)
# fill spaces / gaps and enforce monotonic non-decreasing timing
last = 0.0
for k in range(len(chars)):
    if ends[k] == 0.0:
        starts[k] = last; ends[k] = last
    last = max(last, ends[k])
for k in range(1, len(chars)):
    if starts[k] < ends[k-1]: starts[k] = ends[k-1]
    if ends[k] < starts[k]:   ends[k] = starts[k] + 0.05
json.dump({"characters": chars,
           "character_start_times_seconds": starts,
           "character_end_times_seconds": ends}, open(outdir + "/vo.json", "w"))
print("VOICE DONE", outdir, "dur=%.2f" % ends[-1])
