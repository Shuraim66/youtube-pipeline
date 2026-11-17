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
  5. creates original music/SFX and ducks music beneath narration
  6. renders via Remotion, normalizes the mixed programme and muxes the MP4

Usage: python build.py <script_id>       (default: demo)
Python: /home/alpha/products/whop-clipper/.venv/bin/python
"""
import os, sys, json, subprocess, math, argparse
from production import decorate_timing

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

def loudness_filter(audio_path):
    """Measure the entire programme before final EBU R128 normalization."""
    result = subprocess.run([
        "ffmpeg", "-hide_banner", "-nostats", "-i", audio_path,
        "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json",
        "-f", "null", "-"], check=True, capture_output=True, text=True)
    measured = json.loads(result.stderr[result.stderr.rfind("{"):])
    fields = {"measured_I": "input_i", "measured_TP": "input_tp",
              "measured_LRA": "input_lra", "measured_thresh": "input_thresh",
              "offset": "target_offset"}
    if not all(math.isfinite(float(measured[key])) for key in fields.values()):
        raise ValueError("Cannot normalize narration: invalid or silent audio")
    print(f"[build] programme: {measured['input_i']} LUFS -> target -14 LUFS")
    options = ":".join(f"{name}={measured[key]}" for name, key in fields.items())
    return f"loudnorm=I=-14:TP=-1.5:LRA=11:{options}:linear=true,apad"

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("script_id", nargs="?", default="demo")
    parser.add_argument("--output", help="Review output path; default out/<script_id>.mp4")
    parser.add_argument("--prepare-only", action="store_true", help="Generate timing and audio stems without rendering")
    parser.add_argument("--narration-only", action="store_true", help="Omit the score/foley for comparison")
    parser.add_argument("--edition", default="", help="Separate work cache for a review edition")
    parser.add_argument("--chunk-seconds", type=float, default=0, help="Resumable video sections; use 60 for long episodes")
    parser.add_argument("--composition", choices=['Script', 'MoneyHabits'], default='Script')
    args = parser.parse_args()
    if args.chunk_seconds and args.chunk_seconds < 1:
        parser.error('--chunk-seconds must be zero or at least one second')
    sid = args.script_id
    spath = f"{ROOT}/scripts/{sid}.json"
    if not os.path.exists(spath):
        print(f"ERROR: {spath} not found"); sys.exit(1)
    beats = json.load(open(spath))
    if args.edition and not all(c.isalnum() or c in '-_' for c in args.edition):
        parser.error('--edition must contain only letters, numbers, hyphens or underscores')
    D = f"{ROOT}/work/{sid}" + (f"-{args.edition}" if args.edition else "")
    os.makedirs(D, exist_ok=True)

    full = " ".join(b["vo"] for b in beats)
    vo_json = f"{D}/vo.json"; vo_mp3 = f"{D}/vo.mp3"
    cache_matches = False
    delivery_path = f"{ROOT}/scripts/{sid}.delivery.json"
    if os.path.exists(delivery_path):
        from voice_direction import synthesize
        vo_json, vo_mp3 = synthesize(beats, json.load(open(delivery_path)), D, VOICE_K)
    if os.path.exists(vo_json) and os.path.exists(vo_mp3):
        cached_alignment = json.load(open(vo_json))
        cache_matches = "".join(cached_alignment["characters"]) == full
    if not cache_matches:
        print("[build] generating Kokoro VO...")
        subprocess.run([PY, KOKORO, full, VOICE_K, LANG_K, D], check=True)

    al = json.load(open(vo_json))
    if "".join(al["characters"]) != full:
        raise ValueError("Narration alignment does not match the current script")
    ends = al["character_end_times_seconds"]; vend = ends[-1]

    # map each beat onto its char window (same technique as build_*.py)
    seg = []; cum = 0; prev = 0.0
    for b in beats:
        ei = min(cum + len(b["vo"]) - 1, len(ends) - 1)
        seg.append((prev, ends[ei])); prev = ends[ei]; cum += len(b["vo"]) + 1
    seg[-1] = (seg[-1][0], vend)
    if 'beatWindows' in al:
        seg = al['beatWindows']
        vend = al['audioDuration']

    tail = 1.2  # loop-back tail
    total_s = vend + tail
    cues = word_cues(vo_json)

    timing = {
        "composition": args.composition,
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
    timing = decorate_timing(timing)
    if 'beatWindows' in al:
        from voice_direction import acoustic_prominence
        acoustic_prominence(timing['captions'], vo_mp3, FPS)
    timing['alignmentMethod'] = al.get('alignmentMethod', 'legacy Whisper positional')
    json.dump(timing, open(f"{D}/timing.json", "w"), indent=1)
    json.dump(timing, open(f"{ROOT}/src/timing.json", "w"), indent=1)
    print(f"[build] timing.json: {len(beats)} beats, {timing['totalFrames']} frames ({total_s:.1f}s)")
    if timing["cueFallbacks"]:
        print(f"[build] cue fallback warnings: {timing['cueFallbacks']}")
    if args.narration_only:
        programme = vo_mp3
    else:
        from audio_mix import build_mix
        print("[build] composing score, effects, and ducked stereo mix...")
        programme = build_mix(timing, vo_mp3, D)
    if args.prepare_only:
        print(f"[build] prepared -> {programme}")
        return

    # render (silent video)
    print("[build] rendering Remotion...")
    from render_video import render
    silent = render(ROOT, D, sid, timing, args.chunk_seconds)

    # mux VO audio
    out = os.path.abspath(args.output) if args.output else f"{ROOT}/out/{sid}.mp4"
    os.makedirs(os.path.dirname(out), exist_ok=True)
    print("[build] normalizing final mix and muxing audio...")
    subprocess.run(["ffmpeg", "-y", "-i", silent, "-i", programme,
                    "-c:v", "copy", "-c:a", "aac", "-b:a", "160k",
                    "-af", loudness_filter(programme), "-ar", "48000",
                    "-t", str(timing["totalFrames"] / FPS),
                    "-movflags", "+faststart", out],
                   check=True, stderr=subprocess.DEVNULL)
    print(f"[build] DONE -> {out}")

if __name__ == "__main__":
    main()
