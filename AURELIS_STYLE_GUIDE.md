# AURELIS HQ - STYLE GUIDE (house style "A": hand-drawn + mascot)

Derived from the built A films (`empires_short/experiments/card_blindness/`) and the mascot rig (`brand/mascot/mascot.mjs`, `character_sheet.png`).
Use it for code-drawn scenes AND for AI image generation (prompt prefix at the bottom).

## 1. Palette (gold on charcoal)
| Role | Name | Hex |
|---|---|---|
| Accent / hero | Gold | `#E0B54A` |
| Accent shadow, secondary lines | Dark gold | `#9A7524` |
| Highlights, paper, light text | Ivory | `#F4ECD8` |
| Paper / background | Charcoal | `#2B2B31` |
| Background top / panels | Charcoal light | `#3A3A42` (gradient top `#34343C`) |
| Ground, deep panels, chips | Charcoal deep | `#1B1B1F` (floor `#1F1F24`, booth body `#232328`, window `#101013`) |
| Outline ink (characters, props) | Ink | `#1E1612` |
| Skin | Skin | `#F2CFA0` |
| Hair | Hair | `#16161A` |
| Trousers | Slate | `#4A4A55` |
| Shoes | Black / white sole | `#1E1E22` / `#F4F4F2` |
| Cash | Bill sage | `#B9C79A` (detail `#6C7A52`) |
| Alerts (rare: "?" mark) | Muted red | `#A33B3B` |
Rule: gold + ivory are the ONLY bright colours. No pure white, no saturated blue/red/green except the sage bills and one tiny OK-green on a card reader.

## 2. Line weight
- Characters and props: uniform dark-brown ink outline (`#1E1612`), round caps and joins, about **1.2% of the character's height** (3.4-4 px on a 310 px mascot; ~6 px at 1080p when the mascot is 465 px tall).
- Scene architecture (booth, hoop, panels): **gold (`#E0B54A`) outline, 3.5-4.5 px at 1920 wide**, fill in a darker charcoal; secondary detail lines in dark gold, 2-3 px.
- Ground line: gold, 3 px, with short dark-gold dashes below it.
- No sketchy double lines, no boil: still shots hold perfectly still; drawings animate "on twos" (12 drawings/s).

## 3. Paper grain
- Base: charcoal paper `#2B2B31` with fine fibre grain (claude-animation `paper(W,H,"#2B2B31",0.30)`).
- Finish on every frame: film grain 0.07, flicker 0.015, vignette 0.30 (darkens the corners).
- One faint gold spotlight (radial, ~16% opacity) behind the focal point; slow gold dust motes (26 specks, 10-20% opacity, 1.6-3.6 px).

## 4. Mascot: proportions and outfit
- **Proportions:** chibi, big head. Total height 310 units; **head ~40% of the height** (about 124 units wide, 116 tall), head centre at 234 units above the feet; torso 86-172 units above the feet; legs short and sturdy; hands as round mitts; ears visible.
- **Face:** small black dot pupils on white sclera, simple brows that carry the emotion, small mouth, light blush when happy, sweat drop when nervous. No glasses, no nose shadow.
- **Hair:** messy black spiky mass (about 16 tufts, choppy fringe), swept slightly to one side, down to the ears.
- **Outfit:** gold (`#E0B54A`) short-sleeved button-up shirt with collar, three buttons, a dark-gold chest pocket (the pen is left out of generated art: image models cannot hold it), sleeves rolled at the elbow; slate trousers (`#4A4A55`) with rolled cuffs; black sneakers with white soles, toe cap and laces.
- **Poses:** neutral, hesitant (shrug, sweat, side glance), happy (arms up, closed smiling eyes, blush), shocked (wide eyes, "O" mouth, arms up), pointing. **Props:** cash (fan of sage bills), card (gold card with ivory chip), phone (dark with gold screen), receipt (ivory zig-zag strip with a gold check), ticket (ivory, "ADMIT ONE").
- Faces right by default; mirror to face left. Soft contact shadow under the feet; one-sided cel shade on the right of shirt and head.

## 5. Background rules
1. Dark first: charcoal paper, never white or bright. The mascot (gold) must be the brightest large shape.
2. Stage = flat horizontal: a ground line at ~84% of the frame height (y 905 of 1080), a darker floor band below it, a clear empty zone for the mascot (one third of the frame).
3. Props and buildings: dark fills with gold outlines; awnings striped gold / charcoal-light; highlights in ivory. Maximum 2-3 props per scene; everything else empty paper.
4. Depth by layers, not perspective: far (spotlight, hoop, skyline silhouettes), mid (booth, counter), near (mascot, props). Flat orthographic side-on view.
5. **No text, numbers, logos or prices inside images** (signs are left blank; text is added in the edit). No dollar amounts anywhere (not in the source pack). No real people, no real brands.
6. One idea per frame; leave the top-left 640x190 px free for the brand chip and keep 5% safe margins.
7. Motion (video): "Premium" archetype, 350-600 ms decelerating entrances, 0% overshoot, exits ~35% faster, 450 ms wipe between scenes, ambient dust always moving.

## 6. Image prompt prefix (paste before every scene prompt)
> Flat 2D hand-drawn editorial illustration in the Aurelis house style, 16:9, side-on orthographic view with no perspective: dark charcoal paper background (#2B2B31, soft vignette, fine paper grain) with a darker floor band under a thin gold ground line; uniform dark-brown ink outlines (#1E1612) with round line caps for characters and props, and thin gold (#E0B54A) outlines on buildings and objects; a strict palette of gold #E0B54A, dark gold #9A7524, ivory #F4ECD8, charcoal #2B2B31 / #1B1B1F, with only small touches of sage green for cash; minimal cel shading with a single soft shade on one side and one faint gold spotlight, no gradients, no textures beyond paper grain; no text, letters, numbers, logos or prices anywhere; empty uncluttered composition. The recurring mascot (use the attached reference image exactly): a chibi character with a very big head (about 40% of total height), messy black spiky hair, small black dot eyes, a gold short-sleeved button-up shirt with a dark-gold chest pocket, slate-grey trousers with rolled cuffs, and black sneakers with white soles.


## 7. Generated art (Alux test, Nov 2026)
- Model: Qwen-Image-Edit 2511 (Apache 2.0) through RunPod's public endpoint `qwen-image-edit-2511-lora` (no own endpoint, no LoRA; a trained LoRA could be passed later as `loras[].path`). Mascot references: `training/mascot_lora/control/_reference_front.png` + `_reference_threeq.png` (rig renders).
- Regenerate: `/home/alpha/products/whop-clipper/.venv/bin/python scripts/gen_images_runpod.py --beats <n|all> --seed 11 --force` (prompts: `empires_short/out/experiments/alux_test/prompts.md`). Mascot layers come on flat green and are keyed to alpha; plates use a blank charcoal canvas as the reference.
- Plate rule: every plate prompt ends with "Empty scene. No people, no animals, no characters, no creatures. No text, letters, numbers, signs, logos or currency symbols anywhere." Never put the brand name or a "free area for the character" in a plate prompt.
- Mascot prompts add "no currency symbols, no logos on clothing or shoes". The chest-pen is left out of generated art.
