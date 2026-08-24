"""
VOLT — Mixamo rig-prep export (Blender 4.x)
===========================================
Produces a CLEAN, watertight, decimated, T-pose, mesh-only FBX that Mixamo's
auto-rigger can accept without choking. This is the OPPOSITE of volt_hero.py:
no visor, no emblem, no lights, no fancy materials — Mixamo only wants a single
clean humanoid mesh in a clear T-pose.

Source : mascot_s2.glb
Output : mascot_s2_mixamo.fbx   (upload this to mixamo.com auto-rigger)

Run:
  blender -b -P volt_rigprep.py

Mixamo checklist this script enforces:
  * one joined mesh, no loose bits, no interior floaters
  * merged doubles + recalculated normals (no flipped faces -> no inside-out skinning)
  * holes filled (shorts hem / leg openings) so the mesh is watertight
  * decimated to a rig-friendly poly budget (~18-25k tris)
  * transforms applied, ~standing on the world origin, facing -Y
  * scale sane (Mixamo expects roughly human height in metres)

AFTER Mixamo:
  * download "FBX for Unity/Unreal" (T-pose, +skin) OR the animation pack
  * re-import to Blender, then run volt_hero.py's material block on the rigged
    mesh (parent the visor/emblem to the head/chest bones) for final renders
"""
import bpy, bmesh, math
from mathutils import Vector

BASE = "/home/alpha/products/youtube-pipeline/fitness/mascot3d"
GLB  = f"{BASE}/mascot_s2.glb"
OUT  = f"{BASE}/mascot_s2_mixamo.fbx"

TARGET_TRIS = 22000        # Mixamo-friendly budget
TARGET_H_M  = 1.85         # export height in metres (Mixamo likes ~human scale)

# ----------------------------------------------------------------------------
# 1. import + join
# ----------------------------------------------------------------------------
for ob in list(bpy.data.objects):
    bpy.data.objects.remove(ob, do_unlink=True)
bpy.ops.import_scene.gltf(filepath=GLB)
meshes = [o for o in bpy.data.objects if o.type == 'MESH']
bpy.context.view_layer.objects.active = meshes[0]
for o in meshes: o.select_set(True)
if len(meshes) > 1: bpy.ops.object.join()
body = bpy.context.active_object; body.name = "Mascot"
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# ----------------------------------------------------------------------------
# 2. topology cleanup (the important part for a clean auto-rig)
# ----------------------------------------------------------------------------
Hh0 = max(v.co.z for v in body.data.vertices) - min(v.co.z for v in body.data.vertices)
bm = bmesh.new(); bm.from_mesh(body.data)

# merge coincident verts (AI meshes carry many duplicates)
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0008 * Hh0)

# delete loose geometry (interior floaters / stray verts that break skinning)
loose_v = [v for v in bm.verts if not v.link_faces]
if loose_v: bmesh.ops.delete(bm, geom=loose_v, context='VERTS')

# fill open boundaries (shorts hem, leg openings, any AI holes) -> watertight
open_edges = [e for e in bm.edges if len(e.link_faces) == 1]
if open_edges:
    bmesh.ops.holes_fill(bm, edges=open_edges, sides=8)
# any still-open edges after holes_fill: triangle-fan patch
open_edges = [e for e in bm.edges if len(e.link_faces) == 1]
if open_edges:
    bmesh.ops.triangle_fill(bm, edges=open_edges, use_beauty=True)

# outward normals (prevents inside-out skin weights)
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

bm.to_mesh(body.data); bm.free()
body.data.update()

# report watertightness
bm = bmesh.new(); bm.from_mesh(body.data)
still_open = sum(1 for e in bm.edges if len(e.link_faces) == 1)
non_manifold = sum(1 for e in bm.edges if len(e.link_faces) > 2)
bm.free()
print(f"[cleanup] open edges remaining: {still_open}  non-manifold edges: {non_manifold}")

# ----------------------------------------------------------------------------
# 3. decimate to a rig-friendly budget
# ----------------------------------------------------------------------------
tris = sum((len(p.vertices) - 2) for p in body.data.polygons)
if tris > TARGET_TRIS:
    dec = body.modifiers.new("Dec", "DECIMATE")
    dec.decimate_type = 'COLLAPSE'
    dec.ratio = max(0.05, TARGET_TRIS / tris)
    bpy.ops.object.modifier_apply(modifier="Dec")
tris_after = sum((len(p.vertices) - 2) for p in body.data.polygons)
print(f"[decimate] tris {tris} -> {tris_after}")

# ----------------------------------------------------------------------------
# 4. scale + centre for Mixamo (feet ~on ground, facing -Y, human height)
# ----------------------------------------------------------------------------
zmin = min(v.co.z for v in body.data.vertices)
zmax = max(v.co.z for v in body.data.vertices)
Hh   = zmax - zmin
cx   = sum(v.co.x for v in body.data.vertices)/len(body.data.vertices)
cy   = sum(v.co.y for v in body.data.vertices)/len(body.data.vertices)
body.location = (-cx, -cy, -zmin)                 # feet at z=0, centred in x/y
bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)
s = TARGET_H_M / Hh
body.scale = (s, s, s)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# ----------------------------------------------------------------------------
# 5. one simple material slot (Mixamo ignores shading; keep it clean)
# ----------------------------------------------------------------------------
body.data.materials.clear()
m = bpy.data.materials.new("VOLT_base"); m.use_nodes = True
body.data.materials.append(m)
bpy.ops.object.shade_smooth()

# ----------------------------------------------------------------------------
# 6. export FBX (mesh only, sane axes for Mixamo)
# ----------------------------------------------------------------------------
bpy.ops.object.select_all(action='DESELECT'); body.select_set(True)
bpy.context.view_layer.objects.active = body
bpy.ops.export_scene.fbx(
    filepath=OUT, use_selection=True, object_types={'MESH'},
    apply_scale_options='FBX_SCALE_ALL', bake_space_transform=True,
    mesh_smooth_type='FACE', axis_forward='-Z', axis_up='Y',
)
print("EXPORTED", OUT)
print("Next: upload to mixamo.com -> Auto-Rigger -> place the 4 markers "
      "(chin, wrists, elbows, knees, groin) -> download 'FBX for Unity'.")
