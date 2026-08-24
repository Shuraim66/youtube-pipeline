# VOLT mascot — mesh cleanup & rig-prep checklist

Source sculpt: `mascot_s2.glb` · Turnaround reviewed: `renders/s2_allangles.png`
Face decision: **LOCKED = cyan visor** (faceless volt-blue head, no eyes). Never change.

The build/anatomy is good. The work below is about making the mesh *animatable* and
getting the VOLT identity onto it. Do these in order — don't rig a dirty mesh.

---

## Stage 0 — What the turnaround shows (defects to fix)

Inspected from `s2_allangles.png` (front / side / back):

1. **Shorts hem — torn mesh / holes.** Jagged dark gaps run along the bottom edge of
   the shorts on both legs, visible in all three views. Classic AI-mesh non-manifold
   boundary. Highest priority — it will sparkle under lights and break skinning.
2. **Calf ↔ boot transition — ragged patches.** Dark holes where the shin meets the
   boot cuff (clearest on the back view, right leg).
3. **Boots / feet — blobby, oversized, no toe or sole definition.** Reads as a mitten.
4. **Hands — closed blobby fists**, no finger separation (see `renders/hand_L.png`;
   note the white sliver artifacts between the finger forms).
5. **Head/eyes — obsolete.** The two protruding eye spheres are being replaced by the
   cyan visor; the AI head is cut and swapped for a clean ball in the scripts.

> Two scripts are provided:
> - `volt_hero.py` — beauty/look-dev render (applies the full VOLT identity + visor + lights).
> - `volt_rigprep.py` — clean mesh-only FBX export for the Mixamo auto-rigger.
> Both do a light automatic cleanup pass, but items 1–4 above really want a manual
> sculpt/retopo fix for production quality. Steps below.

---

## Stage 1 — Hole & artifact repair (do in Blender, on the sculpt)

- [ ] Import `mascot_s2.glb`. `Edit Mode → Select All → Mesh → Merge → By Distance`
      (start 0.0001, nudge up until duplicate verts collapse without melting detail).
- [ ] `Select → All by Trait → Non Manifold` — this highlights every hem/boot hole and
      open edge. Zoom the shorts hem and calf/boot seam; they should light up.
- [ ] Fill them: `Face → Fill Holes` (F2/grid-fill for clean quads where possible).
      For the shorts hem, the cleanest result is to **bridge the inner and outer hem
      loops** (`Edge → Bridge Edge Loops`) so the shorts read as fabric with thickness,
      not a torn sheet.
- [ ] `Mesh → Normals → Recalculate Outside` (Shift-N). Confirm no dark inside-out faces.
- [ ] `volt_rigprep.py` automates merge/holes-fill/normals as a backstop, and prints the
      remaining open-edge + non-manifold counts. Target: **0 open edges** before rigging.

## Stage 2 — Hands & feet (blobby → usable)

- [ ] **Feet/boots:** the mesh is a mitten. For Shorts you don't need articulated toes,
      but reshape the boot to a believable high-top: flatten the sole, define a toe box,
      pull in the ankle. Sculpt `Grab` + `Flatten`, or box-model a simple boot and shrink-
      wrap. Keep both boots identical (mirror from one side).
- [ ] **Hands:** current fists are fine for a mascot IF you commit to a **closed fist** as
      the canonical hand (simplest to animate, reads well small). Clean the finger seams
      (the white slivers = overlapping/creased faces): dissolve the crease edges and
      re-smooth. If you want an open/pointing hand for the signature "points at camera"
      pose, sculpt ONE open hand and keep it as a swap-in blend-shape.
- [ ] Mirror left/right so both sides match exactly (`Symmetrize`, -X to +X).

## Stage 3 — Topology bend test (BEFORE Mixamo) — critical

AI meshes pinch and collapse at joints when animated. Test before you invest in rigging.

- [ ] Quick auto-rig test: run `volt_rigprep.py`, upload the FBX to Mixamo, accept the
      auto-rig, and preview a built-in **"Idle" + a "Squat"/"Jumping Jacks"** clip.
- [ ] Watch the **elbows and knees**. If the mesh creases sharply, loses volume, or the
      shorts/boot seam tears when the joint bends past ~90°, the topology is too sparse or
      badly-flowing there → **retopo those areas**.
- [ ] Retopo guidance (only where it fails, not the whole body):
  - Elbows/knees need **3–4 clean edge loops** across the joint to hold volume in a bend.
  - Edge flow should follow the limb (loops circling the arm/leg), not random triangles.
  - Tools: `Quad Remesher` (paid, fastest) or Blender's `Remesh (Voxel)` + shrink-wrap,
    or hand-retopo with the Poly Build tool. Aim ~18–25k tris total (see rig-prep budget).
- [ ] Re-export and re-test until elbows/knees bend cleanly. Legs matter most — the whole
      content strategy is legs/lower-body diagnostics, so knees WILL bend on camera.

## Stage 4 — VOLT identity (the look)

Palette is LOCKED — all values live in `volt_hero.py` (`VOLT` dict, hex → linear):

| Part            | Hex        | Where |
|-----------------|------------|-------|
| Body (mid)      | `#2F6BFF`  | volt-blue matte, gradient body |
| Body top        | `#3B78FF`  | shoulders/chest (gradient high) |
| Body bottom     | `#1A3FB0`  | legs (gradient low) |
| Trunks          | `#16E6CC`  | cyan |
| Emblem          | `#FFC93C`  | amber chest emblem |
| Visor           | `#16E6CC`  | glowing cyan face band (LOCKED) |
| Deep shade/boots| `#0B1B3A`  | visor rim, boots, cavity shadow |
| Rim light       | `#7FA8FF`  | signature edge glow |
| Cue: wrong      | `#FF3B30`  | captions/graphics ONLY — never on the model |
| Cue: right      | `#34C759`  | captions/graphics ONLY — never on the model |

- [ ] Body uses a matte volt-blue **vertical gradient + AO cavity darkening** so muscle
      reads without a face. Roughness ~0.55, metallic 0, low specular = clay-mannequin.
- [ ] **Visor** is an emissive cyan lens (strength ~2.2) over a deep-shade rim — this is
      the brand's single most recognizable cue. Keep the glow; it's what a thumbnail sees.
- [ ] **Emblem** is currently a placeholder amber n-gon on the chest. Replace with a real
      bolt/logo as a texture decal or a modeled badge before launch. Keep it amber.
- [ ] Trunks cyan, boots deep-shade navy. Run `volt_hero.py` and review `renders/volt_hero_*.png`.

## Stage 5 — Rig & hand-off to the pipeline

- [ ] `volt_rigprep.py` → `mascot_s2_mixamo.fbx` → Mixamo auto-rigger (place chin, wrists,
      elbows, knees, groin markers) → download **"FBX for Unity"** (T-pose + skin).
- [ ] Back in Blender: import the rigged mesh, re-apply the `volt_hero.py` material block,
      and **parent the visor + emblem objects to the head/chest bones** (they're separate
      objects, so they follow the rig once parented — don't skin them).
- [ ] Grab Mixamo animation clips you'll reuse (Idle, Point, Flex, Squat, Jumping Jacks,
      Arms-Crossed) → render transparent PNG sequences → into the video pipeline.
- [ ] Lock a canonical **T-pose master .blend** so every future render starts identical.

---

### One-line status
Anatomy good → fix hem/boot holes → bend-test elbows/knees (retopo if they pinch) →
apply LOCKED VOLT + cyan visor → Mixamo rig → PNG sequences. Legs bend on camera, so
Stage 3 is non-negotiable.
