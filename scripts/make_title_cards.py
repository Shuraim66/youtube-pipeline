#!/usr/bin/env python3
"""
Composite the opening title and closing end-screen text onto their plates.

Diffusion can't render legible type, so the plates (scene 0 and 19) are
generated clean with negative space and the wording is added here. Originals
are backed up as *_plate.png so the step is repeatable.

Usage:
    python3 scripts/make_title_cards.py --images data/images/port_royal
"""

import argparse
import os
import shutil

from PIL import Image, ImageDraw, ImageFont, ImageFilter

FONT_DIR = "/usr/share/fonts/truetype/dejavu"
SERIF = os.path.join(FONT_DIR, "DejaVuSerif-Bold.ttf")
SANS = os.path.join(FONT_DIR, "DejaVuSans.ttf")
SANS_BOLD = os.path.join(FONT_DIR, "DejaVuSans-Bold.ttf")


def font(path, size):
    return ImageFont.truetype(path, size)


def text_w(draw, s, f):
    b = draw.textbbox((0, 0), s, font=f)
    return b[2] - b[0]


def draw_center(draw, cx, y, s, f, fill, shadow=(0, 0, 0, 220), dxy=3,
                tracking=0):
    """Draw horizontally-centered text with a drop shadow. Returns bottom y."""
    if tracking:
        # manual letter spacing
        total = sum(text_w(draw, ch, f) + tracking for ch in s) - tracking
        x = cx - total / 2
        for ch in s:
            draw.text((x + dxy, y + dxy), ch, font=f, fill=shadow)
            draw.text((x, y), ch, font=f, fill=fill)
            x += text_w(draw, ch, f) + tracking
    else:
        w = text_w(draw, s, f)
        x = cx - w / 2
        draw.text((x + dxy, y + dxy), s, font=f, fill=shadow)
        draw.text((x, y), s, font=f, fill=fill)
    b = draw.textbbox((0, 0), s, font=f)
    return y + (b[3] - b[1])


def scrim(img, top, bottom, strength=150):
    """Darken a horizontal band so text stays legible over any plate."""
    W, H = img.size
    band = Image.new("L", (W, H), 0)
    bd = ImageDraw.Draw(band)
    bd.rectangle([0, int(top * H), W, int(bottom * H)], fill=strength)
    band = band.filter(ImageFilter.GaussianBlur(60))
    black = Image.new("RGBA", (W, H), (5, 12, 20, 255))
    black.putalpha(band)
    return Image.alpha_composite(img.convert("RGBA"), black)


def prep(images, idx):
    path = os.path.join(images, f"scene_{idx:02d}.png")
    plate = os.path.join(images, f"scene_{idx:02d}_plate.png")
    if not os.path.exists(plate):
        shutil.copy(path, plate)
    img = Image.open(plate).convert("RGBA")
    # normalize to 1080p canvas so text sizing is predictable
    img = img.resize((1920, 1080), Image.LANCZOS)
    return img, path


def title_card(images):
    img, out = prep(images, 0)
    img = scrim(img, 0.20, 0.72, 170)
    d = ImageDraw.Draw(img)
    cx = 960
    draw_center(d, cx, 360, "THE SUNKEN CITY", font(SERIF, 118), (240, 234, 220))
    draw_center(d, cx, 500, "OF PORT ROYAL", font(SERIF, 118), (240, 234, 220))
    # rule
    d.line([(cx - 210, 665), (cx + 210, 665)], fill=(224, 118, 60), width=4)
    draw_center(d, cx, 700, "JAMAICA · 1692", font(SANS, 40),
                (200, 210, 218), tracking=14)
    img.convert("RGB").save(out)
    print(f"title -> {out}")


def end_card(images):
    img, out = prep(images, 19)
    img = scrim(img, 0.18, 0.82, 160)
    d = ImageDraw.Draw(img)
    cx = 960
    draw_center(d, cx, 330, "What else is still down there,", font(SERIF, 62),
                (240, 234, 220))
    draw_center(d, cx, 410, "preserved exactly as it fell?", font(SERIF, 62),
                (240, 234, 220))
    d.line([(cx - 180, 560), (cx + 180, 560)], fill=(224, 118, 60), width=4)
    draw_center(d, cx, 610, "SUBSCRIBE", font(SANS_BOLD, 72),
                (240, 234, 220), tracking=10)
    draw_center(d, cx, 720, "for more lost places", font(SANS, 40),
                (200, 210, 218))
    img.convert("RGB").save(out)
    print(f"end -> {out}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--images", required=True)
    args = ap.parse_args()
    title_card(args.images)
    end_card(args.images)


if __name__ == "__main__":
    main()
