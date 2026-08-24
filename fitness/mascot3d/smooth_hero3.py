import bpy, math, bmesh
from mathutils import Vector
GLB="/home/alpha/products/youtube-pipeline/fitness/mascot3d/mascot_hero_tpose.glb"
R="/home/alpha/products/youtube-pipeline/fitness/mascot3d/renders"
COPPER=(0.33,0.115,0.040)
def principled(nm,col,rough,sss=0.0):
    m=bpy.data.materials.new(nm); m.use_nodes=True; b=m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value=(*col,1); b.inputs["Roughness"].default_value=rough
    if "Subsurface Weight" in b.inputs: b.inputs["Subsurface Weight"].default_value=sss
    if "Subsurface Radius" in b.inputs: b.inputs["Subsurface Radius"].default_value=(0.15,0.05,0.03)
    return m
def skin_ao():
    m=bpy.data.materials.new("Skin"); m.use_nodes=True; nt=m.node_tree; b=nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value=0.42
    if "Subsurface Weight" in b.inputs: b.inputs["Subsurface Weight"].default_value=0.07
    if "Subsurface Radius" in b.inputs: b.inputs["Subsurface Radius"].default_value=(0.15,0.05,0.03)
    ao=nt.nodes.new("ShaderNodeAmbientOcclusion"); ao.samples=16; ao.inputs["Distance"].default_value=0.05
    r=nt.nodes.new("ShaderNodeValToRGB")
    r.color_ramp.elements[0].position=0.20; r.color_ramp.elements[0].color=(0.11,0.032,0.010,1)
    r.color_ramp.elements[1].position=0.72; r.color_ramp.elements[1].color=(*COPPER,1)
    nt.links.new(ao.outputs["AO"],r.inputs["Fac"]); nt.links.new(r.outputs["Color"],b.inputs["Base Color"])
    return m
for ob in list(bpy.data.objects): bpy.data.objects.remove(ob,do_unlink=True)
bpy.ops.import_scene.gltf(filepath=GLB)
ms=[o for o in bpy.data.objects if o.type=='MESH']
bpy.context.view_layer.objects.active=ms[0]
for o in ms: o.select_set(True)
if len(ms)>1: bpy.ops.object.join()
body=bpy.context.active_object; bpy.ops.object.shade_smooth()
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
vs=[v.co for v in body.data.vertices]
zmin=min(p.z for p in vs); zmax=max(p.z for p in vs); Hh=zmax-zmin
cx=sum(p.x for p in vs)/len(vs); cy=sum(p.y for p in vs)/len(vs); cz=(zmin+zmax)/2
def frac(z): return (z-zmin)/Hh
# ---- delete lumpy head ----
CUT=zmin+0.86*Hh
hv=[p for p in vs if p.z>CUT]
hcx=sum(p.x for p in hv)/len(hv); hcy=sum(p.y for p in hv)/len(hv)
hw=max(p.x for p in hv)-min(p.x for p in hv); hd=max(p.y for p in hv)-min(p.y for p in hv)
htop=max(p.z for p in hv); hcz=(CUT+htop)/2; hht=htop-CUT
bm=bmesh.new(); bm.from_mesh(body.data)
bmesh.ops.delete(bm,geom=[v for v in bm.verts if v.co.z>CUT],context='VERTS'); bm.to_mesh(body.data); bm.free()
# ---- clean round head (smaller) ----
skin=skin_ao(); skinP=principled("SkinP",COPPER,0.42,sss=0.07)
HYS=0.58
bpy.ops.mesh.primitive_uv_sphere_add(segments=48,ring_count=32,radius=1.0,location=(hcx,hcy,hcz-0.055*Hh))
head=bpy.context.active_object; head.name="Head"; head.scale=(hw*0.57, hd*HYS, hht*0.60)
head.data.materials.append(skinP); bpy.ops.object.shade_smooth()
# ---- body: skin + shoes only ----
shoes=principled("Shoes",(0.03,0.19,0.18),0.6)
body.data.materials.clear()
for m in (skin,shoes): body.data.materials.append(m)
for poly in body.data.polygons:
    poly.material_index = 1 if frac(poly.center.z)<0.09 else 0
# ---- clean teal shorts SHELL (real geometry, full coverage) ----
def shorts_v(p):
    dx=abs(p.x-cx); f=frac(p.z)
    if dx>=0.17*Hh: return False
    if 0.395<f<0.52: return True
    if 0.315<f<=0.395 and dx>0.035*Hh: return True
    return False
