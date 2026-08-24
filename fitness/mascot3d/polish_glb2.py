import bpy, math
from mathutils import Vector
GLB="/home/alpha/products/youtube-pipeline/fitness/mascot3d/mascot2_shape.glb"
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
bpy.ops.import_scene.gltf(filepath=GLB)
meshes=[o for o in bpy.data.objects if o.type=='MESH']
bpy.context.view_layer.objects.active=meshes[0]
for o in meshes: o.select_set(True)
bpy.ops.object.join(); body=bpy.context.active_object
bpy.ops.object.shade_smooth()
mw=body.matrix_world
vs=[mw@v.co for v in body.data.vertices]
zmin=min(p.z for p in vs); zmax=max(p.z for p in vs); Hh=zmax-zmin
cx=sum(p.x for p in vs)/len(vs); cy=sum(p.y for p in vs)/len(vs); cz=(zmin+zmax)/2
def frac(z): return (z-zmin)/Hh
xgate=0.205*Hh
# Bro Pump palette: vibrant orange skin, teal shorts, bald head (no hair)
skin=cel("Skin",(0.98,0.53,0.17),(0.74,0.29,0.06),ao_dist=0.045,ao_min=0.40)
shoes=cel("Shoes",(0.09,0.55,0.50),(0.04,0.32,0.30),ao_min=0.6)   # teal shoes
hair=skin                                                          # bald orange head
shorts=cel("Shorts",(0.10,0.72,0.64),(0.04,0.44,0.42),ao_min=0.72) # teal shorts
body.data.materials.clear()
for m in (skin,shoes,hair,shorts): body.data.materials.append(m)
def is_shorts(c):
    # arms are clear of the hips now -> no fist-exclusion needed; just fill hips+thighs
    dx=abs(c.x-cx); f=frac(c.z)
    if dx>=xgate: return False
    if 0.385<f<0.535: return True                       # waistband + hips (full)
    if 0.325<f<=0.385 and dx>0.04*Hh: return True       # legs down thighs
    return False
for poly in body.data.polygons:
    c=mw@poly.center; f=frac(c.z)
    if f<0.09:         poly.material_index=1
    elif f>0.92:       poly.material_index=2
    elif is_shorts(c): poly.material_index=3
    else:              poly.material_index=0
emp=bpy.data.objects.new("P",None); bpy.context.collection.objects.link(emp)
emp.location=(cx,cy,cz); body.parent=emp; body.matrix_parent_inverse=emp.matrix_world.inverted()

# ---- two white eyes on the bald head front (the Bro Pump signature) ----
head=[p for p in vs if frac(p.z)>0.88]
hcx=sum(p.x for p in head)/len(head); hcz=sum(p.z for p in head)/len(head)
front_y=min(p.y for p in head); hw=max(p.x for p in head)-min(p.x for p in head)
eyew=bpy.data.materials.new("EyeWhite"); eyew.use_nodes=True
_nt=eyew.node_tree; _nt.nodes.clear()
_o=_nt.nodes.new("ShaderNodeOutputMaterial"); _e=_nt.nodes.new("ShaderNodeEmission")
_e.inputs[0].default_value=(1,1,1,1); _nt.links.new(_e.outputs[0],_o.inputs["Surface"])
def add_eye(sx):
    # FLAT oval decal on the face surface (thin in Y so it doesn't bulge)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0,
        location=(hcx+sx, front_y-0.001*Hh, hcz+0.012*Hh))
    e=bpy.context.active_object; e.name="Eye"
    e.scale=(0.018*Hh, 0.006*Hh, 0.028*Hh)   # thin Y = flat oval, tall
    e.rotation_euler=(0,0,math.radians(-8 if sx<0 else 8))  # slight inward tilt
    e.data.materials.append(eyew); bpy.ops.object.shade_smooth()
    e.parent=emp; e.matrix_parent_inverse=emp.matrix_world.inverted()
add_eye(-0.030*Hh); add_eye(0.030*Hh)
bpy.context.view_layer.objects.active=body
w=bpy.data.worlds.new("W"); bpy.context.scene.world=w; w.use_nodes=True
w.node_tree.nodes.get("Background").inputs[1].default_value=0.0
cd=bpy.data.cameras.new("C"); cd.type='ORTHO'; cd.ortho_scale=Hh*1.1
cam=bpy.data.objects.new("C",cd); bpy.context.collection.objects.link(cam)
cam.location=(cx,cy-Hh*2,cz); cam.rotation_euler=(math.radians(90),0,0); bpy.context.scene.camera=cam
sc=bpy.context.scene; sc.view_settings.view_transform='Standard'
sc.render.use_freestyle=True; vl=sc.view_layers[0]; vl.use_freestyle=True; fs=vl.freestyle_settings
if not fs.linesets: fs.linesets.new("ls")
ls=fs.linesets[0]; ls.select_silhouette=True; ls.select_border=True; ls.select_material_boundary=True
ls.select_crease=False; ls.linestyle.color=(0,0,0); ls.linestyle.thickness=2.2
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=64
sc.render.film_transparent=True; sc.render.resolution_x=720; sc.render.resolution_y=1080
sc.render.image_settings.file_format='PNG'
for i,yaw in enumerate([0,25]):
    emp.rotation_euler=(0,0,math.radians(yaw))
    sc.render.filepath=f"{R}/m2_{i}.png"; bpy.ops.render.render(write_still=True); print("yaw",yaw)
print("DONE")
