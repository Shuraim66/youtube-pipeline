import bpy, math, bmesh
from mathutils import Vector
GLB="/home/alpha/products/youtube-pipeline/fitness/mascot3d/mascot_s2.glb"
R="/home/alpha/products/youtube-pipeline/fitness/mascot3d/renders"
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
bm=bmesh.new(); bm.from_mesh(body.data)
bmesh.ops.delete(bm,geom=[v for v in bm.verts if v.co.z>zmin+0.86*Hh],context='VERTS'); bm.to_mesh(body.data); bm.free()
def frac(z): return (z-zmin)/Hh
# three flat materials: down-normal (blue), up-normal (red), neutral (gray)
def mat(nm,col):
    m=bpy.data.materials.new(nm); m.use_nodes=True; b=m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value=(*col,1); b.inputs["Roughness"].default_value=0.6; return m
neutral=mat("N",(0.5,0.5,0.5)); down=mat("D",(0.1,0.3,0.95)); up=mat("U",(0.95,0.2,0.1))
body.data.materials.clear()
for m in (neutral,down,up): body.data.materials.append(m)
for poly in body.data.polygons:
    f=frac(poly.center.z); nz=poly.normal.z
    idx=0
    if 0.20<f<0.62:                       # only judge the lower-body band
        if nz<-0.2: idx=1                 # downward-facing = hem underside
        elif nz>0.35: idx=2               # upward-facing  = waistband top / shelf
    poly.material_index=idx
w=bpy.data.worlds.new("W"); bpy.context.scene.world=w; w.use_nodes=True
w.node_tree.nodes.get("Background").inputs[1].default_value=0.5
cd=bpy.data.cameras.new("C"); cd.lens=70
cam=bpy.data.objects.new("C",cd); bpy.context.collection.objects.link(cam)
tz=zmin+0.42*Hh
cam.location=(cx,cy-Hh*1.7,tz); cam.rotation_euler=(math.radians(90),0,0); bpy.context.scene.camera=cam
sc=bpy.context.scene; sc.view_settings.view_transform='Standard'
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=40; sc.cycles.use_denoising=True
sc.render.resolution_x=760; sc.render.resolution_y=820; sc.render.image_settings.file_format='PNG'
sc.render.filepath=f"{R}/nz_front.png"; bpy.ops.render.render(write_still=True)
cam.location=(cx-Hh*1.7,cy,tz); cam.rotation_euler=(math.radians(90),0,math.radians(-90))
sc.render.filepath=f"{R}/nz_side.png"; bpy.ops.render.render(write_still=True)
print("DONE")
