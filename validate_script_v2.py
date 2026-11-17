#!/usr/bin/env python3
"""Deterministic V2 script checks (errors vs warnings) against playbooks/V2_SCRIPT_SPEC.json.

Usage: python validate_script_v2.py scripts_v2/*.json [--json]
Exit 1 if any file has an error. Stdlib only. Does not call any service or judge facts — it only checks that the
script is shaped like a V2 script and that every number/date is backed by a listed claim + source.
"""
import json, re, sys
from pathlib import Path

SPEC = json.loads((Path(__file__).parent / "playbooks" / "V2_SCRIPT_SPEC.json").read_text())


def sentences(text):
    return [s.strip() for s in re.split(r"(?<=[.!?…])\s+", text.strip()) if s.strip()]


def words(text):
    return re.findall(r"[A-Za-z0-9$%'’.,-]+", text)


def numbers(text):
    # digits (1931, $50,000, 11) — spelled-out numbers are not tracked
    return {re.sub(r"[^\d]", "", n) for n in re.findall(r"\$?\d[\d,.]*", text) if re.sub(r"[^\d]", "", n)}


def validate(doc):
    issues = []
    err = lambda code, msg: issues.append({"level": "error", "code": code, "msg": msg})
    warn = lambda code, msg: issues.append({"level": "warning", "code": code, "msg": msg})
    lim = SPEC["limits"]

    missing = [f for f in SPEC["fields"]["required"] if not doc.get(f)]
    for f in missing:
        err("missing-field", f"required field `{f}` is missing or empty")
    if "script" in missing:
        return issues
    if doc.get("channel") and doc["channel"] not in SPEC["fields"]["channel"]:
        err("channel", f"unknown channel {doc['channel']!r}")

    script = doc["script"]
    low = script.lower()
    sents = sentences(script)
    n_words = len(words(script))
    est = n_words / lim["words_per_second"]
    lo, hi = lim["target_seconds"]
    if est > lim["hard_max_seconds"]:
        err("too-long", f"~{est:.0f}s spoken ({n_words} words) exceeds the {lim['hard_max_seconds']}s hard max")
    elif not lo <= est <= hi:
        warn("duration", f"~{est:.0f}s spoken ({n_words} words); target {lo}-{hi}s")

    first = sents[0] if sents else ""
    if len(words(first)) > lim["first_sentence_max_words"]:
        warn("slow-open", f"first sentence is {len(words(first))} words; conflict should land faster")
    opener = next((g for g in SPEC["generic_openers"] if first.lower().startswith(g)), None)
    if opener:
        warn("generic-opener", f"first sentence opens generically ({opener.strip()!r})")
    for f in SPEC["filler_phrases"]:
        if f in low:
            warn("filler", f"filler phrase {f!r}")

    # each beat must add information: flag consecutive sentences that mostly repeat each other
    def bag(s):
        return {w.lower().strip(".,!?…'’") for w in words(s) if len(w) > 3}
    for a, b in zip(sents, sents[1:]):
        A, B = bag(a), bag(b)
        if A and B and len(A & B) / len(A | B) >= lim["beat_overlap_jaccard"]:
            warn("beat-repeats", f"sentence repeats the previous beat: {b!r}")

    hook = doc.get("hook") or {}
    lines = hook.get("lines") or []
    hw = len(" ".join(lines).split())
    if not 1 <= len(lines) <= 2:
        err("hook-lines", f"hook needs 1-2 lines (got {len(lines)})")
    if hw > lim["hook_max_words"]:
        err("hook-length", f"hook is {hw} words (max {lim['hook_max_words']})")
    elif hw > lim["hook_preferred_words"]:
        warn("hook-length", f"hook is {hw} words (≤{lim['hook_preferred_words']} reads faster)")
    if hook.get("emphasis") and hook["emphasis"] not in " ".join(lines):
        err("hook-emphasis", f"emphasis {hook['emphasis']!r} is not in the hook")

    payoff = doc.get("payoff") or {}
    if payoff:
        if payoff.get("kind") not in SPEC["fields"]["payoff"]["kind"]:
            err("payoff-kind", f"payoff.kind must be one of {SPEC['fields']['payoff']['kind']}")
        if not (payoff.get("text") or "").strip():
            err("payoff-missing", "payoff.text is empty")
        if not (payoff.get("source") or "").strip():
            err("payoff-source", "payoff has no source")

    claims = doc.get("claims") or []
    for i, c in enumerate(claims):
        if not (c.get("source") or "").strip():
            err("claim-source", f"claim {i} has no source: {c.get('text')!r}")
    backed = set().union(*(numbers(c.get("text", "")) for c in claims)) if claims else set()
    for n in sorted(numbers(script) - backed):
        warn("unsourced-number", f"number {n} in the script is not in any claim")

    # quotations must be sourced verbatim (straight or curly quotes, ≥3 words)
    claim_text = " ".join(c.get("text", "") for c in claims).lower()
    for q in re.findall(r'[“"]([^”"]{8,})[”"]', script):
        if len(q.split()) >= 3 and q.lower().strip(" .,!?…") not in claim_text:
            warn("unsourced-quote", f"quotation not found verbatim in any claim: {q!r}")

    # V2 workflow fields (recommended → warnings)
    cands = doc.get("hook_candidates") or []
    if len(cands) < 3:
        warn("hook-candidates", f"{len(cands)} hook candidate(s) recorded; the workflow writes 3")
    elif lines and " ".join(lines).lower() not in " ".join(cands).lower() and not any(l.lower() in " ".join(cands).lower() for l in lines):
        warn("hook-not-candidate", "chosen hook is not among hook_candidates")
    if cands and not (doc.get("hook_rationale") or "").strip():
        warn("hook-rationale", "hook_rationale missing")
    beats = doc.get("beats") or {}
    missing_beats = [r for r in SPEC["beat_roles"] if not (beats.get(r) or "").strip()]
    if missing_beats:
        warn("beats-missing", f"beats not mapped: {', '.join(missing_beats)}")
    for r, text in beats.items():
        if r not in SPEC["beat_roles"]:
            err("beat-role", f"unknown beat role {r!r}")
        elif text and text.strip() and text.strip().lower()[:40] not in low:
            warn("beat-not-in-script", f"beat {r!r} text is not in the script")

    profile = SPEC["channel_profiles"].get(doc.get("channel"), {})
    for ph in profile.get("avoid_phrases", []):
        if re.search(rf"\b{re.escape(ph)}\b", low):
            warn("off-profile", f"{ph!r} is off-profile for {doc.get('channel')}")

    if payoff.get("kind") != "unresolved":
        for m in SPEC["mystery_words"]:
            if m in low:
                warn("manufactured-mystery", f"{m!r} used but payoff.kind is {payoff.get('kind')!r} — only claim a mystery that is documented as unresolved")
    for c in SPEC["certainty_words"]:
        if re.search(rf"\b{re.escape(c)}\b", low):
            warn("certainty", f"{c!r} asserts certainty — make sure a source supports it")
    return issues


def main(argv):
    as_json = "--json" in argv
    files = [a for a in argv if not a.startswith("--")]
    report, errors = {}, 0
    for f in files:
        issues = validate(json.loads(Path(f).read_text()))
        e = sum(i["level"] == "error" for i in issues)
        errors += e
        report[f] = issues
        if not as_json:
            print(f"{'✗' if e else '✓'} {f}: {e} error(s), {len(issues) - e} warning(s)")
            for i in issues:
                print(f"    {'ERROR' if i['level'] == 'error' else 'warn '} {i['code']}: {i['msg']}")
    if as_json:
        print(json.dumps(report, indent=2, ensure_ascii=False))
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
