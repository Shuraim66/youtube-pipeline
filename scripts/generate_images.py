#!/usr/bin/env python3
"""
Generate documentary B-roll images from a script's image-prompt JSON.

CPU-only Stable Diffusion via diffusers. Designed for the pipeline's
`*_prompts.json` files produced alongside a validated script.

Usage:
    python3 scripts/generate_images.py \
        --prompts data/scripts/script_port_royal_validated_prompts.json \
        --output  data/images/port_royal
"""

import argparse
import json
import os
import time

# Diffusion models cannot render legible type, so text is suppressed hard here
# and any on-screen wording is added in the edit instead.
NEGATIVE = (
    "text, letters, words, lettering, typography, caption, subtitles, "
    "watermark, signature, logo, blurry, low quality, deformed, "
    "extra limbs, jpeg artifacts, oversaturated, cartoon"
)

# Style modifiers mirroring internal/images/prompt.go EnhancePrompt
STYLE_MODIFIERS = {
    "documentary": "cinematic documentary photography, National Geographic quality, "
                   "dramatic lighting, photorealistic, highly detailed",
    "atmospheric": "moody atmospheric shot, fog, dramatic shadows, cinematic "
                   "composition, film grain, documentary style",
    "aerial": "drone aerial photography, bird's eye view, sweeping landscape, "
              "cinematic color grading, highly detailed",
    "interior": "dramatic interior lighting, dust particles in light beams, "
                "archaeological documentation style, photorealistic",
}

CANDIDATE_MODELS = [
    "stable-diffusion-v1-5/stable-diffusion-v1-5",
    "CompVis/stable-diffusion-v1-4",
    "segmind/small-sd",
]


def enhance(prompt: str, style: str) -> str:
    mod = STYLE_MODIFIERS.get(style, STYLE_MODIFIERS["documentary"])
    return f"{prompt}, {mod}"


def load_pipeline(model_id=None):
    import torch
    from diffusers import StableDiffusionPipeline

    ids = [model_id] if model_id else CANDIDATE_MODELS
    last_err = None
    for mid in ids:
        try:
            print(f"Loading model: {mid} ...", flush=True)
            pipe = StableDiffusionPipeline.from_pretrained(
                mid, torch_dtype=torch.float32, safety_checker=None,
                requires_safety_checker=False,
            )
            pipe = pipe.to("cpu")
            pipe.set_progress_bar_config(disable=True)
            print(f"Loaded {mid}", flush=True)
            return pipe, mid
        except Exception as e:  # try the next candidate
            print(f"  failed: {type(e).__name__}: {e}", flush=True)
            last_err = e
    raise RuntimeError(f"No usable model could be loaded: {last_err}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompts", required=True)
    ap.add_argument("--output", required=True)
    ap.add_argument("--width", type=int, default=768)
    ap.add_argument("--height", type=int, default=432)
    ap.add_argument("--steps", type=int, default=20)
    ap.add_argument("--seed", type=int, default=1692)
    ap.add_argument("--model", default=None)
    ap.add_argument("--start", type=int, default=0, help="resume from this index")
    args = ap.parse_args()

    import torch

    with open(args.prompts) as f:
        data = json.load(f)
    items = data["image_prompts"]
    os.makedirs(args.output, exist_ok=True)

    pipe, model_id = load_pipeline(args.model)

    manifest = []
    total = len(items)
    for item in items:
        idx = item["index"]
        out_path = os.path.join(args.output, f"scene_{idx:02d}.png")

        if idx < args.start or os.path.exists(out_path):
            print(f"[{idx + 1}/{total}] skip (exists) {out_path}", flush=True)
            manifest.append({**item, "file_path": out_path, "status": "skipped"})
            continue

        prompt = enhance(item["prompt"], item.get("style", "documentary"))
        # Period scenes add their own exclusions (e.g. modern architecture) on
        # top of the global list via an optional "negative" field.
        negative = NEGATIVE
        if item.get("negative"):
            negative = f"{negative}, {item['negative']}"
        print(f"[{idx + 1}/{total}] {item['scene']}", flush=True)

        start = time.time()
        gen = torch.Generator("cpu").manual_seed(args.seed + idx)
        image = pipe(
            prompt=prompt,
            negative_prompt=negative,
            width=args.width,
            height=args.height,
            num_inference_steps=args.steps,
            guidance_scale=7.0,
            generator=gen,
        ).images[0]
        image.save(out_path)
        elapsed = time.time() - start
        print(f"    saved {out_path} ({elapsed:.0f}s)", flush=True)

        manifest.append({
            **item,
            "file_path": out_path,
            "enhanced_prompt": prompt,
            "time_seconds": round(elapsed, 1),
            "status": "generated",
        })

    manifest_path = os.path.join(args.output, "manifest.json")
    with open(manifest_path, "w") as f:
        json.dump({
            "script_id": data.get("script_id"),
            "model": model_id,
            "width": args.width,
            "height": args.height,
            "steps": args.steps,
            "images": manifest,
        }, f, indent=2)
    print(f"\nDone. Manifest: {manifest_path}", flush=True)


if __name__ == "__main__":
    main()
