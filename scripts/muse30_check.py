#!/usr/bin/env python3
"""Verify the narration of "Aurelis Test 30" (adapted from oldmoney_check.py):
  - Whisper transcript == spoken beats (word for word, normalized);
  - spoken numbers == plan numbers, and the four required numbers (1850, 1940, 93, 70) are heard.
Exit 1 if anything differs, so a bad read blocks the build."""
import json, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import muse30_plan as P

OUT = P.OUT
norm = lambda s: re.sub(r"\s+", " ", s.lower().replace("’", "'").replace("“", '"').replace("”", '"')).strip()
strip_punct = lambda s: re.sub(r"[.,?!:;“”\"'()]", "", s)

A = ("zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
     "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen",
     "eighteen", "nineteen")
T = ("twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety")


def cardinal(ws):
    v, i = 0, 0
    while i < len(ws):
        w = ws[i]
        if w in A:
            v += A.index(w); i += 1
        elif w in T:
            v += (T.index(w) + 2) * 10; i += 1
        elif w == "hundred" and v:
            v *= 100; i += 1
        else:
            return None
    return v


def run_values(ws):
    out, i = [], 0
    while i < len(ws):
        if ws[i] in ("hundred", "thousand"):
            i += 1; continue
        if ws[i] in A or ws[i] in T:
            j = i
            while j < len(ws) and ws[j] in A + T + ("hundred",):
                j += 1
            run = ws[i:j]
            if run[0] in ("eighteen", "nineteen", "twenty") and len(run) >= 2 and run[1] in T:
                a, b = cardinal(run[:1]), cardinal(run[1:2])
                if a is not None and b is not None:
                    out.append(a * 100 + b)
                    i = j; continue
            v = cardinal(run)
            if v is not None:
                out.append(v)
            i = j
        else:
            i += 1
    return out


def numbers(s):
    out = [int(n) for n in re.findall(r"\d+", s)]
    out += run_values(re.sub(r"[^a-z ]", " ", s.lower()).split())
    return sorted(out)


def canon(s):
    """Canonical form for comparing spoken vs heard text: number words and digits are the same number.
    Whisper writes numbers as digits ("70 %", "1850") while the spoken text respells them as words ("seventy percent", "eighteen fifty");
    the check's own numbers() already treats the two renderings as equal, so the substring comparison must too.
    Steps: lowercase, "percent" -> "%", split hyphenated number words ("ninety-three" -> "ninety three"),
    convert number-word runs to digits (years included: "eighteen fifty" -> 1850), drop "%"."""
    s = norm(s).replace("percent", "%")
    s = re.sub(r"(ninety|eighty|seventy|sixty|fifty|forty|thirty|twenty)-", r"\1 ", s)
    toks = s.split()
    out, i = [], 0
    while i < len(toks):
        if toks[i] in A or toks[i] in T:
            j = i
            while j < len(toks) and toks[j] in A + T + ("hundred",):
                j += 1
            vals = run_values(toks[i:j])
            if vals:
                out.append(str(vals[0])); i = j; continue
        out.append(toks[i]); i += 1
    res = []
    for t in out:
        t = t.rstrip("%")
        if t:
            res.append(t)
    return " ".join(res)


def main():
    beats = json.loads((OUT / "vo_beats.json").read_text())["beats"]
    words = json.loads((OUT / "whisper_words.json").read_text())["words"]
    heard = " ".join(w["w"] for w in words)
    errs = []
    for b in beats:
        a, c = strip_punct(norm(b["spoken"])).split(), strip_punct(norm(heard)).split()
        got = " ".join(c)
        if b["text"] != P.B[b["i"] - 1]["text"]:
            errs.append(f"beat {b['i']}: spoken text was not the plan text")
        n_spk, n_pla = numbers(b["spoken"]), numbers(b["text"])
        if n_spk != n_pla:
            errs.append(f"beat {b['i']}: numbers {n_spk} != plan {n_pla}")
        a_norm = canon(strip_punct(b["spoken"]))
        if a_norm not in canon(strip_punct(heard)):
            errs.append(f"beat {b['i']}: transcript does not contain the spoken beat")
    # the four required numbers must be heard (2022 is on-screen only, in the source line — never spoken, so it is not a "must be heard" claim)
    claims = [("1850 to 1940", "1850 1940"), ("93%", "93"), ("70% claim", "70")]
    heard_all = numbers(heard)
    for label, need in claims:
        for n in [int(x) for x in need.split()]:
            if n not in heard_all:
                errs.append(f"number check: {n} from '{label}' was not heard")
    for e in errs:
        print("ERR", e)
    print(f"heard {len(words)} words, {heard_all}, errors {len(errs)}")
    sys.exit(1 if errs else 0)


if __name__ == "__main__":
    main()
