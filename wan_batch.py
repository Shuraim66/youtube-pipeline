#!/usr/bin/env python3
"""
wan_batch.py  —  WAN 2.2 image-to-video micro-motion, batch mode.
Drop-in replacement for ltx_batch.py: runs on the RunPod GPU, animates FLUX
stills into subtle-motion clips, writes <name>_mo.mp4 next to each still so the
builders' img: branch picks them up UNCHANGED (see build_enron_v2.py:228).

WHY WAN over LTX: WAN 2.2 I2V is the photoreal/motion-coherence quality leader
among open models (the "Alux-tier polish" upgrade). fp8 + cpu offload fits a
24GB 3090; 720p source is upscaled to 1080x1920 in the builder anyway.

POD WORKFLOW (same as LTX):
  1. FLUX stills already in /workspace/out/<name>.jpg
  2. list them in /workspace/wan_list.json  ==  ["enron_hq","enron_shred",...]
  3. python wan_batch.py            # animates each -> /workspace/out/<name>_mo.mp4
  4. scp the *_mo.mp4 back into  flux_images/<short>/   then STOP the pod
  5. rebuild locally (ffmpeg) — builder uses the motion clips automatically.

Model: Wan-AI/Wan2.2-I2V-A14B-Diffusers (720p), loaded in fp8 via diffusers
layerwise casting + enable_model_cpu_offload(). Reuses HF_HOME=/workspace/hf
and the stored read token (WAN repos are ungated, but token is harmless).

Deps (venv_flux already has torch/diffusers; add if missing):
  pip install -U diffusers transformers accelerate ftfy imageio imageio-ffmpeg
"""
import os, sys, json, gc, time

# --- config (env-overridable) ---------------------------------------------
ROOT      = os.environ.get("WAN_ROOT", "/workspace")
OUT       = os.path.join(ROOT, "out")                 # stills in, _mo.mp4 out
LISTFILE  = os.path.join(ROOT, "wan_list.json")
MODEL_ID  = os.environ.get("WAN_MODEL", "Wan-AI/Wan2.2-I2V-A14B-Diffusers")
HF_HOME   = os.environ.get("HF_HOME", os.path.join(ROOT, "hf"))
TOKENFILE = os.path.join(HF_HOME, "token")

# 720p vertical source; builder crops/scales to 1080x1920 regardless.
WIDTH     = int(os.environ.get("WAN_W", "720"))
HEIGHT    = int(os.environ.get("WAN_H", "1280"))
FPS       = int(os.environ.get("WAN_FPS", "16"))
NUM_FRAMES= int(os.environ.get("WAN_FRAMES", "49"))   # 49f @16fps ~= 3.0s (matches ltx)
STEPS     = int(os.environ.get("WAN_STEPS", "30"))
GUIDE     = float(os.environ.get("WAN_GUIDE", "5.0"))
# Subtle, on-brand micro-motion — NOT text-to-video. Keep it restrained.
PROMPT    = os.environ.get("WAN_PROMPT",
    "subtle cinematic camera push-in, gentle parallax, slow controlled motion, "
    "photoreal, film grain, atmospheric, no warping, no morphing")
NEG       = os.environ.get("WAN_NEG",
    "fast motion, jitter, warping, morphing, distortion, flicker, extra limbs, "
    "text, watermark, oversaturated, cartoon")

os.environ.setdefault("HF_HOME", HF_HOME)
if os.path.exists(TOKENFILE):
    try:
        os.environ.setdefault("HF_TOKEN", open(TOKENFILE).read().strip())
    except Exception:
        pass

import torch
from diffusers import AutoencoderKLWan, WanImageToVideoPipeline
from diffusers.hooks import apply_layerwise_casting
from diffusers.utils import export_to_video, load_image
from PIL import Image

def log(*a):
    print("[wan]", *a, flush=True)

def load_pipe():
    log(f"loading {MODEL_ID} (fp8 layerwise + cpu offload) ...")
    vae = AutoencoderKLWan.from_pretrained(MODEL_ID, subfolder="vae",
                                           torch_dtype=torch.float32)
    pipe = WanImageToVideoPipeline.from_pretrained(
        MODEL_ID, vae=vae, torch_dtype=torch.bfloat16)
    # fp8 weights, upcast per-layer during forward -> ~50% VRAM, fits 24GB.
    try:
        apply_layerwise_casting(
            pipe.transformer,
            storage_dtype=torch.float8_e4m3fn,
            compute_dtype=torch.bfloat16,
        )
        log("layerwise fp8 casting applied to transformer")
    except Exception as e:
        log("WARN: layerwise casting unavailable, running bf16:", e)
    pipe.enable_model_cpu_offload()
    try:
        pipe.enable_vae_slicing()
    except Exception:
        pass
    return pipe

def fit_image(path):
    """Load still, cover-crop to WIDTHxHEIGHT so WAN gets the right aspect."""
    im = load_image(path).convert("RGB")
    tw, th = WIDTH, HEIGHT
    w, h = im.size
    scale = max(tw / w, th / h)
    nw, nh = int(round(w * scale)), int(round(h * scale))
    im = im.resize((nw, nh), Image.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return im.crop((left, top, left + tw, top + th))

def main():
    if not os.path.exists(LISTFILE):
        log(f"ERROR: {LISTFILE} not found. Write a JSON array of still basenames "
            f"(no extension), e.g. [\"enron_hq\",\"enron_shred\"].")
        sys.exit(1)
    names = json.load(open(LISTFILE))
    if not isinstance(names, list) or not names:
        log("ERROR: wan_list.json must be a non-empty JSON array."); sys.exit(1)

    pipe = load_pipe()
    ok = 0
    for name in names:
        base = os.path.splitext(name)[0]
        # accept .jpg or .png stills
        still = None
        for ext in (".jpg", ".jpeg", ".png"):
            p = os.path.join(OUT, base + ext)
            if os.path.exists(p):
                still = p; break
        if not still:
            log(f"SKIP {base}: no still found in {OUT}"); continue
        outp = os.path.join(OUT, base + "_mo.mp4")
        if os.path.exists(outp) and os.path.getsize(outp) > 10000:
            log(f"SKIP {base}: {os.path.basename(outp)} already exists"); continue

        img = fit_image(still)
        t0 = time.time()
        try:
            result = pipe(
                image=img,
                prompt=PROMPT,
                negative_prompt=NEG,
                height=HEIGHT, width=WIDTH,
                num_frames=NUM_FRAMES,
                num_inference_steps=STEPS,
                guidance_scale=GUIDE,
            )
            frames = result.frames[0]
            export_to_video(frames, outp, fps=FPS)
            ok += 1
            log(f"OK  {base}  -> {os.path.basename(outp)}  "
                f"({NUM_FRAMES}f/{FPS}fps, {time.time()-t0:.0f}s)")
        except torch.cuda.OutOfMemoryError:
            log(f"OOM on {base}: retry with WAN_W/WAN_H lower (e.g. 544x960) "
                f"or WAN_FRAMES=33");
        except Exception as e:
            log(f"FAIL {base}: {e}")
        finally:
            gc.collect(); torch.cuda.empty_cache()

    log(f"done: {ok}/{len(names)} clips written to {OUT}")

if __name__ == "__main__":
    main()
