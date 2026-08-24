"""
Render the 4-angle VOLT turntable from the HAND-PAINTED volt_paint.blend.
Run AFTER you finish painting and save the .blend:
  blender -b fitness/mascot3d/volt_paint.blend -P fitness/mascot3d/volt_render_blend.py
Writes renders/volt_hero_{0..3}.png (front, 3/4, side, back).
"""
import bpy, math
R = "/home/alpha/products/youtube-pipeline/fitness/mascot3d/renders"

meshes = [o for o in bpy.data.objects if o.type == 'MESH' and o.name != 'Backdrop']
# derive a pivot at the character centroid (ignore the far-away backdrop plane)
chars = [o for o in meshes if o.name in ("VOLT","VOLT_Head","VOLT_Visor","VOLT_VisorRim")]
if not chars: chars = meshes
xs=[o.location.x for o in chars];
piv = bpy.data.objects.new("RenderPivot", None); bpy.context.collection.objects.link(piv)
# centroid of the VOLT body bbox in world space
vb = next((o for o in chars if o.name=="VOLT"), chars[0])
import mathutils
ws = [vb.matrix_world @ mathutils.Vector(c) for c in vb.bound_box]
piv.location = (sum(p.x for p in ws)/8, sum(p.y for p in ws)/8, sum(p.z for p in ws)/8)
for o in chars:
    o.parent = piv; o.matrix_parent_inverse = piv.matrix_world.inverted()

sc = bpy.context.scene
sc.render.image_settings.file_format = 'PNG'
for i, yaw in enumerate([0, 45, 90, 180]):
    piv.rotation_euler = (0, 0, math.radians(yaw))
    sc.render.filepath = f"{R}/volt_hero_{i}.png"
    bpy.ops.render.render(write_still=True)
    print("rendered yaw", yaw)
print("PAINTED VOLT render DONE")
