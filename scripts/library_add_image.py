#!/usr/bin/env python3
"""Add ONE new image (a mascot cut-out or a plate) to the Aurelis library, from any source: Muse AI, another image model, a drawing, or a Qwen render.
Free and local: keys the green backdrop, crops, runs the same checks as the Qwen generator, saves the PNG and updates library.json.

  # new mascot pose drawn on a flat pure #00FF00 backdrop (see playbooks/LONGFORM_BUILD.md section 5 for the prompt):
  python scripts/library_add_image.py ~/Desktop/pose.png --id mascot_wave_front --pose wave --view front --prop none --desc "Mascot waving, front view"
  # already transparent PNG:                  add  --no-key
  # a prop pose with two figures on purpose:  add  --multi
  # a new background plate (16:9, nobody in it, no text):
  python scripts/library_add_image.py ~/Desktop/bg.png --kind plate --id plate_rooftop_night --desc "Rooftop at night, empty"

Checks (cut-outs): exactly one big figure, nothing touching the border, margin under the soles, size sanity, a rough palette check (mustard shirt + dark outline).
Use --force to save anyway after you have LOOKED at the result. Nothing is generated or paid for here.
After adding: the image is usable in a beat plan as `<id without mascot_>@L|C|R` (cut-out) or the plate name; for a puppet gesture see playbooks/LONGFORM_BUILD.md section 5."""
import argparse, json, re, sys, time
from pathlib import Path
import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import gen_images_runpod as g            # key_green (border-connected chroma key + despill)
import gen_library_runpod as L           # tight, cutout_checks, contact_sheets, OUT, INDEX

LIB = L.OUT


def palette_ok(rgba):
    """Rough identity check: the mascot has a mustard/gold shirt (~#E0B54A) and a dark outline; reject images with neither."""
    a = np.asarray(rgba.convert("RGBA")); m = a[..., 3] > 40; rgb = a[..., :3].astype(int)
    gold = (np.abs(rgb - np.array([224, 181, 74])).sum(-1) < 90) & m
    dark = (rgb.sum(-1) < 150) & m
    notes = []
    if gold.sum() < 0.03 * m.sum(): notes.append("no mustard/gold shirt found (wrong character or palette?)")
    if dark.sum() < 0.04 * m.sum(): notes.append("no dark outline/hair found")
    return notes


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("image", type=Path)
    ap.add_argument("--id", required=True, help="library id and filename stem, e.g. mascot_wave_front or plate_rooftop_night")
    ap.add_argument("--kind", choices=["cutout", "plate"], default="cutout")
    ap.add_argument("--desc", required=True); ap.add_argument("--tags", default="")
    ap.add_argument("--pose", default=""); ap.add_argument("--view", default="front"); ap.add_argument("--prop", default="none")
    ap.add_argument("--no-key", action="store_true", help="image already has a transparent background")
    ap.add_argument("--multi", action="store_true", help="more than one figure is intended (skips the single-figure check)")
    ap.add_argument("--force", action="store_true"); ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    if not re.fullmatch(r"(mascot|plate)_[a-z0-9_]+", a.id) or not a.id.startswith("mascot_" if a.kind == "cutout" else "plate_"):
        sys.exit("--id must look like mascot_<name> (cut-out) or plate_<name> (plate): lowercase letters, digits, underscores")
    src = Image.open(a.image)
    notes = []
    if a.kind == "plate":
        im = src.convert("RGB")
        if abs(im.width / im.height - 16 / 9) > 0.02: notes.append(f"not 16:9 ({im.width}x{im.height}); it will be cropped to 16:9")
        w = min(im.width, round(im.height * 16 / 9)); h = round(w * 9 / 16)
        im = im.crop(((im.width - w) // 2, (im.height - h) // 2, (im.width - w) // 2 + w, (im.height - h) // 2 + h)).resize((1536, 864), Image.LANCZOS)
        out = im
    else:
        rgba = src.convert("RGBA")
        has_alpha = (np.asarray(rgba)[..., 3] < 250).mean() > 0.02
        keyed = rgba if (a.no_key or has_alpha) else g.key_green(rgba.convert("RGB"))
        out = L.tight(keyed)
        ok, cnotes = L.cutout_checks(out)
        notes += ([n for n in cnotes if not (a.multi and "separate blobs" in n)])
        notes += palette_ok(out)
        if not (350 <= out.height <= 1300): notes.append(f"unusual height {out.height}px (library cut-outs are ~750-850 px tall)")
    for n in notes: print("CHECK:", n)
    if notes and not a.force:
        sys.exit("not saved: fix the image (or pass --force after viewing it). Nothing was written.")
    dest = LIB / f"{a.id}.png"
    if a.dry_run: print("dry run ok:", dest, out.size); return
    (LIB / "raw").mkdir(exist_ok=True); src.convert("RGBA" if a.kind == "cutout" else "RGB").save(LIB / "raw" / f"{a.id}.png")
    out.save(dest)
    idx = json.loads(L.INDEX.read_text()); imgs = [i for i in idx["images"] if i["id"] != a.id]
    tags = sorted({t.strip() for t in a.tags.split(",") if t.strip()} | ({"mascot", a.pose, a.view} if a.kind == "cutout" else {"plate"}) - {""})
    imgs.append({"filename": dest.name, "id": a.id, "kind": a.kind, "description": a.desc, "tags": tags,
                 "pose": (a.pose or None) if a.kind == "cutout" else None, "view": a.view if a.kind == "cutout" else None,
                 "prop": (None if a.prop in ("", "none") else a.prop) if a.kind == "cutout" else None, "traps": [], "imported": True,
                 "size": f"{out.width}*{out.height}", "seed": None, "source": "external (library_add_image.py)", "added": time.strftime("%F")})
    idx["images"] = imgs; idx["updated"] = time.strftime("%Y-%m-%d"); L.INDEX.write_text(json.dumps(idx, indent=1))
    try: L.contact_sheets(imgs)
    except Exception as e: print("(contact sheets not refreshed:", e, ")")
    print(f"added {dest.relative_to(LIB.parent.parent.parent.parent.parent)}  ({out.width}x{out.height}); library now has {sum(i['kind']=='plate' for i in imgs)} plates + {sum(i['kind']=='cutout' for i in imgs)} cut-outs")
    print("next: LOOK at it on a plate (a still of a beat using it), then commit the PNG + library.json. Preflight: python scripts/longform_preflight.py")


if __name__ == "__main__":
    main()
