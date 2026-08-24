import bpy, bmesh, math
BASE="/home/alpha/products/youtube-pipeline/fitness/mascot3d"; GLB=f"{BASE}/mascot_s2.glb"; R=f"{BASE}/renders"
for ob in list(bpy.data.objects): bpy.data.objects.remove(ob,do_unlink=True)
bpy.ops.import_scene.gltf(filepath=GLB)
ms=[o for o in bpy.data.objects if o.type=='MESH']; bpy.context.view_layer.objects.active=ms[0]
for o in ms: o.select_set(True)
if len(ms)>1: bpy.ops.object.join()
body=bpy.context.active_object; bpy.ops.object.shade_smooth()
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
vs=[v.co for v in body.data.vertices]
zmin=min(p.z for p in vs); zmax=max(p.z for p in vs); Hh=zmax-zmin
cx=sum(p.x for p in vs)/len(vs); cy=sum(p.y for p in vs)/len(vs); cz=(zmin+zmax)/2
# cut head
bm=bmesh.new(); bm.from_mesh(body.data)
bmesh.ops.delete(bm,geom=[v for v in bm.verts if v.co.z>zmin+0.85*Hh],context='VERTS'); bm.to_mesh(body.data); bm.free()
# SAME flood as copper_hero
bmf=bmesh.new(); bmf.from_mesh(body.data); bmf.faces.ensure_lookup_table(); bmf.normal_update()
def ffrac(f): return (f.calc_center_median().z-zmin)/Hh
def fxx(f): return f.calc_center_median().x
SLO,SHI=0.36,0.605
def is_hem(f): return f.normal.z<-0.22 and ffrac(f)<0.47
sh_seed=[f for f in bmf.faces if 0.50<ffrac(f)<0.56 and abs(fxx(f)-cx)<0.17*Hh]
sel=set(sh_seed); st=list(sh_seed)
while st:
    f=st.pop()
    for e in f.edges:
        if not e.is_manifold: continue
        for nf in e.link_faces:
            if nf in sel: continue
            fr=ffrac(nf)
            if fr<SLO or fr>SHI: continue
            sel.add(nf)
            if not is_hem(nf): st.append(nf)
for _ in range(6):
    add=[]
    for f in bmf.faces:
        if f in sel: continue
        fr=ffrac(f)
        if fr<0.42 or fr>SHI: continue
        nb=[nf for e in f.edges if e.is_manifold for nf in e.link_faces if nf is not f]
        if nb and sum(1 for nf in nb if nf in sel)>=len(nb)-1: add.append(f)
    if not add: break
    sel.update(add)
from mathutils.kdtree import KDTree
faces=list(bmf.faces); kd=KDTree(len(faces))
for i,f in enumerate(faces): kd.insert(f.calc_center_median(), i)
kd.balance()
tol=0.045*Hh; clean=set()
for f in sel:
    c=f.calc_center_median(); co,idx,dist=kd.find((2*cx-c.x,c.y,c.z))
    if dist is not None and dist<tol and faces[idx] in sel: clean.add(f)
sel=clean
sh_idx={f.index for f in sel}
fr=sorted(ffrac(f) for f in sel)
n=len(fr)
print(f"SHORTS faces={n} fracmin={fr[0]:.3f} p05={fr[n//20]:.3f} p50={fr[n//2]:.3f} p95={fr[n*19//20]:.3f} fracmax={fr[-1]:.3f}")
print(f"as z-from-feet: hem(min)={fr[0]*Hh:.3f}m of total {Hh:.3f}m")
bmf.free()
# materials: clay skin, magenta shorts
def flat(nm,c):
    m=bpy.data.materials.new(nm); m.use_nodes=True; b=m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value=(*c,1); b.inputs["Roughness"].default_value=0.6; return m
clay=flat("Clay",(0.55,0.55,0.55)); mag=flat("Mag",(1.0,0.05,0.6))
body.data.materials.clear()
for m in (clay,mag): body.data.materials.append(m)
for poly in body.data.polygons: poly.material_index = 1 if poly.index in sh_idx else 0
# lights: one soft + one hard raking from below to reveal the fabric hem step
w=bpy.data.worlds.new("W"); bpy.context.scene.world=w; w.use_nodes=True
w.node_tree.nodes.get("Background").inputs[1].default_value=0.15
def area(nm,loc,rot,e,s):
    d=bpy.data.lights.new(nm,'AREA'); d.energy=e; d.size=s
    o=bpy.data.objects.new(nm,d); bpy.context.collection.objects.link(o); o.location=loc; o.rotation_euler=[math.radians(a) for a in rot]
area("Soft",(cx,cy-Hh*1.4,cz+Hh*0.8),(52,0,0),150,Hh*0.9)
area("Rake",(cx,cy-Hh*1.0,zmin+0.10*Hh),(-78,0,0),300,Hh*0.12)
cd=bpy.data.cameras.new("C"); cd.lens=72
cam=bpy.data.objects.new("C",cd); bpy.context.collection.objects.link(cam)
tz=zmin+0.40*Hh
cam.location=(cx,cy-Hh*1.7,tz); cam.rotation_euler=(math.radians(90),0,0); bpy.context.scene.camera=cam
sc=bpy.context.scene; sc.view_settings.view_transform='Standard'
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=60; sc.cycles.use_denoising=True
sc.render.resolution_x=760; sc.render.resolution_y=900; sc.render.image_settings.file_format='PNG'
sc.render.filepath=f"{R}/diag_shorts_front.png"; bpy.ops.render.render(write_still=True)
cam.location=(cx-Hh*1.7,cy,tz); cam.rotation_euler=(math.radians(90),0,math.radians(-90))
sc.render.filepath=f"{R}/diag_shorts_side.png"; bpy.ops.render.render(write_still=True)
print("DONE")
