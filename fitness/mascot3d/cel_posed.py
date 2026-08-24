import bpy, math
from mathutils import Vector
FBX="/home/alpha/Downloads/Standing Torch Light Torch.fbx"
R="/home/alpha/products/youtube-pipeline/fitness/mascot3d/renders"
LDIR=(-0.30,-0.52,0.80)
def cel(nm, lit, shadow, ao_on=True, ao_dist=0.05, ao_min=0.4):
    m=bpy.data.materials.new(nm); m.use_nodes=True; nt=m.node_tree; nt.nodes.clear(); L=nt.links.new
    out=nt.nodes.new("ShaderNodeOutputMaterial"); emis=nt.nodes.new("ShaderNodeEmission")
    geo=nt.nodes.new("ShaderNodeNewGeometry"); lv=nt.nodes.new("ShaderNodeCombineXYZ")
    lv.inputs[0].default_value,lv.inputs[1].default_value,lv.inputs[2].default_value=LDIR
    dot=nt.nodes.new("ShaderNodeVectorMath"); dot.operation='DOT_PRODUCT'
    L(geo.outputs["Normal"],dot.inputs[0]); L(lv.outputs[0],dot.inputs[1])
    lm=nt.nodes.new("ShaderNodeValToRGB"); lm.color_ramp.interpolation='CONSTANT'
    lm.color_ramp.elements[0].position=0.0; lm.color_ramp.elements[0].color=(0,0,0,1)
    lm.color_ramp.elements[1].position=0.46; lm.color_ramp.elements[1].color=(1,1,1,1)
    L(dot.outputs["Value"],lm.inputs["Fac"])
    mix=nt.nodes.new("ShaderNodeMixRGB")
    mix.inputs["Color1"].default_value=(*shadow,1); mix.inputs["Color2"].default_value=(*lit,1)
    L(lm.outputs["Color"],mix.inputs["Fac"]); src=mix
    if ao_on:
        ao=nt.nodes.new("ShaderNodeAmbientOcclusion"); ao.samples=16; ao.inputs["Distance"].default_value=ao_dist
        ar=nt.nodes.new("ShaderNodeValToRGB")
        ar.color_ramp.elements[0].position=0.3; ar.color_ramp.elements[0].color=(ao_min,)*3+(1,)
        ar.color_ramp.elements[1].position=0.6; ar.color_ramp.elements[1].color=(1,1,1,1)
        L(ao.outputs["AO"],ar.inputs["Fac"])
        mul=nt.nodes.new("ShaderNodeMixRGB"); mul.blend_type='MULTIPLY'; mul.inputs["Fac"].default_value=1.0
        L(mix.outputs["Color"],mul.inputs["Color1"]); L(ar.outputs["Color"],mul.inputs["Color2"]); src=mul
    L(src.outputs["Color"],emis.inputs["Color"]); L(emis.outputs[0],out.inputs["Surface"]); return m

for ob in list(bpy.data.objects): bpy.data.objects.remove(ob,do_unlink=True)
bpy.ops.import_scene.fbx(filepath=FBX)
arm=next((o for o in bpy.data.objects if o.type=='ARMATURE'), None)
body=max((o for o in bpy.data.objects if o.type=='MESH'), key=lambda o: len(o.data.vertices))
print("ARMATURE:", arm.name if arm else None, "MESH:", body.name, "verts", len(body.data.vertices))
import math as _m
if arm:
    arm.animation_data_clear()
    arm.data.pose_position='POSE'
    bpy.context.view_layer.objects.active=arm
    def setrot(bn, ex,ey,ez):
        pb=arm.pose.bones.get(bn)
        if pb: pb.rotation_mode='XYZ'; pb.rotation_euler=(_m.radians(ex),_m.radians(ey),_m.radians(ez))
    # bring arms down to sides (iterate axis/sign here)
    setrot('mixamorig:LeftArm', 0,0,-72)
    setrot('mixamorig:RightArm',0,0, 72)
    setrot('mixamorig:LeftForeArm', 0,0,-15)
    setrot('mixamorig:RightForeArm',0,0, 15)
    bpy.context.view_layer.update()
