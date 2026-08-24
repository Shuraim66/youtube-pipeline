import torch, time
from diffusers import StableDiffusionPipeline
OUT="/home/alpha/products/youtube-pipeline/fitness/mascot3d/ref"
PROMPT=("full body T-pose, muscular cartoon strongman mascot, shirtless, huge defined chest, "
        "six-pack abs, bulging biceps and shoulders, dark charcoal shorts, disney pixar 3d render style, "
        "clean stylized, symmetric, arms straight out horizontally to the sides, standing, "
        "plain light grey studio background, centered, friendly confident face")
NEG=("photorealistic, realistic photo, text, watermark, signature, multiple people, extra limbs, "
     "extra arms, deformed hands, mutated, cropped, out of frame, dark background, cluttered, "
     "nsfw, nude, naked, low quality, blurry, ugly, weak, skinny")
print("loading DreamShaper 8...", flush=True)
pipe=StableDiffusionPipeline.from_pretrained("Lykon/dreamshaper-8", torch_dtype=torch.float32,
        safety_checker=None).to("cpu")
pipe.set_progress_bar_config(disable=True)
for i in range(6):
    t=time.time(); g=torch.Generator("cpu").manual_seed(700+i*11)
    img=pipe(PROMPT, negative_prompt=NEG, width=512, height=640,
             num_inference_steps=28, guidance_scale=7.0, generator=g).images[0]
    p=f"{OUT}/ds_{i}.png"; img.save(p); print(f"saved {p} ({time.time()-t:.0f}s)", flush=True)
print("DONE", flush=True)
