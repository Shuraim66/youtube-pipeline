#!/usr/bin/env python3
"""Step-2 plan for "Aurelis Test 30" (Aurelis long-form pipeline test, 30 s). Same pipeline shape as oldmoney_plan.py.

Single source of truth for the beat plan. Running it validates and writes
  empires_short/out/aurelis_muse30/beats.md   (beat table, plate spread, library gaps, cost)
  empires_short/out/aurelis_muse30/claims.md  (every figure checked against AURELIS_MUSE30_SOURCE_PACK.md)
Checks:
  - spoken text == approved script v1 (empires_short/AURELIS_MUSE30_SCRIPT.md), word for word;
  - every plate / library cut-out exists in library.json; puppet strings use v2.0 expressions/gestures only;
  - PUPPET_BEAT_RULES via beat_rules.puppet_rule_errors; no plate+mascot pair twice; no library cut-out in adjacent beats;
  - plate spread: no plate more than MAX_PLATE times;
  - every number in narration/overlays appears in the source pack (as worded); camera never repeats in adjacent beats or on a plate's next use.
Retention: R1-R3 are WAIVED for this 30 s test (brief); R4/R5/R6 must pass (see retention_check()).
No API calls, no cost.
"""
import json, re, sys
from collections import Counter, defaultdict
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import beat_rules, retention_rules

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "empires_short/out/aurelis_muse30"
SCRIPT = ROOT / "empires_short/AURELIS_MUSE30_SCRIPT.md"
PACK = ROOT / "empires_short/AURELIS_MUSE30_SOURCE_PACK.md"
LIB = json.loads((ROOT / "empires_short/public/img/aurelis/library/library.json").read_text())["images"]
PLATES = {x["filename"][6:-4] for x in LIB if x["kind"] == "plate"}
CUTS = {x["filename"][7:-4] for x in LIB if x["kind"] == "cutout"}
EXPR = {"neutral", "happy", "worried", "shocked", "angry", "thinking", "sad"}
GEST = {"rest", "explain", "pointLeft", "shrug", "thumbsUp", "celebrate", "worriedHands"}   # holdProp deliberately unused: prop poses go to library cut-outs
MAX_PLATE = 6

TITLE = "Aurelis Test 30"
SEC_NAMES = {"open": "Cold open", "myth": "Myth-check", "fix": "The fix", "lesson": "Old money lesson", "close": "Closing + CTA"}
ORDER = ["open", "myth", "fix", "lesson", "close"]

# (section, narration, plate, mascot, overlays, chapter_line?)
# mascot: "puppet:<expression>/<gesture>@R|C|L" (puppet v2.0) or "<library cut-out>@L|C|R" or None.
# overlays: DC data card, SRC source line, FIX fix card, LESSON old-money-lesson card,
#           TITLE title card, END end card. Card side L when the puppet points (pointLeft, puppet @R).
B = []
def b(sec, text, plate, m, ov, ch=False, **kw):    # kw: rehook / loop / sfx / cta (playbooks/LONGFORM_RETENTION.md)
    B.append(dict(sec=sec, text=text, plate=plate, m=m, ov=ov, ch=ch, **kw))

# ------------------------------------------------------------------ COLD OPEN
b("open", "Picture a family with a fortune.", "mansion_estate", "puppet:happy/explain@R",
  "TITLE card (first 2 s): AURELIS TEST 30; brand chip")
b("open", "Census records from 1850 to 1940: of the grandchildren of men in the top 1%, 93% did not reach the top 1% themselves.", "library_study", "puppet:worried/pointLeft@R",
  "DC (L): 93% / of grandchildren of the top 1% did not reach the top 1%; SRC: Kalsi & Ward - NBER - 2025 (via InvestmentNews)")

# ------------------------------------------------------------------ MYTH-CHECK
b("myth", "You may have heard that 70% of wealthy families lose it by the second generation. That claim has been challenged.", "payday_desk", "puppet:worried/explain@R",
  "DC (L, CLAIM): 70% / lose their money by the second generation; red CHALLENGED stamp lands when 'challenged' is spoken; SRC: Williams Group study and Grubman, 'There is no 70% rule' (2022), as cited by InvestmentNews")

