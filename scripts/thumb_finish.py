#!/usr/bin/env python3
"""Finish a thumbnail: put the Aurelis logo bottom-left on a charcoal rounded backing, resize to 1280x720, save a JPG under 2 MB.
Usage: thumb_finish.py <image> [--out DIR] [--logo PATH]
Logo height = 9% of image height, margin = 3% of image height. Output: <out>/<stem>.jpg (default empires_short/out/thumbnails/)."""
import argparse, io, re
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parent.parent
W, H, MAX_BYTES = 1280, 720, 2 * 1024 * 1024
CHARCOAL = (27, 27, 31, 215)


def finish(src: Path, logo_path: Path) -> Image.Image:
    img = ImageOps.fit(Image.open(src).convert("RGB"), (W, H), Image.LANCZOS)   # 16:9 crop-to-fill, then logo at final size
    logo = Image.open(logo_path).convert("RGBA")
    lh = round(0.09 * H); logo = logo.resize((round(logo.width * lh / logo.height), lh), Image.LANCZOS)
    pad, m = round(lh * 0.16), round(0.03 * H)
    bw, bh = logo.width + 2 * pad, lh + 2 * pad
    x, y = m, H - m - bh
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(layer).rounded_rectangle([x, y, x + bw, y + bh], radius=round(bh * 0.22), fill=CHARCOAL)
    layer.alpha_composite(logo, (x + pad, y + pad))
    return Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")


def save_jpg(img: Image.Image, dst: Path):
    for q in range(95, 50, -5):
        buf = io.BytesIO(); img.save(buf, "JPEG", quality=q, optimize=True, progressive=True)
        if buf.tell() < MAX_BYTES:
            dst.write_bytes(buf.getvalue()); return q, buf.tell()
    raise SystemExit("could not get under 2 MB")


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("image", type=Path)
    ap.add_argument("--out", type=Path, default=ROOT / "empires_short/out/thumbnails")
    ap.add_argument("--logo", type=Path, default=ROOT / "brand/aurelis_logo.png")
    a = ap.parse_args(); a.out.mkdir(parents=True, exist_ok=True)
    stem = re.sub(r"[^a-z0-9]+", "_", a.image.stem.lower()).strip("_")
    dst = a.out / f"{stem}.jpg"
    q, n = save_jpg(finish(a.image, a.logo), dst)
    print(f"{dst}  1280x720  q{q}  {n / 1024:.0f} KB")


if __name__ == "__main__":
    main()
