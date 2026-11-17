#!/usr/bin/env python3
"""Generate illustrated vertical scene plates on fal.ai (commercially licensed output).

Usage: gen_scene_plates.py <plates.json> [--only name1,name2] [--model flux|recraft] [--force]
plates.json: {"short": "atari", "style": "...", "plates": {"name": "scene prompt", ...}}
Writes public/plates/<short>/<name>.png (1080x1920 after fit) + a manifest with seeds/prompts.
The key is read from the repo's gitignored .fal_key; it is never printed or written.
"""
import io
import json
import sys
from pathlib import Path

import requests
from PIL import Image

ROOT = Path(__file__).resolve().parent
KEY = (ROOT.parent / '.fal_key').read_text().strip()
MODELS = {
    'flux': ('https://fal.run/fal-ai/flux/dev',
             lambda p, seed: {'prompt': p, 'image_size': {'width': 1088, 'height': 1920}, 'num_images': 1,
                              'num_inference_steps': 30, 'guidance_scale': 3.5, 'seed': seed,
                              'enable_safety_checker': True}),
    'recraft': ('https://fal.run/fal-ai/recraft-v3',
                lambda p, seed: {'prompt': p, 'image_size': {'width': 1080, 'height': 1920},
                                 'style': 'digital_illustration'}),
}


def generate(prompt, out, model, seed):
    url, body = MODELS[model]
    r = requests.post(url, headers={'Authorization': f'Key {KEY}'}, json=body(prompt, seed), timeout=300)
    r.raise_for_status()
    img_url = r.json()['images'][0]['url']
    img = Image.open(io.BytesIO(requests.get(img_url, timeout=120).content)).convert('RGB')
    # Cover-fit to exactly 1080x1920.
    scale = max(1080 / img.width, 1920 / img.height)
    img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    left, top = (img.width - 1080) // 2, (img.height - 1920) // 2
    img.crop((left, top, left + 1080, top + 1920)).save(out)


def main():
    spec = json.loads(Path(sys.argv[1]).read_text())
    args = sys.argv[2:]
    only = set(args[args.index('--only') + 1].split(',')) if '--only' in args else None
    model = args[args.index('--model') + 1] if '--model' in args else 'flux'
    force = '--force' in args
    folder = ROOT / 'public' / 'plates' / spec['short']
    folder.mkdir(parents=True, exist_ok=True)
    manifest_path = folder / 'manifest.json'
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    for i, (name, scene) in enumerate(spec['plates'].items()):
        if only and name not in only:
            continue
        out = folder / f'{name}.png'
        if out.exists() and not force:
            print(f'[plate] keep {name}')
            continue
        prompt = f"{scene}. {spec['style']}"
        seed = spec.get('seed', 4242) + i
        print(f'[plate] {model} {name}', flush=True)
        generate(prompt, out, model, seed)
        manifest[name] = {'model': model, 'seed': seed, 'prompt': prompt}
        manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')


if __name__ == '__main__':
    main()
