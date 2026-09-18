#!/usr/bin/env python3
"""
Aurelis vector build: script -> Kokoro VO -> timing.json -> Remotion render -> muxed MP4.

Mirrors the build_*.py pattern but for the flat-vector Remotion engine.
A SCRIPT (scripts/<id>.json) is a list of beats:
  {"scene":"peak"|"mistake"|"collapse"|..., "vo":"spoken line", "props":{...}}
This:
  1. joins beat VO -> runs kokoro_align.py -> vo.mp3 + vo.json (char timings)
  2. maps each beat onto its char window -> start/end SECONDS -> frames @ FPS
  3. builds word-level caption cues (for karaoke sync)
  4. writes src/timing.json  (Remotion imports it)
  5. renders via remotion, then muxes vo.mp3 with ffmpeg -> out/<id>.mp4

Usage: python build.py <script_id>       (default: demo)
Python: /home/alpha/products/whop-clipper/.venv/bin/python
"""
import os, sys, json, subprocess, math

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(ROOT)
PY = "/home/alpha/products/whop-clipper/.venv/bin/python"
KOKORO = REPO + "/kokoro_align.py"
FPS = 30
VOICE_K, LANG_K = "bf_emma", "b"   # Aurelis British-female voice (matches build_*.py)

def word_cues(vo_json, gpop=None):
    """Return [{word, start, end}] from char timings (whitespace-split)."""
    al = json.load(open(vo_json))
    ch = al["characters"]; st = al["character_start_times_seconds"]; en = al["character_end_times_seconds"]
    words = []; i = 0; n = len(ch)
    while i < n:
        if ch[i].isspace(): i += 1; continue
        s = i
        while i < n and not ch[i].isspace(): i += 1
        words.append({"word": "".join(ch[s:i]), "start": st[s], "end": en[i-1]})
    return words

def main():
    sid = sys.argv[1] if len(sys.argv) > 1 else "demo"
    spath = f"{ROOT}/scripts/{sid}.json"
    if not os.path.exists(spath):
        print(f"ERROR: {spath} not found"); sys.exit(1)
    beats = json.load(open(spath))
    D = f"{ROOT}/work/{sid}"; os.makedirs(D, exist_ok=True)

    full = " ".join(b["vo"] for b in beats)
    vo_json = f"{D}/vo.json"; vo_mp3 = f"{D}/vo.mp3"
    if not (os.path.exists(vo_json) and os.path.exists(vo_mp3)):
        print("[build] generating Kokoro VO...")
        subprocess.run([PY, KOKORO, full, VOICE_K, LANG_K, D], check=True)

    al = json.load(open(vo_json))
    ends = al["character_end_times_seconds"]; vend = ends[-1]

    # map each beat onto its char window (same technique as build_*.py)
    seg = []; cum = 0; prev = 0.0
    for b in beats:
        ei = min(cum + len(b["vo"]) - 1, len(ends) - 1)
        seg.append((prev, ends[ei])); prev = ends[ei]; cum += len(b["vo"]) + 1
    seg[-1] = (seg[-1][0], vend)

    tail = 1.2  # loop-back tail
    total_s = vend + tail
    cues = word_cues(vo_json)

    timing = {
        "fps": FPS,
        "totalFrames": math.ceil(total_s * FPS),
        "voDuration": vend,
        "beats": [
            {**beats[i],
             "startFrame": round(seg[i][0] * FPS),
             "endFrame": round(seg[i][1] * FPS),
             "startSec": round(seg[i][0], 3),
             "endSec": round(seg[i][1], 3)}
            for i in range(len(beats))
        ],
        "captions": [{"word": c["word"],
                      "startFrame": round(c["start"] * FPS),
                      "endFrame": round(c["end"] * FPS)} for c in cues],
    }
    json.dump(timing, open(f"{ROOT}/src/timing.json", "w"), indent=1)
    print(f"[build] timing.json: {len(beats)} beats, {timing['totalFrames']} frames ({total_s:.1f}s)")

    # render (silent video)
    silent = f"{D}/silent.mp4"
    print("[build] rendering Remotion...")
    subprocess.run(["npx", "remotion", "render", "Script", silent,
                    "--props", json.dumps({"id": sid})], cwd=ROOT, check=True)

    # mux VO audio
    out = f"{ROOT}/out/{sid}.mp4"; os.makedirs(f"{ROOT}/out", exist_ok=True)
    print("[build] muxing audio...")
    subprocess.run(["ffmpeg", "-y", "-i", silent, "-i", vo_mp3,
                    "-c:v", "copy", "-c:a", "aac", "-b:a", "160k",
                    "-shortest", "-movflags", "+faststart", out],
                   check=True, stderr=subprocess.DEVNULL)
    print(f"[build] DONE -> {out}")

if __name__ == "__main__":
    main()
