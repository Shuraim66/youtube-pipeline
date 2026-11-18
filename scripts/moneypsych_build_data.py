#!/usr/bin/env python3
"""Join plan (plate/cut-out/camera) + structured spec + real VO timings + whisper words -> empires_short/src/moneypsych/data.json for Remotion.
Re-timing to the real narration: beat start/dur come from the per-beat Kokoro wavs; overlay anchors are resolved to the Whisper word times."""
import difflib, json, re, sys
from pathlib import Path
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parent))
import moneypsych_plan as P, moneypsych_spec as S

ROOT = Path(__file__).resolve().parent.parent
R = ROOT / "empires_short"
LIB = R / "public/img/aurelis/library"
vo = json.loads((P.OUT / "vo_beats.json").read_text()); wh = json.loads((P.OUT / "whisper_words.json").read_text())["words"]
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
END_HOLD = 3.0
REGION = {"car": (260, 40), "fence": (-220, 30), "screens": (-300, 0), "shelves": (-300, -60), "shelf": (260, -40), "desk": (-120, 80), "table": (0, 80), "till": (220, 50),
          "lamp": (320, 60), "bench": (260, 60), "bar": (0, 0), "field": (0, 0)}


def camera(c):
    k = c.split()[0].split("-")[0]
    if k == "PUSH": a, b = re.findall(r"[\d.]+", c)[:2]; return dict(z0=float(a), z1=float(b), px0=0, px1=0, py0=0, py1=0)
    if k == "PULL": a, b = re.findall(r"[\d.]+", c)[:2]; return dict(z0=float(a), z1=float(b), px0=0, px1=0, py0=0, py1=0)
    if k == "PAN": d = -1 if c.startswith("PAN-L") else 1; return dict(z0=1.03, z1=1.03, px0=-60 * d, px1=60 * d, py0=0, py1=0)
    if k == "DRIFT": return dict(z0=1.04, z1=1.04, px0=0, px1=0, py0=-40, py1=40)
    if k == "TILT": return dict(z0=1.04, z1=1.04, px0=0, px1=0, py0=40, py1=-40)
    if k == "PUNCH": return dict(z0=1.0, z1=1.03, px0=0, px1=0, py0=0, py1=0, punch=True)
    if k == "ZOOM":
        ox, oy = (0, 0)
        for kw, v in REGION.items():
            if re.search(rf"\b{kw}\b", c): ox, oy = v; break
        return dict(z0=1.28, z1=1.36, px0=ox, px1=ox, py0=oy, py1=oy)
    return dict(z0=1.0, z1=1.015, px0=0, px1=0, py0=0, py1=0)       # HOLD


def token_times(b):
    toks = b["spoken"].split(); t0, t1 = b["start"] - 0.05, b["start"] + b["dur"]
    ww = [(w["w"], w["s"], w["e"]) for w in wh if t0 <= (w["s"] + w["e"]) / 2 < t1]
    a = [norm(w) for w in toks]; c = [norm(w[0]) for w in ww]
    times = [None] * len(a)
    for blk in difflib.SequenceMatcher(None, a, c, autojunk=False).get_matching_blocks():
        for k in range(blk.size): times[blk.a + k] = ww[blk.b + k][1] - b["start"]
    i = 0
    speech_end = (ww[-1][2] - b["start"]) if ww else b["dur"] - 0.3
    while i < len(times):
        if times[i] is None:
            j = i
            while j < len(times) and times[j] is None: j += 1
            lo = times[i - 1] + 0.25 if i else 0.0; hi = times[j] if j < len(times) else speech_end
            for k in range(i, j): times[k] = lo + (hi - lo) * (k - i) / (j - i)
            i = j
        else: i += 1
    return toks, [max(0.0, x) for x in times]


def resolve(at, toks, tt, default=0.3):
    if at is None: return default
    if isinstance(at, (int, float)): return float(at)
    if isinstance(at, list): return [resolve(x, toks, tt, default) for x in at]
    for k, w in enumerate(toks):
        if re.search(at, norm(w) if not re.search(r"[^a-z0-9]", at) else w.lower()): return tt[k]
    for k, w in enumerate(toks):
        if re.search(at, w.lower()): return tt[k]
    print("  anchor not found:", at, "in", " ".join(toks)[:60]); return default


