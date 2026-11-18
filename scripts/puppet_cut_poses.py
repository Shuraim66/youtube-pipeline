#!/usr/bin/env python3
"""Pose-snap sprites for the puppet: each gesture = a FULL library cut-out body with its own head removed; the puppet head layer + SVG face are drawn on top,
aligned to the sprite's face. Output: empires_short/public/img/aurelis/puppet/v2/pose_<key>.png + poses.json (ox, oy placement in the 459x806 puppet frame, head offset tx, ty).
Scale: every sprite is normalised so its face is as wide as the idle face (244 px), then stood on y=781 with the shoes centred on x=220."""
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageOps
from scipy import ndimage

R = Path(__file__).resolve().parent.parent / "empires_short"
LIB = R / "public/img/aurelis/library"; OUT = R / "public/img/aurelis/puppet/v2"
HEAD = np.array(Image.open(R / "public/img/aurelis/puppet/head_front.png").convert("RGBA"))
IDLE_FACE = (245.0, 218.0, 285.0)                 # face width, centre x, centre y in the idle frame (same measurement as for every sprite)
NECK_RGB = (238, 206, 159)
PEN_FIX = {"pointL", "p_card"}                    # alux sprites carry a pen in the shirt pocket: painted out
SHOES_FROM_IDLE = {"pointL"}                      # alux white-toe sneakers replaced by the library idle shoes
slate = lambda a: (a[..., 3] > 200) & (abs(a[..., 0].astype(int) - 74) < 24) & (abs(a[..., 1].astype(int) - 74) < 24) & (abs(a[..., 2].astype(int) - 86) < 26)
IDLE = np.array(Image.open(LIB / "mascot_idle_front.png").convert("RGBA"))
ERASE_DILATE, PROTECT = 22, 7
POSES = {   # key: (file, mirror)
  "pointL": ("mascot_alux_point_left.png", False), "thumbs": ("mascot_thumbs_up_front.png", False),
  "shrug": ("mascot_shrug_front.png", False), "celebrate": ("mascot_celebrate_front.png", False), "explain": ("mascot_explaining_front.png", False),
  "worried": ("mascot_worried_front.png", False),
  "p_cash": ("mascot_cash_fan_front.png", False), "p_card": ("mascot_alux_card_hold_up.png", False), "p_piggy_bank": ("mascot_piggy_bank_hold_front.png", False),
  "p_phone": ("mascot_phone_scroll_front.png", False), "p_receipt": ("mascot_receipt_shocked_front.png", False), "p_calendar": ("mascot_calendar_hold_front.png", False),
  "p_lottery_ticket": ("mascot_lottery_ticket_hold_front.png", False), "p_pay_slip": ("mascot_pay_slip_open_front.png", False), "p_clipboard": ("mascot_clipboard_show_front.png", False),
  "p_test_paper": ("mascot_test_paper_pencil_front.png", False), "p_car_keys": ("mascot_car_keys_hold_front.png", False),
}
skin = lambda a: (a[..., 3] > 200) & (abs(a[..., 0].astype(int) - 242) < 20) & (abs(a[..., 1].astype(int) - 207) < 26) & (abs(a[..., 2].astype(int) - 160) < 36)

def face_box(a):
    m = skin(a); lab, n = ndimage.label(ndimage.binary_opening(m, iterations=1)); sizes = ndimage.sum(m, lab, range(1, n + 1)); fi = int(np.argmax(sizes)) + 1
    ys, xs = np.where(lab == fi); return m, lab, n, sizes, fi, xs.min(), xs.max(), ys.min(), ys.max()

def paint_out_pen(a):
    """pen in the shirt pocket: cream body + ink outline, painted with the nearest surrounding shirt/pocket colour"""
    cream = (a[..., 3] > 200) & (a[..., 0] > 225) & (a[..., 1] > 215) & (a[..., 2] > 150) & (a[..., 2] < 235)
    H, W = cream.shape; box = np.zeros_like(cream); lab, n = ndimage.label(cream)
    best = None
    for i in range(1, n + 1):
        ys, xs = np.where(lab == i)
        if 60 < len(ys) < 900 and (ys.max() - ys.min()) > 1.6 * (xs.max() - xs.min()) and 420 < ys.mean() < 520: best = (i, ys, xs)
    if not best: print("  pen not found"); return a
    i, ys, xs = best; m = ndimage.binary_dilation(lab == i, iterations=9)
    # the pen's lower end sits inside the pocket: also take the pocket-brown pixels only if enclosed by the dilation (keeps the pocket edge)
    idx = ndimage.distance_transform_edt(m, return_distances=False, return_indices=True); src = a[idx[0], idx[1]]
    a2 = a.copy(); a2[m] = src[m]; return a2

