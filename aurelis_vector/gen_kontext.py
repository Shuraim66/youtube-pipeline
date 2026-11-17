#!/usr/bin/env python3
"""Redraw the Aurelis guide INTO an illustrated scene with FLUX Kontext (fal, commercial licence).

Usage: gen_kontext.py <reference.png> <out.png> "<instruction>" [--seed N]
The reference keeps the character's identity (white hair, round glasses, teal suit,
gold waistcoat); the instruction describes the scene and his action. Key from .fal_key.
"""
import base64
import io
import sys
from pathlib import Path

import requests
from PIL import Image

KEY = (Path(__file__).resolve().parent.parent / '.fal_key').read_text().strip()


def main():
    ref, out, instruction = sys.argv[1], sys.argv[2], sys.argv[3]
    seed = int(sys.argv[sys.argv.index('--seed') + 1]) if '--seed' in sys.argv else 11
    data = 'data:image/png;base64,' + base64.b64encode(Path(ref).read_bytes()).decode()
    r = requests.post('https://fal.run/fal-ai/flux-pro/kontext', headers={'Authorization': f'Key {KEY}'},
                      json={'prompt': instruction, 'image_url': data, 'aspect_ratio': '9:16', 'seed': seed,
                            'guidance_scale': 3.5, 'num_images': 1, 'output_format': 'png', 'safety_tolerance': '2'},
                      timeout=300)
    r.raise_for_status()
    img = Image.open(io.BytesIO(requests.get(r.json()['images'][0]['url'], timeout=120).content)).convert('RGB')
    scale = max(1080 / img.width, 1920 / img.height)
    img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    l, t = (img.width - 1080) // 2, (img.height - 1920) // 2
    img.crop((l, t, l + 1080, t + 1920)).save(out)
    print(f'wrote {out}')


if __name__ == '__main__':
    main()
