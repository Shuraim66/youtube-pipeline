#!/usr/bin/env python3
"""Cut the Aurelis puppet body (v2) out of the library art. No generation. Output: empires_short/public/img/aurelis/puppet/v2/*.png + parts.json
Parts (all in the 459x806 frame of mascot_idle_front.png unless noted):
  body.png        everything below the head (neck, torso with collar+pocket, legs, shoes), arms removed
  upper_L/R.png   upper arm: sleeve with rolled cuff, cut along the torso edge (6 px overlap under the torso)
  fore_rest_L/R   forearm + curled hand (rest), cut below the cuff, extended 26 px up so it can swivel under the cuff
  hand_<name>.png gesture forearm+hand sprites (canonical: forearm axis down, wrist end at the top), cropped from other library cut-outs
"""
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent / "empires_short"
LIB = ROOT / "public/img/aurelis/library"; OUT = ROOT / "public/img/aurelis/puppet/v2"; OUT.mkdir(parents=True, exist_ok=True)
SRC = Image.open(LIB / "mascot_idle_front.png").convert("RGBA"); W, H = SRC.size
SS = 4

def mask_poly(pts, size=(W, H)):
    m = Image.new("L", (size[0] * SS, size[1] * SS), 0); ImageDraw.Draw(m).polygon([(x * SS, y * SS) for x, y in pts], fill=255)
    return np.asarray(m.resize(size, Image.LANCZOS)).astype(float) / 255

def cut(mask, img=SRC):
    a = np.array(img).astype(float); a[..., 3] *= mask; return Image.fromarray(a.astype(np.uint8))

mirror = lambda pts: [(440 - x, y) for x, y in pts]
# torso edge (inner side of the sleeve): the original inner stroke, continued up to the collar
T_L = [(168, 392), (150, 418), (136, 446), (124, 474), (113, 500), (110, 536), (106, 563)]
CUFF_BOTTOM = [(52, 520), (112, 543)]                 # lower edge line of the rolled cuff (left); upper arm ends here, forearm starts here
FR_RIGHT = {"y1": 566, "x_hi": 106, "x_lo": 117}      # forearm piece right limit above / below the hem line

def left_polys():
    off = [(x + 6, y) for x, y in T_L]
    upper = [(168 + 6, 380), (20, 380), (20, CUFF_BOTTOM[0][1] + 2)] + [CUFF_BOTTOM[0], CUFF_BOTTOM[1]] + list(reversed(off[:-1]))
    upper = [(20, 380), (20, 521), (52, 521), (112, 544), (118, 538)] + list(reversed(off[:-1])) + [(174, 380)]
    fore = [(20, 521), (52, 521), (112, 544), (FR_RIGHT["x_hi"], 546), (FR_RIGHT["x_hi"], FR_RIGHT["y1"]), (FR_RIGHT["x_lo"], FR_RIGHT["y1"] + 8), (FR_RIGHT["x_lo"], 660), (20, 660)]
    arm_total = [(20, 380), (174, 380)] + list(T_L[:-1]) + [(FR_RIGHT["x_hi"], 546), (FR_RIGHT["x_hi"], FR_RIGHT["y1"]), (FR_RIGHT["x_lo"], FR_RIGHT["y1"] + 8), (FR_RIGHT["x_lo"], 660), (20, 660)]
    arm_total = [(20, 380), (174, 380)] + list(T_L[:-1]) + [(110, 536), (106, 546), (FR_RIGHT["x_hi"], FR_RIGHT["y1"]), (FR_RIGHT["x_lo"], FR_RIGHT["y1"] + 8), (FR_RIGHT["x_lo"], 660), (20, 660)]
    return upper, fore, arm_total

def main():
    up_L, fo_L, tot_L = left_polys(); up_R, fo_R, tot_R = mirror(up_L), mirror(fo_L), mirror(tot_L)
    # --- body: rows >= 380, minus both arms
    body_mask = np.ones((H, W)); body_mask[:380] = 0
    for tot in (tot_L, tot_R): body_mask *= (1 - mask_poly(tot))
    cut(body_mask).save(OUT / "body.png")
    parts = {"frame": [W, H], "shoulder": {"L": [120, 440], "R": [320, 440]}, "elbow": {"L": [86, 528], "R": [354, 528]}, "torsoEdge": {"L": T_L, "R": mirror(T_L)}}
    for side, up, fo in (("L", up_L, fo_L), ("R", up_R, fo_R)):
        up_m = mask_poly(up) * (1 - mask_poly(fo)); cut(up_m).save(OUT / f"upper_{side}.png")
        f = cut(mask_poly(fo)); a = np.array(f)
        # extend the forearm 26 px upward by repeating its first full row (hidden under the cuff)
        cnt = (a[..., 3] > 200).sum(1); ys = np.where(cnt > 0)[0]; y0 = int(ys.min()); ref = np.median(cnt[y0 + 14:y0 + 30])
        ystart = next(y for y in range(y0, H) if cnt[y] >= 0.85 * ref); row = ystart + 8
        for k in range(1, 41): a[row - k] = a[row]
        Image.fromarray(a).save(OUT / f"fore_rest_{side}.png")
    json.dump(parts, open(OUT / "parts.json", "w"), indent=1)
    # QA: re-composite at rest on charcoal (should equal the original)
    bg = Image.new("RGBA", (W, H), (43, 43, 49, 255))
    for n in ("fore_rest_L", "fore_rest_R", "upper_L", "upper_R", "body"): bg.alpha_composite(Image.open(OUT / f"{n}.png"))
    bg.alpha_composite(Image.open(ROOT / "public/img/aurelis/puppet/head_front.png"))
    orig = Image.new("RGBA", (W, H), (43, 43, 49, 255)); orig.alpha_composite(SRC)
    d = np.abs(np.array(bg).astype(int) - np.array(orig).astype(int)).sum(2)
    print("rest recomposite: pixels differing >30:", int((d > 30).sum()), "of", W * H)
    Image.fromarray(np.hstack([np.array(orig), np.array(bg)])[:, :, :3].astype(np.uint8)).save(OUT / "_qa_rest.png")
    Image.fromarray(np.clip(d * 3, 0, 255).astype(np.uint8)).save(OUT / "_qa_diff.png")

if __name__ == "__main__":
    main()
