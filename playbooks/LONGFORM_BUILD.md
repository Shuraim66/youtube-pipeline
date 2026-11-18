# Aurelis long-form build runbook (mascot + text cards + library visuals)

Read this before building or changing a long-form (6–10 min, 1920×1080, 30 fps) Aurelis video. It is written for any agent or person who has only this repository.
Two long-forms were built this way and are the quality bar: **"Money Psychology Explained: 10 Mental Traps"** (`moneypsych_*`, 8:41) and **"9 Old Money Habits That Actually Keep Wealth"** (`oldmoney_*`, 6:43, the newer and better one).
Look at `playbooks/reference/oldmoney_reference_1.jpg` and `_2.jpg` (18 frames from the finished Old Money video) before you design anything: that is the target look.

Rules that override everything here: `CLAUDE.md` (never upload, schedule or post without explicit approval; uploads always use `--expect-channel`; never invent facts) and `playbooks/V2_WORKFLOW.md` (gates). The user is the approver at every gate.

## 0. Check the checkout first

```
python -m venv .venv && . .venv/bin/activate && pip install -r requirements-longform.txt     # once (the shipped videos used Python 3.12)
cd empires_short && npm ci && cd ..                                                           # once (Remotion 4.0.526, Node >= 20, ffmpeg >= 6 on PATH)
python scripts/longform_preflight.py            # must print PREFLIGHT OK; --smoke also renders one still (after step 6)
```
Preflight fails if any asset the renderer reads is missing or git-ignored (the repo's `.gitignore` ignores all PNG/WAV/JSON; `.gitignore` has an allow-list for the pipeline's assets at the bottom, keep it in sync when you add assets).
The scripts in `scripts/` were run with `/home/alpha/products/whop-clipper/.venv/bin/python` on the owner's machine; use your own venv's `python` instead.

## 1. What goes in (facts)

* One **source pack** per video: `empires_short/AURELIS_<NAME>_SOURCE_PACK.md` (audience, promise, one section per item with `Key fact`, `Source`, `Fix`, rules, `## Full sources (for the description)`). The user supplies it. **Use only facts in the pack**, worded as the pack words them. No new statistics, studies, names or examples. Disputed numbers (e.g. "70% of wealthy families lose their money by the second generation") may appear only as *challenged claims*.
* Every figure on screen or in speech must trace to the pack. `oldmoney_plan.py` enforces this (numbers in narration/overlays must exist in the pack) and writes `out/<video>/claims.md` (claim → pack wording → source → beat).

## 2. Pipeline (each video copies the `oldmoney_*` scripts and adapts them; there is no generic CLI yet)

| step | script | output |
|---|---|---|
| plan + script gate | `scripts/oldmoney_plan.py` (beat table `B`, `b(section, text, plate, mascot, overlays, ...)`) | `empires_short/AURELIS_OLDMONEY_SCRIPT.md` (approved wording), `out/aurelis_oldmoney/{beats,claims}.md`. **Stop and show the user: script, beat table, library gaps, cost.** |
| voice | `scripts/oldmoney_vo.py` (Kokoro `bf_emma`, speed 1.12, atempo 1.06, 0.24 s gap per beat; spoken respellings for numbers/names in `PRON`) | per-beat wavs, `public/audio/oldmoney/narration.wav`, `vo_beats.json` |
| word times | `scripts/oldmoney_whisper.py` (faster-whisper `small`) | `whisper_words.json`, `transcript.txt` |
| number check | `scripts/oldmoney_check.py` (every spoken number heard by Whisper; exit 1 on mismatch) | `number_check.md` |
| mix | `scripts/oldmoney_mix.py` (bed `assets/audio/aurelis_bed.wav`, ducked to -22 dB under speech, two-pass loudnorm -14 LUFS / -1.5 dBTP) | `public/audio/oldmoney/narration_mix.wav` |
| data | `scripts/oldmoney_build_data.py` (plan + `oldmoney_spec.py` overlays + real word timings) | `empires_short/src/oldmoney/data.json` (generated; git-ignored) |
| render | `cd empires_short && npx remotion render src/oldmoney/entry.tsx OldMoney out/aurelis_oldmoney.mp4 --crf=18 --concurrency=3` (~10–12 min) | the MP4 |
| report | `scripts/oldmoney_report.py` (duration, loudness, longest static stretch, contact sheet, phone-size stills) | `out/experiments/AurelisOldMoney_*.png` |
| package | `scripts/oldmoney_package.py` (SRT from script text + Whisper times; private manifest entry with chapters from real timings + full sources) | `aurelis_oldmoney.json`, `.en.srt` |
| thumbnail | `scripts/thumb_finish.py <png>` (logo bottom-left, 1280×720 JPG < 2 MB) | `empires_short/out/thumbnails/` |

