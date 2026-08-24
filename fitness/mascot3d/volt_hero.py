"""
VOLT — hero look-dev / beauty render (Blender 4.x, Cycles)
===========================================================
Applies the LOCKED VOLT identity to the base sculpt and renders a turnaround.

Source sculpt : mascot_s2.glb   (shorts + boots geometry are baked in)
Face (LOCKED) : cyan visor on a faceless volt-blue head (NO eyes)
Output        : renders/volt_hero_{0..3}.png  (front, 3/4, side, back)

Run:
  blender -b -P volt_hero.py
(-b = background/headless. Drop -b to open the scene in the UI and inspect.)

NOTE: this is the LOOK/beauty script. It adds a visor + emblem + lights that
must NOT go into the Mixamo upload. For rigging use volt_rigprep.py instead.
"""
import bpy, bmesh, math
from mathutils import Vector

# ----------------------------------------------------------------------------
# paths
# ----------------------------------------------------------------------------
BASE = "/home/alpha/products/youtube-pipeline/fitness/mascot3d"
GLB  = f"{BASE}/mascot_s2.glb"
R    = f"{BASE}/renders"

# ----------------------------------------------------------------------------
# VOLT palette — hex is the single source of truth; convert sRGB->linear so the
# rendered colour matches the spec exactly (Blender inputs are linear).
# ----------------------------------------------------------------------------
def _s2l(c):                       # one sRGB channel (0..1) -> linear
    return c/12.92 if c <= 0.04045 else ((c+0.055)/1.055)**2.4
def hx(h):                         # "#RRGGBB" -> (r,g,b) linear
    h = h.lstrip("#")
    return tuple(_s2l(int(h[i:i+2], 16)/255.0) for i in (0, 2, 4))

VOLT = {
    "body":       hx("#2F6BFF"),   # volt-blue (mid body)
    "body_top":   hx("#3B78FF"),   # gradient top (shoulders/chest)
    "body_bot":   hx("#1A3FB0"),   # gradient bottom (legs)
    "trunks":     hx("#16E6CC"),   # cyan trunks
    "emblem":     hx("#FFC93C"),   # amber emblem
    "visor":      hx("#16E6CC"),   # cyan visor (same cyan as trunks)
    "deepshade":  hx("#0B1B3A"),   # visor rim / boots / deep shadow
    "rim":        hx("#7FA8FF"),   # rim-light tint (signature edge glow)
    # coaching-cue colours are kept SEPARATE from the mascot (captions/graphics only):
    "cue_wrong":  hx("#FF3B30"),   # red  = wrong
    "cue_right":  hx("#34C759"),   # green = right
}

# ----------------------------------------------------------------------------
# material helpers
# ----------------------------------------------------------------------------
def _set(bsdf, name, val):
    if name in bsdf.inputs:
        bsdf.inputs[name].default_value = val

def matte(nm, col, rough=0.55, emit=None, emit_str=0.0):
    """A flat matte Principled material. Optional emission for the visor/emblem."""
    m = bpy.data.materials.new(nm); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    _set(b, "Base Color", (*col, 1)); _set(b, "Roughness", rough)
    _set(b, "Metallic", 0.0); _set(b, "Specular IOR Level", 0.15)
    if emit is not None:
        _set(b, "Emission Color", (*emit, 1)); _set(b, "Emission Strength", emit_str)
    return m

def volt_body():
    """Matte volt-blue with a vertical gradient + AO cavity darkening so the
    sculpted muscle reads even without eyes/features. Robust node set only
    (TexCoord / ColorRamp / AO / Math / VectorMath) — no Mix-node API churn."""
    m = bpy.data.materials.new("VOLT_Body"); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    _set(b, "Roughness", 0.55); _set(b, "Metallic", 0.0); _set(b, "Specular IOR Level", 0.15)

    tc  = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Generated"], sep.inputs["Vector"])   # 0..1 up the bbox

    ramp = nt.nodes.new("ShaderNodeValToRGB")
    e = ramp.color_ramp.elements
    e[0].position = 0.12; e[0].color = (*VOLT["body_bot"], 1)      # legs = deep blue
    mid = ramp.color_ramp.elements.new(0.50); mid.color = (*VOLT["body"], 1)   # mid body
    top = ramp.color_ramp.elements[-1]; top.position = 0.92; top.color = (*VOLT["body_top"], 1)  # shoulders/chest
    nt.links.new(sep.outputs["Z"], ramp.inputs["Fac"])

    ao = nt.nodes.new("ShaderNodeAmbientOcclusion"); ao.samples = 16
    ao.inputs["Distance"].default_value = 0.06
    clamp = nt.nodes.new("ShaderNodeMath"); clamp.operation = 'MAXIMUM'
    clamp.inputs[1].default_value = 0.38                            # cavity darkness floor
    nt.links.new(ao.outputs["AO"], clamp.inputs[0])

    mul = nt.nodes.new("ShaderNodeVectorMath"); mul.operation = 'MULTIPLY'
    nt.links.new(ramp.outputs["Color"], mul.inputs[0])
    nt.links.new(clamp.outputs["Value"], mul.inputs[1])            # scalar broadcast -> vector
    nt.links.new(mul.outputs["Vector"], b.inputs["Base Color"])
    return m

