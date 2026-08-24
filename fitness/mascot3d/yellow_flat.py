"""
YELLOW mascot on the NEW mesh (mascot_flat.glb) whose baggy shorts baked as a
DISTINCT standoff garment with a real hem lip. Shorts are coloured by flooding
the fabric down to that lip — clean, because a genuine edge now exists.
  blender -b -P yellow_flat.py -> renders/yellow_{0..3}.png
"""
import bpy, bmesh, math
BASE="/home/alpha/products/youtube-pipeline/fitness/mascot3d"; GLB=f"{BASE}/mascot_mv.glb"; R=f"{BASE}/renders"
SHORTS=(0.028,0.030,0.038); DARK=(0.012,0.013,0.017); RIMC=(0.80,0.74,0.55)
def _set(b,n,v):
    if n in b.inputs: b.inputs[n].default_value=v
def matte(nm,col,rough=0.55):
    m=bpy.data.materials.new(nm); m.use_nodes=True; b=m.node_tree.nodes["Principled BSDF"]
    _set(b,"Base Color",(*col,1)); _set(b,"Roughness",rough); _set(b,"Metallic",0.0); _set(b,"Specular IOR Level",0.15); return m
def skin_yellow():
    m=bpy.data.materials.new("Skin"); m.use_nodes=True; nt=m.node_tree; b=nt.nodes["Principled BSDF"]
    _set(b,"Roughness",0.42); _set(b,"Specular IOR Level",0.15)
    tc=nt.nodes.new("ShaderNodeTexCoord"); sep=nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Generated"],sep.inputs["Vector"])
    ramp=nt.nodes.new("ShaderNodeValToRGB"); e=ramp.color_ramp.elements
    e[0].position=0.10; e[0].color=(0.38,0.24,0.02,1)          # darker, muted amber
    mid=ramp.color_ramp.elements.new(0.50); mid.color=(0.64,0.44,0.04,1)
    top=ramp.color_ramp.elements[-1]; top.position=0.92; top.color=(0.78,0.58,0.09,1)
    nt.links.new(sep.outputs["Z"],ramp.inputs["Fac"])
    ao=nt.nodes.new("ShaderNodeAmbientOcclusion"); ao.samples=16; ao.inputs["Distance"].default_value=0.05
    clamp=nt.nodes.new("ShaderNodeMath"); clamp.operation='MAXIMUM'; clamp.inputs[1].default_value=0.36
    nt.links.new(ao.outputs["AO"],clamp.inputs[0])
    mul=nt.nodes.new("ShaderNodeVectorMath"); mul.operation='MULTIPLY'
    nt.links.new(ramp.outputs["Color"],mul.inputs[0]); nt.links.new(clamp.outputs["Value"],mul.inputs[1])
    nt.links.new(mul.outputs["Vector"],b.inputs["Base Color"]); return m

for ob in list(bpy.data.objects): bpy.data.objects.remove(ob,do_unlink=True)
bpy.ops.import_scene.gltf(filepath=GLB)
ms=[o for o in bpy.data.objects if o.type=='MESH']; bpy.context.view_layer.objects.active=ms[0]
for o in ms: o.select_set(True)
if len(ms)>1: bpy.ops.object.join()
body=bpy.context.active_object; body.name="YELLOW"; bpy.ops.object.shade_smooth()
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
vs=[v.co for v in body.data.vertices]
zmin=min(p.z for p in vs); zmax=max(p.z for p in vs); Hh=zmax-zmin
cx=sum(p.x for p in vs)/len(vs); cy=sum(p.y for p in vs)/len(vs); cz=(zmin+zmax)/2
def frac(z): return (z-zmin)/Hh