dup=body.copy(); dup.data=body.data.copy(); dup.name="Shorts"; bpy.context.collection.objects.link(dup)
b2=bmesh.new(); b2.from_mesh(dup.data)
bmesh.ops.delete(b2,geom=[v for v in b2.verts if not shorts_v(v.co)],context='VERTS'); b2.to_mesh(dup.data); b2.free()
teal=principled("Shorts",(0.045,0.30,0.28),0.6)
dup.data.materials.clear(); dup.data.materials.append(teal)
sm=dup.modifiers.new("Smooth","SMOOTH"); sm.factor=1.0; sm.iterations=24   # relax muscle bumps -> smooth fabric
sol=dup.modifiers.new("Sol","SOLIDIFY"); sol.thickness=0.018*Hh; sol.offset=1.0
bpy.ops.object.select_all(action='DESELECT'); dup.select_set(True); bpy.context.view_layer.objects.active=dup
bpy.ops.object.shade_smooth()
# ---- eyes (smaller) + dumbbell logo ----
hf=hcy-hd*HYS; white=principled("EyeW",(0.95,0.95,0.95),0.35); dark=principled("Logo",(0.06,0.06,0.07),0.4)
EYEZ=hcz-0.065*Hh; LOGOZ=hcz-0.012*Hh
def add_eye(sx):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0,location=(hcx+sx,hf-0.003*Hh,EYEZ))
    e=bpy.context.active_object; e.scale=(hw*0.085,hd*0.028,hw*0.11)
    e.rotation_euler=(0,0,math.radians(-7 if sx<0 else 7)); e.data.materials.append(white); bpy.ops.object.shade_smooth()
add_eye(-hw*0.16); add_eye(hw*0.16)
def ball(x,r):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r,location=(hcx+x,hf-0.004*Hh,LOGOZ))
    o=bpy.context.active_object; o.scale=(1,0.5,1); o.data.materials.append(dark); bpy.ops.object.shade_smooth()
ball(-hw*0.12,hw*0.045); ball(hw*0.12,hw*0.045)
bpy.ops.mesh.primitive_cylinder_add(radius=hw*0.022,depth=hw*0.26,location=(hcx,hf-0.004*Hh,LOGOZ))
bar=bpy.context.active_object; bar.rotation_euler=(0,math.radians(90),0); bar.scale=(1,0.5,1); bar.data.materials.append(dark)
# ---- world + backdrop + lights + cam ----
w=bpy.data.worlds.new("W"); bpy.context.scene.world=w; w.use_nodes=True
w.node_tree.nodes.get("Background").inputs[0].default_value=(0.015,0.016,0.02,1); w.node_tree.nodes.get("Background").inputs[1].default_value=0.3
bpy.ops.mesh.primitive_plane_add(size=Hh*6,location=(cx,cy+Hh*1.6,cz))
bd=bpy.context.active_object; bd.rotation_euler=(math.radians(90),0,0)
bm2=bpy.data.materials.new("BD"); bm2.use_nodes=True; nt=bm2.node_tree; nt.nodes.clear()
o=nt.nodes.new("ShaderNodeOutputMaterial"); em=nt.nodes.new("ShaderNodeEmission")
tc=nt.nodes.new("ShaderNodeTexCoord"); gr=nt.nodes.new("ShaderNodeTexGradient"); gr.gradient_type='SPHERICAL'
ramp=nt.nodes.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].position=0.0; ramp.color_ramp.elements[0].color=(0.022,0.025,0.034,1)
ramp.color_ramp.elements[1].position=0.65; ramp.color_ramp.elements[1].color=(0.004,0.004,0.007,1)
nt.links.new(tc.outputs["Object"],gr.inputs["Vector"]); nt.links.new(gr.outputs["Color"],ramp.inputs["Fac"])
nt.links.new(ramp.outputs["Color"],em.inputs["Color"]); nt.links.new(em.outputs[0],o.inputs["Surface"]); bd.data.materials.append(bm2)
def area(nm,loc,rot,e,s):
    d=bpy.data.lights.new(nm,'AREA'); d.energy=e; d.size=s
    ob=bpy.data.objects.new(nm,d); bpy.context.collection.objects.link(ob); ob.location=loc; ob.rotation_euler=[math.radians(a) for a in rot]
area("Key",(cx-Hh*0.9,cy-Hh*1.5,cz+Hh*0.7),(58,0,-32),230,Hh*0.55)
area("Fill",(cx+Hh*1.3,cy-Hh*1.1,cz+Hh*0.1),(72,0,48),28,Hh*1.1)
area("RimL",(cx-Hh*1.2,cy+Hh*1.0,cz+Hh*0.6),(-46,0,-32),1400,Hh*0.6)
area("RimR",(cx+Hh*1.2,cy+Hh*1.0,cz+Hh*0.6),(-46,0,32),1400,Hh*0.6)
cd=bpy.data.cameras.new("C"); cd.lens=66
cam=bpy.data.objects.new("C",cd); bpy.context.collection.objects.link(cam)
cam.location=(cx,cy-Hh*3.05,cz-Hh*0.02); cam.rotation_euler=(math.radians(90),0,0); bpy.context.scene.camera=cam
sc=bpy.context.scene; sc.view_settings.view_transform='Standard'
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=150; sc.cycles.use_denoising=True
sc.render.resolution_x=900; sc.render.resolution_y=1150
sc.render.image_settings.file_format='PNG'; sc.render.filepath=f"{R}/smooth_hero3.png"
bpy.ops.render.render(write_still=True); print("DONE")
