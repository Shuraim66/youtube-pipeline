#!/usr/bin/env python3
"""Check a topic-discovery file (research/topics_<channel>_<date>.json) before Gate 1. Stdlib only.

usage: python validate_topics.py research/topics_nightfile_2026-10-12.json [--json]
Errors: <10 candidates, scores missing / outside 1–5, a top-3 pick without hook or sources, unknown channel.
Warnings: a candidate that matches an already-published topic (upload manifests + FB_DESCRIPTIONS.md), top3 not the
three highest totals, thin sourcing. Prints the ranked table. Scores are editorial judgments, not view predictions.
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CRITERIA = ["curiosity", "contradiction", "sources", "visuals", "fit", "audience"]
CHANNELS = ["Aurelis HQ", "The Night File"]
STOP = {"the", "a", "an", "of", "and", "mr", "mrs", "dr", "sir", "jr", "case", "story", "mystery", "disappearance"}


def published_corpus():
    """lower-cased titles of everything already uploaded or drafted, both channels"""
    texts = []
    for f in list(ROOT.glob("aurelis_*.json")) + [ROOT / "nightfile_manifest.json"]:
        try:
            data = json.loads(f.read_text())
        except Exception:
            continue
        for e in data if isinstance(data, list) else [data]:
            if isinstance(e, dict):
                texts.append(f"{e.get('title', '')} {Path(str(e.get('file', ''))).stem}")
    # older builders + Remotion episodes + the handoff log (catches episodes made before the upload manifests existed;
    # PROJECT_CONTEXT also mentions ideas never made, so treat a hit as "check", not proof)
    texts += [p.stem.replace("build_", "").replace("_v2", "") for p in ROOT.glob("build_*.py")]
    for d in ("empires_short/src/archival", "empires_short/src/nightfile", "empires_short/src/empire/data"):
        texts += [p.stem for p in (ROOT / d).glob("*.ts")]
    ctx = ROOT / "PROJECT_CONTEXT.md"
    if ctx.exists():
        texts.append(ctx.read_text())
    fb = ROOT / "FB_DESCRIPTIONS.md"
    if fb.exists():
        texts += re.findall(r"^##.*$", fb.read_text(), re.M)
    return " \n".join(texts).lower()


def name_tokens(name):
    return [t for t in re.findall(r"[a-z0-9]+", name.lower()) if t not in STOP and len(t) > 2]


def validate(doc, corpus=None):
    corpus = published_corpus() if corpus is None else corpus
    issues = []
    err = lambda c, m: issues.append({"level": "error", "code": c, "msg": m})
    warn = lambda c, m: issues.append({"level": "warning", "code": c, "msg": m})
    if doc.get("channel") not in CHANNELS:
        err("channel", f"channel must be one of {CHANNELS}")
    cands = doc.get("candidates") or []
    if len(cands) < 10:
        err("too-few", f"{len(cands)} candidates; research at least 10")
    ranked = []
    for c in cands:
        n = c.get("name", "?")
        sc = c.get("scores") or {}
        bad = [k for k in CRITERIA if not isinstance(sc.get(k), int) or not 1 <= sc[k] <= 5]
        if bad:
            err("scores", f"{n}: scores missing or not 1–5 for {', '.join(bad)}")
        if not c.get("sources"):
            warn("no-sources", f"{n}: no sources listed")
        toks = name_tokens(n)
        # a surname/distinct token that already appears in published titles → likely a repeat
        hits = [t for t in toks if re.search(rf"\b{re.escape(t)}\b", corpus)]
        if toks and len(hits) >= max(1, len(toks) - 1):
            warn("duplicate", f"{n}: looks already covered ({', '.join(hits)} in published titles)")
        ranked.append((sum(sc.get(k, 0) for k in CRITERIA if isinstance(sc.get(k), int)), n, c))
    ranked.sort(key=lambda x: -x[0])
    top3 = doc.get("top3") or []
    if len(top3) != 3:
        err("top3", "top3 must name exactly three candidates")
    by_name = {c.get("name"): c for c in cands}
    for n in top3:
        c = by_name.get(n)
        if not c:
            err("top3-unknown", f"top3 entry {n!r} is not a candidate")
            continue
        if not (c.get("hook") or "").strip():
            err("top3-hook", f"{n}: top-3 pick needs its strongest hook")
        if len(c.get("sources") or []) < 1:
            err("top3-sources", f"{n}: top-3 pick needs sources")
    best = {n for _, n, _ in ranked[:3]}
    if top3 and set(top3) != best:
        warn("top3-not-highest", f"top3 differs from the three highest totals ({', '.join(sorted(best))}) — explain why in notes")
    return issues, ranked


def main(argv):
    as_json = "--json" in argv
    rc = 0
    for f in [a for a in argv if not a.startswith("--")]:
        issues, ranked = validate(json.loads(Path(f).read_text()))
        e = sum(i["level"] == "error" for i in issues)
        rc |= bool(e)
        if as_json:
            print(json.dumps({"file": f, "issues": issues, "ranking": [[t, n] for t, n, _ in ranked]}, indent=2))
            continue
        print(f"{'✗' if e else '✓'} {f}: {e} error(s), {len(issues) - e} warning(s)")
        for i in issues:
            print(f"    {'ERROR' if i['level'] == 'error' else 'warn '} {i['code']}: {i['msg']}")
        print("    rank  total  " + "  ".join(k[:5] for k in CRITERIA) + "  name")
        for r, (t, n, c) in enumerate(ranked, 1):
            sc = c.get("scores") or {}
            print(f"    {r:>4}  {t:>5}  " + "  ".join(f"{sc.get(k, '-'):>5}" for k in CRITERIA) + f"  {n}")
    return rc


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