def process(key, f, mir):
    im = Image.open(LIB / f).convert("RGBA")
    if mir: im = ImageOps.mirror(im)
    a = np.array(im)
    if key in PEN_FIX: a = paint_out_pen(a)
    m, lab, n, sizes, face_i, x0, x1, y0, y1 = face_box(a)
    fw = x1 - x0 + 1; hs = fw / IDLE_FACE[0]                                  # head scale = this sprite's own head size / idle head size
    fcx, fcy = (x0 + x1) / 2, (y0 + y1) / 2
    protect = np.zeros(m.shape, bool)
    for i in range(1, n + 1):
        if i == face_i or sizes[i - 1] < 500: continue
        cy2, cx2 = ndimage.center_of_mass(lab == i)
        if abs(cx2 - fcx) < 190 * hs and abs(cy2 - fcy) < 60 and sizes[i - 1] < 1400: continue          # ear
        protect |= (lab == i)
    protect = ndimage.binary_dilation(protect, iterations=PROTECT)
    # footprint of the puppet head layer (scaled by hs, centred on this sprite's face), dilated sideways/up but never below the chin line
    foot = np.zeros(m.shape, bool); ha = HEAD[..., 3] > 20; ys0, xs0 = np.where(ha)
    Y = np.round((ys0 - IDLE_FACE[2]) * hs + fcy).astype(int); X = np.round((xs0 - IDLE_FACE[1]) * hs + fcx).astype(int)
    ok = (Y >= 0) & (Y < foot.shape[0]) & (X >= 0) & (X < foot.shape[1]); foot[Y[ok], X[ok]] = True
    foot = ndimage.binary_dilation(foot, iterations=ERASE_DILATE)
    foot &= (np.arange(foot.shape[0])[:, None] < fcy + 82 * hs)               # keep the sprite's own neck and collar below the chin
    erase = foot & ~protect; a[erase, 3] = 0
    # drop tiny specks left over from the erased head (only above the shoulders)
    lab2, n2 = ndimage.label(a[..., 3] > 40)
    for i2 in range(1, n2 + 1):
        ys2, xs2 = np.where(lab2 == i2)
        if len(ys2) < 120 and ys2.max() < fcy + 80 * hs: a[lab2 == i2, 3] = 0
    # neck fill: any transparent pixel in the neck band between chin and collar becomes neck skin, edged with ink
    ny0, ny1 = int(fcy + 74 * hs), int(fcy + 118 * hs); nx0, nx1 = int(fcx - 19 * hs), int(fcx + 19 * hs)
    band = a[ny0:ny1, nx0:nx1]; hole = band[..., 3] < 40
    band[hole] = (*NECK_RGB, 255)
    for dx in (0, 1, 2, 3, 4): band[:, dx][hole[:, dx]] = (28, 19, 16, 255); band[:, band.shape[1] - 1 - dx][hole[:, band.shape[1] - 1 - dx]] = (28, 19, 16, 255)
    # feet anchor: centre of the legs (slate trousers, lower part) and the lowest opaque row
    al = a[..., 3] > 40; bottom = int(np.where(al.any(1))[0].max())
    if key in SHOES_FROM_IDLE:
        sl = slate(a); rr = slice(bottom - 175, bottom - 70); lx = np.where(sl[rr].any(0))[0]; lc = (lx.min() + lx.max()) / 2
        isl = slate(IDLE); ic = np.where(isl[640:720].any(0))[0]; icx = (ic.min() + ic.max()) / 2
        top = bottom - 62; a[top:bottom + 1, :, 3] = np.where(a[top:bottom + 1, :, 3] > 0, 0, 0)       # clear old shoe rows
        piece = IDLE[719:782]; sh = int(round(lc - icx)); H0 = piece.shape[0]
        for yy in range(H0):
            for xx in range(piece.shape[1]):
                if piece[yy, xx, 3] > 0 and 0 <= xx + sh < a.shape[1] and 0 <= bottom - H0 + 1 + yy < a.shape[0]: a[bottom - H0 + 1 + yy, xx + sh] = piece[yy, xx]
        al = a[..., 3] > 40
    sl = slate(a); rr = slice(max(bottom - 170, 0), bottom - 60); lx = np.where(sl[rr].any(0))[0]
    cxs = (lx.min() + lx.max()) / 2 if len(lx) else (np.where(al[bottom - 40:bottom + 1].any(0))[0].min() + np.where(al[bottom - 40:bottom + 1].any(0))[0].max()) / 2
    ox = int(round(220 - cxs)); oy = int(781 - bottom)
    Image.fromarray(a).save(OUT / f"pose_{key}.png")
    return {"file": f, "mirror": mir, "ox": ox, "oy": oy, "w": a.shape[1], "h": a.shape[0], "hx": round(float(fcx) + ox, 1), "hy": round(float(fcy) + oy, 1), "hs": round(float(hs), 3)}

def main():
    meta = {k: process(k, f, mir) for k, (f, mir) in POSES.items()}
    json.dump(meta, open(OUT / "poses.json", "w"), indent=1)
    for k, v in meta.items(): print(k, {x: v[x] for x in ("ox", "oy", "w", "h", "hx", "hy", "hs")})

if __name__ == "__main__":
    main()