# ----------------------------------------------------------------------------
# 1. import + consolidate the sculpt
# ----------------------------------------------------------------------------
for ob in list(bpy.data.objects):
    bpy.data.objects.remove(ob, do_unlink=True)
bpy.ops.import_scene.gltf(filepath=GLB)
ms = [o for o in bpy.data.objects if o.type == 'MESH']
bpy.context.view_layer.objects.active = ms[0]
for o in ms: o.select_set(True)
if len(ms) > 1: bpy.ops.object.join()
body = bpy.context.active_object; body.name = "VOLT"
bpy.ops.object.shade_smooth()
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

vs = [v.co for v in body.data.vertices]
zmin = min(p.z for p in vs); zmax = max(p.z for p in vs); Hh = zmax - zmin
cx = sum(p.x for p in vs)/len(vs); cy = sum(p.y for p in vs)/len(vs); cz = (zmin+zmax)/2
def frac(z): return (z - zmin) / Hh

# ----------------------------------------------------------------------------
# 2. (intentionally NO mesh cleanup here)
#    Filling holes / recalculating normals here BRIDGES the shorts hem to the
#    thigh and makes the flood-fill below leak onto the leg. The flood-fill needs
#    the raw sculpt's open hem lip as its wall. Real hole/retopo fixes belong in
#    the sculpt stage (mesh_cleanup_checklist.md), not here.
# ----------------------------------------------------------------------------

# ----------------------------------------------------------------------------
# 3. replace lumpy AI head with a clean faceless ball (volt-blue)
# ----------------------------------------------------------------------------
CUT = zmin + 0.85 * Hh
hv  = [p for p in vs if p.z > CUT]; hcy = sum(p.y for p in hv)/len(hv)
bm = bmesh.new(); bm.from_mesh(body.data)
bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z > CUT], context='VERTS')
bm.to_mesh(body.data); bm.free()

HR  = 0.100 * Hh                    # head radius
HCZ = zmin + 0.895 * Hh             # head centre z (base overlaps traps)
bpy.ops.mesh.primitive_uv_sphere_add(segments=56, ring_count=36, radius=1.0,
                                      location=(cx, hcy, HCZ))
head = bpy.context.active_object; head.name = "VOLT_Head"
head.scale = (HR, HR*0.82, HR*0.94)
head.data.materials.append(matte("VOLT_Head_Mat", VOLT["body"], 0.55))
bpy.ops.object.shade_smooth()

# ----------------------------------------------------------------------------
# 4. LOCKED FACE = cyan visor band (no eyes)
#    - deep-shade rim behind, glowing cyan lens in front, wrapping the face
# ----------------------------------------------------------------------------
hf   = hcy - HR * 0.82              # front surface of the head
EYEZ = HCZ - HR * 0.05             # visor sits just above head centre
# deep-shade rim (slightly larger, behind the lens)
bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, location=(cx, hf + 0.004*Hh, EYEZ))
rim = bpy.context.active_object; rim.name = "VOLT_VisorRim"
rim.scale = (HR*0.82, HR*0.30, HR*0.34)
rim.data.materials.append(matte("VOLT_VisorRim_Mat", VOLT["deepshade"], 0.45))
bpy.ops.object.shade_smooth()
# glowing cyan visor lens (front), wide wraparound band
bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, location=(cx, hf - 0.006*Hh, EYEZ))
visor = bpy.context.active_object; visor.name = "VOLT_Visor"
visor.scale = (HR*0.78, HR*0.30, HR*0.26)
visor.data.materials.append(matte("VOLT_Visor_Mat", VOLT["visor"], 0.20,
                                   emit=VOLT["visor"], emit_str=2.2))
bpy.ops.object.shade_smooth()

# ----------------------------------------------------------------------------
# 5. body / trunks / boots materials  (flood-fill on the BAKED geometry)
#    Ported from the working smooth_s2.py region logic: seed the waistband and
#    flood down to the true hem lip (a down-facing normal wall); seed the soles
#    and flood up to the sock cuff. Everything else = skin (volt body).
# ----------------------------------------------------------------------------
skin   = volt_body()
trunks = matte("VOLT_Trunks", VOLT["trunks"], 0.50)
boots  = matte("VOLT_Boots",  VOLT["deepshade"], 0.60)
body.data.materials.clear()
for m in (skin, boots, trunks):
    body.data.materials.append(m)                      # 0=body 1=boots 2=trunks

