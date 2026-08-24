"""
Render a chosen frame of a Meshy motion clip as a yellow+visor pose shot.
  blender -b -P pose_render.py -- <name> <action> <frame>
reads anim_<name>_<action>.glb -> renders/pose_<name>_<action>.png
"""
import bpy, math, sys
from mathutils import Vector
a=sys.argv[sys.argv.index("--")+1:]
name=a[0] if len(a)>0 else "shredded"; action=a[1] if len(a)>1 else "flex"; frame=int(a[2]) if len(a)>2 else 20
prop=a[3] if len(a)>3 else "none"   # none | dbR | dbL | db2 (dumbbells)
BASE="/home/alpha/products/youtube-pipeline/fitness/mascot3d"; GLB=f"{BASE}/anim_{name}_{action}.glb"; R=f"{BASE}/renders"
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
    _set(bsdf,"Roughness",0.80); _set(bsdf,"Specular IOR Level",0.08); _set(bsdf,"Metallic",0.0)
    # Meshy's rig/anim export ships EMISSION = the texture (self-lit) → washes the yellow
    # bright/pale (blue 9->91). Kill it so the color matches the approved variant.
    if "Emission Strength" in bsdf.inputs: bsdf.inputs["Emission Strength"].default_value=0.0

# reshape head->dome in the REST mesh (world space at rest preserves weights); done pre-pose
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

# signature muscle-GLOW: cyan emissive on the front chest/abs (the "worked muscle" that glows)
GLOW = (len(a)>6 and a[6]=='glow')
if GLOW:
    gm=matte("Glow",DOME,0.5,emit=(0.05,0.85,0.92),es=2.6)   # YELLOW skin that EMITS cyan (glows from within)
    mesh.data.materials.append(gm); gi=len(mesh.data.materials)-1
    cyb=sum(p.y for p in wco)/len(wco); n=0
    for poly in mesh.data.polygons:
        wc=mw@poly.center; f=(wc.z-zmin)/Hh
        if 0.63<f<0.74 and wc.y<cyb and abs(wc.x-cx)<0.15*Hh: poly.material_index=gi; n+=1   # pecs only
    print("GLOW faces",n)

# NOW pose: set the animation frame; the mesh (incl welded visor weighted to Head) deforms
bpy.context.scene.frame_set(frame)

# optional dumbbell props, seated into the posed hand(s) (handle along the hand bone's X axis)
def make_dumbbell(H):
    objs=[]
    bpy.ops.mesh.primitive_cylinder_add(radius=0.015*H, depth=0.155*H, location=(0,0,0))
    h=bpy.context.active_object; h.rotation_euler=(0,math.radians(90),0); objs.append(h)
    for sx in (-1,1):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.050*H, depth=0.052*H, location=(sx*0.076*H,0,0))
        p=bpy.context.active_object; p.rotation_euler=(0,math.radians(90),0); objs.append(p)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.028*H, depth=0.045*H, location=(sx*0.048*H,0,0))
        q=bpy.context.active_object; q.rotation_euler=(0,math.radians(90),0); objs.append(q)
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active=objs[0]; bpy.ops.object.transform_apply(rotation=True)
    bpy.ops.object.join(); db=bpy.context.active_object; db.name="Dumbbell"
    m=matte("Iron",(0.018,0.018,0.022),0.34); m.node_tree.nodes["Principled BSDF"].inputs["Metallic"].default_value=0.85
    db.data.materials.append(m); bpy.ops.object.shade_smooth(); return db
def make_mitt(H):
    # a clean closed grip-fist (BroPump-style mitt) built at origin in the grip-local frame:
    # X = handle axis (across knuckles), Y = toward fingers, Z = back-of-hand. Covers the
    # splayed-finger hand so it reads as gripping the bar.
    parts=[]
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, location=(0,0,0)); fist=bpy.context.active_object
    fist.scale=(0.072*H, 0.052*H, 0.062*H); parts.append(fist)          # fist mass (wide along handle)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, location=(0,-0.050*H,0))   # wrist stub -> blends to forearm
    wr=bpy.context.active_object; wr.scale=(0.045*H,0.045*H,0.050*H); parts.append(wr)
    for fx in (-0.044,-0.015,0.015,0.044):                               # 4 knuckle bumps on the back
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.018*H, location=(fx*H, 0.006*H, 0.046*H))
        parts.append(bpy.context.active_object)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.022*H, location=(0.052*H, 0.026*H, 0.018*H))  # thumb
    th=bpy.context.active_object; th.scale=(0.8,1.35,0.9); parts.append(th)
    bpy.ops.object.select_all(action='DESELECT')
    for o in parts: o.select_set(True)
    bpy.context.view_layer.objects.active=fist
    bpy.ops.object.transform_apply(scale=True); bpy.ops.object.join()
    mitt=bpy.context.active_object; mitt.name="Mitt"
    mitt.data.materials.append(matte("MittSkin",DOME,0.55)); bpy.ops.object.shade_smooth(); return mitt
