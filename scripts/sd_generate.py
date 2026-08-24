#!/usr/bin/env python3
"""
Alternative: Direct Stable Diffusion client for image generation.
Can be used as a standalone tool or imported as a module.
"""

import argparse
import json
import os
import sys
import time
from typing import Optional

try:
    import torch
    from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
    PIper_AVAILABLE = True
except ImportError:
    print("Warning: diffusers/torch not installed.", file=sys.stderr)
    PIper_AVAILABLE = False


class StableDiffusionGenerator:
    def __init__(self, model: str = "runwayml/stable-diffusion-v1-5",
                 device: str = "cpu",
                 steps: int = 25,
                 width: int = 1024,
                 height: int = 576,
                 cfg_scale: float = 7.0):
        self.model = model
        self.device = device
        self.steps = steps
        self.width = width
        self.height = height
        self.cfg_scale = cfg_scale
        self.pipeline = None

    def load_model(self):
        """Load the Stable Diffusion model."""
        if not PIper_AVAILABLE:
            raise RuntimeError("torch and diffusers not installed")

        print(f"Loading model: {self.model}", file=sys.stderr)

        self.pipeline = StableDiffusionPipeline.from_pretrained(
            self.model,
            torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
        )

        # Use DPM-Solver for faster generation
        self.pipeline.scheduler = DPMSolverMultistepScheduler.from_config(
            self.pipeline.scheduler.config
        )

        self.pipeline = self.pipeline.to(self.device)
        print("Model loaded successfully", file=sys.stderr)

    def generate(self, prompt: str, output_path: str,
                 seed: Optional[int] = None) -> dict:
        """Generate a single image."""
        if self.pipeline is None:
            self.load_model()

        generator = None
        if seed is not None:
            generator = torch.Generator(self.device).manual_seed(seed)

        start = time.time()

        image = self.pipeline(
            prompt=prompt,
            num_inference_steps=self.steps,
            guidance_scale=self.cfg_scale,
            width=self.width,
            height=self.height,
            generator=generator,
        ).images[0]

        image.save(output_path)
        elapsed = time.time() - start

        return {
            "prompt": prompt,
            "output_path": output_path,
            "time_seconds": elapsed,
            "model": self.model,
            "steps": self.steps,
            "seed": seed,
        }

    def generate_batch(self, prompts: list, output_dir: str,
                       seed: int = 42) -> dict:
        """Generate multiple images."""
        os.makedirs(output_dir, exist_ok=True)

        results = []
        for i, prompt in enumerate(prompts):
            output_path = os.path.join(output_dir, f"image_{i:03d}.png")
            result = self.generate(prompt, output_path, seed + i)
            results.append(result)
            print(f"Generated {i+1}/{len(prompts)}", file=sys.stderr)

        return {
            "total_images": len(results),
            "results": results,
            "total_time": sum(r["time_seconds"] for r in results),
        }


def enhance_prompt(description: str, style: str = "documentary") -> str:
    """Enhance prompt with style modifiers."""
    modifiers = {
        "documentary": "cinematic documentary photography, National Geographic quality, dramatic lighting, photorealistic, 8k resolution",
        "atmospheric": "moody atmospheric shot, fog, dramatic shadows, cinematic composition, film grain, documentary style",
        "aerial": "drone aerial photography, bird's eye view, sweeping landscape, cinematic color grading, 8k resolution",
        "interior": "dramatic interior lighting, dust particles in light beams, archaeological documentation style, photorealistic",
        "night": "nighttime photography, moonlit scene, cinematic noir lighting, long exposure, moody atmosphere",
    }

    mod = modifiers.get(style, modifiers["documentary"])
    return f"{description}, {mod}"


def main():
    parser = argparse.ArgumentParser(description="Generate images via Stable Diffusion")
    parser.add_argument("--prompt", required=True, help="Text prompt for image generation")
    parser.add_argument("--output", required=True, help="Output image path")
    parser.add_argument("--model", default="runwayml/stable-diffusion-v1-5", help="Model name or path")
    parser.add_argument("--steps", type=int, default=25, help="Number of inference steps")
    parser.add_argument("--width", type=int, default=1024, help="Image width")
    parser.add_argument("--height", type=int, default=576, help="Image height")
    parser.add_argument("--cfg-scale", type=float, default=7.0, help="Classifier-free guidance scale")
    parser.add_argument("--seed", type=int, default=None, help="Random seed")
    parser.add_argument("--device", default="cpu", help="Device to use (cpu/cuda)")
    args = parser.parse_args()

    generator = StableDiffusionGenerator(
        model=args.model,
        device=args.device,
        steps=args.steps,
        width=args.width,
        height=args.height,
        cfg_scale=args.cfg_scale,
    )

    result = generator.generate(args.prompt, args.output, args.seed)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()