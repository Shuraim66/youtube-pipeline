#!/usr/bin/env python3
"""Number check: every number the narration SPEAKS (faster-whisper transcript) vs the numbers the script says in the same beat.
Writes out/aurelis_oldmoney/number_check.md. Exit 1 if any beat mismatches or a claims-table figure is not heard.
Both sides go through the same parser (digits, number words, 'point', years, 'four oh one'), so only real wording/transcription differences show."""
import json, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import oldmoney_plan as P

OUT = P.OUT
U = {w: i for i, w in enumerate("zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split())}
T = {w: 10 * (i + 2) for i, w in enumerate("twenty thirty forty fifty sixty seventy eighty ninety".split())}
NW = set(U) | set(T) | {"hundred", "thousand", "point", "oh", "and"}


def words(s):
    s = s.lower().replace("-", " ")
    return re.findall(r"[a-z]+|\d[\d,]*(?:\.\d+)?", s)


def cardinal(ws):
    tot = cur = 0
    for w in ws:
        if w in U: cur += U[w]
        elif w in T: cur += T[w]
        elif w == "hundred": cur = max(cur, 1) * 100
        elif w == "thousand": tot += max(cur, 1) * 1000; cur = 0
    return tot + cur


def run_values(run):
    """canonical values (as strings) for one run of number words"""
    run = [w for w in run if w != "and"] if "hundred" in run or "thousand" in run else run
    if "oh" in run:                                    # 'four oh one' -> 401
        return ["".join(str(U[w]) if w != "oh" else "0" for w in run if w in U or w == "oh")]
    if "point" in run:
        i = run.index("point"); a = cardinal(run[:i]); frac = "".join(str(U[w]) for w in run[i + 1:] if w in U)
        return [f"{a}.{frac}" if frac else str(a)]
    # year style: two 2-digit groups ('nineteen ninety one', 'twenty twenty five'); 'two thousand and four' is cardinal
    if "hundred" not in run and "thousand" not in run and len(run) >= 2 and run[0] in ("eighteen", "nineteen", "twenty") and (run[1] in T or (run[1] in U and U[run[1]] >= 10) or len(run) >= 3):
        a = cardinal(run[:1]); b = cardinal(run[1:])
        if 10 <= b <= 99: return [str(a * 100 + b)]
    return [str(cardinal(run))]


def numbers(text):
    toks = re.findall(r"\$?\d[\d,]*(?:\.\d+)?%?|[A-Za-z]+|\(k\)", text.lower().replace("-", " "))
    out, run = [], []
    def flush():
        nonlocal run
        r = run
        while r and r[-1] == "and": r = r[:-1]
        if r and not (len(r) == 1 and r[0] in ("point", "oh", "and")): out.extend(run_values(r))
        run = []
    i = 0
    while i < len(toks):
        t = toks[i]
        m = re.match(r"\$?(\d[\d,]*(?:\.\d+)?)%?", t)
        if m:
            flush(); out.append(m.group(1).replace(",", "").rstrip("."))
            if i + 1 < len(toks) and toks[i + 1] == "k" and False: pass
        elif t in NW and not (t == "and" and not run):
            if t == "oh" and not run: pass            # lone 'oh'
            else: run.append(t)
        else:
            flush()
        i += 1
    flush()
    return sorted(out)


def main():
    vo = json.loads((OUT / "vo_beats.json").read_text()); wh = json.loads((OUT / "whisper_words.json").read_text())["words"]
    beats = vo["beats"]
    heard = [[] for _ in beats]
    for w in wh:
        mid = (w["s"] + w["e"]) / 2
        for k, b in enumerate(beats):
            if b["start"] - 0.05 <= mid < b["start"] + b["dur"]:
                heard[k].append(w["w"]); break
    bad, rows = [], []
    for k, b in enumerate(beats):
        gtxt = re.sub(r"(\d)\s+([,.])\s*(\d)", r"\1\2\3", " ".join(heard[k])); gtxt = re.sub(r"(\d)\s+%", r"\1%", gtxt)
        exp = numbers(b["spoken"]); got = numbers(gtxt)
        ok = exp == got
        if exp or got:
            rows.append((b["i"], exp, got, ok))
        if not ok: bad.append((b["i"], b["text"], exp, got, " ".join(heard[k])))
    full = " ".join(w["w"] for w in wh); full = re.sub(r"(\d)\s+([,.])\s*(\d)", r"\1\2\3", full); full = re.sub(r"(\d)\s+%", r"\1%", full)
    claims = [("1850 to 1940", "1850 1940"), ("93%", "93"), ("72%", "72"), ("70% claim", "70"), ("90% claim", "90"), ("3,200 families", "3200"), ("2022", "2022"),
              ("top 10%", "10"), ("22.36%", "22.36"), ("over 22%", "22"), ("2026", "2026"), ("37%", "37"), ("401(k)", "401"), ("86%", "86"), ("1.2 points", "1.2"),
              ("15%", "15"), ("2025", "2025"), ("2,500 adults", "2500"), ("24%", "24"), ("43%", "43"), ("2024", "2024"), ("1,007", "1007"), ("52%", "52"), ("69%", "69"), ("about 31", "31")]
    allheard = set(numbers(full))
    miss = [(c, v) for c, v in claims if any(x not in allheard for x in v.split())]
    md = ["# Number check: spoken (faster-whisper) vs script", "", f"Beats with numbers: {len(rows)}; mismatches: {len(bad)}; claims-table figures not heard: {len(miss)}.", "",
          "| beat | script says | transcript has | ok |", "|---|---|---|---|"]
    md += [f"| {i} | {', '.join(e) or '-'} | {', '.join(g) or '-'} | {'OK' if ok else '**MISMATCH**'} |" for i, e, g, ok in rows]
    if bad:
        md += ["", "## Mismatch detail", ""] + [f"- beat {i}: \"{t}\" -> script {e}, heard {g}; heard text: \"{h}\"" for i, t, e, g, h in bad]
    if miss:
        md += ["", "## Claims-table figures not heard", ""] + [f"- {c}" for c, _ in miss]
    (OUT / "number_check.md").write_text("\n".join(md) + "\n")
    print(f"beats with numbers {len(rows)}, mismatches {len(bad)}, claims not heard {len(miss)}")
    for i, t, e, g, h in bad: print(" MISMATCH", i, e, g, "|", h)
    sys.exit(1 if bad or miss else 0)


if __name__ == "__main__":
    main()
