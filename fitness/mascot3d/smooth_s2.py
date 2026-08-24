import bpy, math, bmesh
from mathutils import Vector
GLB="/home/alpha/products/youtube-pipeline/fitness/mascot3d/mascot_s2.glb"
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
# ---- replace realistic head with clean ball + eyes ----
CUT=zmin+0.85*Hh
hv=[p for p in vs if p.z>CUT]; hcy=sum(p.y for p in hv)/len(hv)
bm=bmesh.new(); bm.from_mesh(body.data)
bmesh.ops.delete(bm,geom=[v for v in bm.verts if v.co.z>CUT],context='VERTS'); bm.to_mesh(body.data); bm.free()
skin=skin_ao(); skinP=principled("SkinP",COPPER,0.42,sss=0.07)
HR=0.100*Hh; HCZ=zmin+0.895*Hh
bpy.ops.mesh.primitive_uv_sphere_add(segments=48,ring_count=32,radius=1.0,location=(cx,hcy,HCZ))
head=bpy.context.active_object; head.name="Head"; head.scale=(HR,HR*0.80,HR*0.92)
head.data.materials.append(skinP); bpy.ops.object.shade_smooth()
# ---- materials: skin / shoes / shorts (baked geometry, just colour) ----
shoes=principled("Shoes",(0.032,0.035,0.042),0.95); charcoal=principled("Shorts",(0.052,0.058,0.068),0.55)
body.data.materials.clear()
for m in (skin,shoes,charcoal): body.data.materials.append(m)
# ---- paint the ACTUAL baked shorts: flood the fabric down from the waistband;
#      the hem lip (a down-facing normal) is the wall, so paint stops exactly at the
#      real fabric edge. Envelope backstops any leak away from muscle-bulge normals. ----
bmf=bmesh.new(); bmf.from_mesh(body.data); bmf.faces.ensure_lookup_table(); bmf.normal_update()
def ffrac(f): return (f.calc_center_median().z-zmin)/Hh
def fx(f): return f.calc_center_median().x
def fy(f): return f.calc_center_median().y
SLO,SHI=0.36,0.605          # shorts z-envelope (waistband top .. below hem)
def is_hem(f): return f.normal.z < -0.22 and ffrac(f) < 0.47   # only the true hem lip walls; upper wrinkles don't
sh_seed=[f for f in bmf.faces if 0.50<ffrac(f)<0.56 and abs(fx(f)-cx)<0.17*Hh]  # full waistband ring
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
            if not is_hem(nf): st.append(nf)     # include the hem face, but don't paint past it
# fill enclosed skin pockets (leg-opening gaps walled off from the flood)
for _ in range(6):
    add=[]
    for f in bmf.faces:
        if f in sel: continue
        fr=ffrac(f)
        if fr<0.42 or fr>SHI: continue
        nb=[nf for e in f.edges if e.is_manifold for nf in e.link_faces if nf is not f]
        if nb and sum(1 for nf in nb if nf in sel) >= len(nb)-1:   # nearly all neighbours are shorts
            add.append(f)
    if not add: break
    sel.update(add)
sh_idx={f.index for f in sel}
# shoes+socks: seed at the sole, flood up to the sock-cuff (down-normal lip too)
so_seed=[f for f in bmf.faces if ffrac(f)<0.04]
sels=set(so_seed); st=list(so_seed)
while st:
    f=st.pop()
    for e in f.edges:
        if not e.is_manifold: continue
        for nf in e.link_faces:
            if nf in sels: continue
            fr=ffrac(nf)
            if fr>0.235: continue
            sels.add(nf)
            if nf.normal.z >= -0.30: st.append(nf)
so_idx={f.index for f in sels}
bmf.free()
for poly in body.data.polygons:
    if poly.index in so_idx:   poly.material_index=1   # sneakers + socks
    elif poly.index in sh_idx: poly.material_index=2   # baggy shorts
    else:                       poly.material_index=0   # skin
# ---- eyes (white oval + dark rim) ----
hf=hcy-HR*0.80; white=principled("EyeW",(0.95,0.95,0.95),0.35); rim=principled("EyeRim",(0.05,0.05,0.06),0.4)
EYEZ=HCZ-HR*0.065
def add_eye(sx):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0,location=(cx+sx,hf+0.002*Hh,EYEZ))
    d=bpy.context.active_object; d.scale=(HR*0.24,HR*0.05,HR*0.30); d.rotation_euler=(0,0,math.radians(-7 if sx<0 else 7))
    d.data.materials.append(rim); bpy.ops.object.shade_smooth()
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0,location=(cx+sx,hf-0.004*Hh,EYEZ))
    e=bpy.context.active_object; e.scale=(HR*0.19,HR*0.06,HR*0.25); e.rotation_euler=(0,0,math.radians(-7 if sx<0 else 7))
    e.data.materials.append(white); bpy.ops.object.shade_smooth()
add_eye(-HR*0.34); add_eye(HR*0.34)
# ---- parent all to pivot for multi-angle ----
emp=bpy.data.objects.new("P",None); bpy.context.collection.objects.link(emp); emp.location=(cx,cy,cz)
for o in [o for o in bpy.data.objects if o.type=='MESH']:
    o.parent=emp; o.matrix_parent_inverse=emp.matrix_world.inverted()
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
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=140; sc.cycles.use_denoising=True
sc.render.resolution_x=760; sc.render.resolution_y=1000; sc.render.image_settings.file_format='PNG'
for i,yaw in enumerate([0,90,150]):
    emp.rotation_euler=(0,0,math.radians(yaw)); sc.render.filepath=f"{R}/s2_{i}.png"; bpy.ops.render.render(write_still=True); print("yaw",yaw)
print("DONE")
