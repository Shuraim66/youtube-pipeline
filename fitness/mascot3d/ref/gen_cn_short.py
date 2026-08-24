import torch, time
from PIL import Image
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel
OUT="/home/alpha/products/youtube-pipeline/fitness/mascot3d/ref"
pose=Image.open(f"{OUT}/tpose_skeleton.png")
print("loading ControlNet + DreamShaper...", flush=True)
cn=ControlNetModel.from_pretrained("lllyasviel/control_v11p_sd15_openpose", torch_dtype=torch.float32)
pipe=StableDiffusionControlNetPipeline.from_pretrained("Lykon/dreamshaper-8", controlnet=cn,
        torch_dtype=torch.float32, safety_checker=None).to("cpu")
pipe.set_progress_bar_config(disable=True)
PROMPT=("lean shredded athletic fitness model, ripped six-pack abs, V-taper, muscular quads, "
        "bald head, very short tight athletic booty shorts high on the upper thigh, "
        "bare muscular thighs fully showing, clenched fists, closed hands, disney pixar 3d render style, "
        "plain light grey background, front view")
NEG=("dumbbell, dumbbells, weights, weight plates, barbell, holding objects, gym equipment, long shorts, baggy shorts, knee-length, board shorts, pants, covered thighs, bulky, fat, "
     "photorealistic, text, watermark, extra limbs, deformed, cropped, dark background, nsfw, nude, "
     "low quality, blurry, hair, open hands, spread fingers, splayed fingers")
for i in range(4):
    pass
    t=time.time(); g=torch.Generator("cpu").manual_seed(2600+i*17)
    img=pipe(PROMPT, image=pose, negative_prompt=NEG, num_inference_steps=28,
             guidance_scale=7.0, controlnet_conditioning_scale=1.0, generator=g).images[0]
    p=f"{OUT}/short3_{i}.png"; img.save(p); print(f"saved {p} ({time.time()-t:.0f}s)", flush=True)
print("DONE", flush=True)