New video: copy the nine `oldmoney_*` scripts to `<name>_*`, change the paths/titles/section order/`CH` names/`PRON`, write a new `<name>_spec.py`, point `entry.tsx` at a new comp (copy `src/oldmoney/`). Keep `src/puppet/Puppet.v2.0.locked.tsx` untouched (it is the locked mascot; changes go in a new version file).

## 3. Script and retention (watch-time) rules

* Second-person cold open about the viewer, then the strongest finding, then the countdown. Per item: **relatable moment → finding (with source named) → the fix → "Old money lesson" card** (the card text is the only place the label appears; it is not spoken). Conversational, short sentences, CTA by number at the very end.
* `playbooks/LONGFORM_RETENTION.md`, enforced by `scripts/retention_rules.py` inside the planner: 7–10 min (8–10 preferred) with **no filler**; an open loop in the first 30 s, paid off explicitly later; a rehook every ≤ 90 s with a visual pattern interrupt (new plate, camera punch-in or sound effect); no "to wrap up / finally / in conclusion" before the final item; CTA < 10 s at the end; rehooks use pack facts only.
* Open-loop wording must not claim more than the data does (a 52% figure supports "haven't done it", not "skip it").
* Known status: the two shipped plans predate the retention checker and still fail R2/R3 (Old Money: loop at ~0:47, gap 0:53–5:02). A new plan must pass before voicing.

## 4. Visual system (this is what makes it look like these videos)

**Beats.** ~5 s each (2.6–9 s). Mark the mascot column `puppet:<expression>/<gesture>@R|C|L` or a library cut-out `<name>@L|C|R` (`playbooks/PUPPET_BEAT_RULES.md`, enforced by `scripts/beat_rules.py`):
* puppet = talking, explaining, pointing, reaction; library cut-outs = poses with props or movement; no puppet↔cut-out swap on the same plate in back-to-back beats; a plate repeats in adjacent beats only puppet→puppet; no plate+cut-out pair twice; a plate at most 6 times; camera move never repeats in adjacent beats or on a plate's next use.
* The puppet points only with `pointLeft`: puppet **frame-right**, data card **frame-left**. Puppet v2.0: front view, pose-snap gestures, mouth follows narration volume, `talkGain` 6. No ZOOM crop on puppet beats (it pushes the puppet out of frame).
* Cut-outs must be fully opaque within ~0.1 s of appearing (a slow fade showed the desk through the mascot; fixed in `OldMoney.tsx` `Mascot`).

**Typography (two fonts only).** Fraunces Bold for big numbers, title, chapter names; Inter SemiBold/Bold for everything else. Minimum 36 px, labels/headings 40 px+, source line 32 px, tracker digits 30 px, letter-spacing ≤ 0.04 em. Colour: gold `#E0B54A` or ivory with a soft dark shadow, on charcoal `#1B1B1F` cards. No other fonts, no baked text in plates.

**Cards** (see the reference sheets): brand chip top-left (two lines: `AURELIS HQ` / title or `#n · CHAPTER`); 9→1 tracker top-right (filled pips, current ringed; open loops pulse gold); chapter card `#n` + title; **DC data card** = charcoal, double gold border, eyebrow label, huge Fraunces figure (≥ 112 px, usually 170–190), divider rule, one-line caption, one fact per card; **source line** bottom-left on every cited figure (`SOURCE · Author · Journal · year`); **fix card** `THE FIX` + 1–2 lines; **Old-money-lesson card** (cream, serif italic, gold rule); open-loop chip / payoff card; end card with "EDUCATION ONLY · NOT FINANCIAL ADVICE".
**Disputed claims** (myth-check): slate-bordered card, big red label **OFTEN QUOTED · NEVER PROVEN**, the number struck through in red, stamp in red when the challenge is spoken. Never style a disputed number like a finding.
**Motion**: decelerating entrances (350–600 ms, 0% overshoot), word-anchored pops (overlays appear on the spoken word using Whisper times), slow plate parallax 0.55× vs character 1.0×, camera move per beat, DC cards get a punch-in.

