import bpy
GLB="/home/alpha/products/youtube-pipeline/fitness/mascot3d/mascot_hero_tpose.glb"
OUT="/home/alpha/products/youtube-pipeline/fitness/mascot3d/mascot_hero_tpose.fbx"
for ob in list(bpy.data.objects): bpy.data.objects.remove(ob,do_unlink=True)
bpy.ops.import_scene.gltf(filepath=GLB)
meshes=[o for o in bpy.data.objects if o.type=='MESH']
bpy.context.view_layer.objects.active=meshes[0]
for o in meshes: o.select_set(True)
bpy.ops.object.join(); body=bpy.context.active_object; body.name="Mascot"
# decimate 140k -> ~21k faces for Mixamo
dec=body.modifiers.new("Dec","DECIMATE"); dec.ratio=0.15
bpy.ops.object.modifier_apply(modifier="Dec")
print("faces after decimate:", len(body.data.polygons))
# apply transforms, clean
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
# export FBX (mesh only)
bpy.ops.object.select_all(action='DESELECT'); body.select_set(True)
bpy.context.view_layer.objects.active=body
bpy.ops.export_scene.fbx(filepath=OUT, use_selection=True, object_types={'MESH'},
                         apply_scale_options='FBX_SCALE_ALL', bake_space_transform=True,
                         mesh_smooth_type='FACE')
print("EXPORTED", OUT)