# EXACT working flood-fill from smooth_s2.py (the grey-shorts reference). It walks
# the BAKED shorts fabric out to its real hem lip (a down-facing normal wall), so
# the seam follows the actual garment edge. This only works on the RAW mesh, which
# is why step 2 does no hole-filling.
bmf = bmesh.new(); bmf.from_mesh(body.data)
bmf.faces.ensure_lookup_table(); bmf.normal_update()
def ffrac(f): return (f.calc_center_median().z - zmin) / Hh
def fx(f):    return f.calc_center_median().x

# ---- TRUNKS: flood down from the waistband ring, stop at the real hem lip ----
SLO, SHI = 0.36, 0.605                                   # shorts z-envelope
def is_hem(f): return f.normal.z < -0.22 and ffrac(f) < 0.47   # the hem-lip walls
sh_seed = [f for f in bmf.faces if 0.50 < ffrac(f) < 0.56 and abs(fx(f)-cx) < 0.17*Hh]
sel = set(sh_seed); st = list(sh_seed)
while st:
    f = st.pop()
    for e in f.edges:
        if not e.is_manifold: continue
        for nf in e.link_faces:
            if nf in sel: continue
            fr = ffrac(nf)
            if fr < SLO or fr > SHI: continue
            sel.add(nf)
            if not is_hem(nf): st.append(nf)              # include hem face, don't paint past it
for _ in range(6):                                        # fill enclosed leg-opening pockets
    add = []
    for f in bmf.faces:
        if f in sel: continue
        fr = ffrac(f)
        if fr < 0.42 or fr > SHI: continue
        nb = [nf for e in f.edges if e.is_manifold for nf in e.link_faces if nf is not f]
        if nb and sum(1 for nf in nb if nf in sel) >= len(nb)-1:
            add.append(f)
    if not add: break
    sel.update(add)
# Kill ONLY the asymmetric flood leak (the drip that escapes through a hole in one
# thigh). Drop shorts faces that sit below the hem line. The clean curved hem on the
# good leg is already above this floor, so it is left exactly as the flood made it.
HEM_FLOOR = 0.46          # raise a hair if a drip sliver remains; lower if a good hem gets trimmed
sel = {f for f in sel if ffrac(f) >= HEM_FLOOR}
sh_idx = {f.index for f in sel}

# ---- BOOTS+SOCKS: flood up from the soles, stop at the sock-cuff lip ----
so_seed = [f for f in bmf.faces if ffrac(f) < 0.04]
sels = set(so_seed); st = list(so_seed)
while st:
    f = st.pop()
    for e in f.edges:
        if not e.is_manifold: continue
        for nf in e.link_faces:
            if nf in sels: continue
            if ffrac(nf) > 0.235: continue
            sels.add(nf)
            if nf.normal.z >= -0.30: st.append(nf)
# Clip the boot creep to a clean ankle line (kills the "socks up the calf").
BOOT_TOP = 0.16           # raise for taller boots, lower for shorter
sels = {f for f in sels if ffrac(f) <= BOOT_TOP}
so_idx = {f.index for f in sels}
bmf.free()

for poly in body.data.polygons:
    if   poly.index in so_idx: poly.material_index = 1   # boots
    elif poly.index in sh_idx: poly.material_index = 2   # trunks
    else:                      poly.material_index = 0   # volt body

# ----------------------------------------------------------------------------
# 6. amber chest emblem  (small disc decal on the pec plate)
#    Placeholder geometry — swap for a proper bolt/logo texture in the pipeline.
# ----------------------------------------------------------------------------
# Placeholder amber emblem — OFF by default. This was a stand-in hexagon, not the
# final logo. Flip to True only when a real VOLT bolt decal/mesh is ready.
ADD_EMBLEM = False
if ADD_EMBLEM:
    EMZ = zmin + 0.66 * Hh
    chest = [p for p in vs if abs(p.z - EMZ) < 0.05*Hh and abs(p.x - cx) < 0.12*Hh]
    chest_front_y = (min(p.y for p in chest) if chest else cy - 0.14*Hh) - 0.004*Hh
    bpy.ops.mesh.primitive_circle_add(vertices=6, radius=HR*0.30, fill_type='NGON',
                                       location=(cx, chest_front_y, EMZ))
    emb = bpy.context.active_object; emb.name = "VOLT_Emblem"
    emb.rotation_euler = (math.radians(90), 0, 0)
    emb.data.materials.append(matte("VOLT_Emblem_Mat", VOLT["emblem"], 0.40,
                                     emit=VOLT["emblem"], emit_str=0.6))