bpy.context.view_layer.update()
try: bpy.ops.object.mode_set(mode='OBJECT')
except: pass
body.data.materials.clear()
bpy.ops.object.select_all(action='DESELECT'); body.select_set(True); bpy.context.view_layer.objects.active=body
bpy.ops.object.shade_smooth()
mw=body.matrix_world
vs=[mw@v.co for v in body.data.vertices]
zmin=min(p.z for p in vs); zmax=max(p.z for p in vs); Hh=zmax-zmin
cx=sum(p.x for p in vs)/len(vs); cy=sum(p.y for p in vs)/len(vs); cz=(zmin+zmax)/2
print("BBOX Hh",round(Hh,3),"center",[round(cx,3),round(cy,3),round(cz,3)])
def frac(z): return (z-zmin)/Hh
xgate=0.16*Hh
skin=cel("Skin",(0.98,0.53,0.17),(0.74,0.29,0.06),ao_dist=0.04,ao_min=0.40)
shoes=cel("Shoes",(0.09,0.55,0.50),(0.04,0.32,0.30),ao_min=0.6)
shorts=cel("Shorts",(0.10,0.72,0.64),(0.04,0.44,0.42),ao_min=0.72)
for m in (skin,shoes,skin,shorts): body.data.materials.append(m)
def is_shorts(c):
    dx=abs(c.x-cx); f=frac(c.z)
    if dx>=xgate: return False
    if 0.40<f<0.535: return True
    if 0.33<f<=0.40 and dx>0.04*Hh: return True
    return False
for poly in body.data.polygons:
    c=mw@poly.center; f=frac(c.z)
    if f<0.09: poly.material_index=1
    elif is_shorts(c): poly.material_index=3
    else: poly.material_index=0
# eyes on head
emp=bpy.data.objects.new("P",None); bpy.context.collection.objects.link(emp); emp.location=(cx,cy,cz)
head=[p for p in vs if frac(p.z)>0.90]
hcx=sum(p.x for p in head)/len(head); hcz=sum(p.z for p in head)/len(head); front_y=min(p.y for p in head)
eyew=bpy.data.materials.new("EyeW"); eyew.use_nodes=True; _n=eyew.node_tree; _n.nodes.clear()
_o=_n.nodes.new("ShaderNodeOutputMaterial"); _e=_n.nodes.new("ShaderNodeEmission"); _e.inputs[0].default_value=(1,1,1,1)
_n.links.new(_e.outputs[0],_o.inputs["Surface"])
def add_eye(sx):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, location=(hcx+sx, front_y-0.004*Hh, hcz+0.012*Hh))
    e=bpy.context.active_object; e.scale=(0.016*Hh,0.006*Hh,0.026*Hh)
    e.rotation_euler=(0,0,math.radians(-8 if sx<0 else 8)); e.data.materials.append(eyew); bpy.ops.object.shade_smooth()
add_eye(-0.030*Hh); add_eye(0.030*Hh)
# camera + light + freestyle
w=bpy.data.worlds.new("W"); bpy.context.scene.world=w; w.use_nodes=True
w.node_tree.nodes.get("Background").inputs[1].default_value=0.0
cd=bpy.data.cameras.new("C"); cd.type='ORTHO'; cd.ortho_scale=Hh*2.05
cam=bpy.data.objects.new("C",cd); bpy.context.collection.objects.link(cam)
cam.location=(cx,cy-Hh*3,cz); cam.rotation_euler=(math.radians(90),0,0); bpy.context.scene.camera=cam
sc=bpy.context.scene; sc.view_settings.view_transform='Standard'
sc.render.use_freestyle=True; vl=sc.view_layers[0]; vl.use_freestyle=True; fs=vl.freestyle_settings
if not fs.linesets: fs.linesets.new("ls")
ls=fs.linesets[0]; ls.select_silhouette=True; ls.select_border=True; ls.select_material_boundary=True
ls.select_crease=False; ls.linestyle.color=(0,0,0); ls.linestyle.thickness=2.0
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=48
sc.render.film_transparent=True; sc.render.resolution_x=900; sc.render.resolution_y=700
sc.render.image_settings.file_format='PNG'; sc.render.filepath=f"{R}/posed_test.png"
bpy.ops.render.render(write_still=True); print("DONE")
