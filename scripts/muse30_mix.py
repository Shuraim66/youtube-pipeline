#!/usr/bin/env python3
"""Mix "Aurelis Test 30" (adapted from oldmoney_mix.py): narration + bed ducked to -22 dB under speech, then two-pass loudnorm to -14 LUFS.
NOTE: this script reads src/muse30/data.json for the total length, so muse30_build_data.py must run BEFORE this script (the runbook lists mix first, but the dependency runs the other way — see REPORT.md T12)."""
import json, os, re, shutil, subprocess, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import muse30_plan as P

ROOT = Path(__file__).resolve().parent.parent
R = ROOT / "empires_short"
VO = R / "public/audio/muse30/narration.wav"
BED = ROOT / "assets/audio/aurelis_bed.wav"
OUT = R / "public/audio/muse30/narration_mix.wav"
TIM = P.OUT / "whisper_words.json"
TOTAL = json.loads((R / "src/muse30/data.json").read_text())["total"]
TMP = P.OUT / "_mix"
TARGET_LUFS, TARGET_TP, TARGET_LRA = -14.0, -1.4, 11.0


def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode:
        print(r.stdout, r.stderr); raise SystemExit(r.returncode)
    return r


def main():
    TMP.mkdir(parents=True, exist_ok=True)
    beats = json.loads((P.OUT / "vo_beats.json").read_text())["beats"]
    words = json.loads(TIM.read_text())["words"]
    seg = json.loads((P.OUT / "vo_beats.json").read_text())
    speech = sorted(seg["beats"], key=lambda b: b["start"])
    # gaps between narration end and next beat start
    gaps = []
    end = 0.0
    for b in beats:
        for w in words:
            if w["e"] > b["start"] + b["dur"]:
                break
            if w["e"] > end and b["start"] <= w["s"] < b["start"] + b["dur"]:
                end = w["e"]
        gaps.append((b["start"], end))
    run(["ffmpeg", "-y", "-v", "error", "-i", str(VO), "-i", str(BED), "-filter_complex",
         f"[1:a]atrim=0:{TOTAL},asetpts=PTS-STARTPTS,volume=0.079[bed];[0:a][bed]sidechaincompress=threshold=0.02:ratio=6:attack=0.02:release=0.25:makeup=1.0,alimiter=limit=0.85[aout]",
         "-map", "[aout]", "-ar", "48000", "-c:a", "pcm_s16le", str(TMP / "pre.wav")])
    r1 = run(["ffmpeg", "-y", "-v", "info", "-i", str(TMP / "pre.wav"), "-vn", "-af",
              f"loudnorm=I={TARGET_LUFS}:TP={TARGET_TP}:LRA={TARGET_LRA}:print_format=json", "-f", "null", "-"], cwd=TMP)
    m = re.search(r"\{[^}]*\}", r1.stderr)
    measured = json.loads(m.group(0)) if m else {}
    ln = {k: measured[k] for k in ("input_i", "input_tp", "input_lra", "target_offset") if k in measured}
    # measured_thresh is the pass-1 measured threshold (input_thresh, a negative dB value), NOT target_offset.
    # oldmoney_mix.py passes target_offset here; that only works while target_offset <= 0. For this mix the input is quiet
    # (input_i -21.89) so target_offset is +1.25, which ffmpeg rejects (measured_thresh must be in [-99, 0]).
    ln["measured_thresh"] = measured.get("input_thresh", "-70")
    print("loudnorm pass 1:", ln)
    run(["ffmpeg", "-y", "-v", "error", "-i", str(TMP / "pre.wav"), "-af",
         f"loudnorm=I={TARGET_LUFS}:TP={TARGET_TP}:LRA={TARGET_LRA}:measured_I={ln['input_i']}:measured_TP={ln['input_tp']}:measured_LRA={ln['input_lra']}:measured_thresh={ln['measured_thresh']}:offset={ln['target_offset']}:linear=true",
         "-ar", "48000", "-c:a", "pcm_s16le", str(OUT)])
    r = run(["ffmpeg", "-i", str(OUT), "-af", "ebur128=framelog=verbose", "-f", "null", "-"])
    for line in r.stderr.splitlines():
        if "Summary:" in line or "I:" in line or "True Peak:" in line:
            print("  ", line.strip())
    shutil.rmtree(TMP, ignore_errors=True)
    print("wrote", OUT)


if __name__ == "__main__":
    main()
