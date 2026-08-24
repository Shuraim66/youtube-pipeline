import bpy, math, bmesh
from mathutils import Vector
GLB="/home/alpha/products/youtube-pipeline/fitness/mascot3d/mascot_short.glb"
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
# ---- replace the melted paddle-hands with clean fists ----
axhalf=max(abs(p.x-cx) for p in vs); WR=0.865*axhalf
handinfo={}
for s in (-1,1):
    wr=[p for p in vs if 0.80*axhalf < s*(p.x-cx) < WR]
    if wr:
        hy=sum(p.y for p in wr)/len(wr); hz=sum(p.z for p in wr)/len(wr)
        rad=max(max(abs(p.y-hy),abs(p.z-hz)) for p in wr)
        handinfo[s]=(hy,hz,rad)
bmh=bmesh.new(); bmh.from_mesh(body.data)
bmesh.ops.delete(bmh,geom=[v for v in bmh.verts if abs(v.co.x-cx)>WR],context='VERTS')
bmh.to_mesh(body.data); bmh.free()
# ---- delete lumpy head (cut lower so ball seats on traps) ----
CUT=zmin+0.85*Hh
hv=[p for p in vs if p.z>CUT]; hcy=sum(p.y for p in hv)/len(hv)
bm=bmesh.new(); bm.from_mesh(body.data)
bmesh.ops.delete(bm,geom=[v for v in bm.verts if v.co.z>CUT],context='VERTS'); bm.to_mesh(body.data); bm.free()
# ---- clean ROUND ball head seated on traps ----
skin=skin_ao(); skinP=principled("SkinP",COPPER,0.42,sss=0.07)
HR=0.100*Hh                      # head radius (smaller)
HCZ=zmin+0.895*Hh                # head center z (bottom overlaps traps)
bpy.ops.mesh.primitive_uv_sphere_add(segments=56,ring_count=36,radius=1.0,location=(cx,hcy,HCZ))
head=bpy.context.active_object; head.name="Head"; head.scale=(HR, HR*0.80, HR*0.92)  # round, slightly flat, not egg
head.data.materials.append(skinP); bpy.ops.object.shade_smooth()
# fist-shaped hands at the wrists (elongated block + knuckle row + thumb)
for s,(hy,hz,rad) in handinfo.items():
    ox=cx+s*WR*1.02
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=20,radius=1.0,location=(ox,hy,hz))
    fist=bpy.context.active_object; fist.name="Fist"; fist.scale=(rad*1.5, rad*1.18, rad*1.12)
    fist.data.materials.append(skinP); bpy.ops.object.shade_smooth()
    for k in range(4):                                   # 4 knuckles on the outer-top face
        ky=hy+(k-1.5)*rad*0.52
        bpy.ops.mesh.primitive_uv_sphere_add(segments=14,ring_count=9,radius=rad*0.32,location=(ox+s*rad*0.78,ky,hz+rad*0.42))
        kn=bpy.context.active_object; kn.data.materials.append(skinP); bpy.ops.object.shade_smooth()
    bpy.ops.mesh.primitive_uv_sphere_add(segments=14,ring_count=9,radius=rad*0.42,location=(ox-s*rad*0.15,hy-rad*0.9,hz-rad*0.1))
    th=bpy.context.active_object; th.scale=(1.0,1.0,1.4); th.data.materials.append(skinP); bpy.ops.object.shade_smooth()  # thumb
# ---- body: skin + shoes ----
shoes=principled("Shoes",(0.055,0.060,0.070),0.9)          # matte charcoal booties
charcoal=principled("Shorts",(0.052,0.058,0.068),0.55)     # charcoal shorts
body.data.materials.clear()
for m in (skin,shoes,charcoal): body.data.materials.append(m)   # 0=skin 1=shoes 2=shorts
for poly in body.data.polygons:
    f=frac(poly.center.z)
    if 0.46<f<0.595:   poly.material_index=2   # short shorts (full coverage)
    elif f<0.085:      poly.material_index=1   # feet -> dark booties (shoes)
    else:              poly.material_index=0   # skin
# (shoes = the feet coloured dark in the material pass above — minimalist booties)
# (NO fake shorts geometry — the mesh already has shorts; coloured in the material pass above)
# ---- eyes: white oval + subtle dark rim (NO logo) ----
hf=hcy-HR*0.80
white=principled("EyeW",(0.95,0.95,0.95),0.35); rim=principled("EyeRim",(0.05,0.05,0.06),0.4)
EYEZ=HCZ-HR*0.18
def add_eye(sx):
    # dark rim (slightly larger, behind)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0,location=(cx+sx,hf+0.002*Hh,EYEZ))
    d=bpy.context.active_object; d.scale=(HR*0.24,HR*0.05,HR*0.30)
    d.rotation_euler=(0,0,math.radians(-7 if sx<0 else 7)); d.data.materials.append(rim); bpy.ops.object.shade_smooth()
    # white eye (in front)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0,location=(cx+sx,hf-0.004*Hh,EYEZ))
    e=bpy.context.active_object; e.scale=(HR*0.19,HR*0.06,HR*0.25)
    e.rotation_euler=(0,0,math.radians(-7 if sx<0 else 7)); e.data.materials.append(white); bpy.ops.object.shade_smooth()
add_eye(-HR*0.34); add_eye(HR*0.34)
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
sc.render.image_settings.file_format='PNG'; sc.render.filepath=f"{R}/smooth_short.png"
bpy.ops.render.render(write_still=True); print("DONE")
