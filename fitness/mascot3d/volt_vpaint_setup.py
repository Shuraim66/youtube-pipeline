"""
VOLT — SIMPLE brush-paint setup (Vertex Paint)
==============================================
Rebuilds volt_paint.blend so you can paint the body like MS Paint:
pick a colour, drag a brush over the model, spin with the middle mouse button.
No Edit Mode / material slots / UVs. Colours save with the .blend automatically.

The body opens PRE-COLOURED with the current guess (blue skin / cyan trunks /
dark boots) as a face-crisp colour layer, so you only touch up the wrong bits.

Build (headless):
  blender -b -P volt_vpaint_setup.py
Then paint in the GUI:
  blender fitness/mascot3d/volt_paint.blend
  -> top-left mode dropdown -> "Vertex Paint" -> pick a palette colour -> drag.
"""
import bpy, bmesh, math

BASE  = "/home/alpha/products/youtube-pipeline/fitness/mascot3d"
GLB   = f"{BASE}/mascot_s2.glb"
BLEND = f"{BASE}/volt_paint.blend"

def _s2l(c): return c/12.92 if c <= 0.04045 else ((c+0.055)/1.055)**2.4
def hx(h):   # -> LINEAR (for lights/emission)
    h=h.lstrip("#"); return tuple(_s2l(int(h[i:i+2],16)/255.0) for i in (0,2,4))
def srgb(h): # -> raw sRGB 0..1 (for byte vertex colours)
    h=h.lstrip("#"); return tuple(int(h[i:i+2],16)/255.0 for i in (0,2,4))

HEXES = {"body":"#2F6BFF","trunks":"#16E6CC","boots":"#0B1B3A",
         "visor":"#16E6CC","deepshade":"#0B1B3A","rim":"#7FA8FF"}
VC = {k: srgb(v) for k,v in HEXES.items()}     # vertex-paint colours (sRGB)
LT = {k: hx(v)   for k,v in HEXES.items()}     # linear (lights/emission)

def _set(b,n,v):
    if n in b.inputs: b.inputs[n].default_value=v
def matte(nm,col,rough=0.55,emit=None,emit_str=0.0):
    m=bpy.data.materials.new(nm); m.use_nodes=True; b=m.node_tree.nodes["Principled BSDF"]
    _set(b,"Base Color",(*col,1)); _set(b,"Roughness",rough); _set(b,"Metallic",0.0); _set(b,"Specular IOR Level",0.15)
    if emit is not None: _set(b,"Emission Color",(*emit,1)); _set(b,"Emission Strength",emit_str)
    return m

# 1. import + consolidate
for ob in list(bpy.data.objects): bpy.data.objects.remove(ob, do_unlink=True)
bpy.ops.import_scene.gltf(filepath=GLB)
ms=[o for o in bpy.data.objects if o.type=='MESH']
bpy.context.view_layer.objects.active=ms[0]
for o in ms: o.select_set(True)
if len(ms)>1: bpy.ops.object.join()
body=bpy.context.active_object; body.name="VOLT"
bpy.ops.object.shade_smooth()
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
vs=[v.co for v in body.data.vertices]
zmin=min(p.z for p in vs); zmax=max(p.z for p in vs); Hh=zmax-zmin
cx=sum(p.x for p in vs)/len(vs); cy=sum(p.y for p in vs)/len(vs); cz=(zmin+zmax)/2