## 5. Library (visuals) and creating NEW images (poses, props, plates, puppet gestures)

`empires_short/public/img/aurelis/library/` (`library.json` indexes it): 37 plates (empty scenes, 1536×864, nobody in them) and 77 mascot cut-outs (transparent PNG, one figure) in the house style (flat 2D hand-drawn, thick dark-brown outline, charcoal/gold palette; the mascot = spiky black hair fan, mustard-gold shirt with a pocket and rolled cuffs, slate trousers, black sneakers with white soles). Counts come from `library.json`.
**Search first.** Before creating anything, look through `library.json` (`tags`, `pose`, `prop`, `description`) and the contact sheets (`contact_cutout_*.png`, `contact_plate_*.png` in that folder). Only create what is truly missing, and keep new images consistent with those.

**Who generates.** If you can create images yourself (Muse AI can), do it: it is free and needs no RunPod. Everything after the image exists is local code (`scripts/library_add_image.py`). The paid Qwen path (`scripts/gen_library_runpod.py`, RunPod public endpoint `qwen-image-edit-2511-lora`, ~$0.025/image, needs `RUNPOD_API_KEY`) is only for when you cannot generate images: **never generate with it or spend without the user's approval and a stated cap; never create pods or volumes.** Check `library.json` ids before choosing a new `--id`.
**Desktop / file access.** You may save generated images anywhere convenient (e.g. the Desktop or Downloads), open them to look at them, and run commands. Pass the file path to the scripts below; the scripts copy the result into the repo. Do not delete or move files in the repo, do not touch files outside it except to read your own generated images, and commit only after the user approves.

### 5.1 New mascot cut-out (a new pose or a pose with a prop)
1. **References** to attach to your image generator: `assets/mascot/reference_front.png` (and `reference_threeq.png` for a three-quarter pose; both built by `python scripts/make_mascot_references.py` from the approved art), plus 1–2 existing cut-outs close to the new pose (e.g. `mascot_phone_scroll_front.png` for a phone pose). Look at them before you draw.
2. **Prompt** (verbatim; only change the Pose line and the view):
   > Keep the attached character EXACTLY (same face, hair, outfit, proportions, line style). Redraw him in the pose below, front view, facing the camera, full body, centred with a clear margin on every side and the soles of his shoes well inside the frame. Pose: <describe: expression, arms, hands, the prop and how it is held>. Flat 2D hand-drawn editorial style as in the reference, uniform dark-brown ink outlines. On a flat pure #00FF00 green background, no ground, no shadow, no scene, nothing else. One character only. No text, letters, numbers, currency symbols, or logos on clothing, shoes or props.
   A prop must not be green (the green backdrop is keyed out; a green prop is only kept if it is enclosed by the figure). Generate 3–4 candidates and pick the best.
3. **Identity check (reject otherwise):** same hair fan and face, same shirt colour and pocket, slate trousers, black sneakers with white soles, same outline weight as the references, one figure, whole body inside the frame, no text/logos, the prop reads at a glance, hands look like the library's mitten hands.
4. **Add it:** `python scripts/library_add_image.py ~/Desktop/pose.png --id mascot_<name>_<front|threeq> --pose <pose> --view front --prop <prop|none> --desc "<one line>" --tags a,b` (`--no-key` if it is already transparent; `--multi` only if two figures are intended). It keys the green, crops, runs the same checks as the Qwen generator (one big figure, nothing touching the border, margin under the soles, mustard shirt + dark outline present), saves `library/<id>.png` (and the original in `library/raw/`) and appends the `library.json` entry. It refuses and explains if a check fails; fix the image, or pass `--force` only after you looked at it.
5. **Look at it in a video frame**: use it in a beat (`<name>@L|C|R`), render one still (`npx remotion still ...`) and compare it next to `mascot_idle_front.png` at the same scale. **Show the user the new pose and get approval before it appears in anything that will be uploaded.** Then commit the PNG + `library.json` (the `.gitignore` allow-list already covers `library/*.png`).

