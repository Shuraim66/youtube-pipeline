import bpy, math, bmesh
GLB="/home/alpha/products/youtube-pipeline/fitness/mascot3d/mascot_s2.glb"
R="/home/alpha/products/youtube-pipeline/fitness/mascot3d/renders"
for ob in list(bpy.data.objects): bpy.data.objects.remove(ob,do_unlink=True)
bpy.ops.import_scene.gltf(filepath=GLB)
ms=[o for o in bpy.data.objects if o.type=='MESH']; bpy.context.view_layer.objects.active=ms[0]
for o in ms: o.select_set(True)
if len(ms)>1: bpy.ops.object.join()
body=bpy.context.active_object; bpy.ops.object.shade_smooth()
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
vs=[v.co for v in body.data.vertices]
zmin=min(p.z for p in vs); zmax=max(p.z for p in vs); Hh=zmax-zmin
cx=sum(p.x for p in vs)/len(vs); cy=sum(p.y for p in vs)/len(vs); cz=(zmin+zmax)/2
# cut head so it doesn't distract
bm=bmesh.new(); bm.from_mesh(body.data)
bmesh.ops.delete(bm,geom=[v for v in bm.verts if v.co.z>zmin+0.86*Hh],context='VERTS'); bm.to_mesh(body.data); bm.free()
clay=bpy.data.materials.new("Clay"); clay.use_nodes=True; b=clay.node_tree.nodes["Principled BSDF"]
b.inputs["Base Color"].default_value=(0.6,0.6,0.6,1); b.inputs["Roughness"].default_value=0.6
body.data.materials.clear(); body.data.materials.append(clay)
w=bpy.data.worlds.new("W"); bpy.context.scene.world=w; w.use_nodes=True
w.node_tree.nodes.get("Background").inputs[1].default_value=0.05
def area(nm,loc,rot,e,s):
    d=bpy.data.lights.new(nm,'AREA'); d.energy=e; d.size=s
    ob=bpy.data.objects.new(nm,d); bpy.context.collection.objects.link(ob); ob.location=loc; ob.rotation_euler=[math.radians(a) for a in rot]
# hard low grazing light from below-front to catch the hem lip as a shadow
area("Graze",(cx,cy-Hh*1.2,zmin+0.05*Hh),(-72,0,0),400,Hh*0.15)
area("Top",(cx,cy-Hh*0.6,cz+Hh*1.4),(30,0,0),120,Hh*0.4)
cd=bpy.data.cameras.new("C"); cd.lens=80
cam=bpy.data.objects.new("C",cd); bpy.context.collection.objects.link(cam)
# frame lower body: crotch..knee
tz=zmin+0.38*Hh
cam.location=(cx,cy-Hh*1.5,tz); cam.rotation_euler=(math.radians(90),0,0); bpy.context.scene.camera=cam
sc=bpy.context.scene; sc.view_settings.view_transform='Standard'
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=100; sc.cycles.use_denoising=True
sc.render.resolution_x=800; sc.render.resolution_y=800; sc.render.image_settings.file_format='PNG'
sc.render.filepath=f"{R}/clay_front.png"; bpy.ops.render.render(write_still=True)
# side view
cam.location=(cx-Hh*1.5,cy,tz); cam.rotation_euler=(math.radians(90),0,math.radians(-90))
sc.render.filepath=f"{R}/clay_side.png"; bpy.ops.render.render(write_still=True)
print("DONE")