FIST_GLB=f"{BASE}/fist3d.glb"; FSIZE=0.16   # fist size (xHh)
# per-pose fist orientation (euler deg in the grip frame) — each hero pose tuned individually
POSE_FA={'curl':(180.0,0.0,0.0),'idle':(0.0,90.0,0.0)}
FA=POSE_FA.get(action,(180.0,0.0,0.0))
if len(a)>4 and a[4]!='-': FA=tuple(float(x) for x in a[4].split(','))
if len(a)>5: FSIZE=float(a[5])
def load_fist():
    before=set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=FIST_GLB)
    new=[o for o in bpy.data.objects if o not in before and o.type=='MESH']
    bpy.ops.object.select_all(action='DESELECT')
    for o in new: o.select_set(True)
    bpy.context.view_layer.objects.active=new[0]
    if len(new)>1: bpy.ops.object.join()
    f=bpy.context.active_object; f.name="Fist"
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY')
    mx=max(f.dimensions); f.scale=(1/mx,1/mx,1/mx); bpy.ops.object.transform_apply(scale=True)  # unit size, origin-centred
    f.data.materials.clear(); f.data.materials.append(matte("FistSkin",DOME,0.55)); bpy.ops.object.shade_smooth(); return f
def place_fist(Rot, seat):
    from mathutils import Euler
    f=load_fist()
    A=Euler((math.radians(FA[0]),math.radians(FA[1]),math.radians(FA[2])),'XYZ').to_matrix().to_4x4()
    f.matrix_world=Matrix.Translation(seat) @ Rot @ A @ Matrix.Scale(FSIZE*Hh,4)
    return f
def delete_hand(side):
    # remove the character's splayed-finger hand so it can't poke through the clean Meshy fist
    import bmesh
    grp=side+"Hand"
    if grp not in mesh.vertex_groups: return
    gi=mesh.vertex_groups[grp].index
    bm=bmesh.new(); bm.from_mesh(mesh.data); dl=bm.verts.layers.deform.active
    if dl is None: bm.free(); return
    kill=[v for v in bm.verts if gi in v[dl] and v[dl][gi]>0.5]
    bmesh.ops.delete(bm, geom=kill, context='VERTS')
    bm.to_mesh(mesh.data); bm.free(); mesh.data.update()
def make_kettlebell(H):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.075*H, location=(0,0,0)); bell=bpy.context.active_object
    bell.scale=(1.0,1.0,0.9)
    bpy.ops.mesh.primitive_torus_add(location=(0,0,0.085*H), major_radius=0.045*H, minor_radius=0.013*H)
    hd=bpy.context.active_object; hd.rotation_euler=(math.radians(90),0,0)
    bpy.ops.object.select_all(action='DESELECT'); bell.select_set(True); hd.select_set(True)
    bpy.context.view_layer.objects.active=bell; bpy.ops.object.transform_apply(rotation=True); bpy.ops.object.join()
    kb=bpy.context.active_object; kb.name="Kettlebell"
    m=matte("Iron",(0.016,0.016,0.02),0.36); m.node_tree.nodes["Principled BSDF"].inputs["Metallic"].default_value=0.8
    kb.data.materials.append(m); bpy.ops.object.shade_smooth(); return kb
from mathutils import Matrix, Vector
def group_center(group):
    # world centroid of the DEFORMED verts weighted to <group>
    if group not in mesh.vertex_groups: return None
    gi=mesh.vertex_groups[group].index
    idxs=[v.index for v in mesh.data.vertices if any(g.group==gi and g.weight>0.4 for g in v.groups)]
    if not idxs: return None
    ev=mesh.evaluated_get(bpy.context.evaluated_depsgraph_get()); em=ev.to_mesh()
    c=Vector((0,0,0))
    for i in idxs: c+=mesh.matrix_world@em.vertices[i].co
    return c/len(idxs)
