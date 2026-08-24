import bpy, importlib, math
from mathutils import Vector
B="bl_ext.user_default.mpfb"
HumanService = importlib.import_module(B+".services.humanservice").HumanService

RENDERS="/home/alpha/products/youtube-pipeline/fitness/mascot3d/renders"

# fixed identity; vary only muscle+weight => same guy, different body
IDENTITY=dict(gender=0.92, age=0.5, proportions=0.5, height=0.55,
              cupsize=0.5, firmness=0.5, race={"asian":0.2,"caucasian":0.6,"african":0.2})
PHYSIQUES=[
    ("lean",     dict(muscle=0.85, weight=0.30)),
    ("athletic", dict(muscle=0.78, weight=0.50)),
    ("bulked",   dict(muscle=1.00, weight=0.68)),
    ("broad",    dict(muscle=0.90, weight=0.82)),
    ("dadbelly", dict(muscle=0.45, weight=0.90)),
]

def clear():
    for ob in list(bpy.data.objects):
        bpy.data.objects.remove(ob, do_unlink=True)

def toon_skin():
    m=bpy.data.materials.new("ToonSkin"); m.use_nodes=True
    nt=m.node_tree; nt.nodes.clear()
    out=nt.nodes.new("ShaderNodeOutputMaterial")
    toon=nt.nodes.new("ShaderNodeBsdfToon")
    toon.component='DIFFUSE'
    toon.inputs["Color"].default_value=(0.87,0.60,0.40,1)  # warm tan
    toon.inputs["Size"].default_value=0.32
    toon.inputs["Smooth"].default_value=0.05
    nt.links.new(toon.outputs[0], out.inputs["Surface"])
    return m

def setup_world_lights():
    w=bpy.data.worlds.get("World") or bpy.data.worlds.new("World")
    bpy.context.scene.world=w; w.use_nodes=True
    bg=w.node_tree.nodes.get("Background")
    bg.inputs[0].default_value=(0.96,0.94,0.88,1); bg.inputs[1].default_value=0.7
    def sun(n,rot,e):
        d=bpy.data.lights.new(n,'SUN'); d.energy=e
        o=bpy.data.objects.new(n,d); bpy.context.collection.objects.link(o)
        o.rotation_euler=[math.radians(a) for a in rot]
    sun("Key",(55,0,-30),3.2); sun("Fill",(70,0,45),1.0)

def setup_camera():
    # fixed frame so physiques are comparable
    cd=bpy.data.cameras.new("Cam"); cd.type='ORTHO'; cd.ortho_scale=2.15
    cam=bpy.data.objects.new("Cam",cd); bpy.context.collection.objects.link(cam)
    cam.location=(0.0,-6.0,0.95); cam.rotation_euler=(math.radians(90),0,0)
    bpy.context.scene.camera=cam

def freestyle():
    sc=bpy.context.scene; sc.render.use_freestyle=True
    vl=sc.view_layers[0]; vl.use_freestyle=True
    fs=vl.freestyle_settings
    if not fs.linesets: fs.linesets.new("ls")
    ls=fs.linesets[0]; lst=ls.linestyle
    lst.color=(0,0,0); lst.thickness=2.2

def render_settings(path):
    sc=bpy.context.scene
    sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=16
    sc.render.resolution_x=560; sc.render.resolution_y=900
    sc.render.image_settings.file_format='PNG'; sc.render.filepath=path

for name,phys in PHYSIQUES:
    clear()
    macro=dict(IDENTITY); macro.update(phys)
    human=HumanService.create_human(macro_detail_dict=macro)
    skin=toon_skin()
    for ob in bpy.data.objects:
        if ob.type=='MESH':
            ob.data.materials.clear(); ob.data.materials.append(skin)
    setup_world_lights(); setup_camera(); freestyle()
    out=f"{RENDERS}/phys_{name}.png"
    render_settings(out)
    bpy.ops.render.render(write_still=True)
    print("RENDERED", name)
print("DONE")
