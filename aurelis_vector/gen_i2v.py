#!/usr/bin/env python3
"""Animate an illustrated plate with image-to-video on fal (queue API; commercial licence).

Usage: gen_i2v.py <image.png> <out.mp4> "<motion prompt>" [--model kling21|kling25] [--seconds 5]
Key from the repo's gitignored .fal_key (never printed).
"""
import base64
import sys
import time
from pathlib import Path

import requests

KEY = (Path(__file__).resolve().parent.parent / '.fal_key').read_text().strip()
H = {'Authorization': f'Key {KEY}'}
MODELS = {
    'kling21': 'fal-ai/kling-video/v2.1/standard/image-to-video',
    'kling25': 'fal-ai/kling-video/v2.5-turbo/pro/image-to-video',
}
NEG = 'blur, distortion, morphing face, extra limbs, text, watermark, photorealistic, 3d render'


def main():
    img, out, prompt = sys.argv[1], sys.argv[2], sys.argv[3]
    model = MODELS[sys.argv[sys.argv.index('--model') + 1] if '--model' in sys.argv else 'kling21']
    secs = sys.argv[sys.argv.index('--seconds') + 1] if '--seconds' in sys.argv else '5'
    data = 'data:image/png;base64,' + base64.b64encode(Path(img).read_bytes()).decode()
    r = requests.post(f'https://queue.fal.run/{model}', headers=H, timeout=120,
                      json={'prompt': prompt, 'image_url': data, 'duration': secs, 'negative_prompt': NEG, 'cfg_scale': 0.5})
    r.raise_for_status()
    job = r.json()
    status_url, response_url = job['status_url'], job['response_url']
    t0 = time.time()
    while True:
        s = requests.get(status_url, headers=H, timeout=60).json()
        if s.get('status') == 'COMPLETED':
            break
        if time.time() - t0 > 900:
            raise TimeoutError('i2v job timed out')
        time.sleep(8)
    video_url = requests.get(response_url, headers=H, timeout=60).json()['video']['url']
    Path(out).write_bytes(requests.get(video_url, timeout=300).content)
    print(f'wrote {out} in {time.time() - t0:.0f}s via {model}')


if __name__ == '__main__':
    main()
