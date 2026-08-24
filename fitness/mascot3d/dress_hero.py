import bpy, importlib, math, bmesh, sys
from mathutils import Vector
B="bl_ext.user_default.mpfb"
HumanService = importlib.import_module(B+".services.humanservice").HumanService
RENDERS="/home/alpha/products/youtube-pipeline/fitness/mascot3d/renders"

# ---- args: name muscle weight res ----
a = sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else ["athletic","1.0","0.5","900"]
name=a[0]; muscle=float(a[1]); weight=float(a[2]); res=int(a[3])

# fixed light direction (toward the light): upper, camera-front(-Y), slightly left(-X)
LDIR=(-0.30,-0.52,0.80)

def clear():
    for ob in list(bpy.data.objects): bpy.data.objects.remove(ob, do_unlink=True)

def cel(nm, lit, shadow, ao_on=True, ao_dist=0.06, ao_min=0.55, thr=0.46):
    """Flat 2-tone cel via manual NdotL + optional AO muscle grooves (emission = no clip)."""
    m=bpy.data.materials.new(nm); m.use_nodes=True; nt=m.node_tree; nt.nodes.clear()
    L=nt.links.new
    out=nt.nodes.new("ShaderNodeOutputMaterial")
    emis=nt.nodes.new("ShaderNodeEmission")
    geo=nt.nodes.new("ShaderNodeNewGeometry")
    lv=nt.nodes.new("ShaderNodeCombineXYZ")
    lv.inputs[0].default_value,lv.inputs[1].default_value,lv.inputs[2].default_value=LDIR
    dot=nt.nodes.new("ShaderNodeVectorMath"); dot.operation='DOT_PRODUCT'
    L(geo.outputs["Normal"],dot.inputs[0]); L(lv.outputs[0],dot.inputs[1])
    lm=nt.nodes.new("ShaderNodeValToRGB")           # light mask (hard step)
    lm.color_ramp.interpolation='CONSTANT'
    lm.color_ramp.elements[0].position=0.0; lm.color_ramp.elements[0].color=(0,0,0,1)
    lm.color_ramp.elements[1].position=thr; lm.color_ramp.elements[1].color=(1,1,1,1)
    L(dot.outputs["Value"],lm.inputs["Fac"])
    mix=nt.nodes.new("ShaderNodeMixRGB"); mix.blend_type='MIX'
    mix.inputs["Color1"].default_value=(*shadow,1); mix.inputs["Color2"].default_value=(*lit,1)
    L(lm.outputs["Color"],mix.inputs["Fac"])
    src=mix
    if ao_on:
        ao=nt.nodes.new("ShaderNodeAmbientOcclusion"); ao.samples=16
        ao.inputs["Distance"].default_value=ao_dist
        ar=nt.nodes.new("ShaderNodeValToRGB")       # AO -> grayscale multiplier (sharper = crisper grooves)
        ar.color_ramp.elements[0].position=0.32; ar.color_ramp.elements[0].color=(ao_min,ao_min,ao_min,1)
        ar.color_ramp.elements[1].position=0.58; ar.color_ramp.elements[1].color=(1,1,1,1)
        L(ao.outputs["AO"],ar.inputs["Fac"])
        mul=nt.nodes.new("ShaderNodeMixRGB"); mul.blend_type='MULTIPLY'; mul.inputs["Fac"].default_value=1.0
        L(mix.outputs["Color"],mul.inputs["Color1"]); L(ar.outputs["Color"],mul.inputs["Color2"])
        src=mul
    L(src.outputs["Color"],emis.inputs["Color"])
    L(emis.outputs[0],out.inputs["Surface"])
    return m

def body_mesh():
    return max((o for o in bpy.data.objects if o.type=='MESH'), key=lambda o: len(o.data.vertices))

def add_muscle_lines(body, H, depth=0.003):
    """Author comic muscle ink-lines as 3D tubes shrinkwrapped onto the torso."""
    y=-0.28
    splines=[
      [(0,y,0.76*H),(0,y,0.70*H),(0,y,0.645*H),(0,y,0.60*H)],           # linea alba (ab center)
      [(0.02,y,0.735*H),(0.09,y,0.75*H),(0.15,y,0.775*H)],              # under-pec R
      [(-0.02,y,0.735*H),(-0.09,y,0.75*H),(-0.15,y,0.775*H)],           # under-pec L
      [(0.0,y,0.80*H),(0.0,y,0.765*H)],                                 # sternum split (short)
      [(-0.10,y,0.705*H),(0.10,y,0.705*H)],                             # ab row 1
      [(-0.09,y,0.665*H),(0.09,y,0.665*H)],                             # ab row 2
      [(-0.075,y,0.628*H),(0.075,y,0.628*H)],                           # ab row 3
    ]
    cu=bpy.data.curves.new("Muscle","CURVE"); cu.dimensions='3D'
    cu.bevel_depth=depth; cu.bevel_resolution=2
    for pts in splines:
        sp=cu.splines.new('POLY'); sp.points.add(len(pts)-1)
        for i,(x,yy,z) in enumerate(pts): sp.points[i].co=(x,yy,z,1)
    ob=bpy.data.objects.new("Muscle",cu); bpy.context.collection.objects.link(ob)
    sw=ob.modifiers.new("SW","SHRINKWRAP"); sw.target=body
    sw.wrap_method='NEAREST_SURFACEPOINT'; sw.offset=0.004
    m=bpy.data.materials.new("Ink"); m.use_nodes=True; nt=m.node_tree; nt.nodes.clear()
    o=nt.nodes.new("ShaderNodeOutputMaterial"); e=nt.nodes.new("ShaderNodeEmission")
    e.inputs[0].default_value=(0.03,0.02,0.02,1); nt.links.new(e.outputs[0],o.inputs["Surface"])
    ob.data.materials.append(m)
    return ob

