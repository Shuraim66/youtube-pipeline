from gradio_client import Client, handle_file
import shutil, os
OUT="/home/alpha/products/youtube-pipeline/fitness/mascot3d"
IMG=f"{OUT}/ref/ref_3d_white.png"
print("connecting...", flush=True)
c=Client("tencent/Hunyuan3D-2")
print("calling /shape_generation ...", flush=True)
res=c.predict(
    caption=None, image=handle_file(IMG),
    mv_image_front=None, mv_image_back=None, mv_image_left=None, mv_image_right=None,
    steps=30, guidance_scale=5.0, seed=1234, octree_resolution=256,
    check_box_rembg=True, num_chunks=8000, randomize_seed=True,
    api_name="/shape_generation")
print("RAW RESULT:", res, flush=True)
saved=[]
def grab(x):
    if isinstance(x,str) and os.path.exists(x) and x.lower().endswith(('.glb','.obj','.ply')):
        d=f"{OUT}/mascot_shape{os.path.splitext(x)[1]}"; shutil.copy(x,d); saved.append(d)
    elif isinstance(x,(list,tuple)):
        [grab(y) for y in x]
    elif isinstance(x,dict):
        [grab(y) for y in x.values()]
grab(res)
print("SAVED:", saved, flush=True)
