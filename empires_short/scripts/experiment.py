#!/usr/bin/env python3
"""Render V1/V2 variants of the same story locally for A/B review. NEVER uploads.

usage: python scripts/experiment.py CaponeShort CaponeShortV2 [NightfileFawcett NightfileFawcettV2 ...] [--no-render]

For each composition id:
  1. scripts/finish.sh <id> exp_<id>    (render, -14 LUFS two-pass, Whisper transcript — unchanged pipeline)
  2. ffprobe video/audio stream durations + integrated LUFS
  3. contact sheet out/experiments/<id>_sheet.png (8 evenly spaced frames from the final mp4)
  4. validator report (scripts/validate_episodes.ts --json)
  5. upsert an entry in experiments/manifest.json (channel, episode, template version, hook variant, duration, output path)
The upload manifests (aurelis_*_short.json, nightfile_manifest.json) are not touched.
"""
import datetime, json, re, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent          # empires_short/
OUT = HERE / "out" / "experiments"
MANIFEST = HERE / "experiments" / "manifest.json"


def sh(cmd, **kw):
    return subprocess.run(cmd, cwd=HERE, capture_output=True, text=True, **kw)


def probe(path):
    r = sh(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type,duration", "-of", "json", str(path)])
    streams = json.loads(r.stdout or "{}").get("streams", [])
    d = {s["codec_type"]: float(s.get("duration", 0)) for s in streams}
    lufs = re.findall(r"^\s+I:\s+(-?[\d.]+) LUFS", sh(["ffmpeg", "-i", str(path), "-af", "ebur128", "-f", "null", "-"]).stderr, re.M)
    return {"video_sec": d.get("video"), "audio_sec": d.get("audio"), "lufs": float(lufs[-1]) if lufs else None}


def sheet(mp4, png, dur):
    step = max(dur / 8, 0.1)
    sh(["ffmpeg", "-y", "-loglevel", "error", "-i", str(mp4), "-vf", f"fps=1/{step:.3f},scale=270:480,tile=8x1", "-frames:v", "1", str(png)])
    return png.exists()


def main(argv):
    ids = [a for a in argv if not a.startswith("--")]
    render = "--no-render" not in argv
    if not ids:
        sys.exit(__doc__)
    OUT.mkdir(parents=True, exist_ok=True)
    MANIFEST.parent.mkdir(exist_ok=True)
    report = json.loads(sh(["scripts/run_ts.sh", "scripts/validate_episodes.ts", "--json", *ids]).stdout or "{}")
    manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else []
    for cid in ids:
        meta = report.get(cid)
        if meta is None:
            print(f"✗ {cid}: unknown composition (not in src/archival/registry.ts)")
            continue
        errors = [i for i in meta["issues"] if i["level"] == "error"]
        if errors:
            print(f"✗ {cid}: {len(errors)} validation error(s) — not rendering"); continue
        name = f"exp_{cid}"
        mp4 = HERE / "out" / f"{name}.mp4"
        transcript = None
        if render:
            r = sh(["scripts/finish.sh", cid, name])
            lines = [l for l in r.stdout.strip().splitlines() if l.strip()]
            transcript = lines[-1].strip() if lines else None
        if not mp4.exists():
            print(f"✗ {cid}: {mp4} missing"); continue
        p = probe(mp4)
        png = OUT / f"{cid}_sheet.png"
        sheet(mp4, png, p["video_sec"] or meta["durationSec"])
        rep = OUT / f"{cid}_validation.json"
        rep.write_text(json.dumps(meta, indent=2, ensure_ascii=False))
        src = sh(["grep", "-rl", f'"{cid}"', "src/Root.tsx"]).stdout  # sanity: registered
        entry = {
            "composition": cid,
            "channel": meta["channel"],
            "episode": re.sub(r"(Short|V2)$", "", re.sub(r"^Nightfile", "", cid)).replace("Short", "").lower(),
            "templateVersion": meta["templateVersion"],
            "hookVariant": " / ".join(meta.get("hook") or []),
            "durationSec": meta["durationSec"],
            **p,
            "output": str(mp4.relative_to(HERE)),
            "contactSheet": str(png.relative_to(HERE)),
            "validation": str(rep.relative_to(HERE)),
            "warnings": [i["code"] for i in meta["issues"] if i["level"] == "warning"],
            "whisper": transcript,
            "renderedAt": datetime.datetime.now().isoformat(timespec="seconds"),
            "registered": bool(src),
            "upload": "LOCAL TEST VARIANT — do not upload; publish at most one version per story",
        }
        manifest = [m for m in manifest if m["composition"] != cid] + [entry]
        av = (p["audio_sec"] or 0) - (p["video_sec"] or 0)
        print(f"✓ {cid} [{entry['templateVersion']}] video {p['video_sec']:.2f}s audio {p['audio_sec']:.2f}s (Δ{av:+.2f}) LUFS {p['lufs']} → {entry['output']}")
    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
    print(f"manifest: {MANIFEST.relative_to(HERE)}")


if __name__ == "__main__":
    main(sys.argv[1:])
