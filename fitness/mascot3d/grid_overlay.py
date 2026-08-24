"""
Stamp a labeled coordinate grid over the VOLT renders so we can point at exact
spots without an image editor. Columns = numbers (left->right), rows = letters
(top->bottom). Run, then open the *_grid.png files and tell me the cell(s).

Run:
  python3 fitness/mascot3d/grid_overlay.py
(needs Pillow: if it errors, run  pip install pillow  or  pip install --user pillow)
"""
import os
from PIL import Image, ImageDraw, ImageFont

R = os.path.join(os.path.dirname(__file__), "renders")
SRC = ["volt_hero_0.png", "volt_hero_3.png"]   # front, back
STEP = 90                                      # grid spacing in pixels
LINE = (255, 40, 140, 160)                     # magenta, semi-transparent
LABEL = (255, 240, 0)                          # yellow labels

def col_name(i):   # 1,2,3...
    return str(i + 1)
def row_name(i):   # A,B,C...
    s = ""
    i += 1
    while i:
        i, r = divmod(i - 1, 26)
        s = chr(65 + r) + s
    return s

try:
    font = ImageFont.truetype("DejaVuSans-Bold.ttf", 22)
except Exception:
    font = ImageFont.load_default()

for name in SRC:
    path = os.path.join(R, name)
    if not os.path.exists(path):
        print("skip (missing):", path); continue
    img = Image.open(path).convert("RGBA")
    W, H = img.size
    ov = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    ncol = (W + STEP - 1) // STEP
    nrow = (H + STEP - 1) // STEP
    for c in range(ncol + 1):
        x = c * STEP
        d.line([(x, 0), (x, H)], fill=LINE, width=1)
    for rr in range(nrow + 1):
        y = rr * STEP
        d.line([(0, y), (W, y)], fill=LINE, width=1)
    # cell labels (col+row, e.g. 3D) in the top-left of each cell
    for c in range(ncol):
        for rr in range(nrow):
            d.text((c * STEP + 3, rr * STEP + 2),
                   f"{col_name(c)}{row_name(rr)}", fill=LABEL, font=font)
    out = Image.alpha_composite(img, ov).convert("RGB")
    dst = os.path.join(R, name.replace(".png", "_grid.png"))
    out.save(dst)
    print("wrote", dst)
print("Open the *_grid.png files and tell me the cell(s), e.g. '4G on the front'.")
