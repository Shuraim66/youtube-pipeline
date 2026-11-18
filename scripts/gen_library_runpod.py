#!/usr/bin/env python3
"""Generate the reusable Aurelis image library via RunPod's PUBLIC Qwen-Image-Edit endpoint ($0.025/image; no pods).

  plan   : scripts/library_catalogue.py (40 plates + 100 mascot cut-outs)  ->  empires_short/out/experiments/library/LIBRARY_PLAN.md
  output : empires_short/public/img/aurelis/library/{plate_*.png, mascot_*.png, raw/*.png, gen_log.json, library.json, contact_*.png}
  cap    : HARD $3.50 counted from gen_log.json (billed images only); the run stops before an image that would pass it.
  checks : cut-outs: one connected figure (no extra characters), no alpha touching the border, margin under the soles, green fringe report.
           plates: no automatic text check is possible, so a contact sheet is produced for visual review; mark failures with --reject id,id
           and re-run with --retry (new seed, billed again, still under the cap).

  gen_library_runpod.py --plan                       # list + cost, no calls
  gen_library_runpod.py --dry-run --limit 3          # print prompts, no calls
  gen_library_runpod.py --tier 1                     # generate tier 1 (skips files that exist)
  gen_library_runpod.py --tier 2
  gen_library_runpod.py --reject plate_gym_floor --retry   # redo rejected ids with seed+1
  gen_library_runpod.py --index                      # rebuild library.json + contact sheets from the log (free)
Key: RUNPOD_API_KEY from the environment or ./.env (never printed). Never uploads anything.
"""
import argparse, io, json, sys, time, urllib.request
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import library_catalogue as cat  # noqa: E402
import gen_images_runpod as g  # noqa: E402  (call, key_green, fringe_report, to_data_uri, blank_canvas, REF, REF3)
from runpod_api import balance  # noqa: E402

OUT = cat.ROOT / "empires_short/public/img/aurelis/library"
LOG = OUT / "gen_log.json"
INDEX = OUT / "library.json"


def load_log():
    return json.loads(LOG.read_text()) if LOG.exists() else []


def spent(log):
    return round(sum(e.get("cost_usd", 0) for e in log), 3)


def cutout_checks(rgba):
    """-> (ok, notes). One big figure, nothing touching the border, margin under the soles."""
    from scipy import ndimage
    a = np.asarray(rgba)[..., 3] > 40
    lab, n = ndimage.label(a)
    notes = []
    if n == 0:
        return False, ["empty"]
    sizes = np.array(ndimage.sum(a, lab, range(1, n + 1)))
    big = int((sizes > 0.08 * sizes.max()).sum())          # a second figure/duplicate is a large separate blob (props/cash pieces are small or attached)
    if big > 1:
        notes.append(f"{big} large separate blobs (extra character?)")
    if a[0].any() or a[-1].any() or a[:, 0].any() or a[:, -1].any():
        notes.append("figure touches the image border")
    ys = np.where(a.any(1))[0]
    if a.shape[0] - 1 - ys.max() < 12:
        notes.append("no margin under the soles")
    return not notes, notes


def tight(rgba, pad=24):
    """Crop a keyed 1536x864 cut-out to its alpha bounding box + padding (matches the imported AluxTest crops)."""
    bb = rgba.split()[3].point(lambda v: 255 if v > 40 else 0).getbbox()
    if not bb:
        return rgba
    return rgba.crop((max(0, bb[0] - pad), max(0, bb[1] - pad), min(rgba.width, bb[2] + pad), min(rgba.height, bb[3] + pad)))


def import_all(items, log):
    """Copy the 27 approved AluxTest plates / keyed cut-outs into the library (free, idempotent)."""
    done = {e["id"] for e in log if e.get("imported") and e.get("status") == "pass"}
    n = 0
    for it in items:
        if not it.get("imported") or it["id"] in done:
            continue
        dest = OUT / f"{it['id']}.png"
        im = Image.open(it["src"]); im = im.convert("RGB" if it["kind"] == "plate" else "RGBA"); im.save(dest)
        log.append({"id": it["id"], "file": dest.name, "status": "pass", "cost_usd": 0.0, "imported": True,
                    "src": str(Path(it["src"]).relative_to(cat.ROOT)), "size": f"{im.width}*{im.height}", "ts": time.strftime("%F %T")}); n += 1
    if n:
        LOG.write_text(json.dumps(log, indent=1))
    return n


