#!/usr/bin/env python3
"""Gate-2 quality report for "Aurelis Test 30" (adapted from oldmoney_report.py):
contact sheet every 2 s + every card beat, phone-size (390 px) stills of EVERY card,
liveness (longest static stretch / longest beat), duration + loudness.
Outputs land in empires_short/out/muse_test/."""
import json, subprocess, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import muse30_plan as P
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
R = ROOT / "empires_short"
MP4 = R / "out/muse_test30.mp4"
OUT_DIR = R / "out/muse_test"
EXP = OUT_DIR
HERE = Path(__file__).resolve().parent.parent


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        print(r.stderr); raise SystemExit(r.returncode)
    return r


def ffprobe(*a):
    return json.loads(run(["ffprobe", "-v", "quiet", "-print_format", "json"] + list(a) + [str(MP4)]).stdout)


def frame(t, path, w=None):
    c = ["ffmpeg", "-y", "-v", "error", "-ss", str(t), "-i", str(MP4), "-frames:v", "1"]
    if w: c += ["-vf", f"scale={w}:-1"]
    c.append(str(path)); run(c)


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True); EXP.mkdir(parents=True, exist_ok=True)
    data = json.loads((R / "src/muse30/data.json").read_text())
    dur = float(ffprobe("-show_entries", "format=duration")["format"]["duration"])
    fps = eval(ffprobe("-show_entries", "stream=r_frame_rate")["streams"][0]["r_frame_rate"])
    w = ffprobe("-show_entries", "stream=width,height")["streams"][0]
    # ---- contact sheet: every 2 s + every card beat
    ts, cells = [], []
    t = 0.0
    while t < dur - 1:
        ts.append((round(t, 2), None)); t += 2.0
    for b in data["beats"]:
        if b.get("dc"): ts.append((round(b["start"] + b["dc"]["at"] + 1.7, 2), "DC"))
        if b.get("fix"): ts.append((round(b["start"] + b["fix"]["at"] + 1.0, 2), "FIX"))
        if b.get("lesson"): ts.append((round(b["start"] + 2.0, 2), "LESSON"))
        if b.get("src"): ts.append((round(b["start"] + b["src"]["at"] + 1.0, 2), "SRC"))
        if b.get("end"): ts.append((round(b["start"] + 2.5, 2), "END"))
    ts.append((0.5, "TITLE"))
    ts = sorted({round(x[0], 2): x[1] for x in ts}.items())
    tmp = OUT_DIR / "tmp_sheet"; tmp.mkdir(exist_ok=True)
    for i, (t, label) in enumerate(ts):
        frame(t, tmp / f"c{i:02d}.png", 480)
    cw, ch, cols = 480, 270, 6
    rows = (len(ts) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cw, rows * (ch + 28)), "white")
    dr = ImageDraw.Draw(sheet)
    for i, (t, label) in enumerate(ts):
        im = Image.open(tmp / f"c{i:02d}.png")
        x, y = (i % cols) * cw, (i // cols) * (ch + 28)
        sheet.paste(im, (x, y)); dr.text((x + 8, y + ch + 6), f"{t:.1f}s" + (f"  {label}" if label else ""), fill="black")
    sheet.save(EXP / "contact_sheet.png"); print("sheet:", EXP / "contact_sheet.png", f"{len(ts)} cells")
    # ---- phone-size stills of EVERY card
    ph = OUT_DIR / "phone"; ph.mkdir(exist_ok=True)
    picks = [("title", 0.5), ("src_beat2", None), ("dc_93", None), ("claim_70", None), ("fix", None), ("lesson", None), ("end", None)]
    def beat_at(b, key, off):
        return round(b["start"] + b[key]["at"] + off, 2)
    beats = data["beats"]
    picks[1] = ("src_beat2", beat_at(beats[1], "src", 1.0))
    picks[2] = ("dc_93", beat_at(beats[1], "dc", 1.7))
    picks[3] = ("claim_70", beat_at(beats[2], "dc", 1.7))
    picks[4] = ("fix", beat_at(beats[3], "fix", 1.0))
    picks[5] = ("lesson", round(beats[4]["start"] + 2.0, 2))
    picks[6] = ("end", round(beats[5]["start"] + 2.5, 2))
    for name, t in picks:
        frame(t, ph / f"{name}_390w.png", 390)
        print(f"  phone still {name}: {t:.1f}s -> {ph / f'{name}_390w.png'}")
    # phone sheet: tile the card stills
    ims = [Image.open(ph / f"{n}_390w.png") for n, _ in picks]
    ph_sheet = Image.new("RGB", (390, sum(im.height for im in ims) + 30 * len(ims)), "white")
    dr2 = ImageDraw.Draw(ph_sheet)
    y = 0
    for (name, _), im in zip(picks, ims):
        dr2.text((8, y + 6), name, fill="black"); ph_sheet.paste(im, (0, y + 28)); y += im.height + 30
    ph_sheet.save(EXP / "phone_sheet.png"); print("phone sheet:", EXP / "phone_sheet.png")
    # ---- stills at 0 s and 3 s
    frame(0, EXP / "still_0s.png"); frame(3, EXP / "still_3s.png")
    # ---- liveness: every 0.25 s, motion = mean absolute diff of 96x54 luma
    im0 = tmp / "luma.png"
    step, prev, static = 0.25, None, []
    cur, start = None, None
    for k in range(int(dur / step)):
        t = round(k * step, 2)
        p = tmp / "l.png"
        run(["ffmpeg", "-y", "-v", "error", "-ss", str(t), "-i", str(MP4), "-frames:v", "1", "-vf", "scale=96:54,format=gray", str(p)])
        im = list(Image.open(p).getdata())
        if prev is not None:
            md = sum(abs(a - b) for a, b in zip(im, prev)) / len(im)
            if md < 0.5 and cur is None:
                cur, start = t, t
            elif md >= 0.5 and cur is not None:
                static.append((start, t, t - start)); cur = None
        prev = im
    if cur is not None:
        static.append((start, dur, dur - start))
    static.sort(key=lambda x: -x[2])
    beats = sorted(data["beats"], key=lambda b: -b["dur"])
    # ---- loudness
    r = run(["ffmpeg", "-i", str(MP4), "-af", "ebur128=framelog=verbose", "-f", "null", "-"])
    lines = [l for l in r.stderr.splitlines() if "Summary:" in l or " I:" in l or "True Peak:" in l]
    measure = dict(duration_s=round(dur, 2), fps=round(fps, 2), width=w["width"], height=w["height"],
                   longest_static=[dict(start=round(a, 2), end=round(b, 2), len=round(c, 2)) for a, b, c in static[:3]],
                   longest_beat=dict(i=beats[0]["i"], sec=beats[0]["sec"], dur=round(beats[0]["dur"], 2)),
                   loudness=[l.strip() for l in lines])
    (EXP / "gate2_measure.json").write_text(json.dumps(measure, indent=2))
    print(json.dumps(measure, indent=2))


if __name__ == "__main__":
    main()
