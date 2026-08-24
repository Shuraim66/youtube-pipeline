import bpy, bmesh, math
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector
BASE="/home/alpha/products/youtube-pipeline/fitness/mascot3d"; GLB=f"{BASE}/mascot_s2.glb"; R=f"{BASE}/renders"
for ob in list(bpy.data.objects): bpy.data.objects.remove(ob,do_unlink=True)
bpy.ops.import_scene.gltf(filepath=GLB)
ms=[o for o in bpy.data.objects if o.type=='MESH']; bpy.context.view_layer.objects.active=ms[0]
for o in ms: o.select_set(True)
if len(ms)>1: bpy.ops.object.join()
body=bpy.context.active_object; bpy.ops.object.shade_smooth()
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
vs=[v.co for v in body.data.vertices]
zmin=min(p.z for p in vs); zmax=max(p.z for p in vs); Hh=zmax-zmin
cx=sum(p.x for p in vs)/len(vs); cy=sum(p.y for p in vs)/len(vs); cz=(zmin+zmax)/2
# clay
clay=bpy.data.materials.new("Clay"); clay.use_nodes=True; b=clay.node_tree.nodes["Principled BSDF"]
b.inputs["Base Color"].default_value=(0.6,0.6,0.6,1); b.inputs["Roughness"].default_value=0.6
body.data.materials.clear(); body.data.materials.append(clay)
w=bpy.data.worlds.new("W"); bpy.context.scene.world=w; w.use_nodes=True
w.node_tree.nodes.get("Background").inputs[1].default_value=0.35
def area(nm,loc,rot,e,s):
    d=bpy.data.lights.new(nm,'AREA'); d.energy=e; d.size=s
    o=bpy.data.objects.new(nm,d); bpy.context.collection.objects.link(o); o.location=loc; o.rotation_euler=[math.radians(a) for a in rot]
area("K",(cx-Hh*0.8,cy-Hh*1.4,cz+Hh*0.6),(56,0,-30),220,Hh*0.6)
area("F",(cx+Hh*1.1,cy-Hh*1.2,cz),(70,0,42),90,Hh*1.0)
cd=bpy.data.cameras.new("C"); cd.lens=66
cam=bpy.data.objects.new("C",cd); bpy.context.collection.objects.link(cam)
cam.location=(cx,cy-Hh*3.05,cz-Hh*0.02); cam.rotation_euler=(math.radians(90),0,0); bpy.context.scene.camera=cam
sc=bpy.context.scene; sc.view_settings.view_transform='Standard'
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=50; sc.cycles.use_denoising=True
RX,RY=900,1150; sc.render.resolution_x=RX; sc.render.resolution_y=RY; sc.render.image_settings.file_format='PNG'
sc.render.filepath=f"{R}/clay_ruler.png"; bpy.ops.render.render(write_still=True)
# project frac lines (front-surface point) to pixel-y and print
depsgraph=bpy.context.evaluated_depsgraph_get()
print("RULER_START")
for i in range(24,50,2):
    fr=i/100.0; z=zmin+fr*Hh
    p=Vector((cx, cy-0.16*Hh, z))
    co=world_to_camera_view(sc, cam, p)
    py=(1.0-co.y)*RY
    print(f"FRAC {fr:.2f} PY {py:.1f}")
print("RULER_END")