def grip_basis(side):
    # hand position + a rotation whose local X = the grip axis (horizontal, PERPENDICULAR to the
    # forearm), so a held bar sits across the fist naturally instead of stabbing through it.
    hand=group_center(side+"Hand");
    if hand is None: return None,None
    fore=group_center(side+"ForeArm"); up=Vector((0,0,1))
    arm_dir=(hand-fore).normalized() if fore else up
    x=arm_dir.cross(up)                     # grip axis: horizontal, perpendicular to the forearm
    if x.length<1e-4: x=Vector((1,0,0))
    x.normalize(); y=arm_dir; z=x.cross(y).normalized()
    R=Matrix.Identity(3); R.col[0]=x; R.col[1]=y; R.col[2]=z
    return hand, R.to_4x4()
def place_db(side):
    hand,R=grip_basis(side)
    if hand is None: return
    arm_dir=Vector(R.col[1][:3])
    seat=hand-arm_dir*0.018*Hh                       # pull the fist back onto the wrist
    delete_hand(side)                                # remove splayed fingers (they poked through before)
    db=make_dumbbell(Hh); M=R.copy(); M.translation=seat-Vector((0,0.01*Hh,0)); db.matrix_world=M
    place_fist(R, seat)   # Meshy-generated clean gripping fist replaces the deleted hand
def place_kb(side):
    hand,R=grip_basis(side)
    if hand is None: return
    kb=make_kettlebell(Hh); kb.matrix_world=Matrix.Translation(hand-Vector((0,0,0.10*Hh)))
    mitt=make_mitt(Hh); mm=R.copy(); mm.translation=hand; mitt.matrix_world=mm
if arm and prop!="none":
    if prop in ("dbR","db2"): place_db("Right")
    if prop in ("dbL","db2"): place_db("Left")
    if prop=="kbR": place_kb("Right")
    if prop=="kb2":   # two-handed kettlebell (midpoint between the two hands)
        l=group_center("LeftHand"); r=group_center("RightHand")
        if l and r:
            c=l.lerp(r,0.5); c.z-=0.10*Hh
            make_kettlebell(Hh).matrix_world=Matrix.Translation(c)
    if prop=="kbR": place_kb("RightHand")
# camera frames the posed bbox
deps=bpy.context.evaluated_depsgraph_get(); me=mesh.evaluated_get(deps); tm=me.to_mesh()
pts=[mesh.matrix_world@ v.co for v in tm.vertices]  # deformed world verts
xs=[p.x for p in pts]; ys=[p.y for p in pts]; zs=[p.z for p in pts]
cx2=(min(xs)+max(xs))/2; cy2=(min(ys)+max(ys))/2; z0=min(zs); z1=max(zs); cz=(z0+z1)/2; span=max(max(xs)-min(xs), z1-z0)

w=bpy.data.worlds.new("W"); bpy.context.scene.world=w; w.use_nodes=True
bg=w.node_tree.nodes.get("Background"); bg.inputs[0].default_value=(0.03,0.03,0.035,1); bg.inputs[1].default_value=0.16
def area(nm,loc,rot,e,s,c=(1,1,1)):
    d=bpy.data.lights.new(nm,'AREA'); d.energy=e; d.size=s; d.color=c
    o=bpy.data.objects.new(nm,d); bpy.context.collection.objects.link(o); o.location=loc; o.rotation_euler=[math.radians(x) for x in rot]
# lights use the APPROVED rig (rest-height Hh distances + fixed energies) so color/exposure
# is identical across every pose; only the CAMERA uses the posed span, for framing.
area("Key",(cx2-Hh*1.0,cy2-Hh*1.4,cz+Hh*0.8),(56,0,-34),170,Hh*0.5,(1.0,0.98,0.92))
area("Fill",(cx2+Hh*1.3,cy2-Hh*1.0,cz+Hh*0.1),(72,0,48),16,Hh*1.2,(1.0,0.99,0.95))
area("Back",(cx2,cy2+Hh*1.3,cz+Hh*0.6),(-52,0,0),130,Hh*0.6,(0.85,0.9,1.0))
cd=bpy.data.cameras.new("C"); cd.lens=70
cam=bpy.data.objects.new("C",cd); bpy.context.collection.objects.link(cam)
cam.location=(cx2,cy2-(Hh*2.2+span*0.7),cz); cam.rotation_euler=(math.radians(90),0,0); bpy.context.scene.camera=cam
sc=bpy.context.scene; sc.view_settings.view_transform='Standard'
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=120; sc.cycles.use_denoising=True
sc.render.resolution_x=800; sc.render.resolution_y=900; sc.render.filepath=f"{R}/pose_{name}_{action}.png"
bpy.ops.render.render(write_still=True)
print(f"POSE {name} {action} f{frame} DONE")