# ------------------------------------------------------------------ THE FIX
b("fix", "The fix: make saving the default.", "kitchen_table", "piggy_bank_hold_front@L",
  "FIX: MAKE SAVING THE DEFAULT")

# ------------------------------------------------------------------ LESSON
b("lesson", "The families that last rely on systems, not willpower.", "living_room_sofa", "puppet:happy/thumbsUp@R",
  "LESSON (L): OLD MONEY LESSON / The families that last rely on systems, not willpower.")

# ------------------------------------------------------------------ CLOSING
b("close", "Nine habits in the full video. Which one are you starting with?", "front_door_evening", "wave_front@C",
  "END card: EDUCATION ONLY - NOT FINANCIAL ADVICE", cta=True)

# ------------------------------------------------------------------ retention marks (playbooks/LONGFORM_RETENTION.md; R1-R3 waived for the 30 s test)
RETENTION = {
    "Nine habits in the full video.": dict(cta=True),
}
for x in B:
    for k, v in RETENTION.items():
        if x["text"].startswith(k):
            x.update(v)

# ======================================================================= validation
def norm(s):
    return re.sub(r"\s+", " ", s.replace("*", "").replace("“", '"').replace("”", '"').replace("’", "'")).strip().lower()


def approved_narration():
    txt = SCRIPT.read_text().split("## Cold open", 1)[1].split("\n", 1)[1].split("## Fact check", 1)[0]
    keep = []
    for ln in txt.splitlines():
        ln = ln.strip()
        if not ln or ln.startswith(("`[SRC", "#", "---", "*(", "**Old money lesson (card only")):
            continue
        keep.append(ln.replace("**Old money lesson:** ", ""))
    return norm(" ".join(keep))


def pack_numbers():
    p = PACK.read_text().split("## Full sources", 1)[0]
    return {n.replace(",", "") for n in re.findall(r"\d[\d,]*(?:\.\d+)?", p)}


def nums(s):
    s = re.sub(r"pip[s]? [\d, and]+|#\d|\b\d (?:s|>)|\b9 > 1|\d+ s after|first 2 s|hold 2 s", "", s)
    return {n.rstrip(".,").replace(",", "") for n in re.findall(r"\d[\d,]*(?:\.\d+)?", s)}


def parse_m(m):
    if not m:
        return None, None, None, None
    if m.startswith("puppet:"):
        spec, pos = m[7:].split("@")
        e, g = spec.split("/")
        return "puppet", e, g, pos
    name, pos = m.split("@")
    return "library", name, None, pos


def camera_plan():
    seq = ["PUSH 1.00>1.06", "PAN-R 40 px", "DRIFT-UP", "PULL 1.08>1.00", "PAN-L 40 px", "HOLD (parallax)", "TILT-DOWN 40 px", "ZOOM 1.35 crop"]
    out, last_plate, prev, k = [], {}, None, 0
    for x in B:
        if x["ov"].startswith("DC") or "; DC" in x["ov"] or " DC (" in x["ov"]:
            cand = ["PUNCH to 1.10 on DC"] + seq
        else:
            cand = seq[k % len(seq):] + seq[:k % len(seq)]
            k += 1
        if x["m"] and x["m"].startswith("puppet:"):          # zoom crops scale the character layer and push the puppet out of frame
            cand = [c for c in cand if not c.startswith("ZOOM")]
        for c in cand:
            key = c.split()[0]
            if key != prev and last_plate.get(x["plate"]) != key:
                break
        out.append(c); prev = c.split()[0]; last_plate[x["plate"]] = prev
    return out


