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
# LOOSE baggy mid-thigh shorts with a STRAIGHT even hem — baggy so they stand off the
# legs (the 3D tool then bakes a real fabric edge) and simple so the hem stays clean.
PROMPT=("solo lean muscular young man shirtless, athletic male V-taper, bare chest, defined six-pack abs, symmetric T-pose arms straight out sideways, "
        "LARGE clearly-defined clenched fists, prominent knuckles, closed hands, loose baggy black gym shorts flat hem mid-thigh, white sneakers, bald, "
        "pixar 3d style, plain grey background, full body")
NEG=("woman, female, girl, sports bra, bra, breasts, shirt, top, tank top, covered chest, "
     "bikini, briefs, thong, speedo, tiny shorts, tight shorts, feminine, skinny, frail, "
     "bulky, obese, fat, multiple people, group, extra characters, "
     "open hands, spread fingers, pointing, sandals, bare feet, ragged hem, long pants, "
     "photorealistic, text, watermark, deformed, cropped, nsfw, nude, hair, blurry")
for i in range(3):
    t=time.time(); g=torch.Generator("cpu").manual_seed(8800+i*37)
    img=pipe(PROMPT, image=pose, negative_prompt=NEG, num_inference_steps=28,
             guidance_scale=7.5, controlnet_conditioning_scale=1.25, generator=g).images[0]
    p=f"{OUT}/flat_{i}.png"; img.save(p); print(f"saved {p} ({time.time()-t:.0f}s)", flush=True)
print("DONE", flush=True)
