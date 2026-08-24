"""
COPPER hero v2 — LONGER baggy shorts as real geometry.
Inflates the pelvis+upper-thigh band of the mesh outward into draped fabric that
reaches mid-thigh (short_2 style), smooths out the muscle under it, colours gray.
  blender -b -P copper_hero2.py  ->  renders/copper2_{0..3}.png
"""
import bpy, bmesh, math
BASE="/home/alpha/products/youtube-pipeline/fitness/mascot3d"
GLB=f"{BASE}/mascot_s2.glb"; R=f"{BASE}/renders"
COPPER=(0.33,0.115,0.040); GRAY=(0.135,0.140,0.150); DARK=(0.020,0.022,0.028); RIMC=(0.85,0.55,0.35)
INF_LO, INF_HI, DRAPE = 0.335, 0.585, 0.032        # shorts band + drape amount (*Hh)

def _set(b,n,v):
    if n in b.inputs: b.inputs[n].default_value=v
def matte(nm,col,rough=0.55):
    m=bpy.data.materials.new(nm); m.use_nodes=True; b=m.node_tree.nodes["Principled BSDF"]
    _set(b,"Base Color",(*col,1)); _set(b,"Roughness",rough); _set(b,"Metallic",0.0); _set(b,"Specular IOR Level",0.15); return m
def skin_copper():
    m=bpy.data.materials.new("Skin"); m.use_nodes=True; nt=m.node_tree; b=nt.nodes["Principled BSDF"]
    _set(b,"Roughness",0.42); _set(b,"Specular IOR Level",0.15)
    if "Subsurface Weight" in b.inputs: b.inputs["Subsurface Weight"].default_value=0.06
    tc=nt.nodes.new("ShaderNodeTexCoord"); sep=nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Generated"],sep.inputs["Vector"])
    ramp=nt.nodes.new("ShaderNodeValToRGB"); e=ramp.color_ramp.elements
    e[0].position=0.10; e[0].color=(0.20,0.065,0.020,1)
    mid=ramp.color_ramp.elements.new(0.50); mid.color=(*COPPER,1)
    top=ramp.color_ramp.elements[-1]; top.position=0.92; top.color=(0.44,0.175,0.075,1)
    nt.links.new(sep.outputs["Z"],ramp.inputs["Fac"])
    ao=nt.nodes.new("ShaderNodeAmbientOcclusion"); ao.samples=16; ao.inputs["Distance"].default_value=0.055
    clamp=nt.nodes.new("ShaderNodeMath"); clamp.operation='MAXIMUM'; clamp.inputs[1].default_value=0.34
    nt.links.new(ao.outputs["AO"],clamp.inputs[0])
    mul=nt.nodes.new("ShaderNodeVectorMath"); mul.operation='MULTIPLY'
    nt.links.new(ramp.outputs["Color"],mul.inputs[0]); nt.links.new(clamp.outputs["Value"],mul.inputs[1])
    nt.links.new(mul.outputs["Vector"],b.inputs["Base Color"]); return m

for ob in list(bpy.data.objects): bpy.data.objects.remove(ob,do_unlink=True)
bpy.ops.import_scene.gltf(filepath=GLB)
ms=[o for o in bpy.data.objects if o.type=='MESH']; bpy.context.view_layer.objects.active=ms[0]
for o in ms: o.select_set(True)
if len(ms)>1: bpy.ops.object.join()
body=bpy.context.active_object; body.name="COPPER"; bpy.ops.object.shade_smooth()
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
vs=[v.co for v in body.data.vertices]
zmin=min(p.z for p in vs); zmax=max(p.z for p in vs); Hh=zmax-zmin
cx=sum(p.x for p in vs)/len(vs); cy=sum(p.y for p in vs)/len(vs); cz=(zmin+zmax)/2
def frac(z): return (z-zmin)/Hh

