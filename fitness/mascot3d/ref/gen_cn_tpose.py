import torch, time, math
from PIL import Image, ImageDraw
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel
OUT="/home/alpha/products/youtube-pipeline/fitness/mascot3d/ref"

# ---- build an OpenPose (COCO-18) T-pose skeleton image ----
W=H=512
# keypoints: 0nose 1neck 2Rsho 3Relb 4Rwri 5Lsho 6Lelb 7Lwri 8Rhip 9Rkne 10Rank
#            11Lhip 12Lkne 13Lank 14Reye 15Leye 16Rear 17Lear
K=[(256,86),(256,132),(206,142),(140,142),(78,142),(306,142),(372,142),(434,142),
   (228,250),(224,350),(222,452),(284,250),(288,350),(290,452),
   (248,80),(264,80),(238,86),(274,86)]
limbs=[(1,2),(1,5),(2,3),(3,4),(5,6),(6,7),(1,8),(8,9),(9,10),(1,11),(11,12),(12,13),
       (1,0),(0,14),(14,16),(0,15),(15,17)]
col=[(255,0,0),(255,85,0),(255,170,0),(255,255,0),(170,255,0),(85,255,0),(0,255,0),
     (0,255,85),(0,255,170),(0,255,255),(0,170,255),(0,85,255),(0,0,255),(85,0,255),
     (170,0,255),(255,0,255),(255,0,170)]
kcol=[(255,0,0),(255,85,0),(255,170,0),(255,255,0),(170,255,0),(85,255,0),(0,255,0),
      (0,255,85),(0,255,170),(0,255,255),(0,170,255),(0,85,255),(0,0,255),(85,0,255),
      (170,0,255),(255,0,255),(255,0,170),(255,0,85)]
pose=Image.new("RGB",(W,H),(0,0,0)); d=ImageDraw.Draw(pose)
for i,(a,b) in enumerate(limbs):
    d.line([K[a],K[b]],fill=col[i%len(col)],width=8)
for i,(x,y) in enumerate(K):
    d.ellipse([x-5,y-5,x+5,y+5],fill=kcol[i])
pose.save(f"{OUT}/tpose_skeleton.png")
print("pose skeleton saved", flush=True)

print("loading ControlNet openpose + DreamShaper...", flush=True)
cn=ControlNetModel.from_pretrained("lllyasviel/control_v11p_sd15_openpose", torch_dtype=torch.float32)
pipe=StableDiffusionControlNetPipeline.from_pretrained("Lykon/dreamshaper-8", controlnet=cn,
        torch_dtype=torch.float32, safety_checker=None).to("cpu")
pipe.set_progress_bar_config(disable=True)
PROMPT=("lean shredded athletic fitness model, ripped defined six-pack abs, V-taper, "
        "moderate muscle not bulky, low body fat, bald head, dark charcoal shorts, "
        "disney pixar 3d render style, plain light grey background, front view")
NEG=("bulky, huge, fat, obese, photorealistic, text, watermark, extra limbs, deformed, "
     "cropped, dark background, nsfw, nude, low quality, blurry, hair")
for i in range(3):
    t=time.time(); g=torch.Generator("cpu").manual_seed(500+i*23)
    img=pipe(PROMPT, image=pose, negative_prompt=NEG, num_inference_steps=28,
             guidance_scale=7.0, controlnet_conditioning_scale=1.0, generator=g).images[0]
    p=f"{OUT}/tpose_{i}.png"; img.save(p); print(f"saved {p} ({time.time()-t:.0f}s)", flush=True)
print("DONE", flush=True)
