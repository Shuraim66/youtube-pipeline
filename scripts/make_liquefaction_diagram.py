#!/usr/bin/env python3
"""
Render the liquefaction cross-section explainer.

Diffusion models cannot depict an abstract geological process reliably, so the
documentary's central reveal is drawn deterministically instead. Two panels:
packed sand carrying a building, then the same ground shaken into a slurry
with the building settling straight down, still intact.

Usage:
    python3 scripts/make_liquefaction_diagram.py --output data/images/port_royal
"""

import argparse
import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, FancyArrow, Polygon, Rectangle
import numpy as np

BG = "#0d1b26"
SAND = "#c8a86b"
SAND_DK = "#8f7442"
WATER = "#2f7f93"
WATER_LT = "#5fb6c9"
BUILDING = "#e8dcc4"
BUILDING_DK = "#b9a888"
INK = "#f2ece0"
MUTED = "#9bb0bd"
ACCENT = "#e0763c"


def sand_grains(ax, rng, n, x0, x1, y0, y1, r, color, alpha=1.0):
    for _ in range(n):
        x = rng.uniform(x0, x1)
        y = rng.uniform(y0, y1)
        ax.add_patch(Circle((x, y), r, facecolor=color, edgecolor=SAND_DK,
                            linewidth=0.4, alpha=alpha, zorder=3))


def building(ax, x, base_y, w=1.9, h=1.25, sunk=0.0):
    """Draw an intact structure whose base sits at base_y, sunk by `sunk`."""
    y = base_y - sunk
    ax.add_patch(Rectangle((x, y), w, h, facecolor=BUILDING,
                           edgecolor=BUILDING_DK, linewidth=1.6, zorder=6))
    ax.add_patch(Polygon([[x - 0.16, y + h], [x + w + 0.16, y + h],
                          [x + w / 2, y + h + 0.55]],
                         closed=True, facecolor=BUILDING_DK,
                         edgecolor=BUILDING_DK, linewidth=1.4, zorder=6))
    for wx in (x + 0.42, x + w - 0.62):
        ax.add_patch(Rectangle((wx, y + 0.45), 0.3, 0.36,
                               facecolor=BG, edgecolor=BUILDING_DK,
                               linewidth=1.0, zorder=7))


def panel(ax, title, caption, shaken, rng):
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 8.8)
    ax.axis("off")
    ax.set_facecolor(BG)

    ground = 4.3

    # sky / sea above grade
    ax.add_patch(Rectangle((0, ground), 10, 8.8 - ground,
                           facecolor="#14293a", edgecolor="none", zorder=0))
    # saturated ground mass
    ax.add_patch(Rectangle((0, 0), 10, ground,
                           facecolor=WATER if shaken else "#6b5836",
                           edgecolor="none", alpha=0.95 if shaken else 1.0,
                           zorder=1))

    if shaken:
        # grains suspended and dispersed, water dominant
        sand_grains(ax, rng, 210, 0.2, 9.8, 0.25, ground - 0.15, 0.088,
                    SAND, alpha=0.9)
        # pore water forcing upward, kept clear of the building and its label
        for x in np.linspace(0.9, 9.1, 9):
            if 2.6 < x < 6.4:
                continue
            ax.add_patch(FancyArrow(x, 0.7, 0, 2.5, width=0.035,
                                    head_width=0.19, head_length=0.34,
                                    facecolor=WATER_LT, edgecolor="none",
                                    alpha=0.85, zorder=5))
        building(ax, 4.05, ground, sunk=1.55)
        # settlement indicator
        ax.annotate("", xy=(3.72, ground - 1.5), xytext=(3.72, ground - 0.05),
                    arrowprops=dict(arrowstyle="-|>", color=ACCENT, lw=2.4),
                    zorder=9)
        ax.text(3.48, ground - 0.78, "settles\nintact", color=ACCENT,
                fontsize=14, ha="right", va="center", linespacing=1.35,
                fontweight="bold", zorder=10,
                bbox=dict(facecolor=BG, edgecolor="none", alpha=0.8, pad=3.5))
    else:
        # densely packed grains in contact, load carried grain to grain
        sand_grains(ax, rng, 430, 0.2, 9.8, 0.25, ground - 0.12, 0.105, SAND)
        building(ax, 4.05, ground, sunk=0.0)

    # grade line
    ax.plot([0, 10], [ground, ground], color=INK, lw=1.5, alpha=0.55, zorder=8)

    ax.text(0.15, 8.45, title, color=INK, fontsize=25, fontweight="bold",
            va="top", zorder=10)
    ax.text(0.15, 7.68, caption, color=MUTED, fontsize=15.5, va="top",
            linespacing=1.5, zorder=10)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--output", required=True, help="output directory")
    ap.add_argument("--name", default="scene_12.png")
    args = ap.parse_args()

    rng = np.random.default_rng(1692)
    fig, axes = plt.subplots(1, 2, figsize=(19.2, 10.8), dpi=100)
    fig.patch.set_facecolor(BG)
    fig.subplots_adjust(left=0.035, right=0.965, top=0.87, bottom=0.10,
                        wspace=0.10)

    panel(axes[0], "Before the shaking",
          "Sand grains rest against one another.\nThat grain-to-grain contact carries the building.",
          shaken=False, rng=rng)
    panel(axes[1], "During the shaking",
          "Shaking lifts the water pressure between grains.\nThe ground briefly behaves like a liquid.",
          shaken=True, rng=rng)

    fig.suptitle("Liquefaction", color=INK, fontsize=42, fontweight="bold",
                 x=0.035, y=0.965, ha="left")
    fig.text(0.035, 0.048,
             "Buildings sank rather than toppled — which is why so much of "
             "Port Royal was preserved where it stood.",
             color=MUTED, fontsize=17)

    os.makedirs(args.output, exist_ok=True)
    out = os.path.join(args.output, args.name)
    fig.savefig(out, facecolor=BG)
    print(f"saved {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