### 5.2 New plate (background)
16:9, empty scene, nobody in it (no people or animals), no text/letters/numbers/currency symbols, flat hand-drawn style with thick dark outlines, charcoal/dark base with gold and cream accents, one clear subject and a dark upper area (cards and chips sit there). Attach 2 existing plates as style references. End the prompt with: "Empty scene. No people, no animals, no text, no currency symbols." Then `python scripts/library_add_image.py ~/Desktop/bg.png --kind plate --id plate_<name> --desc "..."` (crops to 16:9, resizes to 1536×864).

### 5.3 New puppet gesture (pose snap)
The puppet (`src/puppet/Puppet.v2.0.locked.tsx`) is **locked**; its gestures are snaps to full-body library cut-outs with the head swapped for the puppet head. To add a gesture: (a) add the full-body front-view cut-out via 5.1; (b) add `"<key>": ("mascot_<name>.png", False)` to `POSES` in `scripts/puppet_cut_poses.py` and run it (writes `public/img/aurelis/puppet/v2/pose_<key>.png` + `poses.json`; deterministic, it reproduces the 17 existing sprites exactly); (c) copy the locked file to `Puppet.v2.1.tsx`, add the gesture to `GestureName` and `POSE_OF`; never edit v2.0; (d) add the new sprite names to `scripts/longform_preflight.py`, the rule to `playbooks/PUPPET_BEAT_RULES.md`, and a note to `PROJECT_CONTEXT.md`; (e) render a test sheet and get the user's approval. Limits: front view only, mouth follows volume, head tilt clamped to ±6°, pointing only with `pointLeft`.

### 5.4 Paid Qwen generation (only without your own image generation, and only with approval)
`python scripts/library_catalogue.py` prints the plan and cost; `python scripts/gen_library_runpod.py` generates the items listed in the catalogue (resumable, skips existing, key/crop/checks as above, `--dry-run` first). The keyer is verified against 63 of the 66 existing raw renders (byte-identical output).
Puppet sprites live in `public/img/aurelis/puppet/v2/` (cut by `scripts/puppet_cut_*.py`).

## 6. QA gates before showing the user (all were used on the shipped videos)

* planner exit 0 (narration == approved script word for word, numbers in pack, all asset names exist, rules above); Whisper number check passes (accept pronoun mishears like "had one" → "won" explicitly).
* Render, then **look**: contact sheet (every ~10 s) and phone-size stills (390 px wide: cards, source lines, chips, end card). Typical failures found this way: card covering the cut-out, label/stamp overlap, a source line wrapping to two lines, "ROUGHLY 15%" wrapping at 120 px, end-card labels colliding. Fix and re-render, then re-check.
* Report: length, -14.0 LUFS ±0.2, true peak ≤ -1.4 dBTP, longest static stretch (≈ ≤ 1.2 s at the strict threshold), longest beat (≤ 9 s), spend (should be $0 unless new images were approved).

## 7. Packaging and release

* Manifest entry **private**, no `uploaded` field, `format: longform`, title ≤ 100 chars, tags ~12 around the main phrase, description = hook + **CHAPTERS from real timings** + **full SOURCES from the pack** + "Education only, not financial advice." + hashtags. **No CREDITS/AI-tools block in the description** (owner decision). Pinned comment text goes in the manifest, but posting/pinning and "Related video" are manual in Studio (the API token cannot do them).
* Stop at Gate 2. Upload only on explicit approval: `python upload_yt.py --manifest <one-entry.json> --secret <client_secret.json> --token token.json --expect-channel "Aurelis HQ"` (one-entry manifests; it sets the thumbnail if `thumbnail` is in the entry; `publishAt` is UTC; the token cannot edit a video afterwards).
* Update `PROJECT_CONTEXT.md` at the end of the work (CLAUDE.md requires it).

## 8. What is deliberately NOT in git

Generated media (`out/`, narration wavs, MP4s), `data.json`, the Python venv, `node_modules`, API keys/tokens (`token.json`, `*.key` files, client secrets), the Kokoro/Whisper model weights (downloaded on first run). Everything else the renderer needs is tracked; `scripts/longform_preflight.py` proves it.
