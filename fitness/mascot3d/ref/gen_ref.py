import torch, time, os
from diffusers import StableDiffusionPipeline
OUT="/home/alpha/products/youtube-pipeline/fitness/mascot3d/ref"
PROMPT=("full body front view of a friendly muscular cartoon strongman mascot character, "
        "shirtless with a defined muscular chest and six-pack abs, wearing dark charcoal gym shorts "
        "and an orange headband, big confident friendly smile, standing straight facing forward, "
        "symmetrical A-pose, stylized 3d render, pixar style, exaggerated heroic proportions, "
        "clean plain solid light grey studio background, centered, whole body visible head to feet")
NEG=("photorealistic, realistic photo, photograph, realistic skin texture, text, letters, watermark, "
     "signature, multiple people, two people, crowd, extra limbs, extra arms, extra legs, deformed hands, "
     "mutated, cropped, out of frame, close-up, dark background, busy cluttered background, nsfw, nude, "
     "naked, low quality, blurry, jpeg artifacts")
print("loading SD1.5...", flush=True)
pipe=StableDiffusionPipeline.from_pretrained("stable-diffusion-v1-5/stable-diffusion-v1-5",
        torch_dtype=torch.float32, safety_checker=None)
pipe=pipe.to("cpu"); pipe.set_progress_bar_config(disable=True)
for i in range(4):
    t=time.time()
    g=torch.Generator("cpu").manual_seed(100+i*7)
    img=pipe(PROMPT, negative_prompt=NEG, width=512, height=768,
             num_inference_steps=30, guidance_scale=7.5, generator=g).images[0]
    p=f"{OUT}/ref_{i}.png"; img.save(p)
    print(f"saved {p} ({time.time()-t:.0f}s)", flush=True)
print("DONE", flush=True)
