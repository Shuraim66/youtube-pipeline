#!/usr/bin/env python3
"""Identity references for generating NEW mascot art (Qwen via gen_library_runpod.py, or any image model such as Muse's).
Builds assets/mascot/reference_front.png and reference_threeq.png (1024x1024, flat #F4F4F4) from the approved library cut-outs
mascot_idle_front.png / mascot_idle_threeq.png, so a new pose is drawn from the real mascot art (hair fan, mustard shirt + pocket, slate trousers,
black sneakers with white soles, dark-brown outline). Free, local, deterministic.   python scripts/make_mascot_references.py"""
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parent.parent
LIB = ROOT / "empires_short/public/img/aurelis/library"
OUT = ROOT / "assets/mascot"; OUT.mkdir(parents=True, exist_ok=True)
for view in ("front", "threeq"):
    art = Image.open(LIB / f"mascot_idle_{view}.png").convert("RGBA")
    h = 900; art = art.resize((round(art.width * h / art.height), h), Image.LANCZOS)
    bg = Image.new("RGBA", (1024, 1024), (0xF4, 0xF4, 0xF4, 255))
    bg.alpha_composite(art, ((1024 - art.width) // 2, 62))
    bg.convert("RGB").save(OUT / f"reference_{view}.png"); print("wrote", OUT / f"reference_{view}.png")
