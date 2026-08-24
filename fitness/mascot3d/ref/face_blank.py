import torch
from PIL import Image
from diffusers import StableDiffusionImg2ImgPipeline
im=Image.open('short_2.png').convert('RGB')
box=(212,44,300,156)                     # HEAD ONLY (above chest)
head=im.crop(box); hs=head.size
pipe=StableDiffusionImg2ImgPipeline.from_pretrained("Lykon/dreamshaper-8",
        torch_dtype=torch.float32, safety_checker=None).to("cpu")
pipe.set_progress_bar_config(disable=True)
g=torch.Generator("cpu").manual_seed(7)
out=pipe(prompt="smooth clean bald egg-shaped head, completely blank featureless face, no eyes no nose no mouth, plain smooth tan skin, simple 3d render, plain grey background",
         image=head.resize((512,512)), strength=0.62, guidance_scale=7.5, num_inference_steps=30,
         negative_prompt="face, eyes, nose, mouth, lips, facial features, ears, hair, beard, wrinkles, teeth",
         generator=g).images[0]
im.paste(out.resize(hs), box)
im.save('char2d_blank.png'); print("DONE")
