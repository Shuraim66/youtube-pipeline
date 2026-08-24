import bpy, importlib, math
from mathutils import Vector
B="bl_ext.user_default.mpfb"
HumanService = importlib.import_module(B+".services.humanservice").HumanService

# --- clean default scene objects (keep world) ---
for ob in list(bpy.data.objects):
    bpy.data.objects.remove(ob, do_unlink=True)

# --- hero character macro (male, adult, athletic) ---
macro = {
  "gender":0.92,"age":0.5,"muscle":0.78,"weight":0.5,
  "proportions":0.5,"height":0.55,"cupsize":0.5,"firmness":0.5,
  "race":{"asian":0.2,"caucasian":0.6,"african":0.2}
}
human = HumanService.create_human(macro_detail_dict=macro)
print("CREATED:", human.name, "verts:", len(human.data.vertices))

# --- world background: light gray ---
world = bpy.data.worlds.get("World") or bpy.data.worlds.new("World")
bpy.context.scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
bg.inputs[0].default_value = (0.9,0.9,0.9,1)
bg.inputs[1].default_value = 1.0

# --- compute world bbox of all mesh objects ---
mins=Vector((1e9,1e9,1e9)); maxs=Vector((-1e9,-1e9,-1e9))
for ob in bpy.data.objects:
    if ob.type=='MESH':
        for c in ob.bound_box:
            w=ob.matrix_world@Vector(c)
            for i in range(3):
                mins[i]=min(mins[i],w[i]); maxs[i]=max(maxs[i],w[i])
center=(mins+maxs)/2
height=maxs[2]-mins[2]
print("BBOX height:", round(height,3), "center:", [round(v,3) for v in center])

# --- orthographic front camera (camera at -Y looking +Y) ---
cam_data=bpy.data.cameras.new("Cam"); cam_data.type='ORTHO'
cam_data.ortho_scale=height*1.15
cam=bpy.data.objects.new("Cam",cam_data)
bpy.context.collection.objects.link(cam)
cam.location=(center.x, mins[1]-height*2, center.z)
cam.rotation_euler=(math.radians(90),0,0)   # look toward +Y
bpy.context.scene.camera=cam

# --- key + fill + rim sun lights ---
def sun(name,rot,energy):
    d=bpy.data.lights.new(name,'SUN'); d.energy=energy
    o=bpy.data.objects.new(name,d); bpy.context.collection.objects.link(o)
    o.rotation_euler=[math.radians(a) for a in rot]; return o
sun("Key",(60,0,-35),3.0)
sun("Fill",(70,0,40),1.2)
sun("Rim",(-60,0,20),2.0)

# --- render settings: Cycles CPU ---
sc=bpy.context.scene
sc.render.engine='CYCLES'
sc.cycles.device='CPU'
sc.cycles.samples=24
sc.render.resolution_x=640
sc.render.resolution_y=960
sc.render.film_transparent=False
sc.render.image_settings.file_format='PNG'
out="/home/alpha/products/youtube-pipeline/fitness/mascot3d/renders/hero_test.png"
sc.render.filepath=out
print("rendering (Cycles CPU, 24 samples, 640x960)...")
bpy.ops.render.render(write_still=True)
print("SAVED:", out)

# save the blend for reuse
bpy.ops.wm.save_as_mainfile(filepath="/home/alpha/products/youtube-pipeline/fitness/mascot3d/hero_base.blend")
print("SAVED BLEND")