# ---- build LONGER shorts: inflate the pelvis+thigh band into draped fabric ----
band=[v.co for v in body.data.vertices if 0.34<frac(v.co.z)<0.44]
L=[p for p in band if p.x<cx]; Rr=[p for p in band if p.x>=cx]
lcx=sum(p.x for p in L)/len(L); lcy=sum(p.y for p in L)/len(L)
rcx=sum(p.x for p in Rr)/len(Rr); rcy=sum(p.y for p in Rr)/len(Rr)
pcy=(lcy+rcy)/2
bmi=bmesh.new(); bmi.from_mesh(body.data)
region_v=[]
for v in bmi.verts:
    fr=frac(v.co.z)
    if INF_LO<fr<INF_HI:
        region_v.append(v)
        t=(INF_HI-fr)/(INF_HI-INF_LO)             # 0 at waist -> 1 at hem
        d=DRAPE*Hh*math.sin(math.pi*max(0.0,min(1.0,t)))   # 0 at both ends, bulge mid = drape
        legx,legy=(lcx,lcy) if v.co.x<cx else (rcx,rcy)
        bf=max(0.0,min(1.0,(fr-0.44)/0.08))       # blend leg-axis(low) -> body-axis(high)
        ax=legx*(1-bf)+cx*bf; ay=legy*(1-bf)+pcy*bf
        dx=v.co.x-ax; dy=v.co.y-ay; L2=math.hypot(dx,dy) or 1e-6
        v.co.x+=dx/L2*d; v.co.y+=dy/L2*d
# smooth the fabric (kill muscle bumps) without changing heights
for _ in range(18):
    bmesh.ops.smooth_vert(bmi, verts=region_v, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=False)
bmi.to_mesh(body.data); bmi.free()
vs=[v.co for v in body.data.vertices]

# faceless dome + white eyes
CUT=zmin+0.85*Hh
hv=[p for p in vs if p.z>CUT]; hcy=sum(p.y for p in hv)/len(hv)
bm=bmesh.new(); bm.from_mesh(body.data)
bmesh.ops.delete(bm,geom=[v for v in bm.verts if v.co.z>CUT],context='VERTS'); bm.to_mesh(body.data); bm.free()
skin=skin_copper(); skinP=matte("SkinP",COPPER,0.42)
HR=0.100*Hh; HCZ=zmin+0.895*Hh
bpy.ops.mesh.primitive_uv_sphere_add(segments=56,ring_count=36,radius=1.0,location=(cx,hcy,HCZ))
head=bpy.context.active_object; head.name="Head"; head.scale=(HR,HR*0.82,HR*0.94)
head.data.materials.append(skinP); bpy.ops.object.shade_smooth()
hf=hcy-HR*0.82; white=matte("EyeW",(0.92,0.92,0.92),0.35); rimm=matte("EyeRim",(0.03,0.03,0.035),0.4)
EYEZ=HCZ-HR*0.065
def add_eye(sx):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0,location=(cx+sx,hf+0.002*Hh,EYEZ))
    d=bpy.context.active_object; d.scale=(HR*0.24,HR*0.05,HR*0.30); d.rotation_euler=(0,0,math.radians(-7 if sx<0 else 7))
    d.data.materials.append(rimm); bpy.ops.object.shade_smooth()
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0,location=(cx+sx,hf-0.004*Hh,EYEZ))
    e=bpy.context.active_object; e.scale=(HR*0.19,HR*0.06,HR*0.25); e.rotation_euler=(0,0,math.radians(-7 if sx<0 else 7))
    e.data.materials.append(white); bpy.ops.object.shade_smooth()
add_eye(-HR*0.34); add_eye(HR*0.34)

# colour: shorts band gray, feet dark, rest skin
shorts=matte("Shorts",GRAY,0.55); shoes=matte("Shoes",DARK,0.6)
body.data.materials.clear()
for m in (skin,shoes,shorts): body.data.materials.append(m)
for poly in body.data.polygons:
    f=frac(poly.center.z)
    if f<0.16:                 poly.material_index=1
    elif INF_LO<f<INF_HI:      poly.material_index=2
    else:                      poly.material_index=0

