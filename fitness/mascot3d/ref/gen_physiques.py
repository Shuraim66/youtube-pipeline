import torch, time
from diffusers import StableDiffusionPipeline
OUT="/home/alpha/products/youtube-pipeline/fitness/mascot3d/ref"
BASE=("full body front view, arms straight out horizontally to the sides in a wide T-pose, "
      "bald muscular cartoon strongman mascot, {phys}, dark charcoal shorts, "
      "disney pixar 3d render style, clean stylized, symmetric, standing straight, "
      "plain light grey studio background, centered")
NEG=("arms down, arms at sides, arms hanging, flexing, photorealistic, realistic photo, text, "
     "watermark, signature, multiple people, extra limbs, deformed hands, cropped, out of frame, "
     "dark background, cluttered, nsfw, nude, low quality, blurry, hair, long hair")
PHYS={
 "shredded":"extremely shredded ripped lean physique, very defined striated muscle, sharp six-pack abs, very low body fat, vascular",
 "bulk":    "huge massive bodybuilder, enormous bulky thick muscles, mass monster, wide",
 "lean":    "lean fit athletic build, moderate defined muscle, slim narrow waist, toned",
 "fat":     "overweight out of shape, big round belly gut, soft chubby heavy body, some muscle underneath",
}
print("loading DreamShaper 8...", flush=True)
pipe=StableDiffusionPipeline.from_pretrained("Lykon/dreamshaper-8", torch_dtype=torch.float32,
        safety_checker=None).to("cpu"); pipe.set_progress_bar_config(disable=True)
for name,phys in PHYS.items():
    for i in range(2):
        t=time.time(); g=torch.Generator("cpu").manual_seed(3300+i*17)
        img=pipe(BASE.format(phys=phys), negative_prompt=NEG, width=576, height=576,
                 num_inference_steps=28, guidance_scale=7.5, generator=g).images[0]
        p=f"{OUT}/phys_{name}_{i}.png"; img.save(p); print(f"saved {p} ({time.time()-t:.0f}s)", flush=True)
print("DONE", flush=True)
