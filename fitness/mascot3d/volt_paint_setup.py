"""
VOLT — manual paint setup
=========================
Builds a paint-ready .blend so you can PAINT the trunks/boots by hand instead of
tuning the flood-fill. Opens with VOLT already looking right (blue body, cyan
visor, dark boots) and the flood-fill result as a STARTING GUESS on 3 material
slots — you just fix the few wrong faces in Edit Mode with Assign.

Build (headless):
  blender -b -P volt_paint_setup.py
Then open the GUI to paint:
  blender fitness/mascot3d/volt_paint.blend

Material slots on the VOLT body: 0 = Body(blue)  1 = Boots(dark)  2 = Trunks(cyan)
"""
import bpy, bmesh, math

BASE  = "/home/alpha/products/youtube-pipeline/fitness/mascot3d"
GLB   = f"{BASE}/mascot_s2.glb"
BLEND = f"{BASE}/volt_paint.blend"

def _s2l(c): return c/12.92 if c <= 0.04045 else ((c+0.055)/1.055)**2.4
def hx(h):
    h = h.lstrip("#"); return tuple(_s2l(int(h[i:i+2],16)/255.0) for i in (0,2,4))
VOLT = {"body":hx("#2F6BFF"),"body_top":hx("#3B78FF"),"body_bot":hx("#1A3FB0"),
        "trunks":hx("#16E6CC"),"visor":hx("#16E6CC"),"deepshade":hx("#0B1B3A"),
        "rim":hx("#7FA8FF")}

def _set(b,n,v):
    if n in b.inputs: b.inputs[n].default_value = v
def matte(nm,col,rough=0.55,emit=None,emit_str=0.0,vp=None):
    m = bpy.data.materials.new(nm); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    _set(b,"Base Color",(*col,1)); _set(b,"Roughness",rough)
    _set(b,"Metallic",0.0); _set(b,"Specular IOR Level",0.15)
    if emit is not None: _set(b,"Emission Color",(*emit,1)); _set(b,"Emission Strength",emit_str)
    m.diffuse_color = (*(vp or col),1)          # viewport (Solid+Material) colour
    return m
def volt_body():
    m = bpy.data.materials.new("VOLT_Body"); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    _set(b,"Roughness",0.55); _set(b,"Metallic",0.0); _set(b,"Specular IOR Level",0.15)
    tc = nt.nodes.new("ShaderNodeTexCoord"); sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Generated"], sep.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB"); e = ramp.color_ramp.elements
    e[0].position=0.12; e[0].color=(*VOLT["body_bot"],1)
    mid = ramp.color_ramp.elements.new(0.50); mid.color=(*VOLT["body"],1)
    top = ramp.color_ramp.elements[-1]; top.position=0.92; top.color=(*VOLT["body_top"],1)
    nt.links.new(sep.outputs["Z"], ramp.inputs["Fac"])
    ao = nt.nodes.new("ShaderNodeAmbientOcclusion"); ao.samples=16; ao.inputs["Distance"].default_value=0.06
    clamp = nt.nodes.new("ShaderNodeMath"); clamp.operation='MAXIMUM'; clamp.inputs[1].default_value=0.38
    nt.links.new(ao.outputs["AO"], clamp.inputs[0])
    mul = nt.nodes.new("ShaderNodeVectorMath"); mul.operation='MULTIPLY'
    nt.links.new(ramp.outputs["Color"], mul.inputs[0]); nt.links.new(clamp.outputs["Value"], mul.inputs[1])
    nt.links.new(mul.outputs["Vector"], b.inputs["Base Color"])
    m.diffuse_color = (*VOLT["body"],1)
    return m

# 1. import + consolidate
for ob in list(bpy.data.objects): bpy.data.objects.remove(ob, do_unlink=True)
bpy.ops.import_scene.gltf(filepath=GLB)
ms = [o for o in bpy.data.objects if o.type=='MESH']
bpy.context.view_layer.objects.active = ms[0]
for o in ms: o.select_set(True)
if len(ms) > 1: bpy.ops.object.join()
body = bpy.context.active_object; body.name = "VOLT"
bpy.ops.object.shade_smooth()
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
vs = [v.co for v in body.data.vertices]
zmin=min(p.z for p in vs); zmax=max(p.z for p in vs); Hh=zmax-zmin
cx=sum(p.x for p in vs)/len(vs); cy=sum(p.y for p in vs)/len(vs); cz=(zmin+zmax)/2
def frac(z): return (z-zmin)/Hh

