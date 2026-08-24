import torch
from PIL import Image, ImageDraw
from diffusers import StableDiffusionInpaintPipeline
im=Image.open('short_2.png').convert('RGB')
mask=Image.new('L',im.size,0)
ImageDraw.Draw(mask).ellipse((222,72,290,148),fill=255)   # tight over the face features
pipe=None
for mid in ["Lykon/dreamshaper-8-inpainting","runwayml/stable-diffusion-inpainting","stabilityai/stable-diffusion-2-inpainting"]:
    try:
        print("trying",mid,flush=True)
        pipe=StableDiffusionInpaintPipeline.from_pretrained(mid,torch_dtype=torch.float32,safety_checker=None).to("cpu")
        print("loaded",mid,flush=True); break
    except Exception as e:
        print("skip",mid,repr(e)[:120],flush=True)
pipe.set_progress_bar_config(disable=True)
g=torch.Generator("cpu").manual_seed(3)
out=pipe(prompt="smooth clean blank bald head, plain even tan skin, completely featureless, no eyes no nose no mouth, simple 3d render",
    image=im, mask_image=mask, num_inference_steps=35, guidance_scale=8.0,
    negative_prompt="eyes, nose, mouth, lips, teeth, face, facial features, hair, ears, wrinkles, dark spots",
    generator=g).images[0]
out.save('char2d_blank.png'); print("DONE")
