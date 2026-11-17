#!/usr/bin/env python3
"""Record YouTube Studio numbers at 48 h / 7 d (or an earlier snapshot) in analytics/metrics.csv, and summarise them.

Claude has no YouTube Analytics API access: every row comes from Studio numbers the user pastes. Blank = not given.

  python record_metrics.py add --video z4mA6qaOGBE --checkpoint 48h --hours 48 --views 156 --stayed 34.6 --apv 74.9 \
      [--engaged 120] [--likes 7] [--subs 1] [--date 2026-10-12] [--note "..."]
  python record_metrics.py summary            # per-channel table + medians by template / hook type
The channel, title, template version and hook type are looked up from the upload manifests (never typed by hand).
"""
import argparse, csv, datetime, json, statistics, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CSV = ROOT / "analytics" / "metrics.csv"
FIELDS = ["video_id", "channel", "title", "template", "hook_type", "checkpoint", "hours", "recorded_on",
          "views", "engaged_views", "stayed_pct", "apv_pct", "likes", "subs_gained", "note"]
CHECKPOINTS = ["early", "48h", "7d"]


def manifest_index():
    """video id → {channel, title, template, hook_type} from the upload manifests"""
    idx = {}
    for f, channel in [(p, "Aurelis HQ") for p in ROOT.glob("aurelis_*.json")] + [(ROOT / "nightfile_manifest.json", "The Night File")]:
        try:
            data = json.loads(f.read_text())
        except Exception:
            continue
        for e in data if isinstance(data, list) else [data]:
            url = isinstance(e, dict) and e.get("uploaded") or ""
            if "youtu" in str(url):
                vid = str(url).rstrip("/").split("/")[-1].split("=")[-1]
                idx[vid] = {"channel": channel, "title": e.get("title", ""), "template": e.get("templateVersion", "v1"),
                            "hook_type": e.get("hookType", "")}
    return idx


def num(v, lo=0, hi=None, name=""):
    if v is None or v == "":
        return ""
    x = float(v)
    if x < lo or (hi is not None and x > hi):
        raise SystemExit(f"{name}={v} out of range [{lo}, {hi}]")
    return int(x) if x.is_integer() and name not in ("stayed", "apv") else x


def add(a):
    idx = manifest_index()
    meta = idx.get(a.video)
    if not meta:
        raise SystemExit(f"video {a.video} is not in any upload manifest (check the id; only uploaded Shorts can be tracked)")
    if a.checkpoint not in CHECKPOINTS:
        raise SystemExit(f"--checkpoint must be one of {CHECKPOINTS}")
    row = {
        "video_id": a.video, **meta, "checkpoint": a.checkpoint, "hours": num(a.hours, 0, None, "hours"),
        "recorded_on": a.date or datetime.date.today().isoformat(),
        "views": num(a.views, 0, None, "views"), "engaged_views": num(a.engaged, 0, None, "engaged"),
        "stayed_pct": num(a.stayed, 0, 100, "stayed"), "apv_pct": num(a.apv, 0, 400, "apv"),
        "likes": num(a.likes, 0, None, "likes"), "subs_gained": num(a.subs, -1e9, None, "subs"), "note": a.note or "",
    }
    rows = read()
    rows = [r for r in rows if not (r["video_id"] == a.video and r["checkpoint"] == a.checkpoint)] + [row]
    write(rows)
    print(f"recorded {a.video} {a.checkpoint}: " + ", ".join(f"{k}={row[k]}" for k in ("views", "stayed_pct", "apv_pct", "likes", "subs_gained") if row[k] != ""))


def read():
    if not CSV.exists():
        return []
    with CSV.open() as f:
        return list(csv.DictReader(f))


def write(rows):
    CSV.parent.mkdir(exist_ok=True)
    with CSV.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        for r in rows:
            w.writerow({k: r.get(k, "") for k in FIELDS})


def summary(_a):
    rows = read()
    if not rows:
        print("no metrics recorded yet")
        return
    for ch in sorted({r["channel"] for r in rows}):
        print(f"\n{ch}")
        print(f"  {'checkpoint':<6} {'h':>4} {'views':>6} {'stayed':>7} {'apv':>6} {'likes':>5} {'subs':>4}  tmpl  title")
        for r in sorted((r for r in rows if r["channel"] == ch), key=lambda r: (r["recorded_on"], r["title"])):
            print(f"  {r['checkpoint']:<6} {r['hours']:>4} {r['views']:>6} {r['stayed_pct']:>7} {r['apv_pct']:>6} {r['likes']:>5} {r['subs_gained']:>4}  {r['template']:<4}  {r['title'][:60]}")
        for key in ("template", "hook_type"):
            groups = {}
            for r in rows:
                if r["channel"] == ch and r["checkpoint"] == "48h" and r["stayed_pct"]:
                    groups.setdefault(r[key] or "?", []).append(float(r["stayed_pct"]))
            if len(groups) > 1:
                print(f"  48h median stayed by {key}: " + ", ".join(f"{g} {statistics.median(v):.1f}% (n={len(v)})" for g, v in groups.items()))
    print("\nSmall samples, different topics and publish times: read differences as hypotheses, not causes.")


def main(argv):
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("add")
    a.add_argument("--video", required=True)
    a.add_argument("--checkpoint", required=True)
    a.add_argument("--hours")
    for k in ("views", "engaged", "stayed", "apv", "likes", "subs", "date", "note"):
        a.add_argument(f"--{k}")
    a.set_defaults(fn=add)
    s = sub.add_parser("summary")
    s.set_defaults(fn=summary)
    args = p.parse_args(argv)
    args.fn(args)


if __name__ == "__main__":
    main(sys.argv[1:])