def main():
    beats = vo["beats"]; order = {}
    for b in beats: order.setdefault(b["sec"], []).append(b)
    n_by_trap = {}
    out = []
    sizes = {}
    for i, b in enumerate(beats):
        sec = b["sec"]; idx = order[sec].index(b); spec = S.SPEC[sec][idx]
        _, text, plate, cut, ov, cam = P.B[i]
        assert text == b["text"], (i, text[:30], b["text"][:30])
        toks, tt = token_times(b)
        cuts = []
        parts = cut.split("+") if cut else []
        for j, c in enumerate(parts):
            name, pos = c.split("@"); mir = pos.endswith("~") or name.endswith("~"); name = name.rstrip("~"); pos = pos.rstrip("~")
            f = f"mascot_{name}.png"
            if f not in sizes: sizes[f] = Image.open(LIB / f).size
            w, h = sizes[f]; two = len(parts) == 2
            x = {"L": 470, "R": 1450, "C": 960}[pos] if not two else (420 if j == 0 else 1520)
            if b["i"] == 1: x = 1620                                   # opening beat: keep the yawning mascot's hair clear of the title block
            cuts.append(dict(f=f, x=x, w=w, h=h, scale=0.62 if two else 0.8, flip=mir, at=(-0.6 if b["i"] == 1 else 0.2 + 0.35 * j), pos=pos))
        last_in_sec = idx == len(order[sec]) - 1
        CUT = 0.4 if last_in_sec else 0.05                           # overlays of a section's last beat clear 0.4 s early so nothing sits under the next chapter card
        d = dict(last=last_in_sec, i=b["i"], sec=sec, start=b["start"], dur=b["dur"], plate=f"plate_{plate}.png", cuts=cuts, cam=camera(cam), text=b["text"])
        cm = d["cam"]
        if cm.get("punch") and spec.get("dc"): cm["punchAt"] = resolve(spec["dc"].get("at"), toks, tt)
        elif cm.get("punch"): cm["punchAt"] = 0.6
        if idx == 0 and sec.startswith("t"):
            n = int(sec[1:]); d["ch"] = dict(n=n, title=P.CH[n])
        if spec.get("title"): d["title"] = True
        if spec.get("dc"):
            dc = dict(spec["dc"]); dc["at"] = resolve(dc.get("at"), toks, tt)
            if "swap" in dc: dc["swap"] = dict(dc["swap"], at=resolve(dc["swap"].get("at"), toks, tt))
            d["dc"] = dc
        if spec.get("src"):
            s = dict(spec["src"]); s["at"] = resolve(s.get("at"), toks, tt); span = s.pop("span", 1)
            last = order[sec][min(idx + span - 1, len(order[sec]) - 1)]; s["until"] = round(last["start"] + last["dur"] - (0.4 if last is order[sec][-1] else 0.05), 3)
            d["src"] = s
        if spec.get("fix"):
            f = dict(spec["fix"]); f["at"] = resolve(f.get("at"), toks, tt); span = f.pop("span", 1)
            last = order[sec][min(idx + span - 1, len(order[sec]) - 1)]; f["until"] = round(last["start"] + last["dur"] - (0.4 if last is order[sec][-1] else 0.05), 3)
            d["fix"] = f
        if spec.get("props"):
            ps = []
            for p in spec["props"]:
                p = dict(p); span = p.pop("span", 1); p["at"] = resolve(p.get("at"), toks, tt, 0.3)
                if isinstance(p["at"], list): p["_at"] = p["at"]; p["at"] = p["_at"][0]
                last = order[sec][min(idx + span - 1, len(order[sec]) - 1)]
                p["end"] = round(last["start"] + last["dur"] - (0.4 if last is order[sec][-1] else 0.05) - b["start"], 3)                      # local to this beat's start
                p["bs"] = [round(order[sec][min(idx + q, len(order[sec]) - 1)]["start"] - b["start"], 3) for q in range(span)]
                for it in p.get("items", []):
                    if "at" in it: it["_at"] = resolve(it.pop("at"), toks, tt, 0.3)
                ps.append(p)
            d["props"] = ps
        for k in ("note", "lines", "trkBuild", "trkAll", "trkPulse", "checklist", "end"):
            if spec.get(k) is not None:
                v = spec[k]
                if k == "lines": v = [dict(l, at=resolve(l.get("at"), toks, tt)) for l in v]
                d[k] = v
        if spec.get("plateTags"): d["plateTags"] = [dict(t, at=resolve(t.get("at"), toks, tt, 0.3)) for t in spec["plateTags"]]
        if k_end := (i == len(beats) - 1): d["dur"] = round(d["dur"] + END_HOLD, 3)
        out.append(d)
    total = out[-1]["start"] + out[-1]["dur"]
    fixes = [x["fix"]["lines"] for x in out if x.get("fix") and x["sec"].startswith("t") and not x["fix"].get("ticks")]
    data = dict(total=round(total, 3), fps=30, beats=out, chapters=[dict(n=int(k[1:]), title=P.CH[int(k[1:])], start=order[k][0]["start"]) for k in order if k.startswith("t")],
                words=[dict(w=w["w"], s=w["s"], e=w["e"]) for w in wh])
    (R / "src/moneypsych").mkdir(exist_ok=True, parents=True)
    (R / "src/moneypsych/data.json").write_text(json.dumps(data))
    print("beats", len(out), "total", round(total, 2), "s")


if __name__ == "__main__":
    main()
