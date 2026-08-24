"""
Apply the yellow + faceless cyan-visor dome to a RIGGED variant base, preserving the
armature/weights (world-space per-vertex reshape). Exports a rigged, textured GLB.
  blender -b -P rig_variant.py -- <name>   (reads mascot_<name>_rigbase.glb -> mascot_<name>_rigged.glb + renders/rig_<name>.png)
"""
import bpy, math, sys
from mathutils import Vector
name=sys.argv[sys.argv.index("--")+1] if "--" in sys.argv else "shredded"
BASE="/home/alpha/products/youtube-pipeline/fitness/mascot3d"; GLB=f"{BASE}/mascot_{name}_rigbase.glb"; R=f"{BASE}/renders"
DOME=(0.82,0.50,0.015); HUE=0.55; SAT=1.42; VAL=0.82
def _set(b,n,v):
    if n in b.inputs: b.inputs[n].default_value=v
def matte(nm,col,rough=0.5,emit=None,es=0.0):
    m=bpy.data.materials.new(nm); m.use_nodes=True; b=m.node_tree.nodes["Principled BSDF"]
    _set(b,"Base Color",(*col,1)); _set(b,"Roughness",rough); _set(b,"Specular IOR Level",0.1)
    if emit is not None: _set(b,"Emission Color",(*emit,1)); _set(b,"Emission Strength",es)
    return m

for o in list(bpy.data.objects): bpy.data.objects.remove(o,do_unlink=True)
bpy.ops.import_scene.gltf(filepath=GLB)
for o in list(bpy.data.objects):
    if o.type=='MESH' and o.name.lower().startswith('icosphere'): bpy.data.objects.remove(o,do_unlink=True)
mesh=next(o for o in bpy.data.objects if o.type=='MESH')
arm=next((o for o in bpy.data.objects if o.type=='ARMATURE'),None)

for mat in mesh.data.materials:
    if not mat or not mat.use_nodes: continue
    nt=mat.node_tree; bsdf=next((n for n in nt.nodes if n.type=='BSDF_PRINCIPLED'),None)
    if not bsdf: continue
    bc=bsdf.inputs["Base Color"]
    if bc.is_linked:
        src=bc.links[0].from_socket
        hsv=nt.nodes.new("ShaderNodeHueSaturation"); hsv.inputs["Hue"].default_value=HUE
        hsv.inputs["Saturation"].default_value=SAT; hsv.inputs["Value"].default_value=VAL
        nt.links.new(src,hsv.inputs["Color"])
        ao=nt.nodes.new("ShaderNodeAmbientOcclusion"); ao.inputs["Distance"].default_value=0.035
        clamp=nt.nodes.new("ShaderNodeMath"); clamp.operation='MAXIMUM'; clamp.inputs[1].default_value=0.42
        nt.links.new(ao.outputs["AO"],clamp.inputs[0])
        mix=nt.nodes.new("ShaderNodeMixRGB"); mix.blend_type='MULTIPLY'; mix.inputs["Fac"].default_value=1.0
        nt.links.new(hsv.outputs["Color"],mix.inputs["Color1"]); nt.links.new(clamp.outputs["Value"],mix.inputs["Color2"])
        nt.links.new(mix.outputs["Color"],bc)
    _set(bsdf,"Roughness",0.80); _set(bsdf,"Specular IOR Level",0.08)

mw=mesh.matrix_world; mwi=mw.inverted()
wco=[mw@v.co for v in mesh.data.vertices]
zmin=min(p.z for p in wco); zmax=max(p.z for p in wco); Hh=zmax-zmin
cx=sum(p.x for p in wco)/len(wco)
HB=0.865; HC=zmin+0.930*Hh; Rx=0.050*Hh; Ry=0.048*Hh; Rz=0.060*Hh
hd=[p for p in wco if (p.z-zmin)/Hh>HB]; hcy=sum(p.y for p in hd)/len(hd)
for v in mesh.data.vertices:
    wc=mw@v.co; f=(wc.z-zmin)/Hh
    if f<=HB: continue
    dx=wc.x-cx; dy=wc.y-hcy; dz=wc.z-HC
    L=math.sqrt((dx/Rx)**2+(dy/Ry)**2+(dz/Rz)**2) or 1e-6
    tx=cx+dx/L; ty=hcy+dy/L; tz=HC+dz/L
    w=min(1.0,max(0.0,(f-HB)/0.085))
    v.co=mwi@Vector((wc.x+(tx-wc.x)*w, wc.y+(ty-wc.y)*w, wc.z+(tz-wc.z)*w))