# 2. faceless head + cyan visor (separate objects; you won't paint these)
CUT=zmin+0.85*Hh
hv=[p for p in vs if p.z>CUT]; hcy=sum(p.y for p in hv)/len(hv)
bm=bmesh.new(); bm.from_mesh(body.data)
bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z>CUT], context='VERTS')
bm.to_mesh(body.data); bm.free()
HR=0.100*Hh; HCZ=zmin+0.895*Hh
bpy.ops.mesh.primitive_uv_sphere_add(segments=56,ring_count=36,radius=1.0,location=(cx,hcy,HCZ))
head=bpy.context.active_object; head.name="VOLT_Head"; head.scale=(HR,HR*0.82,HR*0.94)
head.data.materials.append(matte("VOLT_Head_Mat",LT["body"],0.55)); bpy.ops.object.shade_smooth()
hf=hcy-HR*0.82; EYEZ=HCZ-HR*0.05
bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0,location=(cx,hf+0.004*Hh,EYEZ))
rim=bpy.context.active_object; rim.name="VOLT_VisorRim"; rim.scale=(HR*0.82,HR*0.30,HR*0.34)
rim.data.materials.append(matte("VOLT_VisorRim_Mat",LT["deepshade"],0.45)); bpy.ops.object.shade_smooth()
bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0,location=(cx,hf-0.006*Hh,EYEZ))
visor=bpy.context.active_object; visor.name="VOLT_Visor"; visor.scale=(HR*0.78,HR*0.30,HR*0.26)
visor.data.materials.append(matte("VOLT_Visor_Mat",LT["visor"],0.20,emit=LT["visor"],emit_str=2.2)); bpy.ops.object.shade_smooth()

# 3. flood-fill STARTING GUESS -> per-face region (body/boots/trunks)
def ffrac_bm(f): return (f.calc_center_median().z-zmin)/Hh
bmf=bmesh.new(); bmf.from_mesh(body.data); bmf.faces.ensure_lookup_table(); bmf.normal_update()
def fxx(f): return f.calc_center_median().x
SLO,SHI=0.36,0.605
def is_hem(f): return f.normal.z<-0.22 and ffrac_bm(f)<0.47
sh_seed=[f for f in bmf.faces if 0.50<ffrac_bm(f)<0.56 and abs(fxx(f)-cx)<0.17*Hh]
sel=set(sh_seed); st=list(sh_seed)
while st:
    f=st.pop()
    for e in f.edges:
        if not e.is_manifold: continue
        for nf in e.link_faces:
            if nf in sel: continue
            fr=ffrac_bm(nf)
            if fr<SLO or fr>SHI: continue
            sel.add(nf)
            if not is_hem(nf): st.append(nf)
for _ in range(6):
    add=[]
    for f in bmf.faces:
        if f in sel: continue
        fr=ffrac_bm(f)
        if fr<0.42 or fr>SHI: continue
        nb=[nf for e in f.edges if e.is_manifold for nf in e.link_faces if nf is not f]
        if nb and sum(1 for nf in nb if nf in sel)>=len(nb)-1: add.append(f)
    if not add: break
    sel.update(add)
sel={f for f in sel if ffrac_bm(f)>=0.46}
sh_idx={f.index for f in sel}
so_seed=[f for f in bmf.faces if ffrac_bm(f)<0.04]
sels=set(so_seed); st=list(so_seed)
while st:
    f=st.pop()
    for e in f.edges:
        if not e.is_manifold: continue
        for nf in e.link_faces:
            if nf in sels: continue
            if ffrac_bm(nf)>0.235: continue
            sels.add(nf)
            if nf.normal.z>=-0.30: st.append(nf)
sels={f for f in sels if ffrac_bm(f)<=0.16}
so_idx={f.index for f in sels}
bmf.free()

def region(fi):
    if fi in so_idx: return VC["boots"]
    if fi in sh_idx: return VC["trunks"]
    return VC["body"]

# 4. crisp per-corner colour layer, pre-filled from the guess
me=body.data
if me.color_attributes:
    for a in list(me.color_attributes): me.color_attributes.remove(a)
col=me.color_attributes.new(name="VOLTcol", type='BYTE_COLOR', domain='CORNER')
for poly in me.polygons:
    r=region(poly.index)
    for li in poly.loop_indices:
        col.data[li].color=(r[0],r[1],r[2],1.0)
me.color_attributes.active_color=col
me.color_attributes.render_color_index=list(me.color_attributes).index(col)

# 5. material reads the colour layer (so paint shows in the render too)
pm=bpy.data.materials.new("VOLT_Paint"); pm.use_nodes=True
nt=pm.node_tree; b=nt.nodes["Principled BSDF"]
_set(b,"Roughness",0.52); _set(b,"Metallic",0.0); _set(b,"Specular IOR Level",0.15)
cn=nt.nodes.new("ShaderNodeVertexColor"); cn.layer_name="VOLTcol"
nt.links.new(cn.outputs["Color"], b.inputs["Base Color"])
me.materials.clear(); me.materials.append(pm)

