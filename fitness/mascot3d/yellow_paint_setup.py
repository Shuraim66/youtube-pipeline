"""
Build yellow_edit.blend — ready to (a) VERTEX-PAINT the shorts by hand and
(b) SCULPT more detail into the back and fists. Mesh = mascot_mv.glb.
Opens pre-coloured (amber skin / charcoal shorts / dark boots) with a palette,
and the muscular back reference loaded as an image for sculpting reference.

  blender -b -P yellow_paint_setup.py        # build
  blender fitness/mascot3d/yellow_edit.blend # open to work
"""
import bpy, bmesh, math
BASE="/home/alpha/products/youtube-pipeline/fitness/mascot3d"
GLB=f"{BASE}/mascot_mv.glb"; BLEND=f"{BASE}/yellow_edit.blend"
# vertex-paint colours (sRGB)
C_SKIN=(0.80,0.58,0.10); C_SHORTS=(0.16,0.17,0.20); C_BOOTS=(0.09,0.09,0.11)
def _set(b,n,v):
    if n in b.inputs: b.inputs[n].default_value=v
def matte(nm,col,rough=0.5):
    m=bpy.data.materials.new(nm); m.use_nodes=True; b=m.node_tree.nodes["Principled BSDF"]
    _set(b,"Base Color",(*col,1)); _set(b,"Roughness",rough); m.diffuse_color=(*col,1); return m

for ob in list(bpy.data.objects): bpy.data.objects.remove(ob,do_unlink=True)
bpy.ops.import_scene.gltf(filepath=GLB)
ms=[o for o in bpy.data.objects if o.type=='MESH']; bpy.context.view_layer.objects.active=ms[0]
for o in ms: o.select_set(True)
if len(ms)>1: bpy.ops.object.join()
body=bpy.context.active_object; body.name="MASCOT"; bpy.ops.object.shade_smooth()
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
vs=[v.co for v in body.data.vertices]
zmin=min(p.z for p in vs); zmax=max(p.z for p in vs); Hh=zmax-zmin
cx=sum(p.x for p in vs)/len(vs); cy=sum(p.y for p in vs)/len(vs); cz=(zmin+zmax)/2

# ---- region guess (same flood as the render) so painting starts from a good base ----
bmf=bmesh.new(); bmf.from_mesh(body.data); bmf.faces.ensure_lookup_table(); bmf.normal_update()
def ffrac(f): return (f.calc_center_median().z-zmin)/Hh
def fxx(f): return f.calc_center_median().x
SLO,SHI=0.40,0.605
def is_hem(f): return f.normal.z<-0.20 and ffrac(f)<0.47
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
    add=[f for f in bmf.faces if f not in sel and SLO<ffrac(f)<SHI and
         (lambda nb: nb and sum(1 for nf in nb if nf in sel)>=len(nb)-1)(
             [nf for e in f.edges if e.is_manifold for nf in e.link_faces if nf is not f])]
    if not add: break
    sel.update(add)
for _ in range(8):
    add=[f for f in bmf.faces if f not in sel and 0.44<ffrac(f)<SHI and
         (lambda nb: nb and sum(1 for nf in nb if nf in sel)>=len(nb)*0.5)(
             [nf for e in f.edges if e.is_manifold for nf in e.link_faces if nf is not f])]
    if not add: break
    sel.update(add)
sh_idx={f.index for f in sel}
so_idx={f.index for f in bmf.faces if ffrac(f)<0.055}
bmf.free()
def region(fi):
    if fi in so_idx: return C_BOOTS
    if fi in sh_idx: return C_SHORTS
    return C_SKIN
me=body.data
if me.color_attributes:
    for a in list(me.color_attributes): me.color_attributes.remove(a)
col=me.color_attributes.new(name="Paint", type='BYTE_COLOR', domain='CORNER')
for poly in me.polygons:
    r=region(poly.index)
    for li in poly.loop_indices: col.data[li].color=(r[0],r[1],r[2],1.0)
me.color_attributes.active_color=col; me.color_attributes.render_color_index=0

# material reads the paint layer (so painting shows in render)
pm=bpy.data.materials.new("Mascot_Paint"); pm.use_nodes=True; nt=pm.node_tree; b=nt.nodes["Principled BSDF"]
_set(b,"Roughness",0.5)
cn=nt.nodes.new("ShaderNodeVertexColor"); cn.layer_name="Paint"
nt.links.new(cn.outputs["Color"], b.inputs["Base Color"])
me.materials.clear(); me.materials.append(pm)

# palette for easy colour picking
pal=bpy.data.palettes.new("Mascot")
for c in (C_SKIN,C_SHORTS,C_BOOTS):
    pc=pal.colors.new(); pc.color=c
ts=bpy.context.scene.tool_settings
ts.vertex_paint.palette=pal
try:
    if ts.vertex_paint.brush: ts.vertex_paint.brush.color=C_SHORTS
except Exception: pass

# load the muscular back reference as an image (sculpt guide)
try: bpy.data.images.load(f"{BASE}/ref/back_1.png")
except Exception: pass

# simple 3-point light so a preview render looks right
w=bpy.data.worlds.new("W"); bpy.context.scene.world=w; w.use_nodes=True
w.node_tree.nodes.get("Background").inputs[1].default_value=0.4
def area(nm,loc,rot,e,s):
    d=bpy.data.lights.new(nm,'AREA'); d.energy=e; d.size=s
    o=bpy.data.objects.new(nm,d); bpy.context.collection.objects.link(o); o.location=loc; o.rotation_euler=[math.radians(a) for a in rot]
area("Key",(cx-Hh*0.9,cy-Hh*1.4,cz+Hh*0.6),(58,0,-32),220,Hh*0.6)
area("Back",(cx,cy+Hh*1.4,cz+Hh*0.5),(-58,0,0),400,Hh*0.7)
cd=bpy.data.cameras.new("C"); cd.lens=64
cam=bpy.data.objects.new("C",cd); bpy.context.collection.objects.link(cam)
cam.location=(cx,cy-Hh*3.0,cz); cam.rotation_euler=(math.radians(90),0,0); bpy.context.scene.camera=cam
sc=bpy.context.scene; sc.view_settings.view_transform='Standard'
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=80

bpy.ops.object.select_all(action='DESELECT'); body.select_set(True); bpy.context.view_layer.objects.active=body
bpy.ops.wm.save_as_mainfile(filepath=BLEND)
print("SAVED", BLEND)
