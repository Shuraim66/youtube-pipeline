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
PROMPT=("solo lean muscular man seen from behind, rear back view, muscular defined back lats "
        "trapezius spine erectors, symmetric T-pose arms straight out sideways, clenched fists, "
        "loose baggy black gym shorts flat hem mid-thigh, bald head from behind, white sneakers, "
        "pixar 3d style, plain grey background, full body")
NEG=("front view, face, eyes, abs, six pack, chest, pecs, nipples, belly button, "
     "woman, female, sports bra, bulky, obese, fat, multiple people, group, extra characters, "
     "open hands, spread fingers, sandals, bare feet, briefs, tight shorts, "
     "photorealistic, text, watermark, deformed, cropped, nsfw, nude, hair, blurry")
for i in range(3):
    t=time.time(); g=torch.Generator("cpu").manual_seed(5200+i*31)
    img=pipe(PROMPT, image=pose, negative_prompt=NEG, num_inference_steps=28,
             guidance_scale=7.5, controlnet_conditioning_scale=1.2, generator=g).images[0]
    p=f"{OUT}/back_{i}.png"; img.save(p); print(f"saved {p} ({time.time()-t:.0f}s)", flush=True)
print("DONE", flush=True)