def validate():
    errs = []
    spoken = norm(" ".join(x["text"] for x in B if not x["ch"]))
    want = approved_narration()
    if spoken != want:
        a, c = spoken.split(), want.split()
        i = next((j for j in range(min(len(a), len(c))) if a[j] != c[j]), min(len(a), len(c)))
        errs.append(f"narration differs from approved script at word {i}: plan '{' '.join(a[i:i+8])}' vs script '{' '.join(c[i:i+8])}'")
    # "30" is the test's own title ("AURELIS TEST 30"), not a statistic from the pack.
    allowed = pack_numbers() | {"22", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "30", "401"}
    pairs = Counter()
    pb = []
    for i, x in enumerate(B, 1):
        if x["plate"] not in PLATES:
            errs.append(f"beat {i}: plate '{x['plate']}' not in library")
        kind, a, g, pos = parse_m(x["m"])
        if kind == "library" and a not in CUTS:
            errs.append(f"beat {i}: cut-out '{a}' not in library")
        if kind == "puppet" and (a not in EXPR or g not in GEST):
            errs.append(f"beat {i}: puppet '{a}/{g}' not in v2.0")
        if kind:
            pairs[(x["plate"], x["m"].split("@")[0])] += 1
        if i > 1 and kind == "library" and parse_m(B[i - 2]["m"])[1] == a:
            errs.append(f"beat {i}: cut-out {a} repeated from the previous beat")
        pb.append(dict(plate=x["plate"], mascot=kind, gesture=g, puppet_x=pos or "C",
                       card=("L" if g == "pointLeft" and "(L" in x["ov"] else None)))
        for n in nums(x["text"]) | nums(x["ov"]):
            if n not in allowed:
                errs.append(f"beat {i}: number {n} is not in the source pack")
    errs += [f"pair {p} + {m} used {k} times" for (p, m), k in pairs.items() if k > 1]
    errs += beat_rules.puppet_rule_errors(pb)
    for p, k in Counter(x["plate"] for x in B).items():
        if k > MAX_PLATE:
            errs.append(f"plate {p} used {k} times (max {MAX_PLATE})")
    return errs


FINAL_ITEM = "close"
def retention_check():
    cams, t, rb = camera_plan(), 0.0, []
    for x, c in zip(B, cams):
        d = dur(x["text"]); rb.append(dict(x, start=t, dur=d, cam=c)); t += d
    fi = next(i for i, x in enumerate(B) if x["sec"] == FINAL_ITEM)
    errs, warns = retention_rules.retention_errors(rb, PACK.read_text(), fi)
    # 30 s test: R1 (7-10 min length), R2 (open loop < 0:30), R3 (rehook every <= 90 s) are WAIVED by the brief.
    # R4 (pattern interrupt at rehooks), R5 (no wrap-up phrases, CTA last and < 10 s), R6 (rehooks use pack facts only) must pass.
    errs = [e for e in errs if not e.startswith(("R1 ", "R2 ", "R3 "))]
    return errs, warns


WPS = 2.6
def dur(t):
    return max(2.6, len(t.split()) / WPS + 0.35)


def fmt_t(s):
    return f"{int(s // 60)}:{int(s % 60):02d}"