# 2. faceless ball head + cyan visor
CUT = zmin + 0.85*Hh
hv=[p for p in vs if p.z>CUT]; hcy=sum(p.y for p in hv)/len(hv)
bm=bmesh.new(); bm.from_mesh(body.data)
bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z>CUT], context='VERTS')
bm.to_mesh(body.data); bm.free()
HR=0.100*Hh; HCZ=zmin+0.895*Hh
bpy.ops.mesh.primitive_uv_sphere_add(segments=56,ring_count=36,radius=1.0,location=(cx,hcy,HCZ))
head=bpy.context.active_object; head.name="VOLT_Head"; head.scale=(HR,HR*0.82,HR*0.94)
head.data.materials.append(matte("VOLT_Head_Mat",VOLT["body"],0.55)); bpy.ops.object.shade_smooth()
hf=hcy-HR*0.82; EYEZ=HCZ-HR*0.05
bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0,location=(cx,hf+0.004*Hh,EYEZ))
rim=bpy.context.active_object; rim.name="VOLT_VisorRim"; rim.scale=(HR*0.82,HR*0.30,HR*0.34)
rim.data.materials.append(matte("VOLT_VisorRim_Mat",VOLT["deepshade"],0.45)); bpy.ops.object.shade_smooth()
bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0,location=(cx,hf-0.006*Hh,EYEZ))
visor=bpy.context.active_object; visor.name="VOLT_Visor"; visor.scale=(HR*0.78,HR*0.30,HR*0.26)
visor.data.materials.append(matte("VOLT_Visor_Mat",VOLT["visor"],0.20,emit=VOLT["visor"],emit_str=2.2))
bpy.ops.object.shade_smooth()

# 3. THREE material slots + flood-fill STARTING GUESS (you refine this by hand)
skin=volt_body(); boots=matte("VOLT_Boots",VOLT["deepshade"],0.60); trunks=matte("VOLT_Trunks",VOLT["trunks"],0.50)
body.data.materials.clear()
for m in (skin, boots, trunks): body.data.materials.append(m)   # 0=body 1=boots 2=trunks
bmf=bmesh.new(); bmf.from_mesh(body.data); bmf.faces.ensure_lookup_table(); bmf.normal_update()
def ffrac(f): return (f.calc_center_median().z-zmin)/Hh
def fxx(f):   return f.calc_center_median().x
SLO,SHI=0.36,0.605
def is_hem(f): return f.normal.z<-0.22 and ffrac(f)<0.47
sh_seed=[f for f in bmf.faces if 0.50<ffrac(f)<0.56 and abs(fxx(f)-cx)<0.17*Hh]
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
for _ in range(6):
    add=[]
    for f in bmf.faces:
        if f in sel: continue
        fr=ffrac(f)
        if fr<0.42 or fr>SHI: continue
        nb=[nf for e in f.edges if e.is_manifold for nf in e.link_faces if nf is not f]
        if nb and sum(1 for nf in nb if nf in sel)>=len(nb)-1: add.append(f)
    if not add: break
    sel.update(add)
sel={f for f in sel if ffrac(f)>=0.46}
sh_idx={f.index for f in sel}
so_seed=[f for f in bmf.faces if ffrac(f)<0.04]
sels=set(so_seed); st=list(so_seed)
while st:
    f=st.pop()
    for e in f.edges:
        if not e.is_manifold: continue
        for nf in e.link_faces:
            if nf in sels: continue
            if ffrac(nf)>0.235: continue
            sels.add(nf)
            if nf.normal.z>=-0.30: st.append(nf)
sels={f for f in sels if ffrac(f)<=0.16}
so_idx={f.index for f in sels}
bmf.free()
for poly in body.data.polygons:
    if   poly.index in so_idx: poly.material_index=1
    elif poly.index in sh_idx: poly.material_index=2
    else:                      poly.material_index=0

# 4. simple lights/world/cam so you can F12-preview while painting
w=bpy.data.worlds.new("W"); bpy.context.scene.world=w; w.use_nodes=True
bg=w.node_tree.nodes.get("Background"); bg.inputs[0].default_value=(0.012,0.014,0.020,1); bg.inputs[1].default_value=0.25
def area(nm,loc,rot,energy,size,color=(1,1,1)):
    d=bpy.data.lights.new(nm,'AREA'); d.energy=energy; d.size=size; d.color=color
    o=bpy.data.objects.new(nm,d); bpy.context.collection.objects.link(o)
    o.location=loc; o.rotation_euler=[math.radians(a) for a in rot]
area("Key",(cx-Hh*0.9,cy-Hh*1.5,cz+Hh*0.7),(58,0,-32),240,Hh*0.55,(1.0,0.98,0.95))
area("Fill",(cx+Hh*1.3,cy-Hh*1.1,cz+Hh*0.1),(72,0,48),30,Hh*1.10,(0.92,0.95,1.0))
area("RimL",(cx-Hh*1.2,cy+Hh*1.0,cz+Hh*0.6),(-46,0,-32),1500,Hh*0.6,VOLT["rim"])
area("RimR",(cx+Hh*1.2,cy+Hh*1.0,cz+Hh*0.6),(-46,0,32),1500,Hh*0.6,VOLT["rim"])
cd=bpy.data.cameras.new("C"); cd.lens=66
cam=bpy.data.objects.new("C",cd); bpy.context.collection.objects.link(cam)
cam.location=(cx,cy-Hh*3.05,cz-Hh*0.02); cam.rotation_euler=(math.radians(90),0,0)
bpy.context.scene.camera=cam
sc=bpy.context.scene
sc.view_settings.view_transform='Standard'
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=100; sc.cycles.use_denoising=True
sc.render.resolution_x=900; sc.render.resolution_y=1150

# 5. open in FACE-select mode with the body active/selected
bpy.ops.object.select_all(action='DESELECT')
body.select_set(True); bpy.context.view_layer.objects.active=body
sc.tool_settings.mesh_select_mode=(False,False,True)   # face select

bpy.ops.wm.save_as_mainfile(filepath=BLEND)
print("SAVED", BLEND)