# ----------------------------------------------------------------------------
# 7. parent everything to a pivot for clean turntable rotation
# ----------------------------------------------------------------------------
piv = bpy.data.objects.new("Pivot", None); bpy.context.collection.objects.link(piv)
piv.location = (cx, cy, cz)
for o in [o for o in bpy.data.objects if o.type == 'MESH']:
    o.parent = piv; o.matrix_parent_inverse = piv.matrix_world.inverted()

# ----------------------------------------------------------------------------
# 8. world + gradient backdrop
# ----------------------------------------------------------------------------
w = bpy.data.worlds.new("W"); bpy.context.scene.world = w; w.use_nodes = True
bg = w.node_tree.nodes.get("Background")
bg.inputs[0].default_value = (0.012, 0.014, 0.020, 1); bg.inputs[1].default_value = 0.25
bpy.ops.mesh.primitive_plane_add(size=Hh*6, location=(cx, cy+Hh*1.6, cz))
bd = bpy.context.active_object; bd.rotation_euler = (math.radians(90), 0, 0)
bdm = bpy.data.materials.new("BD"); bdm.use_nodes = True; nt = bdm.node_tree; nt.nodes.clear()
out = nt.nodes.new("ShaderNodeOutputMaterial"); em = nt.nodes.new("ShaderNodeEmission")
tc = nt.nodes.new("ShaderNodeTexCoord"); gr = nt.nodes.new("ShaderNodeTexGradient")
gr.gradient_type = 'SPHERICAL'
rp = nt.nodes.new("ShaderNodeValToRGB")
rp.color_ramp.elements[0].position = 0.0;  rp.color_ramp.elements[0].color = (0.020, 0.026, 0.045, 1)
rp.color_ramp.elements[1].position = 0.65; rp.color_ramp.elements[1].color = (0.003, 0.004, 0.008, 1)
nt.links.new(tc.outputs["Object"], gr.inputs["Vector"])
nt.links.new(gr.outputs["Color"], rp.inputs["Fac"])
nt.links.new(rp.outputs["Color"], em.inputs["Color"])
nt.links.new(em.outputs[0], out.inputs["Surface"])
bd.data.materials.append(bdm)
bd.parent = None                                        # backdrop stays put during turntable

# ----------------------------------------------------------------------------
# 9. 3-point studio lighting  (key + fill + two rim-blue edge lights)
# ----------------------------------------------------------------------------
def area(nm, loc, rot, energy, size, color=(1, 1, 1)):
    d = bpy.data.lights.new(nm, 'AREA'); d.energy = energy; d.size = size; d.color = color
    ob = bpy.data.objects.new(nm, d); bpy.context.collection.objects.link(ob)
    ob.location = loc; ob.rotation_euler = [math.radians(a) for a in rot]
    return ob
area("Key",  (cx-Hh*0.9, cy-Hh*1.5, cz+Hh*0.7), (58, 0, -32), 240, Hh*0.55, (1.0, 0.98, 0.95))
area("Fill", (cx+Hh*1.3, cy-Hh*1.1, cz+Hh*0.1), (72, 0,  48),  30, Hh*1.10, (0.92, 0.95, 1.0))
area("RimL", (cx-Hh*1.2, cy+Hh*1.0, cz+Hh*0.6), (-46, 0, -32), 1500, Hh*0.6, VOLT["rim"])
area("RimR", (cx+Hh*1.2, cy+Hh*1.0, cz+Hh*0.6), (-46, 0,  32), 1500, Hh*0.6, VOLT["rim"])

# ----------------------------------------------------------------------------
# 10. camera + render
# ----------------------------------------------------------------------------
cd = bpy.data.cameras.new("C"); cd.lens = 66
cam = bpy.data.objects.new("C", cd); bpy.context.collection.objects.link(cam)
cam.location = (cx, cy-Hh*3.05, cz-Hh*0.02); cam.rotation_euler = (math.radians(90), 0, 0)
bpy.context.scene.camera = cam

sc = bpy.context.scene
sc.view_settings.view_transform = 'Standard'
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'
sc.cycles.samples = 150; sc.cycles.use_denoising = True
sc.render.resolution_x = 900; sc.render.resolution_y = 1150
sc.render.image_settings.file_format = 'PNG'

for i, yaw in enumerate([0, 45, 90, 180]):              # front, 3/4, side, back
    piv.rotation_euler = (0, 0, math.radians(yaw))
    sc.render.filepath = f"{R}/volt_hero_{i}.png"
    bpy.ops.render.render(write_still=True)
    print("rendered yaw", yaw)
print("VOLT hero look-dev DONE")