def save_index(items, log):
    ok = {}
    for e in log:
        ok[e["id"]] = e                                      # last entry per id wins
    lib = []
    for it in items:
        e = ok.get(it["id"])
        if not e or e.get("status") != "pass" or not (OUT / e["file"]).exists():
            continue
        lib.append({"filename": e["file"], "id": it["id"], "kind": it["kind"], "description": it["description"], "tags": it["tags"],
                    "pose": it["pose"], "view": it["view"], "prop": it["prop"], "traps": it.get("traps", []), "imported": bool(e.get("imported")),
                    "size": e.get("size"), "seed": e.get("seed")})
    INDEX.write_text(json.dumps({"updated": time.strftime("%Y-%m-%d"), "style": "Aurelis flat hand-drawn (AURELIS_STYLE_GUIDE.md)",
                                 "note": "plates are 1536x864 RGB; mascot files are RGBA cut-outs. Pick by tag, e.g. kind=='plate' and 'bank' in tags.",
                                 "images": lib}, indent=1))
    return lib


def contact_sheets(lib):
    """plates 8 per sheet (4x2); cut-outs 20 per sheet on charcoal (5x4)."""
    from PIL import ImageDraw
    for kind, cols, cell in (("plate", 7, (300, 190)), ("cutout", 11, (190, 235))):          # one overview sheet per kind
        sel = [x for x in lib if x["kind"] == kind]
        rows = -(-len(sel) // cols)
        sheet = Image.new("RGB", (cols * cell[0], max(1, rows) * cell[1]), (0x2B, 0x2B, 0x31)); d = ImageDraw.Draw(sheet)
        for k, x in enumerate(sel):
            im = Image.open(OUT / x["filename"]).convert("RGBA"); im.thumbnail((cell[0] - 8, cell[1] - 22))
            px, py = (k % cols) * cell[0] + 4, (k // cols) * cell[1] + 4
            sheet.paste(im, (px, py), im); d.text((px, py + im.height + 2), ("*" if x.get("imported") else "") + x["id"].replace("mascot_", "").replace("plate_", "")[:30], fill=(244, 236, 216))
        sheet.save(OUT / f"contact_{kind}s_all.png")
    for kind, cols, rows, cell in (("plate", 4, 2, (480, 270)), ("cutout", 5, 4, (260, 300))):
        sel = [x for x in lib if x["kind"] == kind]
        per = cols * rows
        for s in range(0, len(sel), per):
            sheet = Image.new("RGB", (cols * cell[0], rows * cell[1]), (0x2B, 0x2B, 0x31))
            from PIL import ImageDraw
            d = ImageDraw.Draw(sheet)
            for k, x in enumerate(sel[s:s + per]):
                im = Image.open(OUT / x["filename"]).convert("RGBA"); im.thumbnail((cell[0] - 8, cell[1] - 22))
                px, py = (k % cols) * cell[0] + 4, (k // cols) * cell[1] + 4
                sheet.paste(im, (px, py), im); d.text((px, py + im.height + 2), x["id"][:38], fill=(244, 236, 216))
            sheet.save(OUT / f"contact_{kind}_{s // per + 1}.png")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--plan", action="store_true"); ap.add_argument("--dry-run", action="store_true"); ap.add_argument("--index", action="store_true")
    ap.add_argument("--tier", type=int, choices=[1, 2]); ap.add_argument("--limit", type=int)
    ap.add_argument("--ids", help="comma list of ids"); ap.add_argument("--reject", help="comma list of ids to mark rejected"); ap.add_argument("--retry", action="store_true"); ap.add_argument("--recrop", action="store_true")
    ap.add_argument("--seed", type=int, default=7)
    a = ap.parse_args()
    items = cat.build(); log = load_log(); OUT.mkdir(parents=True, exist_ok=True)

    if a.plan:
        print(cat.plan_md(items)); return
    if a.reject:
        for i in a.reject.split(","):
            log.append({"id": i, "file": None, "status": "rejected", "cost_usd": 0.0, "ts": time.strftime("%F %T")})
        LOG.write_text(json.dumps(log, indent=1)); print("rejected:", a.reject); return
    if a.recrop:                                              # free: re-key raw/ and crop every generated cut-out that passed
        n = 0
        for e in log:
            r = OUT / "raw" / (e.get("file") or "x")
            if e.get("status") == "pass" and not e.get("imported") and r.exists():
                tight(g.key_green(Image.open(r).convert("RGB"))).save(OUT / e["file"]); n += 1
        print("recropped", n); lib = save_index(items, log); contact_sheets(lib); return
    if a.index:
        lib = save_index(items, log); contact_sheets(lib); print(len(lib), "images indexed"); return

    status = {}
    for e in log:
        status[e["id"]] = e.get("status")
    if not a.plan and not a.dry_run:
        print("imported", import_all(items, log), "AluxTest items")
    want = [i for i in items if not i.get("imported") and (not a.tier or i["tier"] == a.tier) and (not a.ids or i["id"] in a.ids.split(","))]
    if a.retry:
        want = [i for i in want if status.get(i["id"]) in ("rejected", "fail")]
    else:
        want = [i for i in want if status.get(i["id"]) != "pass"]
    want.sort(key=lambda i: (i["tier"], i["kind"] != "plate"))
    if a.limit:
        want = want[:a.limit]
    total = spent(log)
    print(f"{len(want)} to do; spent so far ${total:.3f} of ${cat.CAP:.2f}; est. ${len(want) * cat.PRICE:.3f}")
    if a.dry_run:
        for i in want:
            print(f"\n--- {i['id']}\n{i['prompt']}")
        return
    try:
        print("account balance (API):", balance())
    except Exception as e:
        print("balance check failed:", str(e)[:80])

    for it in want:
        if total + cat.PRICE > cat.CAP + 1e-9:
            print(f"STOP: next image would pass the ${cat.CAP:.2f} cap (spent ${total:.3f})"); break
        tries = sum(1 for e in log if e["id"] == it["id"] and e.get("file"))
        seed = a.seed + tries
        plate = it["kind"] == "plate"
        dest = OUT / f"{it['id']}.png"
        entry = {"id": it["id"], "file": dest.name, "prompt": it["prompt"], "seed": seed, "endpoint": "qwen-image-edit-2511-lora", "size": g.SIZE, "ts": time.strftime("%F %T")}
        try:
            refs = [g.to_data_uri(g.blank_canvas())] if plate else [g.to_data_uri(g.REF), g.to_data_uri(g.REF3)]
            r = g.call(it["prompt"], refs, seed, None, 0.8)
            data = urllib.request.urlopen(urllib.request.Request(r["output"]["result"], headers={"User-Agent": "aurelis/1.0"}), timeout=120).read()
            img = Image.open(io.BytesIO(data)).convert("RGB")
            cost = float(r["output"].get("cost", cat.PRICE)); total += cost; entry["cost_usd"] = cost
            if plate:
                img.save(dest); entry["status"] = "pass"; entry["note"] = "pending visual review (text / characters)"
            else:
                (OUT / "raw").mkdir(exist_ok=True); img.save(OUT / "raw" / dest.name)
                k = g.key_green(img); ok, notes = cutout_checks(k)
                if it.get("multi_figure"):   # two intended figures: skip the one-figure check, eye review instead
                    notes = [n for n in notes if "blobs" not in n]; ok = not notes; notes = notes or ["multi-figure: pending eye review"]
                tight(k).save(dest); entry.update(fringe=g.fringe_report(k), status="pass" if ok else "rejected", note="; ".join(notes))
            print(("ok   " if entry["status"] == "pass" else "FLAG ") + it["id"], entry.get("note", ""))
        except Exception as e:
            entry.update(status="fail", error=str(e)[:200], cost_usd=0.0); print("FAIL", it["id"], str(e)[:100])
        log.append(entry); LOG.write_text(json.dumps(log, indent=1))
    lib = save_index(items, log); contact_sheets(lib)
    print(f"done. spent ${total:.3f} of ${cat.CAP:.2f}; {len(lib)} indexed; contact sheets in {OUT.relative_to(cat.ROOT)}")


if __name__ == "__main__":
    main()
