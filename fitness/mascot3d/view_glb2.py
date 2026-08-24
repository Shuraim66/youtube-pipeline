import bpy, math
from mathutils import Vector
GLB="/home/alpha/products/youtube-pipeline/fitness/mascot3d/mascot2_shape.glb"
R="/home/alpha/products/youtube-pipeline/fitness/mascot3d/renders"
for ob in list(bpy.data.objects): bpy.data.objects.remove(ob,do_unlink=True)
bpy.ops.import_scene.gltf(filepath=GLB)
meshes=[o for o in bpy.data.objects if o.type=='MESH']
# combined world bbox
mins=Vector((1e9,)*3); maxs=Vector((-1e9,)*3)
for o in meshes:
    for c in o.bound_box:
        w=o.matrix_world@Vector(c)
        for i in range(3): mins[i]=min(mins[i],w[i]); maxs[i]=max(maxs[i],w[i])
ctr=(mins+maxs)/2; size=maxs-mins; H=max(size)
print("size",[round(v,3) for v in size],"H",round(H,3))
# parent to empty at center for easy rotation
emp=bpy.data.objects.new("Piv",None); bpy.context.collection.objects.link(emp)
emp.location=ctr
for o in meshes:
    o.parent=emp; o.matrix_parent_inverse=emp.matrix_world.inverted()
# simple cel-ish material
m=bpy.data.materials.new("M"); m.use_nodes=True; nt=m.node_tree; nt.nodes.clear()
out=nt.nodes.new("ShaderNodeOutputMaterial"); d=nt.nodes.new("ShaderNodeBsdfDiffuse")
d.inputs[0].default_value=(0.8,0.6,0.45,1); nt.links.new(d.outputs[0],out.inputs[0])
for o in meshes: o.data.materials.clear(); o.data.materials.append(m)
# world + light
w=bpy.data.worlds.new("W"); bpy.context.scene.world=w; w.use_nodes=True
w.node_tree.nodes.get("Background").inputs[1].default_value=0.5
key=bpy.data.lights.new("K",'SUN'); key.energy=3; ko=bpy.data.objects.new("K",key)
bpy.context.collection.objects.link(ko); ko.rotation_euler=[math.radians(a) for a in (55,0,-25)]
# camera ortho pointing -Y
cd=bpy.data.cameras.new("C"); cd.type='ORTHO'; cd.ortho_scale=H*1.2
cam=bpy.data.objects.new("C",cd); bpy.context.collection.objects.link(cam)
cam.location=(ctr.x, ctr.y-H*2, ctr.z); cam.rotation_euler=(math.radians(90),0,0)
bpy.context.scene.camera=cam
sc=bpy.context.scene; sc.view_settings.view_transform='Standard'
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=12
sc.render.resolution_x=420; sc.render.resolution_y=640
sc.render.image_settings.file_format='PNG'; sc.render.film_transparent=True
for i,yaw in enumerate([0,90,180,270]):
    emp.rotation_euler=(0,0,math.radians(yaw))
    sc.render.filepath=f"{R}/glb2_view_{i}.png"; bpy.ops.render.render(write_still=True)
    print("view",yaw)
print("DONE")
