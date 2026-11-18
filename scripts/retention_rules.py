"""Long-form retention checks (playbooks/LONGFORM_RETENTION.md). Shared by the *_plan.py beat planners.

A beat is a dict: text, start (s), dur (s), plate, cam (camera move string), and optional
  rehook: "question" | "catch" | "teaser" | "callback";  loop: "open" | "payoff";  sfx: str;  cta: bool.
retention_errors(beats, pack_text, final_item_index) -> (errors, warnings)
"""
import re

MIN_S, PREF_S, MAX_S = 420, 480, 600
LOOP_BY_S, MAX_GAP_S, MAX_CTA_S = 30, 90, 10
REHOOK_KINDS = {"question", "catch", "teaser", "callback"}
BANNED = re.compile(r"\b(to wrap up|wrapping up|finally|in conclusion|last but not least)\b", re.I)
PUNCH = ("PUNCH", "ZOOM")


def _t(s):
    return f"{int(s // 60)}:{int(s % 60):02d}"


def _nums(s):
    return {n.rstrip(".,").replace(",", "") for n in re.findall(r"\d[\d,]*(?:\.\d+)?", s)}


def retention_errors(beats, pack_text, final_item_index):
    errs, warns = [], []
    end = beats[-1]["start"] + beats[-1]["dur"]

    # R1 length
    if not MIN_S <= end <= MAX_S:
        errs.append(f"R1 length {_t(end)} is outside 7:00-10:00")
    elif end < PREF_S:
        warns.append(f"R1 length {_t(end)} is under the preferred 8:00 (do not pad with filler)")

    # R2 open loop + payoff
    opens = [i for i, b in enumerate(beats) if b.get("loop") == "open"]
    if not opens or beats[opens[0]]["start"] >= LOOP_BY_S:
        errs.append(f"R2 no open loop starting before 0:{LOOP_BY_S}" + (f" (first at {_t(beats[opens[0]]['start'])})" if opens else ""))
    if opens and not any(b.get("loop") == "payoff" for b in beats[opens[0] + 1:]):
        errs.append("R2 open loop is never paid off explicitly (no beat marked loop='payoff')")

    # R3 rehook spacing (open loop and payoff count)
    cta0 = next((i for i, b in enumerate(beats) if b.get("cta")), len(beats))
    rh = [i for i, b in enumerate(beats) if b.get("rehook") or b.get("loop")]
    for i in rh:
        if beats[i].get("rehook") and beats[i]["rehook"] not in REHOOK_KINDS:
            errs.append(f"R3 beat {i+1}: unknown rehook kind '{beats[i]['rehook']}'")
    marks = [0.0] + [beats[i]["start"] for i in rh if i < cta0] + [beats[cta0]["start"] if cta0 < len(beats) else end]
    for a, c in zip(marks, marks[1:]):
        if c - a > MAX_GAP_S:
            errs.append(f"R3 {_t(a)}-{_t(c)}: {c - a:.0f} s without a rehook (max {MAX_GAP_S})")

    # R4 pattern interrupt at each rehook
    for i in rh:
        b, prev = beats[i], beats[i - 1] if i else None
        if not ((prev is None or b["plate"] != prev["plate"]) or str(b.get("cam", "")).startswith(PUNCH) or b.get("sfx")):
            errs.append(f"R4 beat {i+1} ({_t(b['start'])}): rehook without a pattern interrupt (new plate, punch-in or sfx)")

    # R5 wrap-up phrases before the final item; CTA last and short
    for i, b in enumerate(beats[:final_item_index]):
        m = BANNED.search(b["text"])
        if m:
            errs.append(f"R5 beat {i+1} ({_t(b['start'])}): '{m.group(0)}' before the final item")
    cta = [i for i, b in enumerate(beats) if b.get("cta")]
    if not cta:
        errs.append("R5 no CTA beat marked (cta=True)")
    else:
        if cta != list(range(cta[0], len(beats))):
            errs.append("R5 CTA beats must be the last beats of the video")
        d = sum(beats[i]["dur"] for i in cta)
        if d >= MAX_CTA_S:
            errs.append(f"R5 CTA runs {d:.1f} s (must be under {MAX_CTA_S})")

    # R6 rehook facts from the pack only
    pack = {n.replace(",", "") for n in re.findall(r"\d[\d,]*(?:\.\d+)?", pack_text)}
    for i in rh:
        bad = _nums(beats[i]["text"]) - pack
        if bad:
            errs.append(f"R6 beat {i+1}: rehook uses number(s) not in the source pack: {', '.join(sorted(bad))}")
    return errs, warns
