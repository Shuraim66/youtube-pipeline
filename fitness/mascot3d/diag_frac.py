import bpy, math
GLB="/home/alpha/products/youtube-pipeline/fitness/mascot3d/mascot_s2.glb"
R="/home/alpha/products/youtube-pipeline/fitness/mascot3d/renders"
for ob in list(bpy.data.objects): bpy.data.objects.remove(ob,do_unlink=True)
bpy.ops.import_scene.gltf(filepath=GLB)
ms=[o for o in bpy.data.objects if o.type=='MESH']
bpy.context.view_layer.objects.active=ms[0]
for o in ms: o.select_set(True)
if len(ms)>1: bpy.ops.object.join()
body=bpy.context.active_object; bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
vs=[v.co for v in body.data.vertices]
zmin=min(p.z for p in vs); zmax=max(p.z for p in vs); Hh=zmax-zmin
cx=sum(p.x for p in vs)/len(vs); cy=sum(p.y for p in vs)/len(vs); cz=(zmin+zmax)/2
def frac(z): return (z-zmin)/Hh
# 20 alternating bands every 0.05 frac: even=blue, odd=orange, plus label bands 0.4/0.5 special
mats=[]
cols=[(0.1,0.2,0.8),(0.9,0.5,0.1)]
for i in range(20):
    m=bpy.data.materials.new(f"b{i}"); m.use_nodes=True; nt=m.node_tree; nt.nodes.clear()
    o=nt.nodes.new("ShaderNodeOutputMaterial"); e=nt.nodes.new("ShaderNodeEmission")
    c=cols[i%2]
    if i in (8,10,6): c=(0,1,0)          # 0.40,0.50,0.30 lines highlighted green
    e.inputs[0].default_value=(*c,1); nt.links.new(e.outputs[0],o.inputs["Surface"]); mats.append(m)
body.data.materials.clear()
for m in mats: body.data.materials.append(m)
for poly in body.data.polygons:
    band=min(19,int(frac(poly.center.z)/0.05)); poly.material_index=band
w=bpy.data.worlds.new("W"); bpy.context.scene.world=w; w.use_nodes=True
w.node_tree.nodes.get("Background").inputs[1].default_value=0.0
cd=bpy.data.cameras.new("C"); cd.type='ORTHO'; cd.ortho_scale=Hh*2.1
cam=bpy.data.objects.new("C",cd); bpy.context.collection.objects.link(cam)
cam.location=(cx,cy-Hh*3,cz); cam.rotation_euler=(math.radians(90),0,0); bpy.context.scene.camera=cam
sc=bpy.context.scene; sc.view_settings.view_transform='Standard'
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=8; sc.render.film_transparent=True
sc.render.resolution_x=600; sc.render.resolution_y=900; sc.render.filepath=f"{R}/diag.png"
bpy.ops.render.render(write_still=True); print("bands: each stripe=0.05 frac; GREEN=0.30,0.40,0.50. DONE")
