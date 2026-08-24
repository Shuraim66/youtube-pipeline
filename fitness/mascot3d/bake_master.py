"""
Take the Meshy textured mesh (tan skin + black shorts + sneakers) and:
 - hue-shift the SKIN to yellow (leaves the near-desaturated shorts/shoes dark),
 - replace the realistic head with a faceless yellow dome + white eyes.
   blender -b -P yellow_meshy.py -> renders/ym_{0..3}.png
"""
import bpy, bmesh, math
BASE="/home/alpha/products/youtube-pipeline/fitness/mascot3d"; GLB=f"{BASE}/mascot_meshy.glb"; R=f"{BASE}/renders"
HUE=0.55; SAT=1.42; VAL=0.82                # skin -> DARK yellow (not bright)
DOME=(0.82,0.50,0.015)                      # dome yellow matched to the vivid body
def _set(b,n,v):
    if n in b.inputs: b.inputs[n].default_value=v
def matte(nm,col,rough=0.5,emit=None,es=0.0):
    m=bpy.data.materials.new(nm); m.use_nodes=True; b=m.node_tree.nodes["Principled BSDF"]
    _set(b,"Base Color",(*col,1)); _set(b,"Roughness",rough); _set(b,"Specular IOR Level",0.2)
    if emit is not None: _set(b,"Emission Color",(*emit,1)); _set(b,"Emission Strength",es)
    return m

for o in list(bpy.data.objects): bpy.data.objects.remove(o,do_unlink=True)
bpy.ops.import_scene.gltf(filepath=GLB)
ms=[o for o in bpy.data.objects if o.type=='MESH']; bpy.context.view_layer.objects.active=ms[0]
for o in ms: o.select_set(True)
if len(ms)>1: bpy.ops.object.join()
body=bpy.context.active_object; body.name="MESHY"; bpy.ops.object.shade_smooth()
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
vs=[v.co for v in body.data.vertices]
zmin=min(p.z for p in vs); zmax=max(p.z for p in vs); Hh=zmax-zmin
cx=sum(p.x for p in vs)/len(vs); cy=sum(p.y for p in vs)/len(vs); cz=(zmin+zmax)/2
def frac(z): return (z-zmin)/Hh

# hue-shift the skin toward yellow on the PBR material
for mat in body.data.materials:
    if not mat or not mat.use_nodes: continue
    nt=mat.node_tree
    bsdf=next((n for n in nt.nodes if n.type=='BSDF_PRINCIPLED'), None)
    if not bsdf: continue
    bc=bsdf.inputs["Base Color"]
    if bc.is_linked:
        src=bc.links[0].from_socket
        hsv=nt.nodes.new("ShaderNodeHueSaturation")
        hsv.inputs["Hue"].default_value=HUE; hsv.inputs["Saturation"].default_value=SAT; hsv.inputs["Value"].default_value=VAL
        nt.links.new(src, hsv.inputs["Color"])
        # AO multiply so the sculpted muscle reads through the flat colour
        ao=nt.nodes.new("ShaderNodeAmbientOcclusion"); ao.samples=16; ao.inputs["Distance"].default_value=0.035
        clamp=nt.nodes.new("ShaderNodeMath"); clamp.operation='MAXIMUM'; clamp.inputs[1].default_value=0.42
        nt.links.new(ao.outputs["AO"], clamp.inputs[0])
        mix=nt.nodes.new("ShaderNodeMixRGB"); mix.blend_type='MULTIPLY'; mix.inputs["Fac"].default_value=1.0
        nt.links.new(hsv.outputs["Color"], mix.inputs["Color1"]); nt.links.new(clamp.outputs["Value"], mix.inputs["Color2"])
        nt.links.new(mix.outputs["Color"], bc)
    _set(bsdf,"Roughness",0.80); _set(bsdf,"Specular IOR Level",0.08); _set(bsdf,"Metallic",0.0)
    if "Emission Strength" in bsdf.inputs: bsdf.inputs["Emission Strength"].default_value=0.0

# RESHAPE the realistic head IN PLACE into a smooth small DOME (NO cutting -> collars/neck
# can never break). Project head verts onto a small ellipsoid, weight 0 at the neck (smooth
# join) rising to 1 at the crown; the nose/face features flatten onto the dome.
HB=0.865                                            # blend starts here (neck top); nothing below is touched
HC=zmin+0.930*Hh; Rx=0.050*Hh; Ry=0.048*Hh; Rz=0.060*Hh
hd=[p for p in vs if frac(p.z)>HB]
hcy=(sum(p.y for p in hd)/len(hd)) if hd else cy
bmh=bmesh.new(); bmh.from_mesh(body.data)
for v in bmh.verts:
    f=(v.co.z-zmin)/Hh
    if f<=HB: continue
    dx=v.co.x-cx; dy=v.co.y-hcy; dz=v.co.z-HC
    L=math.sqrt((dx/Rx)**2+(dy/Ry)**2+(dz/Rz)**2) or 1e-6
    tx=cx+dx/L; ty=hcy+dy/L; tz=HC+dz/L
    w=min(1.0,max(0.0,(f-HB)/0.085))
    v.co.x+=(tx-v.co.x)*w; v.co.y+=(ty-v.co.y)*w; v.co.z+=(tz-v.co.z)*w
bmh.to_mesh(body.data); bmh.free()
# flat yellow on the dome faces to hide the face texture (yellow-on-yellow join, invisible)
skinP=matte("DomeYellow",DOME,0.55); body.data.materials.append(skinP); dome_i=len(body.data.materials)-1
for poly in body.data.polygons:
    if (poly.center.z-zmin)/Hh > 0.882: poly.material_index=dome_i
bpy.ops.object.shade_smooth()
# cyan visor across the front of the dome
fy=hcy-Ry; VZ=HC+Rz*0.05
rimm=matte("VisorRim",(0.03,0.03,0.04),0.4)
cyanm=matte("Visor",(0.05,0.85,0.85),0.20,emit=(0.05,0.85,0.85),es=2.4)
bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0,location=(cx,fy+0.004*Hh,VZ))
d=bpy.context.active_object; d.scale=(Rx*0.84,Ry*0.18,Rz*0.30); d.data.materials.append(rimm); bpy.ops.object.shade_smooth()
bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0,location=(cx,fy-0.004*Hh,VZ))
v=bpy.context.active_object; v.scale=(Rx*0.78,Ry*0.18,Rz*0.21); v.data.materials.append(cyanm); bpy.ops.object.shade_smooth()

# ---- BAKE MASTER: join everything into one mesh, save .blend + export FBX geometry ----
meshes=[o for o in bpy.data.objects if o.type=='MESH']
bpy.ops.object.select_all(action='DESELECT')
for o in meshes: o.select_set(True)
bpy.context.view_layer.objects.active=body
if len(meshes)>1: bpy.ops.object.join()
master=bpy.context.active_object; master.name="Mascot"
# recentre origin to the feet-centre for clean rigging
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
bpy.ops.wm.save_as_mainfile(filepath="/home/alpha/products/youtube-pipeline/fitness/mascot3d/mascot_master.blend")
bpy.ops.object.select_all(action='DESELECT'); master.select_set(True); bpy.context.view_layer.objects.active=master
bpy.ops.export_scene.fbx(filepath="/home/alpha/products/youtube-pipeline/fitness/mascot3d/mascot_master.fbx", use_selection=True, path_mode='COPY', embed_textures=True, mesh_smooth_type='FACE')
print("MASTER SAVED")
