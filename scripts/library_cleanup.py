#!/usr/bin/env python3
"""Free post-processing for the Aurelis library (no API calls).
  --specks id,id   remove small detached blobs (green flecks) from keyed cut-outs, re-crop (works from raw/)
  --grade          colour-grade generated plates with green furniture/grass toward the gold-on-charcoal palette (originals kept in raw/)
"""
import argparse, sys, json
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, str(Path(__file__).resolve().parent))
import gen_images_runpod as g
from gen_library_runpod import tight, OUT


def specks(ids):
    for i in ids:
        k = g.key_green(Image.open(OUT / "raw" / f"{i}.png").convert("RGB"))
        a = np.asarray(k)[..., 3] > 40
        lab, n = ndimage.label(a)
        sizes = np.array(ndimage.sum(a, lab, range(1, n + 1)))
        keep = [j + 1 for j, sz in enumerate(sizes) if sz > 0.02 * sizes.max()]
        mask = np.isin(lab, keep)
        arr = np.array(k); arr[..., 3] = np.where(mask, arr[..., 3], 0)
        tight(Image.fromarray(arr)).save(OUT / f"{i}.png")
        print(i, f"removed {n - len(keep)} blobs ({int(sizes.sum() - sizes[np.array(keep) - 1].sum())} px)")


def grade_array(rgb):
    h = np.asarray(Image.fromarray(rgb).convert("HSV")).astype(np.float32)
    hue = h[..., 0] * 360 / 255; sat = h[..., 1] / 255; val = h[..., 2] / 255
    w = np.clip(1 - np.abs(hue - 115) / 60, 0, 1) * np.clip((sat - 0.2) / 0.3, 0, 1)      # weight: how "green" (hue 55..175, saturated)
    w = ndimage.gaussian_filter(w, 1.0)
    h[..., 0] = (hue * (1 - w) + 88 * w) * 255 / 360                                       # toward sage (#B8C89E ~ 88 deg)
    h[..., 1] = np.clip(sat * (1 - 0.62 * w), 0, 1) * 255
    h[..., 2] = np.clip(val * (1 - 0.18 * w), 0, 1) * 255
    return np.asarray(Image.fromarray(h.astype(np.uint8), "HSV").convert("RGB"))


def grade(min_pct=0.7):
    lib = json.loads((OUT / "library.json").read_text())["images"]
    done = []
    for x in lib:
        if x["kind"] != "plate" or x.get("imported"):
            continue
        p = OUT / x["filename"]; raw = OUT / "raw" / x["filename"]
        src = raw if raw.exists() else p
        im = np.asarray(Image.open(src).convert("RGB"))
        h = np.asarray(Image.fromarray(im).convert("HSV")).astype(float)
        hue = h[..., 0] * 360 / 255
        pct = ((hue > 65) & (hue < 170) & (h[..., 1] / 255 > .30) & (h[..., 2] / 255 > .25)).mean() * 100
        if pct < min_pct:
            continue
        if not raw.exists():
            (OUT / "raw").mkdir(exist_ok=True); Image.fromarray(im).save(raw)
        Image.fromarray(grade_array(im)).save(p); done.append((x["id"], round(pct, 1)))
    print(len(done), "plates graded:", done)


if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("--specks"); ap.add_argument("--grade", action="store_true"); a = ap.parse_args()
    if a.specks: specks(["mascot_" + i.replace("mascot_", "") for i in a.specks.split(",")])
    if a.grade: grade()
