import bpy, math
from mathutils import Vector
GLB="/home/alpha/products/youtube-pipeline/fitness/mascot3d/mascot_hero_tpose.glb"
R="/home/alpha/products/youtube-pipeline/fitness/mascot3d/renders"
for ob in list(bpy.data.objects): bpy.data.objects.remove(ob,do_unlink=True)
bpy.ops.import_scene.gltf(filepath=GLB)
ms=[o for o in bpy.data.objects if o.type=='MESH']
bpy.context.view_layer.objects.active=ms[0]
for o in ms: o.select_set(True)
if len(ms)>1: bpy.ops.object.join()
body=bpy.context.active_object; bpy.ops.object.shade_smooth()
mw=body.matrix_world; vs=[mw@v.co for v in body.data.vertices]
zmin=min(p.z for p in vs); zmax=max(p.z for p in vs); Hh=zmax-zmin
cx=sum(p.x for p in vs)/len(vs); cy=sum(p.y for p in vs)/len(vs); cz=(zmin+zmax)/2
def frac(z): return (z-zmin)/Hh
xgate=0.16*Hh
def principled(nm,col,rough,sss=0.0,ssscol=(0.8,0.3,0.2)):
    m=bpy.data.materials.new(nm); m.use_nodes=True; b=m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value=(*col,1); b.inputs["Roughness"].default_value=rough
    for k,v in (("Subsurface Weight",sss),):
        if k in b.inputs: b.inputs[k].default_value=v
    if "Subsurface Radius" in b.inputs: b.inputs["Subsurface Radius"].default_value=(0.15,0.05,0.03)
    return m
skin=principled("Skin",(0.55,0.21,0.075),0.38,sss=0.10)
shoes=principled("Shoes",(0.05,0.30,0.29),0.6)
shorts=principled("Shorts",(0.07,0.40,0.38),0.6)
body.data.materials.clear()
for m in (skin,shoes,skin,shorts): body.data.materials.append(m)
def is_shorts(c):
    dx=abs(c.x-cx); f=frac(c.z)
    if dx>=xgate: return False
    if 0.40<f<0.535: return True
    if 0.33<f<=0.40 and dx>0.04*Hh: return True
    return False
for poly in body.data.polygons:
    c=mw@poly.center; f=frac(c.z)
    if f<0.09: poly.material_index=1
    elif is_shorts(c): poly.material_index=3
    else: poly.material_index=0
# head landmarks + local face-front at a given height
head=[p for p in vs if frac(p.z)>0.86]
hcx=sum(p.x for p in head)/len(head)
def face_front(z):
    near=[p for p in vs if abs(p.z-z)<0.02*Hh and abs(p.x-hcx)<0.07*Hh]
    return min(p.y for p in near) if near else min(p.y for p in head)
EYE_Z=zmin+0.875*Hh; LOGO_Z=zmin+0.915*Hh
# eyes: flat white ovals sitting on the actual face surface at eye height
white=principled("EyeW",(0.95,0.95,0.95),0.35)
efy=face_front(EYE_Z)
def add_eye(sx):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, location=(hcx+sx, efy-0.002*Hh, EYE_Z))
    e=bpy.context.active_object; e.scale=(0.016*Hh,0.0022*Hh,0.021*Hh)
    e.rotation_euler=(0,0,math.radians(-7 if sx<0 else 7)); e.data.materials.append(white); bpy.ops.object.shade_smooth()
add_eye(-0.026*Hh); add_eye(0.026*Hh)
# dumbbell forehead logo (2 dark spheres + bar)
dark=principled("Logo",(0.06,0.06,0.07),0.4)
lfy=face_front(LOGO_Z)
def ball(x,z,r):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=(hcx+x, lfy-0.002*Hh, z)); o=bpy.context.active_object
    o.scale=(1,0.5,1); o.data.materials.append(dark); bpy.ops.object.shade_smooth(); return o
ball(-0.022*Hh,LOGO_Z,0.010*Hh); ball(0.022*Hh,LOGO_Z,0.010*Hh)
bpy.ops.mesh.primitive_cylinder_add(radius=0.005*Hh, depth=0.042*Hh, location=(hcx,lfy-0.002*Hh,LOGO_Z))
bar=bpy.context.active_object; bar.rotation_euler=(0,math.radians(90),0); bar.scale=(1,0.5,1); bar.data.materials.append(dark)
# dark studio world + backdrop gradient plane
w=bpy.data.worlds.new("W"); bpy.context.scene.world=w; w.use_nodes=True
w.node_tree.nodes.get("Background").inputs[0].default_value=(0.015,0.016,0.02,1)
w.node_tree.nodes.get("Background").inputs[1].default_value=0.3
bpy.ops.mesh.primitive_plane_add(size=Hh*6, location=(cx,cy+Hh*1.6,cz))
bd=bpy.context.active_object; bd.rotation_euler=(math.radians(90),0,0)
bm=bpy.data.materials.new("BD"); bm.use_nodes=True; nt=bm.node_tree; nt.nodes.clear()
o=nt.nodes.new("ShaderNodeOutputMaterial"); em=nt.nodes.new("ShaderNodeEmission")
tc=nt.nodes.new("ShaderNodeTexCoord"); gr=nt.nodes.new("ShaderNodeTexGradient"); gr.gradient_type='SPHERICAL'
mp=nt.nodes.new("ShaderNodeMapping"); ramp=nt.nodes.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].position=0.0; ramp.color_ramp.elements[0].color=(0.10,0.11,0.14,1)
ramp.color_ramp.elements[1].position=0.7; ramp.color_ramp.elements[1].color=(0.02,0.02,0.03,1)
nt.links.new(tc.outputs["Object"],mp.inputs["Vector"]); nt.links.new(mp.outputs["Vector"],gr.inputs["Vector"])
nt.links.new(gr.outputs["Color"],ramp.inputs["Fac"]); nt.links.new(ramp.outputs["Color"],em.inputs["Color"])
nt.links.new(em.outputs[0],o.inputs["Surface"]); bd.data.materials.append(bm)
# 3-point area lights
def area(nm,loc,rot,energy,size):
    d=bpy.data.lights.new(nm,'AREA'); d.energy=energy; d.size=size
    ob=bpy.data.objects.new(nm,d); bpy.context.collection.objects.link(ob)
    ob.location=loc; ob.rotation_euler=[math.radians(a) for a in rot]
area("Key",(cx-Hh*0.9,cy-Hh*1.6,cz+Hh*0.7),(58,0,-32),320,Hh*1.0)
area("Fill",(cx+Hh*1.2,cy-Hh*1.2,cz+Hh*0.1),(72,0,46),95,Hh*1.1)
area("Rim",(cx+Hh*0.2,cy+Hh*1.3,cz+Hh*1.0),(-52,0,10),650,Hh*0.8)
# camera (perspective front, slight low heroic angle)
cd=bpy.data.cameras.new("C"); cd.lens=62
cam=bpy.data.objects.new("C",cd); bpy.context.collection.objects.link(cam)
cam.location=(cx,cy-Hh*3.4,cz-Hh*0.02); cam.rotation_euler=(math.radians(90),0,0); bpy.context.scene.camera=cam
sc=bpy.context.scene; sc.view_settings.view_transform='Standard'
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=110; sc.cycles.use_denoising=True
sc.render.resolution_x=760; sc.render.resolution_y=1000
sc.render.image_settings.file_format='PNG'; sc.render.filepath=f"{R}/smooth_hero.png"
bpy.ops.render.render(write_still=True); print("DONE")