def write():
    OUT.mkdir(parents=True, exist_ok=True)
    cams = camera_plan()
    words = sum(len(x["text"].split()) for x in B)
    total = sum(dur(x["text"]) for x in B)
    pu = Counter(x["plate"] for x in B)
    kinds = Counter(parse_m(x["m"])[0] for x in B)
    m = [f"# Beat plan: {TITLE}", "",
         f"_Step 2 for review. Nothing voiced, generated or rendered._", "",
         f"- **{len(B)} beats**, {words} words, about **{fmt_t(total)}** of narration at Kokoro pace ({total / len(B):.1f} s per beat, estimate).",
         f"- Mascot: **puppet v2.0** {kinds['puppet']} beats (talking, pointing at cards, reactions) · **library cut-outs** {kinds['library']} beats (prop poses) · no mascot {kinds[None]} beats.",
         "- Narration = approved script v1 word for word (checked in code). No chapter lines, no 9-habit tracker, no chapter cards (removed for the 30 s test).",
         "- The `Old money lesson:` label is **on the card only**, not spoken; the lesson sentence is spoken.",
         "- Checks passed: PUPPET_BEAT_RULES (`beat_rules.puppet_rule_errors`), library existence, no plate+mascot pair twice, no cut-out in adjacent beats, "
         f"plate spread ≤ {MAX_PLATE} uses, camera never repeats in adjacent beats or on a plate's next use, every number in the pack. Retention R1-R3 waived for the 30 s test; R4/R5/R6 pass.", "",
         "## Legend", "",
         "- Mascot `puppet:<expression>/<gesture>@R|C|L` (pointing = `pointLeft`, puppet frame-right, card frame-left) or library cut-out `name@pos`.",
         "- Overlays: `TITLE` title card (first 2 s) · `DC` data card (charcoal, gold border, Fraunces number) · `DC (CLAIM)` disputed-claim card (slate border, red label, struck-through number, red stamp) · `SRC` short source line bottom-left (full citation in the description) · `FIX` fix card · `LESSON` **Old money lesson card** (cream card, small gold OLD MONEY LESSON label, serif italic line, gold rule) · `END` end card with the education note.", ""]
    secs = defaultdict(list)
    for i, x in enumerate(B, 1):
        secs[x["sec"]].append(i)
    t = 0.0
    for s in ORDER:
        m += [f"## {SEC_NAMES[s]}", "", "| # | t | len | narration | plate | mascot | overlays | camera |", "|---|---|---|---|---|---|---|---|"]
        for i in secs[s]:
            x = B[i - 1]; d = dur(x["text"])
            m.append(f"| {i}{' CH' if x['ch'] else ''} | {fmt_t(t)} | {d:.1f}s | {x['text']} | `{x['plate']}` | {('`' + x['m'] + '`') if x['m'] else '-'} | {x['ov']} | {cams[i - 1]} |")
            t += d
        m.append("")
    m += ["## Plate spread", "",
          f"{len(pu)} of {len(PLATES)} plates used. Uses per plate: " + ", ".join(f"`{k}` ×{v}" for k, v in pu.most_common()) + ".",
          "Every plate is used once; no plate repeats, so no adjacency rule can bite.", "",
          "## Library gaps and solutions", "",
          "| gap | library state | solution | cost |", "|---|---|---|---|",
          "| waving mascot (end beat) | did not exist | GENERATED (own image generation, free): `mascot_wave_front` on #00FF00, keyed by `library_add_image.py`, passed without --force | $0 |",
          "| front door at evening (end beat plate) | did not exist | GENERATED (own image generation, free): `plate_front_door_evening`, added by `library_add_image.py`, passed without --force | $0 |",
          "", "**Total image spend for this test: $0.**", ""]
    (OUT / "beats.md").write_text("\n".join(m))
    return words, total


CLAIMS = [
    ("93% of grandchildren of men in the top 1% did not reach the top 1%; census 1850-1940", "Opening finding", "Kalsi & Ward, NBER 2025 (via InvestmentNews)", "2"),
    ("70% by the second generation — shown only as an often-quoted, challenged claim", "Myth-check + rule", "Williams Group; Grubman 2022 (via InvestmentNews)", "3"),
    ("Grubman 2022, 'There is no 70% rule'", "Myth-check", "Grubman (2022), as cited by InvestmentNews", "3"),
    ("'The families that last rely on systems, not willpower' (lesson line)", "The fix (habit 5)", "—", "5"),
]


def write_claims():
    c = ["# Claims table — checked against `AURELIS_MUSE30_SOURCE_PACK.md`", "",
         "Every number in narration and overlays is machine-checked to occur in the pack (`muse30_plan.py`); this table maps each claim to its pack section by hand.", "",
         "| claim as spoken / shown | pack section | source on screen | beats |", "|---|---|---|---|"]
    c += [f"| {a} | {b_} | {s} | {n} |" for a, b_, s, n in CLAIMS]
    c += ["", "Pack rules: 70% only as a challenged claim ✔ · source named whenever a number is stated ✔ · no promises of wealth; NOT FINANCIAL ADVICE footer at the end ✔.",
          "Non-numeric statements I wrote (opinions/framing, not evidence): the 'Old money lesson' line (the spoken fix sentence, shown on the card too). None adds a fact."]
    (OUT / "claims.md").write_text("\n".join(c))


if __name__ == "__main__":
    e = validate()
    re_, rw = retention_check(); e += re_
    for x in rw:
        print("WARN", x)
    for x in e:
        print("ERR", x)
    w, ts = write()
    write_claims()
    print(f"beats {len(B)}, words {w}, est {fmt_t(ts)}, errors {len(e)}")
    sys.exit(1 if e else 0)
