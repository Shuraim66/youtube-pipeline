import bpy, math
from mathutils import Vector
GLB="/home/alpha/products/youtube-pipeline/fitness/mascot3d/mascot2_shape.glb"
R="/home/alpha/products/youtube-pipeline/fitness/mascot3d/renders"
for ob in list(bpy.data.objects): bpy.data.objects.remove(ob,do_unlink=True)
bpy.ops.import_scene.gltf(filepath=GLB)
meshes=[o for o in bpy.data.objects if o.type=='MESH']
bpy.context.view_layer.objects.active=meshes[0]
for o in meshes: o.select_set(True)
bpy.ops.object.join(); body=bpy.context.active_object; bpy.ops.object.shade_smooth()
mw=body.matrix_world; vs=[mw@v.co for v in body.data.vertices]
zmin=min(p.z for p in vs); zmax=max(p.z for p in vs); Hh=zmax-zmin
cx=sum(p.x for p in vs)/len(vs); cy=sum(p.y for p in vs)/len(vs); cz=(zmin+zmax)/2
def frac(z): return (z-zmin)/Hh
xgate=0.205*Hh
def principled(nm,col,rough=0.5,sss=0.0):
    m=bpy.data.materials.new(nm); m.use_nodes=True; b=m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value=(*col,1); b.inputs["Roughness"].default_value=rough
    try: b.inputs["Subsurface Weight"].default_value=sss
    except: pass
    return m
skin=principled("Skin",(0.62,0.30,0.13),0.42,0.12)
shoes=principled("Shoes",(0.05,0.34,0.32),0.5)
shorts=principled("Shorts",(0.05,0.45,0.42),0.55)
eyem=bpy.data.materials.new("Eye"); eyem.use_nodes=True
en=eyem.node_tree; en.nodes.clear(); eo=en.nodes.new("ShaderNodeOutputMaterial"); ee=en.nodes.new("ShaderNodeEmission")
ee.inputs[0].default_value=(1,1,1,1); ee.inputs[1].default_value=1.4; en.links.new(ee.outputs[0],eo.inputs["Surface"])
body.data.materials.clear()
for m in (skin,shoes,skin,shorts): body.data.materials.append(m)
def is_shorts(c):
    dx=abs(c.x-cx); f=frac(c.z)
    if dx>=xgate: return False
    if 0.385<f<0.535: return True
    if 0.325<f<=0.385 and dx>0.04*Hh: return True
    return False
for poly in body.data.polygons:
    c=mw@poly.center; f=frac(c.z)
    if f<0.09: poly.material_index=1
    elif is_shorts(c): poly.material_index=3
    else: poly.material_index=0
# pivot + eyes
emp=bpy.data.objects.new("P",None); bpy.context.collection.objects.link(emp)
emp.location=(cx,cy,cz); body.parent=emp; body.matrix_parent_inverse=emp.matrix_world.inverted()
head=[p for p in vs if frac(p.z)>0.88]
hcx=sum(p.x for p in head)/len(head); hcz=sum(p.z for p in head)/len(head); front_y=min(p.y for p in head)
def add_eye(sx):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, location=(hcx+sx, front_y-0.005*Hh, hcz+0.004*Hh))
    e=bpy.context.active_object; e.scale=(0.016*Hh,0.013*Hh,0.026*Hh)
    e.data.materials.append(eyem); bpy.ops.object.shade_smooth()
    e.parent=emp; e.matrix_parent_inverse=emp.matrix_world.inverted()
add_eye(-0.032*Hh); add_eye(0.032*Hh)
# dark world
w=bpy.data.worlds.new("W"); bpy.context.scene.world=w; w.use_nodes=True
w.node_tree.nodes.get("Background").inputs[0].default_value=(0.02,0.02,0.025,1)
w.node_tree.nodes.get("Background").inputs[1].default_value=0.4
# soft lights
def area(nm,loc,rot,energy,size):
    d=bpy.data.lights.new(nm,'AREA'); d.energy=energy; d.size=size
    o=bpy.data.objects.new(nm,d); bpy.context.collection.objects.link(o)
    o.location=loc; o.rotation_euler=[math.radians(a) for a in rot]
area("Key",(cx-Hh*0.8,cy-Hh*1.2,cz+Hh*0.6),(60,0,-35),600,Hh*0.8)
area("Fill",(cx+Hh*1.0,cy-Hh*1.0,cz+Hh*0.2),(70,0,40),200,Hh*0.9)
area("Rim",(cx,cy+Hh*1.2,cz+Hh*0.8),(-50,0,0),500,Hh*0.7)
cd=bpy.data.cameras.new("C"); cd.type='ORTHO'; cd.ortho_scale=Hh*1.1
cam=bpy.data.objects.new("C",cd); bpy.context.collection.objects.link(cam)
cam.location=(cx,cy-Hh*2,cz); cam.rotation_euler=(math.radians(90),0,0); bpy.context.scene.camera=cam
sc=bpy.context.scene; sc.view_settings.view_transform='Filmic'
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=80
sc.render.resolution_x=720; sc.render.resolution_y=1080
sc.render.image_settings.file_format='PNG'; sc.render.filepath=f"{R}/m2_smooth.png"
bpy.ops.render.render(write_still=True); print("DONE")
