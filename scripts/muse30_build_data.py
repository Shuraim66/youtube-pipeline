#!/usr/bin/env python3
"""Join plan (plate/mascot/camera) + structured spec + real VO timings + whisper words -> empires_short/src/muse30/data.json for Remotion.
Adapted from oldmoney_build_data.py (which is a copy of moneypsych_build_data.py adapted to puppet v2.0 beats).
Re-timing to the real narration: beat start/dur come from the per-beat Kokoro wavs; overlay anchors are resolved to the Whisper word times.
END_HOLD: the closing beat holds after the voice ends (Old Money's close held 2 s after voice). The planner's duration estimate for the 6 beats is ~31 s, so the final value is set once the real VO total is measured — see REPORT.md.
No chapter cards, no 9-habit tracker (removed for the 30 s test). The CHALLENGED stamp lands on the spoken word "challenged" (stampAt), not 1 s after the card appears.
NOTE: MB.token_times() reads the module-global MB.wh, so it must be re-pointed at muse30's whisper words (oldmoney does the same)."""
import json, sys
from pathlib import Path
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parent))
import moneypsych_build_data as MB
import muse30_plan as P, muse30_spec as S

ROOT = Path(__file__).resolve().parent.parent
R = ROOT / "empires_short"
LIB = R / "public/img/aurelis/library"
vo = json.loads((P.OUT / "vo_beats.json").read_text()); wh = json.loads((P.OUT / "whisper_words.json").read_text())["words"]
MB.wh = wh
END_HOLD = 2.0
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
        if spec.get("dc"):
            dc = dict(spec["dc"]); dc["at"] = rs(dc.get("at"))
            if "stampAt" in dc: dc["stampAt"] = rs(dc["stampAt"])     # relative to beat start, like "at"
            d["dc"] = dc
        for key in ("src", "fix"):
            if spec.get(key):
                s = dict(spec[key]); s["at"] = rs(s.get("at")); span = s.pop("span", 1)
                j = min(grp.index(b) + span - 1, len(grp) - 1); lb = grp[j]
                s["until"] = round(lb["start"] + lb["dur"] - (0.4 if lb is grp[-1] else 0.05), 3)
                d[key] = s
        for k in ("title", "lesson", "loop", "note", "end"):
            if spec.get(k) is not None: d[k] = spec[k]
        if i == len(beats) - 1: d["dur"] = round(d["dur"] + END_HOLD, 3)
        out.append(d)
    total = out[-1]["start"] + out[-1]["dur"]
    data = dict(total=round(total, 3), fps=30, beats=out, chapters=[],
                close=next(x["start"] for x in out if x["sec"] == "close"),
                words=[dict(w=w["w"], s=w["s"], e=w["e"]) for w in wh])
    (R / "src/muse30").mkdir(exist_ok=True, parents=True)
    (R / "src/muse30/data.json").write_text(json.dumps(data))
    print("beats", len(out), "total", round(total, 2), "s")


if __name__ == "__main__":
    main()