# faceless dome + white eyes
CUT=zmin+0.86*Hh
hv=[p for p in vs if p.z>CUT]; hcy=sum(p.y for p in hv)/len(hv)
bm=bmesh.new(); bm.from_mesh(body.data)
bmesh.ops.delete(bm,geom=[v for v in bm.verts if v.co.z>CUT],context='VERTS'); bm.to_mesh(body.data); bm.free()
skin=skin_yellow(); skinP=matte("SkinP",(0.64,0.44,0.04),0.42)
shorts=matte("Shorts",SHORTS,0.55); boots=matte("Boots",DARK,0.6)
body.data.materials.clear()
for m in (skin,boots,shorts): body.data.materials.append(m)     # 0=skin 1=boots 2=shorts

# ---- shorts: flood the fabric down to its real hem lip (distinct standoff garment) ----
bmf=bmesh.new(); bmf.from_mesh(body.data); bmf.faces.ensure_lookup_table(); bmf.normal_update()
def ffrac(f): return (f.calc_center_median().z-zmin)/Hh
def fxx(f): return f.calc_center_median().x
SLO,SHI=0.40,0.605
def is_hem(f): return f.normal.z < -0.20 and ffrac(f) < 0.47   # only the true hem walls, not interior folds
sh_seed=[f for f in bmf.faces if 0.52<ffrac(f)<0.585 and abs(fxx(f)-cx)<0.18*Hh]
sel=set(sh_seed); st=list(sh_seed)
while st:
    f=st.pop()
    for e in f.edges:
        if not e.is_manifold: continue
        for nf in e.link_faces:
            if nf in sel: continue
            fr=ffrac(nf)
            if fr<SLO or fr>SHI: continue
            sel.add(nf)
            if not is_hem(nf): st.append(nf)
for _ in range(10):
    add=[]
    for f in bmf.faces:
        if f in sel or not (SLO<ffrac(f)<SHI): continue
        nb=[nf for e in f.edges if e.is_manifold for nf in e.link_faces if nf is not f]
        if nb and sum(1 for nf in nb if nf in sel)>=len(nb)-1: add.append(f)
    if not add: break
    sel.update(add)
# close the fly/drawstring notch: majority-fill ABOVE the hem (0.44). The shorts stand
# off the legs so the hem is a clean edge -> this can't drip past it onto the thigh.
for _ in range(8):
    add=[]
    for f in bmf.faces:
        if f in sel or not (0.44<ffrac(f)<SHI): continue
        nb=[nf for e in f.edges if e.is_manifold for nf in e.link_faces if nf is not f]
        if nb and sum(1 for nf in nb if nf in sel)>=len(nb)*0.5: add.append(f)
    if not add: break
    sel.update(add)
sh_idx={f.index for f in sel}
# boots: feet dark (flat, low)
so_idx={f.index for f in bmf.faces if ffrac(f)<0.055}
bmf.free()
for poly in body.data.polygons:
    if   poly.index in so_idx: poly.material_index=1
    elif poly.index in sh_idx: poly.material_index=2
    else:                      poly.material_index=0

HR=0.078*Hh; HCZ=zmin+0.900*Hh                      # smaller head
bpy.ops.mesh.primitive_uv_sphere_add(segments=56,ring_count=36,radius=1.0,location=(cx,hcy,HCZ))
head=bpy.context.active_object; head.name="Head"; head.scale=(HR*0.90,HR*0.80,HR*1.12)  # OVAL (taller than wide)
head.data.materials.append(skinP); bpy.ops.object.shade_smooth()
hf=hcy-HR*0.82; white=matte("EyeW",(0.94,0.94,0.94),0.35); rimm=matte("EyeRim",(0.03,0.03,0.035),0.4)
EYEZ=HCZ-HR*0.065
def add_eye(sx):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0,location=(cx+sx,hf+0.002*Hh,EYEZ))
    d=bpy.context.active_object; d.scale=(HR*0.24,HR*0.05,HR*0.30); d.rotation_euler=(0,0,math.radians(-7 if sx<0 else 7))
    d.data.materials.append(rimm); bpy.ops.object.shade_smooth()
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0,location=(cx+sx,hf-0.004*Hh,EYEZ))
    e=bpy.context.active_object; e.scale=(HR*0.19,HR*0.06,HR*0.25); e.rotation_euler=(0,0,math.radians(-7 if sx<0 else 7))
    e.data.materials.append(white); bpy.ops.object.shade_smooth()