# pivot + world + backdrop + lights + cam
piv=bpy.data.objects.new("Pivot",None); bpy.context.collection.objects.link(piv); piv.location=(cx,cy,cz)
for o in [o for o in bpy.data.objects if o.type=='MESH']:
    o.parent=piv; o.matrix_parent_inverse=piv.matrix_world.inverted()
w=bpy.data.worlds.new("W"); bpy.context.scene.world=w; w.use_nodes=True
bg=w.node_tree.nodes.get("Background"); bg.inputs[0].default_value=(0.014,0.013,0.011,1); bg.inputs[1].default_value=0.28
bpy.ops.mesh.primitive_plane_add(size=Hh*6,location=(cx,cy+Hh*1.6,cz))
bd=bpy.context.active_object; bd.name="Backdrop"; bd.rotation_euler=(math.radians(90),0,0); bd.parent=None
bdm=bpy.data.materials.new("BD"); bdm.use_nodes=True; nt=bdm.node_tree; nt.nodes.clear()
out=nt.nodes.new("ShaderNodeOutputMaterial"); em=nt.nodes.new("ShaderNodeEmission")
tc=nt.nodes.new("ShaderNodeTexCoord"); gr=nt.nodes.new("ShaderNodeTexGradient"); gr.gradient_type='SPHERICAL'
rp=nt.nodes.new("ShaderNodeValToRGB")
rp.color_ramp.elements[0].position=0.0;  rp.color_ramp.elements[0].color=(0.030,0.024,0.018,1)
rp.color_ramp.elements[1].position=0.65; rp.color_ramp.elements[1].color=(0.006,0.005,0.004,1)
nt.links.new(tc.outputs["Object"],gr.inputs["Vector"]); nt.links.new(gr.outputs["Color"],rp.inputs["Fac"])
nt.links.new(rp.outputs["Color"],em.inputs["Color"]); nt.links.new(em.outputs[0],out.inputs["Surface"])
bd.data.materials.append(bdm)
def area(nm,loc,rot,energy,size,color=(1,1,1)):
    d=bpy.data.lights.new(nm,'AREA'); d.energy=energy; d.size=size; d.color=color
    o=bpy.data.objects.new(nm,d); bpy.context.collection.objects.link(o); o.location=loc; o.rotation_euler=[math.radians(a) for a in rot]
area("Key",(cx-Hh*0.9,cy-Hh*1.5,cz+Hh*0.7),(58,0,-32),240,Hh*0.55,(1.0,0.96,0.90))
area("Fill",(cx+Hh*1.3,cy-Hh*1.1,cz+Hh*0.1),(72,0,48),28,Hh*1.10,(1.0,0.97,0.92))
area("RimL",(cx-Hh*1.2,cy+Hh*1.0,cz+Hh*0.6),(-46,0,-32),1500,Hh*0.6,RIMC)
area("RimR",(cx+Hh*1.2,cy+Hh*1.0,cz+Hh*0.6),(-46,0,32),1500,Hh*0.6,RIMC)
cd=bpy.data.cameras.new("C"); cd.lens=66
cam=bpy.data.objects.new("C",cd); bpy.context.collection.objects.link(cam)
cam.location=(cx,cy-Hh*3.05,cz-Hh*0.02); cam.rotation_euler=(math.radians(90),0,0); bpy.context.scene.camera=cam
sc=bpy.context.scene; sc.view_settings.view_transform='Standard'
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=150; sc.cycles.use_denoising=True
sc.render.resolution_x=900; sc.render.resolution_y=1150; sc.render.image_settings.file_format='PNG'
for i,yaw in enumerate([0,45,90,180]):
    piv.rotation_euler=(0,0,math.radians(yaw)); sc.render.filepath=f"{R}/copper2_{i}.png"
    bpy.ops.render.render(write_still=True); print("rendered yaw",yaw)
print("COPPER2 DONE")
