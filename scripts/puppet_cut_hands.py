#!/usr/bin/env python3
"""Cut gesture forearm+hand sprites from existing library cut-outs (viewer-left arm of each), rotate to the canonical frame
(forearm axis pointing DOWN, wrist end at the top, hand at the bottom), scale to the rest forearm width, extend the wrist end upward
so it can tuck under the sleeve cuff. Writes empires_short/public/img/aurelis/puppet/v2/hand_<name>.png + hands.json (anchor = wrist centre)."""
import json
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

R = Path(__file__).resolve().parent.parent / "empires_short"
LIB = R / "public/img/aurelis/library"; OUT = R / "public/img/aurelis/puppet/v2"
# name: (source file, bbox x0,x1,y0,y1 around the hand's skin components, wrist/base point in the source, note)
SRC = {
  "fist":   ("mascot_angry_front.png",     (40, 112, 510, 612), (80, 520)),
  "open":   ("mascot_explaining_front.png",(50, 160, 370, 482), (146, 470)),
  "point":  ("mascot_alux_point_left.png", (5, 133, 370, 428), (128, 400)),
  "thumbs": ("mascot_thumbs_up_front.png", (25, 115, 340, 472), (86, 466)),
  "spread": ("mascot_celebrate_front.png", (25, 150, 185, 320), (116, 316)),
  "shrug":  ("mascot_shrug_front.png",     (35, 155, 310, 430), (150, 424)),
}
skin = lambda a: (a[..., 3] > 200) & (abs(a[..., 0] - 242) < 20) & (abs(a[..., 1] - 207) < 26) & (abs(a[..., 2] - 160) < 36)

def extend_top(ca, n=28):
    """drop the ragged first rows (cuff residue), then repeat a clean row upward so the wrist end can tuck under the cuff"""
    cnt = (ca[..., 3] > 200).sum(1); ys = np.where(cnt > 0)[0]; y0 = int(ys.min())
    ref = np.median(cnt[y0 + 8:y0 + 26]) if len(cnt) > y0 + 26 else cnt[y0:].max()
    ystart = next((y for y in range(y0, len(cnt)) if cnt[y] >= 0.85 * ref), y0)
    row = min(ystart + 5, len(cnt) - 1)
    pad = np.zeros((n, ca.shape[1], 4), np.uint8); pad[:] = ca[row]
    cx = (np.where(ca[row, :, 3] > 200)[0].min() + np.where(ca[row, :, 3] > 200)[0].max()) / 2
    lo, hi = int(cx - 20), int(cx + 20)                         # keep the tucked-in extension no wider than a forearm
    pad[:, :max(lo, 0), 3] = 0; pad[:, hi:, 3] = 0
    return np.vstack([pad, ca[row:]])


def rest_width():
    a = np.array(Image.open(OUT / "fore_rest_L.png")); ys = np.where(a[..., 3].max(1) > 200)[0]; y = int(ys.min()) + 34
    xs = np.where(a[y, :, 3] > 200)[0]; return xs.max() - xs.min() + 1

def main():
    target = rest_width(); meta = {"target_width": int(target)}
    for name, (f, (x0, x1, y0, y1), base) in SRC.items():
        im = Image.open(LIB / f).convert("RGBA"); a = np.array(im); m = skin(a); box = np.zeros(m.shape, bool); box[y0:y1, x0:x1] = True
        m &= box; m = ndimage.binary_closing(m, iterations=3)
        lab, k = ndimage.label(m); sizes = ndimage.sum(m, lab, range(1, k + 1)); keep = [i + 1 for i, s in enumerate(sizes) if s > 150]
        m = np.isin(lab, keep); reg = ndimage.binary_dilation(m, iterations=6)
        out = a.copy(); out[..., 3] = (a[..., 3] * reg).astype(np.uint8)
        ys, xs = np.where(m); pts = np.stack([xs, ys], 1).astype(float); c = pts.mean(0)
        bp = np.array(base, float); dist = np.linalg.norm(pts - bp, axis=1); far = pts[dist >= np.percentile(dist, 70)]
        v = far.mean(0) - bp; v /= np.linalg.norm(v)             # forearm axis = from the wrist/cuff point toward the hand's far end
        ang = np.degrees(np.arctan2(v[0], v[1]))             # angle between v and +y (down); rotate image so v -> down
        rot = Image.fromarray(out).rotate(-ang * -1, resample=Image.BICUBIC, center=tuple(c), expand=True)
        # verify orientation numerically and fix if needed
        r = np.array(rot); mm = r[..., 3] > 200; yy, xx = np.where(mm)
        W0 = np.where(mm[yy.min():yy.min() + 12].any(0))[0]; Wb = np.where(mm[yy.max() - 12:yy.max()].any(0))[0]
        crop = rot.crop((xx.min() - 2, yy.min() - 2, xx.max() + 3, yy.max() + 3)); ca = np.array(crop)
        # wrist end = the narrower... use the base point distance instead: after rotation find which end is the base via the same transform
        top = ca[:14, :, 3] > 200; bot = ca[-14:, :, 3] > 200
        # base point in the rotated frame
        th = np.radians(-ang * -1); cx, cy = c
        # (rotation by PIL expand shifts the origin; track via rotating a marker image)
        mk = np.zeros(m.shape, np.uint8); mk[int(base[1]) - 2:int(base[1]) + 3, int(base[0]) - 2:int(base[0]) + 3] = 255
        mr = np.array(Image.fromarray(mk).rotate(-ang * -1, resample=Image.NEAREST, center=tuple(c), expand=True)); my, mx = np.where(mr > 0)
        by = my.mean() - (yy.min() - 2)
        if by > crop.height / 2: crop = crop.rotate(180, expand=True); ca = np.array(crop)
        # scale so the wrist end width matches the rest forearm
        top = ca[:20, :, 3] > 200; w = np.where(top.any(0))[0]; tw = w.max() - w.min() + 1; sc = target / max(tw, 1)
        sc = 1.0                                   # the library cut-outs share one scale: keep the hands at their drawn size; crop = crop.resize((int(crop.width * sc), int(crop.height * sc)), Image.LANCZOS); ca = np.array(crop)
        gold = (abs(ca[..., 0].astype(int) - 224) < 40) & (abs(ca[..., 1].astype(int) - 181) < 40) & (ca[..., 2] < 120)   # cuff residue
        ca[gold, 3] = 0
        ca = extend_top(ca)
        top = ca[34:38, :, 3] > 200; w = np.where(top.any(0))[0]; cxw = float((w.min() + w.max()) / 2)
        Image.fromarray(ca).save(OUT / f"hand_{name}.png"); meta[name] = {"size": [int(ca.shape[1]), int(ca.shape[0])], "wrist": [cxw, 24.0], "rot_deg": round(float(ang), 1), "scale": round(float(sc), 2)}
        print(name, meta[name])
    json.dump(meta, open(OUT / "hands.json", "w"), indent=1)

if __name__ == "__main__":
    main()