# 6. a palette so colour-picking is one click (Body / Trunks / Boots)
pal=bpy.data.palettes.new("VOLT")
for k in ("body","trunks","boots"):
    c=pal.colors.new(); c.color=VC[k]
ts=bpy.context.scene.tool_settings
ts.vertex_paint.palette=pal
# default brush colour = trunks cyan, full strength solid
try:
    br=ts.vertex_paint.brush
    if br: br.color=VC["trunks"]; br.strength=1.0
except Exception: pass

# 7. lights / world / backdrop (so F12 and my render look like the VOLT beauty shot)
w=bpy.data.worlds.new("W"); bpy.context.scene.world=w; w.use_nodes=True
bg=w.node_tree.nodes.get("Background"); bg.inputs[0].default_value=(0.012,0.014,0.020,1); bg.inputs[1].default_value=0.25
bpy.ops.mesh.primitive_plane_add(size=Hh*6, location=(cx,cy+Hh*1.6,cz))
bd=bpy.context.active_object; bd.name="Backdrop"; bd.rotation_euler=(math.radians(90),0,0)
bdm=bpy.data.materials.new("BD"); bdm.use_nodes=True; nt2=bdm.node_tree; nt2.nodes.clear()
out=nt2.nodes.new("ShaderNodeOutputMaterial"); em=nt2.nodes.new("ShaderNodeEmission")
tc=nt2.nodes.new("ShaderNodeTexCoord"); gr=nt2.nodes.new("ShaderNodeTexGradient"); gr.gradient_type='SPHERICAL'
rp=nt2.nodes.new("ShaderNodeValToRGB")
rp.color_ramp.elements[0].position=0.0;  rp.color_ramp.elements[0].color=(0.020,0.026,0.045,1)
rp.color_ramp.elements[1].position=0.65; rp.color_ramp.elements[1].color=(0.003,0.004,0.008,1)
nt2.links.new(tc.outputs["Object"],gr.inputs["Vector"]); nt2.links.new(gr.outputs["Color"],rp.inputs["Fac"])
nt2.links.new(rp.outputs["Color"],em.inputs["Color"]); nt2.links.new(em.outputs[0],out.inputs["Surface"])
bd.data.materials.append(bdm)
def area(nm,loc,rot,energy,size,color=(1,1,1)):
    d=bpy.data.lights.new(nm,'AREA'); d.energy=energy; d.size=size; d.color=color
    o=bpy.data.objects.new(nm,d); bpy.context.collection.objects.link(o)
    o.location=loc; o.rotation_euler=[math.radians(a) for a in rot]
area("Key",(cx-Hh*0.9,cy-Hh*1.5,cz+Hh*0.7),(58,0,-32),240,Hh*0.55,(1.0,0.98,0.95))
area("Fill",(cx+Hh*1.3,cy-Hh*1.1,cz+Hh*0.1),(72,0,48),30,Hh*1.10,(0.92,0.95,1.0))
area("RimL",(cx-Hh*1.2,cy+Hh*1.0,cz+Hh*0.6),(-46,0,-32),1500,Hh*0.6,LT["rim"])
area("RimR",(cx+Hh*1.2,cy+Hh*1.0,cz+Hh*0.6),(-46,0,32),1500,Hh*0.6,LT["rim"])
cd=bpy.data.cameras.new("C"); cd.lens=66
cam=bpy.data.objects.new("C",cd); bpy.context.collection.objects.link(cam)
cam.location=(cx,cy-Hh*3.05,cz-Hh*0.02); cam.rotation_euler=(math.radians(90),0,0)
bpy.context.scene.camera=cam
sc=bpy.context.scene
sc.view_settings.view_transform='Standard'
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=100; sc.cycles.use_denoising=True
sc.render.resolution_x=900; sc.render.resolution_y=1150

# open with the body active + selected
bpy.ops.object.select_all(action='DESELECT')
body.select_set(True); bpy.context.view_layer.objects.active=body

bpy.ops.wm.save_as_mainfile(filepath=BLEND)
print("SAVED", BLEND)
