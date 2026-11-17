"""Per-beat Kokoro VO for empire Shorts.
Usage: python scripts/gen_vo.py scripts/vo/<name>.json
JSON: {"out": "blackberry", "voice": "bf_emma", "lang": "b", "speed": 1.12, "gap": 0.2,
       "lines": [["hook", "text"], ["beatId", "text"], ...]}
Writes public/vo/<out>/vo.wav + timing.json ([{id, sec}] — beat durations incl. gap).
"""
import json, sys, numpy as np, soundfile as sf
from pathlib import Path
from kokoro import KPipeline

cfg = json.load(open(sys.argv[1]))
OUT = Path(__file__).resolve().parent.parent / "public" / "vo" / cfg["out"]
OUT.mkdir(parents=True, exist_ok=True)
SR = 24000
pipe = KPipeline(lang_code=cfg.get("lang", "b"), repo_id="hexgrad/Kokoro-82M")
audio, timing = [], []
for key, text in cfg["lines"]:
    a = np.concatenate([x for _, _, x in pipe(text, voice=cfg.get("voice", "bf_emma"), speed=cfg.get("speed", 1.12))])
    a = np.concatenate([a, np.zeros(int(cfg.get("gap", 0.2) * SR), dtype=a.dtype)])
    timing.append({"id": key, "sec": round(len(a) / SR, 3)})
    audio.append(a)
sf.write(OUT / "vo.wav", np.concatenate(audio), SR)
json.dump(timing, open(OUT / "timing.json", "w"), indent=2)
print(json.dumps(timing), "total", round(sum(t["sec"] for t in timing), 2))
