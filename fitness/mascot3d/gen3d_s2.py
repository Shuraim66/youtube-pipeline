from gradio_client import Client, handle_file
import shutil, os
OUT="/home/alpha/products/youtube-pipeline/fitness/mascot3d"
IMG=f"{OUT}/ref/hero_s2_white.png"
print("connecting...", flush=True)
c=Client("tencent/Hunyuan3D-2")
print("calling /shape_generation ...", flush=True)
res=c.predict(caption=None, image=handle_file(IMG),
    mv_image_front=None, mv_image_back=None, mv_image_left=None, mv_image_right=None,
    steps=40, guidance_scale=5.5, seed=1234, octree_resolution=300,
    check_box_rembg=True, num_chunks=8000, randomize_seed=True, api_name="/shape_generation")
print("stats:", res[2] if isinstance(res,(list,tuple)) and len(res)>2 else "n/a", flush=True)
saved=[]
def grab(x):
    if isinstance(x,str) and os.path.exists(x) and x.lower().endswith(('.glb','.obj','.ply')):
        d=f"{OUT}/mascot_s2{os.path.splitext(x)[1]}"; shutil.copy(x,d); saved.append(d)
    elif isinstance(x,(list,tuple)): [grab(y) for y in x]
    elif isinstance(x,dict): [grab(y) for y in x.values()]
grab(res); print("SAVED:", saved, flush=True)
