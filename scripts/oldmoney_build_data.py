#!/usr/bin/env python3
"""Join plan (plate / mascot / camera) + oldmoney_spec overlays + real Kokoro timings + Whisper words -> empires_short/src/oldmoney/data.json.
Copy of moneypsych_build_data.py adapted to: puppet v2.0 beats ("puppet:<expr>/<gesture>@R|C|L"), lesson / loop cards, the 9 -> 1 tracker,
data cards on a side (L when the puppet points). Anchors resolve to Whisper word times."""
import json, re, sys
from pathlib import Path
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parent))
import oldmoney_plan as P, oldmoney_spec as S
import moneypsych_build_data as MB          # reuse camera() / token_times() / resolve() (token_times reads MB.wh: re-pointed below)

ROOT = Path(__file__).resolve().parent.parent
R = ROOT / "empires_short"
LIB = R / "public/img/aurelis/library"
vo = json.loads((P.OUT / "vo_beats.json").read_text()); wh = json.loads((P.OUT / "whisper_words.json").read_text())["words"]
MB.wh = wh
END_HOLD = 3.0
PUPPET_H = 640
X = {"L": 470, "R": 1460, "C": 960}


def main():
    beats = vo["beats"]; cams = P.camera_plan(); out = []
    secs = {}
    for b in beats: secs.setdefault(b["sec"], []).append(b)
    sizes = {}
    for i, b in enumerate(beats):
        pb = P.B[i]; assert pb["text"] == b["text"], i
        spec = S.SPEC.get(b["i"], {})
        toks, tt = MB.token_times(b)
        rs = lambda at, d=0.3: MB.resolve(at, toks, tt, d)
        sec = b["sec"]; grp = secs[sec]; last = b is grp[-1]
        cuts = []
        kind, a, g, pos = P.parse_m(pb["m"])
        if kind == "puppet":
            cuts.append(dict(type="puppet", expr=a, gesture=None if g == "rest" else g, x=X[pos] + (40 if pos == "R" else 0), h=PUPPET_H,
                             gFrom=round(max(0.25, rs(spec["dc"]["at"]) - 0.1) if spec.get("dc") and g == "pointLeft" else 0.35, 2), gTo=round(b["dur"] - 0.1, 2)))
        elif kind == "library":
            f = f"mascot_{a}.png"
            if f not in sizes: sizes[f] = Image.open(LIB / f).size
            w, h = sizes[f]
            sc = 0.8 if a != "family_child_front" else 0.78
            cuts.append(dict(type="lib", f=f, x=X[pos], w=w, h=h, scale=sc, flip=False, at=0.2, pos=pos))
        d = dict(last=last, i=b["i"], sec=sec, start=b["start"], dur=b["dur"], plate=f"plate_{pb['plate']}.png", cuts=cuts, cam=MB.camera(cams[i]), text=b["text"])
        cm = d["cam"]
        if cm.get("punch"): cm["punchAt"] = rs(spec["dc"]["at"]) if spec.get("dc") else 0.6
        if pb["ch"]:
            n = int(sec[1:]); d["ch"] = dict(n=n, title=P.CH[n])
        if spec.get("ch"): d["ch"] = spec["ch"]
        if spec.get("dc"):
            dc = dict(spec["dc"]); dc["at"] = rs(dc.get("at")); d["dc"] = dc
        for key in ("src", "fix"):
            if spec.get(key):
                s = dict(spec[key]); s["at"] = rs(s.get("at")); span = s.pop("span", 1)
                j = min(grp.index(b) + span - 1, len(grp) - 1); lb = grp[j]
                s["until"] = round(lb["start"] + lb["dur"] - (0.4 if lb is grp[-1] else 0.05), 3)
                d[key] = s
        if spec.get("props"):
            ps = []
            for p in spec["props"]:
                p = dict(p); span = p.pop("span", 1); at = rs(p.get("at"))
                if isinstance(at, list): p["_at"] = [x for x in at]; at = at[0]
                p["at"] = at
                j = min(grp.index(b) + span - 1, len(grp) - 1); lb = grp[j]
                p["end"] = round(lb["start"] + lb["dur"] - (0.4 if lb is grp[-1] else 0.05) - b["start"], 3)
                p["bs"] = [round(grp[min(grp.index(b) + q, len(grp) - 1)]["start"] - b["start"], 3) for q in range(span)]
                for it in p.get("items", []):
                    if "at" in it: it["_at"] = rs(it.pop("at"))
                ps.append(p)
            d["props"] = ps
        for k in ("title", "lesson", "loop", "note", "trkBuild", "trkAll", "trkPulse", "checklist", "end"):
            if spec.get(k) is not None: d[k] = spec[k]
        if i == len(beats) - 1: d["dur"] = round(d["dur"] + END_HOLD, 3)
        out.append(d)
    total = out[-1]["start"] + out[-1]["dur"]
    chapters = [dict(n=x["ch"]["n"], title=x["ch"]["title"], start=x["start"]) for x in out if x.get("ch") and x["ch"]["n"]]
    data = dict(total=round(total, 3), fps=30, beats=out, chapters=chapters, close=next(x["start"] for x in out if x["sec"] == "close"),
                words=[dict(w=w["w"], s=w["s"], e=w["e"]) for w in wh])
    (R / "src/oldmoney").mkdir(exist_ok=True, parents=True)
    (R / "src/oldmoney/data.json").write_text(json.dumps(data))
    print("beats", len(out), "total", round(total, 2), "s")


if __name__ == "__main__":
    main()