def shell(body, name, pred, thickness):
    dup=body.copy(); dup.data=body.data.copy(); dup.name=name
    bpy.context.collection.objects.link(dup)
    bm=bmesh.new(); bm.from_mesh(dup.data); mw=dup.matrix_world
    dead=[v for v in bm.verts if not pred(mw@v.co)]
    bmesh.ops.delete(bm, geom=dead, context='VERTS')
    bm.to_mesh(dup.data); bm.free()
    dup.data.materials.clear()
    s=dup.modifiers.new("Solid","SOLIDIFY"); s.thickness=thickness; s.offset=1.0
    return dup

clear()
macro=dict(gender=1.0, age=0.5, proportions=0.5, height=0.55, cupsize=0.5, firmness=0.5,
           muscle=muscle, weight=weight, race={"asian":0.2,"caucasian":0.6,"african":0.2})
human=HumanService.create_human(macro_detail_dict=macro)
body=body_mesh(); mw=body.matrix_world
zs=[(mw@v.co).z for v in body.data.vertices]; H=max(zs)
head=[mw@v.co for v in body.data.vertices if (mw@v.co).z>H-0.22]
hc=sum(head,Vector((0,0,0)))/len(head)

# shorts / hair (shells)
z_thigh=0.34*H; z_waist=0.60*H
shorts=shell(body,"Shorts", lambda p: z_thigh<=p.z<=z_waist, 0.020)
shorts.data.materials.append(cel("Charcoal",(0.20,0.24,0.27),(0.10,0.12,0.14),ao_on=True,ao_min=0.7))
hair=shell(body,"Hair", lambda p: p.z>H-0.07 or (p.z>H-0.16 and p.y> hc.y+0.03), 0.012)
hair.data.materials.append(cel("Hair",(0.20,0.13,0.09),(0.10,0.06,0.04),ao_on=False))

# skin (stronger AO carving -> muscle pop)
body.data.materials.clear()
body.data.materials.append(cel("Skin",(0.90,0.60,0.39),(0.50,0.29,0.18),
                                ao_on=True, ao_dist=0.045, ao_min=0.34))
add_muscle_lines(body, H)

# world: neutral, low (emission shaders ignore it anyway) + transparent film
w=bpy.data.worlds.get("World") or bpy.data.worlds.new("World"); bpy.context.scene.world=w
w.use_nodes=True; w.node_tree.nodes.get("Background").inputs[1].default_value=0.0

# camera
cd=bpy.data.cameras.new("Cam"); cd.type='ORTHO'; cd.ortho_scale=2.05
cam=bpy.data.objects.new("Cam",cd); bpy.context.collection.objects.link(cam)
cam.location=(0,-6,0.98); cam.rotation_euler=(math.radians(90),0,0); bpy.context.scene.camera=cam

# freestyle outline
sc=bpy.context.scene; sc.render.use_freestyle=True
vl=sc.view_layers[0]; vl.use_freestyle=True; fs=vl.freestyle_settings
if not fs.linesets: fs.linesets.new("ls")
ls=fs.linesets[0]
ls.select_silhouette=True; ls.select_border=True; ls.select_crease=True; ls.select_material_boundary=True
ls.linestyle.color=(0,0,0); ls.linestyle.thickness=2.4
# ink the muscle grooves as interior lines (higher angle catches gentler curves)
fs.crease_angle=math.radians(142)

# render (Standard transform, transparent bg)
sc.view_settings.view_transform='Standard'
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=40
sc.render.film_transparent=True
sc.render.resolution_x=int(res*2/3); sc.render.resolution_y=res
sc.render.image_settings.file_format='PNG'
out=f"{RENDERS}/dressed_{name}.png"; sc.render.filepath=out
bpy.ops.render.render(write_still=True)
print("SAVED",out)
