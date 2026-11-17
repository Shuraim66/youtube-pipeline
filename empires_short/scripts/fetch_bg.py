"""Fetch per-beat background clips from Pexels (key in ../.pexels_key) into public/bg/."""
import json, sys, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KEY = (ROOT.parent / ".pexels_key").read_text().strip()
OUT = ROOT / "public" / "bg" / (sys.argv[1] if len(sys.argv) > 1 else "")
OUT.mkdir(parents=True, exist_ok=True)

QUERIES_BY_SET = {
    "": {
        "offer": "business meeting boardroom",
        "peak": "shopping mall crowd",
        "streaming": "vhs tapes",
        "collapse": "stock market crash screen",
        "bankruptcy": "empty office",
        "closed": "abandoned building",
    },
    "blackberry": {
        "peak": "businessman phone city",
        "crash": "touchscreen smartphone scrolling",
        "crash2": "stock market red screen",
        "phones": "empty factory",
        "dark": "dark city night lights off",
    },
}
QUERIES = QUERIES_BY_SET[sys.argv[1] if len(sys.argv) > 1 else ""]

def get(url):
    req = urllib.request.Request(url, headers={"Authorization": KEY, "User-Agent": "empires-short/1.0"})
    return urllib.request.urlopen(req, timeout=60)

for name, q in QUERIES.items():
    dst = OUT / f"{name}.mp4"
    if dst.exists():
        continue
    data = json.load(get(f"https://api.pexels.com/videos/search?query={urllib.parse.quote(q)}&per_page=8&orientation=portrait"))
    vids = data.get("videos") or []
    if not vids:
        data = json.load(get(f"https://api.pexels.com/videos/search?query={urllib.parse.quote(q)}&per_page=8"))
        vids = data.get("videos") or []
    best = None
    for v in vids:
        if v.get("duration", 0) < 4:
            continue
        files = sorted([f for f in v["video_files"] if f.get("height") and f["height"] <= 1920 and f.get("file_type") == "video/mp4"],
                       key=lambda f: -f["height"])
        if files:
            best = (v, files[0]); break
    if not best:
        print("no result", name, q, file=sys.stderr); continue
    v, f = best
    dst.write_bytes(get(f["link"]).read())
    print(f"{name}: {v['url']} ({f['width']}x{f['height']}, {v['duration']}s) by {v['user']['name']}")