add_eye(-HR*0.34); add_eye(HR*0.34)

piv=bpy.data.objects.new("Pivot",None); bpy.context.collection.objects.link(piv); piv.location=(cx,cy,cz)
for o in [o for o in bpy.data.objects if o.type=='MESH']:
    o.parent=piv; o.matrix_parent_inverse=piv.matrix_world.inverted()
w=bpy.data.worlds.new("W"); bpy.context.scene.world=w; w.use_nodes=True
bg=w.node_tree.nodes.get("Background"); bg.inputs[0].default_value=(0.012,0.013,0.016,1); bg.inputs[1].default_value=0.28
bpy.ops.mesh.primitive_plane_add(size=Hh*6,location=(cx,cy+Hh*1.6,cz))
bd=bpy.context.active_object; bd.name="Backdrop"; bd.rotation_euler=(math.radians(90),0,0); bd.parent=None
bdm=bpy.data.materials.new("BD"); bdm.use_nodes=True; nt=bdm.node_tree; nt.nodes.clear()
out=nt.nodes.new("ShaderNodeOutputMaterial"); em=nt.nodes.new("ShaderNodeEmission")
tc=nt.nodes.new("ShaderNodeTexCoord"); gr=nt.nodes.new("ShaderNodeTexGradient"); gr.gradient_type='SPHERICAL'
rp=nt.nodes.new("ShaderNodeValToRGB")
rp.color_ramp.elements[0].position=0.0;  rp.color_ramp.elements[0].color=(0.022,0.023,0.030,1)
rp.color_ramp.elements[1].position=0.65; rp.color_ramp.elements[1].color=(0.004,0.004,0.006,1)
nt.links.new(tc.outputs["Object"],gr.inputs["Vector"]); nt.links.new(gr.outputs["Color"],rp.inputs["Fac"])
nt.links.new(rp.outputs["Color"],em.inputs["Color"]); nt.links.new(em.outputs[0],out.inputs["Surface"])
bd.data.materials.append(bdm)
def area(nm,loc,rot,energy,size,color=(1,1,1)):
    d=bpy.data.lights.new(nm,'AREA'); d.energy=energy; d.size=size; d.color=color
    o=bpy.data.objects.new(nm,d); bpy.context.collection.objects.link(o); o.location=loc; o.rotation_euler=[math.radians(a) for a in rot]
area("Key",(cx-Hh*0.9,cy-Hh*1.5,cz+Hh*0.7),(58,0,-32),240,Hh*0.55,(1.0,0.98,0.92))
area("Fill",(cx+Hh*1.3,cy-Hh*1.1,cz+Hh*0.1),(72,0,48),28,Hh*1.10,(1.0,0.98,0.94))
area("RimL",(cx-Hh*1.2,cy+Hh*1.0,cz+Hh*0.6),(-46,0,-32),1500,Hh*0.6,RIMC)
area("RimR",(cx+Hh*1.2,cy+Hh*1.0,cz+Hh*0.6),(-46,0,32),1500,Hh*0.6,RIMC)
cd=bpy.data.cameras.new("C"); cd.lens=64
cam=bpy.data.objects.new("C",cd); bpy.context.collection.objects.link(cam)
cam.location=(cx,cy-Hh*3.05,cz-Hh*0.02); cam.rotation_euler=(math.radians(90),0,0); bpy.context.scene.camera=cam
sc=bpy.context.scene; sc.view_settings.view_transform='Standard'
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=150; sc.cycles.use_denoising=True
sc.render.resolution_x=900; sc.render.resolution_y=1150; sc.render.image_settings.file_format='PNG'
for i,yaw in enumerate([0,45,90,180]):
    piv.rotation_euler=(0,0,math.radians(yaw)); sc.render.filepath=f"{R}/yellow_{i}.png"
    bpy.ops.render.render(write_still=True); print("rendered yaw",yaw)
print("YELLOW FLAT DONE")
