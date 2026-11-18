#!/usr/bin/env python3
"""Gate-2 measurements for out/aurelis_oldmoney.mp4 (copy of moneypsych_report.py + phone-size stills): duration, loudness, longest stretch without a visual change, contact sheet (one frame / 20 s + every data card),
stills at 0 s and 3 s. Writes out/experiments/AurelisOldMoney_{sheet,still_0s,still_3s}.png and out/aurelis_oldmoney/gate2_measure.json."""
import json, re, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

R = Path(__file__).resolve().parent.parent / "empires_short"
MP4 = R / "out/aurelis_oldmoney.mp4"; EXP = R / "out/experiments"; EXP.mkdir(exist_ok=True, parents=True)
data = json.loads((R / "src/oldmoney/data.json").read_text())
FF = ["ffmpeg", "-hide_banner", "-loglevel", "error"]
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(MP4)]).decode())
print("duration", dur)
# loudness
e = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(MP4), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
lufs = float(re.findall(r"\s+I:\s+(-?[\d.]+) LUFS", e)[-1]); tp = float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", e)[-1]); lra = float(re.findall(r"LRA:\s+(-?[\d.]+) LU", e)[-1])
print("loudness", lufs, tp, lra)

def frame(t, path):
    subprocess.run(FF + ["-y", "-ss", f"{t:.3f}", "-i", str(MP4), "-frames:v", "1", str(path)], check=True)

frame(0.0, EXP / "AurelisOldMoney_still_0s.png"); frame(3.0, EXP / "AurelisOldMoney_still_3s.png")

# longest stretch without a visual change: 10 fps, 160x90 gray; a "change" = mean abs diff vs the frame 0.3 s earlier above THR
raw = subprocess.run(FF + ["-i", str(MP4), "-vf", "fps=10,scale=160:90,format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, 90, 160).astype(np.float32)
LAG = 3
d = np.array([np.abs(fr[i] - fr[i - LAG]).mean() for i in range(LAG, len(fr))])
res = {}
for thr in (0.6, 1.2, 2.5):
    best = (0, 0); cur = None
    for i, v in enumerate(d):
        if v < thr:
            cur = i if cur is None else cur
            if (i - cur + 1) > best[1] - best[0]: best = (cur, i + 1)
        else: cur = None
    res[str(thr)] = dict(seconds=round((best[1] - best[0]) / 10, 1), at=round((best[0] + LAG) / 10, 1))
print("longest static stretch (mean abs diff < thr over 0.3 s):", res)
bd = max(data["beats"], key=lambda b: b["dur"] if b["i"] != len(data["beats"]) else 0)
print("longest beat (new plate/pose):", bd["i"], round(bd["dur"], 1), "s at", round(bd["start"], 1))

# contact sheet
cells = []
for t in np.arange(0, dur - 1, 20.0): cells.append((t, f"{int(t // 60)}:{int(t % 60):02d}"))
for b in data["beats"]:
    if b.get("dc"):
        a = b["start"] + b["dc"]["at"] + 1.7; cells.append((min(a, b["start"] + b["dur"] - 0.2), f"DC b{b['i']}"))
        if b["dc"].get("swap"): cells.append((b["start"] + b["dc"]["swap"]["at"] + 1.7, f"DC b{b['i']}b"))
cells.sort(); cw, ch = 480, 270; cols = 6; rows = -(-len(cells) // cols)
sheet = Image.new("RGB", (cols * cw, rows * ch), (27, 27, 31)); dr = ImageDraw.Draw(sheet)
tmp = R / "out/aurelis_oldmoney/_cell.png"
for k, (t, lab) in enumerate(cells):
    frame(t, tmp); im = Image.open(tmp).convert("RGB").resize((cw - 4, ch - 4)); x, y = (k % cols) * cw + 2, (k // cols) * ch + 2
    sheet.paste(im, (x, y)); dr.rectangle((x, y, x + 150, y + 22), fill=(0, 0, 0)); dr.text((x + 6, y + 5), f"{lab}  ({int(t // 60)}:{int(t % 60):02d})", fill=(244, 236, 216))
sheet.save(EXP / "AurelisOldMoney_sheet.png"); print("sheet", len(cells), "frames")
json.dump(dict(duration=round(dur, 2), lufs=lufs, true_peak=tp, lra=lra, static=res, longest_beat=dict(i=bd["i"], s=round(bd["dur"], 2)), sheet_frames=len(cells)), open(R / "out/aurelis_oldmoney/gate2_measure.json", "w"), indent=1)

# phone-size stills: a 1920x1080 frame shown full-width on a phone is ~390 px wide; render key frames at 390 px and tile them
PH = R / "out/aurelis_oldmoney/phone"; PH.mkdir(parents=True, exist_ok=True)
picks = [("title", 0.5)]
for b in data["beats"]:
    tag = "dc" if b.get("dc") else "lesson" if b.get("lesson") else "fix" if b.get("fix") else "loop" if b.get("loop") else None
    if tag and not any(p[0] == tag for p in picks): picks.append((tag, b["start"] + min(b["dur"] - 0.3, 2.8)))
src_b = next(b for b in data["beats"] if b.get("src")); picks.append(("source", src_b["start"] + src_b["src"]["at"] + 1.0))
ch_b = next(b for b in data["beats"] if b.get("ch") and b["ch"].get("n")); picks.append(("chapter", ch_b["start"] + 1.0))
end_b = data["beats"][-1]; picks.append(("end", end_b["start"] + 2.5))
tiles = []
for name, t in picks:
    frame(t, tmp); im = Image.open(tmp).convert("RGB").resize((390, 219), Image.LANCZOS); im.save(PH / f"{name}_390w.png"); tiles.append((name, im))
ps = Image.new("RGB", (3 * 400, -(-len(tiles) // 3) * 245), (27, 27, 31)); dp = ImageDraw.Draw(ps)
for k, (name, im) in enumerate(tiles):
    x, y = (k % 3) * 400 + 5, (k // 3) * 245 + 5; ps.paste(im, (x, y)); dp.text((x, y + 222), name, fill=(244, 236, 216))
ps.save(EXP / "AurelisOldMoney_phone_sheet.png"); print("phone sheet", len(tiles))