mesh.data.update()
skinP=matte("DomeYellow",DOME,0.55); mesh.data.materials.append(skinP); dome_i=len(mesh.data.materials)-1
for poly in mesh.data.polygons:
    if ((mw@poly.center).z-zmin)/Hh>0.882: poly.material_index=dome_i

fy=hcy-Ry; VZ=HC+Rz*0.05
rimm=matte("VisorRim",(0.03,0.03,0.04),0.4); cyanm=matte("Visor",(0.05,0.85,0.85),0.2,emit=(0.05,0.85,0.85),es=2.4)
def band(nm,loc,sc,m):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0,location=loc); o=bpy.context.active_object; o.name=nm; o.scale=sc
    o.data.materials.append(m); bpy.ops.object.shade_smooth(); return o
rim=band("VRim",(cx,fy+0.004*Hh,VZ),(Rx*0.84,Ry*0.18,Rz*0.30),rimm)
vis=band("VCyan",(cx,fy-0.004*Hh,VZ),(Rx*0.78,Ry*0.18,Rz*0.21),cyanm)
n_before=len(mesh.data.vertices)
bpy.ops.object.select_all(action='DESELECT')
rim.select_set(True); vis.select_set(True); mesh.select_set(True); bpy.context.view_layer.objects.active=mesh
bpy.ops.object.join()
hg=mesh.vertex_groups.get("Head") or mesh.vertex_groups.new(name="Head")
for i in range(n_before, len(mesh.data.vertices)): hg.add([i],1.0,'REPLACE')
bpy.ops.object.shade_smooth()

# export rigged + textured variant (armature + mesh)
bpy.ops.object.select_all(action='DESELECT')
mesh.select_set(True)
if arm: arm.select_set(True)
bpy.ops.export_scene.gltf(filepath=f"{BASE}/mascot_{name}_rigged.glb", use_selection=True, export_format='GLB')

# bind-pose render
w=bpy.data.worlds.new("W"); bpy.context.scene.world=w; w.use_nodes=True
w.node_tree.nodes.get("Background").inputs[1].default_value=0.16
def area(nm,loc,rot,e,s,c=(1,1,1)):
    d=bpy.data.lights.new(nm,'AREA'); d.energy=e; d.size=s; d.color=c
    o=bpy.data.objects.new(nm,d); bpy.context.collection.objects.link(o); o.location=loc; o.rotation_euler=[math.radians(a) for a in rot]
cz=zmin+0.5*Hh
area("Key",(cx-Hh*1.0,hcy-Hh*1.4,cz+Hh*0.8),(56,0,-34),200,Hh*0.5,(1.0,0.98,0.92))
area("Back",(cx,hcy+Hh*1.3,cz+Hh*0.6),(-52,0,0),150,Hh*0.6,(0.85,0.9,1.0))
cd=bpy.data.cameras.new("C"); cd.lens=68
cam=bpy.data.objects.new("C",cd); bpy.context.collection.objects.link(cam)
cam.location=(cx,hcy-Hh*3.0,cz); cam.rotation_euler=(math.radians(90),0,0); bpy.context.scene.camera=cam
sc=bpy.context.scene; sc.view_settings.view_transform='Standard'
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=120; sc.cycles.use_denoising=True
sc.render.resolution_x=620; sc.render.resolution_y=840; sc.render.filepath=f"{R}/rig_{name}.png"
bpy.ops.render.render(write_still=True)
print(f"RIG VARIANT {name} DONE")
