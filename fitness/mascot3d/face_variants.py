"""Render 4 face/eye styles on the yellow dome head, tiled, so the user can pick."""
import bpy, math
R="/home/alpha/products/youtube-pipeline/fitness/mascot3d/renders"
YEL=(0.62,0.42,0.05)                          # dome yellow (matches body better)
def _set(b,n,v):
    if n in b.inputs: b.inputs[n].default_value=v
def matte(nm,col,rough=0.5,emit=None,es=0.0):
    m=bpy.data.materials.new(nm); m.use_nodes=True; b=m.node_tree.nodes["Principled BSDF"]
    _set(b,"Base Color",(*col,1)); _set(b,"Roughness",rough); _set(b,"Specular IOR Level",0.08); _set(b,"Metallic",0.0)
    if emit is not None: _set(b,"Emission Color",(*emit,1)); _set(b,"Emission Strength",es)
    return m

def clear():
    for o in list(bpy.data.objects): bpy.data.objects.remove(o,do_unlink=True)

def build(style):
    clear()
    yel=matte("Dome",YEL,0.55); white=matte("W",(0.94,0.94,0.94),0.35)
    rim=matte("Rim",(0.03,0.03,0.04),0.4); dark=matte("Dark",(0.02,0.02,0.03),0.4)
    cyan=matte("Cyan",(0.05,0.85,0.85),0.2,emit=(0.05,0.85,0.85),es=2.0)
    HR=1.0
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64,ring_count=44,radius=1.0,location=(0,0,0))
    head=bpy.context.active_object; head.scale=(HR*0.92,HR*0.82,HR*1.08); head.data.materials.append(yel); bpy.ops.object.shade_smooth()
    hf=-HR*0.82
    def eye(sx,sc,rot,pupil=False,mat=white):
        # rim
        bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0,location=(sx,hf+0.02,0.0))
        d=bpy.context.active_object; d.scale=(sc[0]*1.18,0.05,sc[1]*1.18); d.rotation_euler=(0,0,math.radians(rot)); d.data.materials.append(rim); bpy.ops.object.shade_smooth()
        # sclera
        bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0,location=(sx,hf,0.0))
        e=bpy.context.active_object; e.scale=(sc[0],0.06,sc[1]); e.rotation_euler=(0,0,math.radians(rot)); e.data.materials.append(mat); bpy.ops.object.shade_smooth()
        if pupil:
            bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0,location=(sx,hf-0.03,-sc[1]*0.15))
            p=bpy.context.active_object; p.scale=(sc[0]*0.42,0.05,sc[1]*0.5); p.data.materials.append(dark); bpy.ops.object.shade_smooth()
    if style=="A":       # big clean ovals, slight outward tilt (Bro-Pump classic, bigger)
        eye(-0.30,(0.24,0.34), 8); eye(0.30,(0.24,0.34),-8)
    elif style=="B":     # angry/determined (tilt inward-down)
        eye(-0.30,(0.26,0.30),-22); eye(0.30,(0.26,0.30),22)
    elif style=="C":     # with dark pupils (more life)
        eye(-0.30,(0.26,0.34),6,pupil=True); eye(0.30,(0.26,0.34),-6,pupil=True)
    elif style=="D":     # single cyan visor band
        bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0,location=(0,hf+0.02,0.05))
        d=bpy.context.active_object; d.scale=(0.72,0.06,0.20); d.data.materials.append(rim); bpy.ops.object.shade_smooth()
        bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0,location=(0,hf-0.01,0.05))
        v=bpy.context.active_object; v.scale=(0.66,0.07,0.15); v.data.materials.append(cyan); bpy.ops.object.shade_smooth()
    # lights + cam
    w=bpy.data.worlds.new("W"); bpy.context.scene.world=w; w.use_nodes=True
    bg=w.node_tree.nodes.get("Background"); bg.inputs[0].default_value=(0.03,0.03,0.035,1); bg.inputs[1].default_value=0.2
    def area(nm,loc,rot,e,s,c=(1,1,1)):
        d=bpy.data.lights.new(nm,'AREA'); d.energy=e; d.size=s; d.color=c
        o=bpy.data.objects.new(nm,d); bpy.context.collection.objects.link(o); o.location=loc; o.rotation_euler=[math.radians(a) for a in rot]
    area("K",(-1.5,-2.4,1.2),(56,0,-34),120,1.2,(1,0.98,0.92)); area("F",(1.8,-1.8,0.2),(72,0,48),12,2.0)
    area("B",(0,2.2,0.8),(-52,0,0),80,1.4,(0.85,0.9,1.0))
    cd=bpy.data.cameras.new("C"); cd.lens=80
    cam=bpy.data.objects.new("C",cd); bpy.context.collection.objects.link(cam)
    cam.location=(0,-4.0,-0.05); cam.rotation_euler=(math.radians(90),0,0); bpy.context.scene.camera=cam
    sc=bpy.context.scene; sc.view_settings.view_transform='Standard'
    sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=90; sc.cycles.use_denoising=True
    sc.render.resolution_x=420; sc.render.resolution_y=420; sc.render.image_settings.file_format='PNG'
    sc.render.filepath=f"{R}/face_{style}.png"; bpy.ops.render.render(write_still=True); print("face",style)

for s in ("A","B","C","D"): build(s)
print("DONE")
