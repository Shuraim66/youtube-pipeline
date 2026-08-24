import torch, time
from diffusers import StableDiffusionPipeline
OUT="/home/alpha/products/youtube-pipeline/fitness/mascot3d/ref"
PROMPT=("full body cartoon muscular strongman mascot, shirtless with six-pack abs, dark gym shorts, "
        "orange headband, confident friendly smile, standing straight facing forward, symmetric A-pose, "
        "both arms relaxed down slightly away from sides, pixar 3d render style, heroic proportions, "
        "plain light grey background, centered")
NEG=("flexing, raised arms, arms up, arms above head, waving, action pose, dynamic pose, asymmetric, "
     "one arm raised, running, photorealistic, realistic photo, photograph, text, watermark, signature, "
     "multiple people, two people, extra limbs, extra arms, deformed hands, cropped, out of frame, "
     "close-up, dark background, cluttered background, nsfw, nude, low quality, blurry")
print("loading SD1.5...", flush=True)
pipe=StableDiffusionPipeline.from_pretrained("stable-diffusion-v1-5/stable-diffusion-v1-5",
        torch_dtype=torch.float32, safety_checker=None).to("cpu")
pipe.set_progress_bar_config(disable=True)
for i in range(6):
    t=time.time(); g=torch.Generator("cpu").manual_seed(2100+i*13)
    img=pipe(PROMPT, negative_prompt=NEG, width=512, height=768,
             num_inference_steps=32, guidance_scale=8.0, generator=g).images[0]
    p=f"{OUT}/apose_{i}.png"; img.save(p); print(f"saved {p} ({time.time()-t:.0f}s)", flush=True)
print("DONE", flush=True)
