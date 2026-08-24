"""Render the raw Meshy fist from a few angles to judge quality/orientation."""
import bpy, math
from mathutils import Vector
BASE="/home/alpha/products/youtube-pipeline/fitness/mascot3d"; R=f"{BASE}/renders"
for o in list(bpy.data.objects): bpy.data.objects.remove(o,do_unlink=True)
bpy.ops.import_scene.gltf(filepath=f"{BASE}/fist_raw.glb")
ms=[o for o in bpy.data.objects if o.type=='MESH']
for o in ms: o.select_set(True)
bpy.context.view_layer.objects.active=ms[0]
if len(ms)>1: bpy.ops.object.join()
m=bpy.context.active_object
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
vs=[v.co for v in m.data.vertices]
cx=sum(p.x for p in vs)/len(vs); cy=sum(p.y for p in vs)/len(vs); cz=sum(p.z for p in vs)/len(vs)
xr=max(p.x for p in vs)-min(p.x for p in vs); yr=max(p.y for p in vs)-min(p.y for p in vs); zr=max(p.z for p in vs)-min(p.z for p in vs)
span=max(xr,yr,zr)
print("FIST dims x%.3f y%.3f z%.3f verts %d"%(xr,yr,zr,len(m.data.vertices)))
# neutral clay material
mat=bpy.data.materials.new("clay"); mat.use_nodes=True; b=mat.node_tree.nodes["Principled BSDF"]
b.inputs["Base Color"].default_value=(0.82,0.50,0.015,1); b.inputs["Roughness"].default_value=0.6
m.data.materials.clear(); m.data.materials.append(mat); bpy.ops.object.shade_smooth()
w=bpy.data.worlds.new("W"); bpy.context.scene.world=w; w.use_nodes=True
w.node_tree.nodes.get("Background").inputs[1].default_value=0.3
def area(nm,loc,e):
    d=bpy.data.lights.new(nm,'AREA'); d.energy=e; d.size=span*1.5
    o=bpy.data.objects.new(nm,d); bpy.context.collection.objects.link(o); o.location=loc
    o.rotation_euler=(Vector((cx,cy,cz))-Vector(loc)).to_track_quat('-Z','Y').to_euler()
area("K",(cx-span,cy-span*1.4,cz+span),200); area("B",(cx,cy+span*1.3,cz+span*0.6),140)
piv=bpy.data.objects.new("P",None); bpy.context.collection.objects.link(piv); piv.location=(cx,cy,cz)
m.parent=piv; m.matrix_parent_inverse=piv.matrix_world.inverted()
cd=bpy.data.cameras.new("C"); cd.lens=60
cam=bpy.data.objects.new("C",cd); bpy.context.collection.objects.link(cam)
cam.location=(cx,cy-span*2.6,cz); cam.rotation_euler=(math.radians(90),0,0); bpy.context.scene.camera=cam
sc=bpy.context.scene; sc.view_settings.view_transform='Standard'
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=90; sc.cycles.use_denoising=True
sc.render.resolution_x=1200; sc.render.resolution_y=400
# 3 yaws into one wide sheet via separate files
for i,yaw in enumerate([0,90,200]):
    piv.rotation_euler=(0,0,math.radians(yaw)); sc.render.resolution_x=420; sc.render.resolution_y=420
    sc.render.filepath=f"{R}/fist_{i}.png"; bpy.ops.render.render(write_still=True)
print("FIST INSPECT DONE")
