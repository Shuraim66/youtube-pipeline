# PROJECT CONTEXT — YouTube Shorts Pipeline

> **For any new session: READ THIS FILE FIRST for full context, then UPDATE it at the end of significant work** (new uploads, new builders, recipe changes, status). Keep it current — it is the single source of truth that carries context across chats. Never put raw API keys/secrets in here (reference the key *files* instead).

Last updated: 2026-11-18


## RECOVERY (2026-11-18) - the 2026-11-17 clean-up deleted the long-form pipeline; it was REBUILT from the session transcripts
The clean-up below `rm -rf`'d the long-form work (mascot puppet, Money Psychology / Old Money renderers and scripts, rules). It was reconstructed by replaying every logged Write/Edit/shell edit from the Claude session transcripts in a sandbox, then verified: `oldmoney_plan.py` and `moneypsych_plan.py` reproduce the surviving `beats.md`/`claims.md`/`script.md` byte for byte, and Remotion stills from the rebuilt code match the finished MP4s (22 Old Money frames across the whole video + 6 Money Psychology frames; differences = H.264 noise only).
**Restored:** `empires_short/src/{puppet (Puppet.tsx original + Puppet.v2.0.locked.tsx + Sheets/SnapTest/SwitchTest/PuppetTest/entry),moneypsych,oldmoney}`, `scripts/{beat_rules,retention_rules,library_catalogue,gen_library_runpod,library_cleanup,runpod_api,runpod_guard,alux_mix,puppet_cut_*,moneypsych_*,oldmoney_*,thumb_finish}.py`, `playbooks/{PUPPET_BEAT_RULES,LONGFORM_RETENTION}.md`, `empires_short/AURELIS_OLDMONEY_{SCRIPT,SOURCE_PACK}.md` + `AURELIS_MONEYPSYCH_SOURCE_PACK.md` (pack text recovered from tool output; Money Psychology pack verified by reproducing its plan). **Added so a fresh clone can build a video:** `assets/audio/aurelis_bed.wav` (rebuilt from the surviving looped bed; the mixers now read it), allow-list at the bottom of `.gitignore` (library PNGs, puppet sprites, sfx, config), `playbooks/LONGFORM_BUILD.md` (runbook + design spec), `playbooks/reference/*.jpg`, `scripts/longform_preflight.py`, `requirements-longform.txt`, `AGENTS.md`.
**NOT restored (still gone):** Old Money/Money Psychology Shorts code (`src/shorts`, `src/oldmoney_shorts`, `scripts/shorts_*`, `oldmoney_shorts*`, recoverable from the same transcripts if needed), `src/thumbs`, `src/cardblind`, `src/blender`, Blender/LoRA/notebooks work, `empires_short/experiments`, `src/alux/AluxTest`, all other untracked briefs. `src/puppet/Puppet.rewrite-2026-11-18.tsx` is another session's approximate rewrite of the puppet (written when the original was believed lost); `src/debt/` (active debt-preview work) imports it. The original `Puppet.tsx` is back in place.
**Image tooling (verified 2026-11-18):** `gen_images_runpod.py`/`gen_library_runpod.py`/`library_catalogue.py` restored; the keyer reproduces 63 of 66 existing raw renders byte for byte, `puppet_cut_poses.py` reproduces all 17 pose sprites + `poses.json` exactly. The deleted generator references (`training/.../_reference_*.png`) are replaced by `assets/mascot/reference_{front,threeq}.png` (built by `scripts/make_mascot_references.py` from the approved library art; the rig likeness is in `assets/mascot/rig_reference_*.png`). New: `scripts/library_add_image.py` (adds any externally generated pose/plate to the library: key, crop, checks, `library.json`), and `playbooks/LONGFORM_BUILD.md` section 5 (prompts, identity checklist, puppet-gesture steps) for agents that can generate images themselves (Muse AI) and have desktop access. Untested with Qwen after the restore: one test image costs $0.025 and needs the user's OK.
Lesson: untracked work is one `git clean`/`rm -rf` from gone. Commit the restored files.

## Repo clean-up (2026-11-17) - READ BEFORE TRUSTING OLDER SECTIONS
Only files tied to the **V2 editorial workflow** (`playbooks/V2_WORKFLOW.md`) and the kept engines were committed. **Permanently deleted** (never in git, not recoverable): `blender_celeste/`, `blender_test/`, `training/` (mascot LoRA), `notebooks/`, `empires_short/{.agents,.claude/skills,experiments}`, `empires_short/src/{blender,cardblind,moneypsych,oldmoney,oldmoney_shorts,puppet,thumbs,shorts}`, `empires_short/src/alux/{AluxTest,entry}.tsx`, all old `scripts/*` (oldmoney_*, moneypsych_*, puppet_*, RunPod/library, shorts_*, thumb_finish, alux_mix, beat/retention rules), longform + blackberry/blockbuster scripts in `empires_short/scripts/`, and every untracked `.md`/`.txt` brief, report, playbook and transcript (incl. `LONGFORM_RETENTION.md`, `PUPPET_BEAT_RULES.md`, `AURELIS_*_BRIEF/SOURCE_PACK`, `V3_BATCH_BRIEF.md`, `reports/gate2_*`). Sections below that cite those paths are **historical upload records only** - the video IDs/URLs stay valid, the files do not exist.
**Kept:** V2 tooling (`validate_script_v2.py`, `validate_topics.py`, `record_metrics.py`, `analytics/metrics.csv`, `tests/`), `empires_short/` engine (archival, nightfile, guess, empire, longform, cinematic, three, alux/AluxExecutive; `npm test` 11 pass, `npm run validate` 0 errors, `tsc` clean), `aurelis_vector/` (flat-vector engine + Atari/FTX/Pan Am/money-traps builders, code only), `brand/mascot/`, `AURELIS_STYLE_GUIDE.md`. Removed docs: do not cite `empires_short/AURELIS_*.md`.

## Aurelis HOUSE STYLE = hand-drawn (A) + MASCOT (Nov 5 2026 decision; local only, nothing uploaded)
**Style A** = claude-animation (`~/.claude/plugins/cache/claude-animation-skill/...`, node canvas + ffmpeg, frame-exact) with the Aurelis mascot. Gold on charcoal, Premium motion (350-600 ms, 0% overshoot, decelerate in / faster out, ambient dust), brand chip "AURELIS HQ / TRAP #n". C (Lottie) dropped, no LottieFiles account; B (Remotion SVG, `empires_short/src/cardblind/`) is reference only. Details + commands: `empires_short/experiments/card_blindness/README.md`.
**MASCOT RIG - `brand/mascot/`** (README + `character_sheet.png`): `mascot.mjs` exports `drawMascot(ctx,x,groundY,scale,{pose,prop,propArg,hand,flip,...chibi overrides})`, `POSES` (neutral, hesitant, happy, shocked, pointing), `PROPS` (cash(n), card, phone, receipt, ticket), `LOOK`, `PALETTE`, `HEAD`. Vendored claude-animation chibi (MIT) in `vendor/`; browser bundle `dist/mascot.browser.js` (`npm run bundle`, global `Mascot`) for the stick-figure engine/Remotion canvases. Same module serves 16:9 and 9:16 (scale 1 = 310 px; origin = feet).
**Outputs (`empires_short/out/experiments/CardBlindness_*`, each with `_sheet`)**: `A_handdrawn` (20 s, 26 s render, 8.2 GB), `T2_stickfigure_short` (23.5 s, 9:16, Kokoro bf_emma, mascot, 22 s build), `T2_bars_37v86` (Remotion two-bar, 5 s), `A_trap2_segment` (53.5 s narration-sync test; + `_syncproof.png`), B (reference).
**Segment render rule:** the harness `node film.mjs render` leaks native memory (>20 GB at ~1,300 frames, killed) -> use `A_segment/render_chunks.sh` (`CH=160 P=3`): 34 s wall for 53.5 s, 3.1 GB per chunk. stick-figure kit (`~/.claude/plugins/cache/claude-animation-skills/animation-skills/1.0.0/kit`) renders only with `CHROME=~/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome` (Playwright download hangs here).
**8-minute estimate**: see the report in the Nov 5 session / README (authoring dominates; render ~5 min chunked).

## Night File "Guess first, late reveal" batch (Nov 5, UPLOADED + SCHEDULED 05:00 PKT: Andrée https://youtu.be/-btOsUEitJU Nov 5; Christie https://youtu.be/6nEL8gys4EM Nov 7; Celeste https://youtu.be/tdQRIBZgLdo Nov 9; pinned comment still to post manually)
`GuessShort` gained `reveal: "end"` (default "early" unchanged; Flight 19 frame re-rendered after the refactor matches the shipped MP4): options slide in 1.2/1.5/1.8 s, crossfade into a top strip at 3.4 s with "ANSWER AT THE END" + progress bar, 3 clue cards, then highlight + stamp (1.2 s) + closing (reading-time rule), no countdown ticks. Data `empires_short/src/guess/{andree,christie,celeste}late_guess.ts`; compositions `NightfileAndreeLate` (24.2 s), `NightfileChristieLate` (21.6 s), `NightfileCelesteLate` (23.3 s); MP4s `out/nightfile_{andree,christie,celeste}_late.mp4`; sheets/stills `out/experiments/<Comp>_{sheet,still_1.5s,still_reveal}.png`; `scripts/check_late_guess.ts` prints timings. Manifest entries appended to `nightfile_manifest.json` (private, no `uploaded`, pinned comment). Record: `experiments/guess_test_2026-10.json` arm `late_reveal` (success rule inside). Clue cards avoid answer-implying images (no film frames for Andrée, no Harrogate images for Christie, no 1873 "murdered at sea" newspaper for Celeste). **Nov 5 Gate 2:** Andrée + Christie approved. Celeste clue 1 is now an animated MapBeat map of the Azores (`GuessImage.map`), map approved; clue 2 is now a typed "ABOARD: 10" card (`GuessImage.typed`) over the blurred 1861 painting (no portraits/lap desk), clue 3 a sails-only zoom crop (`GuessImage.zoom`), re-rendered 23.3 s, awaiting final approval. `npm test` 11/11, `npm run validate` 35 compositions 0 errors, experiment.py --no-render OK (experiments/manifest.json restored).

## Aurelis long-form "15 Skills That Will Pay More by 2030" (Oct 28, UPLOADED PRIVATE to Aurelis HQ 2026-10-28: https://youtu.be/7suud_lm2aw (thumbnail, SRT, pinned comment still to be set manually in Studio))

Brief: `empires_short/AURELIS_LONGFORM_BRIEF.md`. **Built locally:** `empires_short/out/aurelis_skills2030.mp4` (1920x1080/30fps, 9:24.6, -14.1 LUFS, peak -1.2 dBFS, decode OK). Composition `AurelisSkills2030` (+ `AurelisSkills2030Thumb`) in `src/Root.tsx`; source `src/longform/` (`types.ts`, `skills2030.ts` sections+cards+Pexels credits header, `timeline.ts` word-anchored timing, `LongForm.tsx`, `Thumb.tsx`). Scripts: `gen_longform_vo.py <atempo>` (20 sections via vo_v2.py, bf_emma, 0.4 s gaps -> `public/vo/skills2030/{vo.wav,words.json,sections.json}`; atempo **1.0** because 0.95 gave 9:51), `fetch_longform_broll.py` (78 Pexels clips -> `public/longform/broll/` + credits.json), `gen_longform_bed.py` (original music bed), `gen_longform_srt.py`, `gen_longform_header.py`, `gen_longform_manifest.py`, `check_longform.ts` (pacing asserts), `longform_sheet.py`, `diff_longform_whisper.py`. Outputs: `out/aurelis_skills2030.en.srt`, `out/aurelis_skills2030_thumb.png`, `out/experiments/AurelisSkills2030_sheet.png`, `skills2030_whisper_diff.txt`. Manifest `aurelis_skills2030_longform.json` (private, no `uploaded`; has captionsSrt/thumbnail/pinnedComment keys that upload_yt.py does NOT act on). Full render takes ~35 min and ~28 GB RAM peak: close other apps. Gate-2 revisions applied in ONE full re-render (no ffmpeg splices): 62% PwC card shown from frame 0 (no wipe, dim clip removed), #2 "≈8× faster" note, #13 WEF "Top 3 core skill" source line, thumbnail "AI SKILLS" line. WEF/PwC links confirmed by user. VO audit: nothing audibly missing, VO unchanged (#12 "Number twelve" is the one worth a human listen). Stills: `out/experiments/final/t{0,0.5,3}.png`. Open: do not upload without approval (`--expect-channel`).

## "Guess first" format test — Night File Flight 19 (Oct 25, SCHEDULED)

**Why:** every format so far = stills + narration, stayed-to-watch 15-40%. New format with an unanswered question + visible 3-2-1 countdown, then reveal. **No voiceover** (text, drone bed, ticks, hit only).
**Built locally, NOT uploaded:** `empires_short/out/nightfile_flight19_guess.mp4` (22.9 s after Gate 2 cut of card 3, 1080x1920/30fps, -14.6 LUFS). Source `empires_short/src/guess/` (`types.ts` props + timing, `GuessShort.tsx`, `flight19_guess.ts`); composition `NightfileFlight19Guess` in `src/Root.tsx` (deliberately NOT in `registry.ts`; ArchivalShort/V2 validator untouched). SFX `guess_bed/guess_tick/guess_hit.wav` added to `scripts/gen_sfx.py`. Render with `scripts/finish.sh NightfileFlight19Guess nightfile_flight19_guess` (its Whisper step hallucinates "Thank you for watching" on the drone - there is no speech). Contact sheet `out/experiments/NightfileFlight19Guess_sheet.png`; QA stills can pass `--props='{"debugSafe":true}'` to draw the safe zone.
**Gate 2 (approved Oct 25):** card 3 (Mariner, 13 aboard) removed -> 4 cards, 22.9 s; the 13-crew fact stays in the description. Guess SFX now live in `scripts/gen_sfx_guess.py` (own seed; `gen_sfx.py` is back to its original content and must not be re-run casually: an earlier run rewrote drone/glitch/impact/tick/whoosh, and with no git history for `empires_short/` or `*.wav` they could not be diffed).
**UPLOADED Oct 25 2026 (Gate 2 approved): https://youtu.be/CF96J7O__cU** - private, `publishAt 2026-10-25T00:00:00Z` (5 AM PKT), category 24, via `nightfile_flight19_guess_sched.json`, channel verified. **Pinned comment NOT posted yet (script doesn't post it): "What did you guess: A, B or C? 👇" - post manually after it goes live. Next: record stayed-to-watch at 48 h.**
**Manifest:** `nightfile_manifest.json` last entry (private, no `uploaded`, `format: guess_first`, pinned comment "What did you guess: A, B or C?"). **Experiment:** `empires_short/experiments/guess_test_2026-10.json` - decision rule: >=1 of 4 Guess Shorts must reach 45% stayed-to-watch on 300+ impressions, else drop the format. Upload only after explicit approval, with `--expect-channel`.

**ALL 8 GUESS SHORTS SCHEDULED (Oct 25, private + publishAt, 5 AM PKT = 00:00Z, 48 h apart, channel verified each time):** Night File - Flight 19 `CF96J7O__cU` (Oct 25), Collapsible A `MZ7yAEzaQQo` (Oct 27), Mallory `zejeDQcdO74` (Oct 29), Lady Be Good `Ve7k3vzgRRc` (Oct 31). Aurelis - Ward `lk5boqnNG60` (Oct 25), MacGregor `LdV5sJW_euI` (Oct 27), Tulip `cNlgsY6FWRM` (Oct 29), Fisher `xp18oX8sLuA` (Oct 31). Final cuts: Fisher card 3 cut + banner moved below the countdown row (21.8 s); Mallory/Lady Be Good re-rendered with closing.byReadingTime (22.7/22.4 s); MacGregor kept at 24.3 s. Per-channel decision rules in `experiments/guess_test_2026-10.json` (>=45% stayed on >=300 shown, else drop for that channel; Aurelis also records whether shown-in-feed recovers above 300). **Pinned comments NOT posted** (upload_yt.py doesn't post): "What did you guess: A, B or C? 👇" on each after it goes live. Next: record stayed-to-watch at 48 h per Short.

**Guess-first batch 3 - AURELIS (Oct 25, Gate 2 pending, NOT uploaded):** `GuessShort` now supports `brand: "aurelis"` (gold `palette.gold` accent + emblem chip; same clean look), two-line stamps for long text, and `closing.byReadingTime`. Compositions `WardGuessShort` (22.0 s), `MacGregorGuessShort` (24.3 s, over by 0.3 s), `TulipGuessShort` (21.8 s), `FisherGuessShort` (24.6 s, over); data `src/guess/{ward,macgregor,tulip,fisher}_guess.ts`; MP4s `out/aurelis_{ward,macgregor,tulip,fisher}_guess.mp4`; sheets/5.5 s stills `out/experiments/<Comp>_{sheet,still_5.5s}.png`; manifest entries appended to `aurelis_{ward,macgregor,tulip,fisher}_short.json` (private, no `uploaded`; the earlier uploaded entry in each file is skipped by upload_yt.py); baselines + the Aurelis-impressions note in `experiments/guess_test_2026-10.json`. NOTE: Night File closings (Flight19/CollapsibleA/Mallory/LadyBeGood) are a fixed 2.2 s; the 8-word ones are ~0.9 s short of the card reading-time rule.

**Guess-first batch 2 (Oct 25, APPROVED at Gate 2, NOT uploaded - user publishes them 48 h apart after Flight 19 Guess):** `NightfileCollapsibleAGuess` (22.1 s, card 4 Beattie cut), `NightfileMalloryGuess` (21.8 s, card 2 cut), `NightfileLadyBeGoodGuess` (21.5 s, diary card cut; card 2 kept). `GuessShort` gained `compact` flow layout, `box` placement for contain images and an auto-shrinking stamp (Flight 19 unchanged). Data `src/guess/{collapsiblea,mallory,ladybegood}_guess.ts`; MP4s `out/nightfile_{collapsiblea,mallory,ladybegood}_guess.mp4`; sheets + 5.5 s stamp stills in `out/experiments/`; manifest entries appended (private, no `uploaded`; descriptions still mention the cut facts, which is fine); same-topic baselines in `experiments/guess_test_2026-10.json` (CollapsibleA V2 16.0%, Mallory V2 40.7%, LadyBeGood V2 26.5% stayed).

## FTX Short — first full CODE-ONLY Short (Sep 25)

**Context:** Atari (`aTtwBPeH_YE`, plates cut) got **10 views in 23 h** — a feed-distribution
signal; too few views to judge retention (ask the user for stayed-to-watch). The user approved
the code-only 11 s Atari sample (except the truck, since redrawn), so the next Short uses that
pipeline. **Built and uploaded:** `aurelis_vector/out/ftx-short.mp4` (31.43 s, 1080×1920/30fps,
-14.5 LUFS / -1.9 dBFS, full decode OK, loop diff 0.72/255). Builder `build_ftx_short.py`
(Kokoro bf_emma VO via voice_direction; aliases FTX→F-T-X, NBA→N-B-A; the length guard was relaxed to 32 s);
script `scripts/ftx_short.json` + `.delivery.json`; composition `src/ftx/FtxShort.tsx`
(`FtxShort`), which reuses `sample/GuideBust`, `sample/Carts3D` (now has `kind: 'coin'` 3D
tokens), and the FX exported from `sample/AtariSample` (layer/Cam/Dust/Grain/Vignette/Wipe).
12 shots: Miami arena + 3D tokens (hook "$32 BILLION. / GONE IN 10 DAYS.") → 10 calendar tiles
struck + shocked guide → arena marquee "$135M" → CONFIDENTIAL folder opens on the Alameda
balance sheet, FTT rows highlighted → ALAMEDA tower on a wobbling 3D token stack → tokens
dumped, tower falls → a grid of phones tapping WITHDRAW → vault pouring 3D coins "72 HOURS" →
empty vault "−$8 BILLION" → sign letters die "CHAPTER 11" → gavel "25 YEARS" → guide + "118%" →
loop to frame 0. Facts (CoinDesk/NPR/CBS/ESPN): $32B valuation; Nov 2 leak ($14.6B assets, $5.8B
FTT); Nov 6 rival FTT sale; billions withdrawn in ~72 h; ~$8B shortfall; Nov 11 bankruptcy;
$135M/19-yr arena deal; 25-year sentence (Mar 28 2024); 98% of creditors paid 118% of claims.
**UPLOADED PUBLIC Sep 25 2026: https://youtu.be/WE_sa5MZxa4** (category 27; manifest `aurelis_ftx_short.json`). FB copy is #12 in FB_DESCRIPTIONS.md. Next: record stayed-to-watch/AVD at ~48 h.

## Atari Short — retention-first rebuild of the Short format (Sep 24)

**Trigger:** user reported the Pan Am Short (`luVzeRelCRE`) got **<50% AVD and ~10%
stayed-to-watch**. Frame review found: dark/static frame 0 with a small hook and no
paradox; slide-deck pacing (one still picture per 3–5 s beat + a repeated header); a
**7 s static end card (23% of runtime)**; small boxed 38 px captions; a summary script
with no open loop. **The Pan Am/money-traps Short idiom (dark navy, one static picture
per beat, end card, progress bar) is now considered the retention failure mode for
Shorts.**

**New Short built locally, NOT uploaded:** `aurelis_vector/out/atari-short.mp4`
(29.03 s, 1080×1920/30fps, H.264/AAC stereo, -15.2 LUFS / -2.0 dBFS). Topic: Atari
buried ~700,000 games in the New Mexico desert under concrete (1983) → rewind: $28M
purchase → $2B → E.T. rushed in under 6 weeks → needed 4M sales, flopped → lost $536M
→ dug up in 2014. Facts verified (Wikipedia, Snopes, The Henry Ford). **New Short
template** = `src/AtariShort.tsx` + `build_atari_short.py`.
**Retention mechanics:** an open-loop paradox hook answered only at the end ("WHY?" at
6 s); frame 0 already in motion with a hard-on hook; a visual event every ~1–1.5 s keyed
to spoken words via `at(word, beatStart)`; a soft camera punch per cut and shake on
impacts; SFX (boom / reversed-whoosh rewind / whooshes / impact booms) mixed in the
builder; **no end card or progress bar, and the last 16 frames dissolve into frame 0**
(seamless loop); runtime set by the VO (+0.5 s).
**Brand (user, Sep 24: "stay consistent with our branding; reference is Alux"):** the
first cut (bright orange/purple primaries, Anton stamps, sticker outlines, fat captions)
was rejected as off-brand and restyled after studying 3 Alux Shorts (see
`memory/alux-visual-reference.md` Shorts section). The house style is now: Aurelis
palette only (navy/ink/gold/ivory/oxblood); dark cinematic grounds with a **gold rim
light** (Alux's is cyan); glowing focal objects; **Fraunces gold-glow title words**
popping on key words; an **Alux-style caption pill** (single line, all caps, Space
Grotesk 54 px, one gold word, ink pill with a gold border); the **guide in most beats**
(6/8) with varied actions; and the standard emblem lockup. Alux Shorts run **83–103 s**;
ours stays ~29 s for now (one experiment at a time).
**Option A test — AI-illustrated scene plates (Sep 24, user asked "don't our videos look
low quality vs Alux?" → chose A):** `out/atari-short-plates.mp4` (29.03 s, same
script/VO/timing/titles/captions/loop) over 8 full-frame illustrated plates generated
on **fal FLUX dev** (commercial licence via fal; key `.fal_key`). Generator
`aurelis_vector/gen_scene_plates.py <plates.json> [--only a,b] [--model flux|recraft]
[--force]`; prompts `scripts/atari_plates.json` (a locked Aurelis style suffix: flat vector
explainer, navy/ink + gold rim light + ivory + oxblood, top third calm for titles, no
people/text); output + seeds/prompts manifest in `public/plates/atari/`. FLUX beat Recraft v3
in a head-to-head (Recraft was painterly/textured, with a signature artifact). Two moons in the
hook plate were painted out with PIL. Composition `src/AtariShortPlates.tsx`
(`AtariShortPlates`): per-beat Ken Burns + punch-in, animated overlays (tumbling
cartridges, dust, coins, count-ups), top/bottom grade + vignette, and the Banker guide
seated in the plates via `GuideFx` (slight darken + **one-sided gold rim light** +
contact shadow; a full halo looked like a sticker). Build: `build_atari_short.py
--variant plates`. Comparison vs Alux: the plates close most of the scene-richness gap;
remaining gaps = the guide is flatter than the plates, there are no character close-ups
or acting, and plates are single stills with camera moves (Alux animates within scenes).
**UPLOADED (user picked the plates cut):** https://youtu.be/aTtwBPeH_YE — private, scheduled `publishAt 2026-09-24T17:00:00Z` (10 PM PKT / 1 PM ET), category 27, manifest `aurelis_atari_short.json`. The vector cut `out/atari-short.mp4` stays local only. **Next:** after ~48 h, record stayed-to-watch + AVD for aTtwBPeH_YE vs Pan Am luVzeRelCRE (10% stayed). Note this video changes two things at once (retention mechanics + illustrated plates), so a lift can't be attributed to one of them alone.
**Still not Alux level (user, Sep 24) → animated, character-in-scene shots PROVEN on the hook:**
the motion comparison showed that Alux characters act inside shots and are big and drawn in the
scene style; the plates cut was a near-frozen frame. New tools: `aurelis_vector/gen_kontext.py`
(FLUX Kontext pro, $0.04/img, redraws the guide from `character/ref/guide_ref.png` [GuideRef
composition] into a scene, acting) + `aurelis_vector/gen_i2v.py` (Kling 2.1 standard i2v,
$0.28 per 5 s, ~2 min/clip). Result: `work/atari_short/kontext/hook_guide_k21.mp4`; the guide
turns to camera in shock while cartridges pour, style stable, identity held. Est. $4–6 per Short
for ~12 shots. **Pending user decision:** rebuild Atari (and future Shorts) this way.
**Code-only 11 s sample (Sep 25, user: "no hosted keys or local models, keep everything in
code; leave current visuals"):** `aurelis_vector/out/atari-sample.mp4` (0:00–0:11 of the
Atari script; 11 s instead of 10 so "million." isn't cut; audio = the first 11 s of the existing
Atari mix, no model run). Build: `build_atari_sample.py` (~30 s render). Source
`src/sample/`: `AtariSample.tsx` (6 shots: wide dump → guide close-up turns in shock →
top-down concrete pour → "WHY?" close-up with gold ?s → VHS rewind replaying earlier shots
backwards, 1983→1976 → 1976 boardroom with CSS-3D cheque + $28M; multi-layer parallax
cameras, gold-edge diagonal wipe, push transition, cut punches, grain, vignette, dust),
`GuideBust.tsx` (close-up rig of the same guide: yaw/gaze/blink/brows/shock mouth/frown,
gold rim light), `Carts3D.tsx` (three.js toon-shaded outlined cartridges via
@remotion/three + R3F v8 + drei v9, **manual OrthographicCamera 0..1080 × 0..-1920 so
3D uses the SVG pixel coords**; R3F's automatic ortho camera misplaced them).
New deps: three 0.169, @react-three/fiber 8.17, @react-three/drei 9.114,
@remotion/three|noise|paths 4.0.526. WebGL renders headless with `--gl=angle` (set in
remotion.config.ts). No Framer Motion (clock-based; breaks Remotion's per-frame rendering).
Kokoro gotcha: "E.T." is split as a sentence end by `voice_direction` → pin the line
in `phrases` and alias "E.T. game" → "E-T game". Review: `out/atari-short-review.md`.
Upload: see the plates-cut entry below (scheduled public, not unlisted).

## Pan Am Short — "How Empires Die" (Sep 22)

**New 30-second vertical Aurelis Short built locally** on the flat-vector Remotion
engine: `aurelis_vector/out/panam-short.mp4` (1080×1920, 30 fps, H.264/AAC stereo,
4,481,044 bytes, exactly 30.00 s). This is a proper collapse story (Pan American
World Airways, 1927–1991), replacing the off-brand "money-tips" pattern with the
locked winning hook formula: **named subject + peak→collapse + hard number + short
time window**. Frame-0 hook is **HARD-ON, no fade-in** — reads silent as "IT OWNED
THE SKY. THEN IT VANISHED." (the money-traps Short's title faded in from opacity 0
and was near-invisible in the muted feed; that bug is fixed here and should be
avoided in every future Short). 7 beats, VO 28.57 s (Kokoro `bf_emma`), karaoke
captions, seamless-loop tail. Full decode + TypeScript passed; audio -14.3 LUFS /
-1.9 dBTP.

**STANDALONE + varied per-beat backgrounds (user feedback Sep 23):** there is NO
Pan Am long-form episode, so the Short does NOT claim "watch the full video" — both
the end card and the narration are a series follow ("NO GIANT IS FOREVER · HOW
EMPIRES DIE · A SERIES BY AURELIS · FOLLOW FOR THE NEXT FALL"). Do not add a
"full video" CTA to a Short unless that long-form actually exists. Also: the first
cut reused the money-traps Short's single arched-window room for all 7 beats and
looked like one static frame — now **each beat has its own background** (teal → sky
blue → dusk → graphite storm → amber → oxblood → gold sunburst) with shape-wipe
transitions, and the recurring guide appears only on hero beats (metaphor beats are
characterless), per the Alux reference (`memory/alux-visual-reference.md`). **Lesson
for future Shorts: vary the composition/background per beat like Alux; don't hold one
frame.**

New/changed files: builder `aurelis_vector/build_panam_short.py`; composition
`aurelis_vector/src/PanAmShort.tsx` (registered in `src/Root.tsx` as `PanAmShort`,
duration from `src/panAmShortTiming.json`); script `scripts/panam_short.json` +
delivery `scripts/panam_short.delivery.json`. Review: `out/panam-short-review.md`.
Upload manifest: `aurelis_panam_short.json` (privacy `unlisted`, category 27).
Uploaded Unlisted on Sep 23 at https://youtu.be/luVzeRelCRE with Education category
(27), kids setting off. It is a standalone series episode (no companion long-form,
so `relatedVideoId` is blank). Reproduce:
`cd aurelis_vector && /home/alpha/products/whop-clipper/.venv/bin/python build_panam_short.py`.

**Sep 23 visual refinement:** the recurring guide is larger for phone readability;
hook/empire globes and the jumbo jet have more visual weight; and both fire-sale
cards enter earlier to remove dead middle space. Shape wipes, varied backgrounds,
and the standalone series CTA remain. Full decode, TypeScript, 30-second duration,
and stereo audio checks pass.

## Money habits companion Short

**Sep 22: new 30-second vertical Short built locally** to send viewers to the
published long-form episode. Output: `aurelis_vector/out/money-traps-short.mp4`
(1080×1920, 30fps, H.264/AAC stereo). It focuses on spotting a forgotten
subscription or recurring fee, checking the last three statements, and choosing
one charge to cancel or keep. Burned-in word-synced captions, original SVG artwork,
and the consistent Aurelis guide/palette are included. Sep 22 cleanup moved the
emblem/wordmark to a compact upper-left lockup, removed two rules and an overlapping
wallet label, and raised the hook. Full decode, TypeScript,
and render-duration checks passed; audio measures -14.3 LUFS / -1.85 dBTP.
The last card says to tap the Related video. Uploaded Sep 22 as **Unlisted**, with
Education category (27), kids setting off, and the long-form target recorded as
`https://youtu.be/IwNvOsAiECw`. The clickable Studio Related video association is
still pending: the existing OAuth grant is upload-only and the Data API upload
does not expose that Shorts setting.
Build/review/package: `aurelis_vector/build_money_traps_short.py`,
`aurelis_vector/out/money-traps-short-review.md`, and
`aurelis_vector/scripts/money_traps_short.package.json`. Upload manifest:
`aurelis_money_traps_short.json`.

---

## Money habits long-form production

**Sep 21: Rothschild art-direction revision v3 rendered.** Latest master:
`aurelis_vector/out/money_habits-v3.mp4` (15:32.30, 1920x1080/30fps,
27,969 frames, H.264/AAC stereo, 149,299,494 bytes). User asked to close the
style mismatch with the first illustrated Rothschild Short. Separate source:
`src/MoneyStoryV3.tsx`, `src/MoneyArt.tsx`; renderer `render_money_habits_v3.py`.
V2 source and both earlier masters remain intact (SHA-256 preservation verified).

Changes: consistent ink/patina/brass palette, shaded supporting woman with facial
planes/eyes/hair/hands and tailored clothing, arched-window/paneled rooms,
shelves and street architecture, detailed desk, bound parchment ledger/calendar,
revised bank/meal artwork, and original compact emblem + Aurelis wordmark.
All 191 final stills reviewed; encoded standing/kitchen/desk/ending samples and
half-second opening motion samples inspected. TypeScript, 11 regressions, caption
checks and complete timing equality passed. Full decode passed; both streams are
932.30s. Compressed audio hash equals v2 exactly (stream-copy, no re-encoding).
Final audio audit passed: -14.06 LUFS / -1.41 dBTP, 6.1 dB music ducking,
17.3 dB below voice. Report: `out/money_habits-v3.audit.json`.

Review: `out/money_habits-v3-opening.mp4` (first minute with audio),
`out/money-habits-v3-before-after.jpg`, `out/money_habits-v3-review.md`.
Next is user playback/art-direction acceptance.
Uploaded publicly to Aurelis on 2026-09-21: https://youtu.be/IwNvOsAiECw.
Manifest: `aurelis_money_habits_v3.json`. This closes the implemented style pass, not
continuous subjective listening acceptance or the separate future interaction
capabilities (ownership-changing handovers, bank-counter exchanges, building entry).
**Thumbnail attached Sep 21, 2026:** `aurelis_vector/out/money-habits-v3-thumbnail.jpg`
(1280x720), designed with bold short hook text and a single wallet/coins focal
illustration using the Aurelis visual system. Render source/composition:
`aurelis_vector/src/MoneyThumbnail.tsx` / `MoneyThumbnail`.

**Sep 21: visual revision v2 delivered locally.** Final master:
`aurelis_vector/out/money_habits-v2.mp4` (15:32.30, 1920x1080/30fps,
27,969 frames, H.264/AAC stereo, 107,056,346 bytes). The original
`out/money_habits.mp4` is preserved; its SHA-256 verification passed.

The user's requested visual revision is implemented in `src/MoneyStory.tsx`,
with 191 authored views from `scripts/storyboard_money_habits.py` (median 4.43s,
maximum 14.17s). The persistent top-right copy and fixed chapter-slide layout
were replaced with varied story staging. Approved script, narration and caption
timing are unchanged. Follow-up fixes: larger, proportionally fitted original
emblem; explicit standing/seated supporting-character legs and chair staging;
phone closeups without cropped side copy or partial guide; sequential phone-label
fades to prevent overlapping text. The corrected 59-second silent opening preview
is `out/money_habits-v2-opening-silent.mp4`, refreshed from the final master.

Validation: all 191 final stills rendered and reviewed through storyboard sheets;
encoded standing, seated and phone frames inspected. TypeScript, 11 production
regressions, caption checks, continuous timeline and exact audio cue-sheet checks
passed. Full encoded decode passed. Audio audit: -14.06 LUFS, -1.41 dBTP,
6.1 dB music ducking, music 17.3 dB below voice. Report:
`out/money_habits-v2.audit.json`; delivery notes: `out/money_habits-v2-review.md`.
No upload or scheduling performed. Next is user playback/listening review of v2;
these sampled and numerical checks do not establish continuous subjective review.
Full ownership-changing handovers and bank-counter/entry animation remain future
capabilities, not completed by this visual correction. These files are a curated
cross-chat handoff, not a full transcript.

**Sep 20 history: v1 visual revision requested (v2 delivered above).** User reports repetitive scenes,
missing emblem, constant top-right copy and insufficient screen changes. Fresh
Alux/Aurelis frame comparison confirms the fixed slide layout and repeated
artwork are the main problem. The 96 timing beats are not 96 distinct visual
shots. Chapter headings persist 44.6-71.1 seconds. Existing emblem was omitted
by the new composition. See `aurelis_vector/LONGFORM_VISUAL_REVIEW.md` for evidence,
code causes and revision direction. Technical checks below remain valid but do
not establish visual quality. The script remains approved; the v1 long-form visuals
were the first draft requiring revision.

User approved script v2 and requested the long-form video. Production uses the
full narration: 2,217 spoken words across 96 shots and 17 chapter markers. Native
Kokoro timing gives **15:32.30** including the ending hold; a 10-12 minute cut
would require script shortening. `scripts/prepare_money_habits.py` verifies that
the JSON narration matches approved Markdown exactly (excluding the Closing label).
The new `MoneyHabits` composition is 1920x1080 at 30 fps, with original object
illustrations, the consistent guide, and an original supporting person at a desk.
`build.py --composition MoneyHabits` selects this format, and rendering uses
resumable 60-second sections. Music/SFX are original procedural audio with speech
ducking; cue fallbacks are zero. No upload or scheduling is authorized by this
production request. Final output target: `aurelis_vector/out/money_habits.mp4`.
Subtitles and chapter/review notes are in `out/money_habits.en.srt` and
`out/money_habits-review.md`. Rendering and encoded-file audit are complete:
27,969 frames, H.264/AAC stereo, 81,027,309 bytes; full decode passed. Measured
loudness is -14.06 LUFS, true peak -1.47 dBTP, music 17.3 dB below voice during
speech, and 6.1 dB music ducking. TypeScript, 11 production regression tests,
caption checks and timeline continuity checks passed. Inspected a rendered sample
from every shot through six storyboard sheets; this is not continuous playback.
Numerical narration spot-checks recovered the key financial amounts; SPIVA/year
2024 had phonetic ASR differences and remains a listening-review item. Headphone
and phone-speaker listening remains human review before publication. Audit report:
`out/money_habits.audit.json`. The video has not been uploaded.

New interactions are partial: desk discussion/document holding and distinct
supporting character exist. Full handover, ownership changes, bank-counter
transactions and entering a building remain unimplemented. See
`aurelis_vector/INTERACTION_REFERENCE.md` for the precise status.

---

## Current long-form research candidate — Alux money habits reference

Selected high-performing Alux long-form reference: **"15 Things Poor People Do
That The Rich Don't"** (`nllZrOoxpzc`), uploaded 2017-06-18, 13:25. `yt-dlp`
metadata check on Sep 19 2026 showed **8,693,972 views** and **181,506 likes**.
Transcript was downloaded to `/tmp/alux-transcript/nllZrOoxpzc.en.vtt` for
analysis only; do not copy the full transcript into the repo or a script.

New Aurelis script/research file:
`aurelis_vector/scripts/money_habits_longform.md`. It creates an original,
evidence-led version titled **"15 Money Traps That Can Keep You Broke"**, replacing
the reference video's broad rich-vs-poor judgments with systems, habits and
verified claims. Fact sources include the Federal Reserve SHED, BLS ATUS and
Consumer Expenditures, New York Fed household debt, SEC Investor.gov, S&P SPIVA,
Census income data, CFPB guidance and CDC health guidance. The script is designed as a
long-form Aurelis episode and can exercise the next interaction capability:
guide plus supporting characters, budget/desk scenes, document handoffs, bank
or office settings, and object-focused examples.

Second factual review completed Sep 19, 2026: script v2 corrects the SHED
"would pay" versus "could pay" distinction, clarifies that aggregate card
balances include monthly payoffs, distinguishes total fraud from consumer-borne
losses, labels SEC fee values as hypothetical, and replaces the broken fee link.
Unsupported rich/poor behavior claims and the medication-avoidance implication
were removed. Investing, saving and health suggestions now state relevant limits.
The script includes primary-source links and interpretation/calculation notes;
recommendations are editorial suggestions, not proven guarantees. Alux metadata
remains the earlier retrieval snapshot. This is a reviewed script, not a rendered
or approved-for-upload long-form video.

---

## Current direction — quality approved; produce and improve together

**Next concrete visual capability:** user wants the character engaging with
objects/other people and buildings functioning as real settings. Reviewed the
downloaded Alux reference using fresh half-second frame sequences (05:06 ladder/
boxes, 09:48 two-person money-bag scene, 13:26 desk discussion). These use clear
poses, props, eyelines and restrained motion; full object handovers were not
established by those samples. Money-habits production adds two-person desk staging
and a supporting character. `aurelis_vector/INTERACTION_REFERENCE.md` specifies
original bank-counter transaction, desk discussion/signing, bank exterior and
supporting-character work. Full handovers and bank-counter transactions remain
unimplemented and should be developed alongside new content.

The user says the quality is **very good** and approves it as the production
baseline. Move into regular content creation while improving specific weaknesses
alongside it. Complete Alux imitation/parity is no longer the objective or a
condition for producing videos. Keep Aurelis's own identity, consistent character,
palette and current free/local production approach. This supersedes older parity
and acceptance-blocker language below. Approval is user feedback, not a claim
that the agent performed subjective listening.

Next production priority: stronger researched hooks and the opening visual, then
story pacing/payoff. Make focused, observable quality improvements as scripts need
them; avoid another open-ended engine-polish cycle. Prefer one main experiment
per video so the result is interpretable. Keep routine factual, pronunciation,
caption, frame and audio checks. Creating content does not itself authorize an
unspecified upload schedule.

User-reported Rothschild snapshot: **88 views, 35.8% stayed to watch, 32s AVD**.
The user did not specify which upload ID or measurement window. If this is the
59-second corrected upload, AVD is approximately **54.2%** of runtime; do not
attribute the result to the newer local studio edition. Treat the opening as a
testable hypothesis, not a proven cause or a verdict on visual quality from this
small sample. Record later snapshots with video ID and elapsed time when available.

## Latest production work — Rothschild refinement (Sep 19, 2026)
- **Studio final verification:** `out/rothschild-studio.mp4` is **60.7667s / 1823 frames**, stereo **-14.01 LUFS / -1.69 dBTP**; music ducking 6.24 dB, 17.59 dB below voice. Encoded audit passed. Final scene samples and the reading-gesture sequence reviewed; scene listening excerpts regenerated from the final artifact. YouTube still has the earlier corrected upload, not this local studio edition.
- **LATEST LOCAL — focused studio pass:** `aurelis_vector/out/rothschild-studio.mp4`, about 60.8s. Implements the user's four selected areas: clause-level voice speeds/pauses, retained Roths-child pronunciation, effects ducking under speech, reading glance and gesture recovery, pupil/blink detail and pen lift, fixed phrase captions and eased wipes. Fixed a real alias bug that assigned zero times to spaces and broke monotonic character alignment. Whole-word aliases now match longest names first. Eleven Python tests, caption grouping regressions, full native timeline checks and TypeScript pass; full-mix transcription recovers the script. Sources: `voice_direction.py`, `src/captionPhrases.ts`, `test_caption_phrases.cjs`, `review_delivery.py`.
- **Current acceptance scope:** these production changes are implemented, not a fresh list of missing features. Subjective listening-based refinement is still unverified: the agent can measure/transcribe audio but cannot claim a listening review. Review excerpts and storyboard: `out/rothschild-studio-review/README.md`. Future status reports should identify specific observed defects, rather than repeatedly reopening all four generic gaps. Rebuild with `build.py rothschild --edition studio --output out/rothschild-studio.mp4`; no YouTube changes in this pass.
- **CURRENT REVIEW — directed edition:** `aurelis_vector/out/rothschild-directed.mp4` (58.93s, 1768 frames, 1080×1920/30fps). Supersedes the first polished pass for review; prior videos and YouTube upload preserved. Adds per-scene voice pace/pauses, native Kokoro alignment, measured acoustic caption prominence, cue-driven anticipation/nods/presenting, standing anatomy, atlas/correspondence/exchange/drafting sets, and a distinct adaptation composition. Same bf_emma and same SVG character identity. Revised script removes “every border” and the duplicated ending thesis; now explicitly says enduring businesses adapt.
- **Current evidence:** 8 tests and TypeScript/Python compilation pass; all native timestamps in bounds/monotonic, scenes continuous, positive word durations, zero cue fallbacks. Automatic transcription of the mixed programme recovered the script accurately (not a subjective listening review). All scene samples and standing-gesture extremes reviewed. Stereo final: **-14.06 LUFS / -1.71 dBTP**, music ducked 6.23 dB and 17.56 dB below speech. Chunked render joins preserve 1768 frames and 58.933s.
- **Reproduce:** from `aurelis_vector`, use the existing Python venv to run `build.py rothschild --edition directed --output out/rothschild-directed.mp4`. Add `--chunk-seconds 60` for resumable longer renders; verified on this Short with 15-second chunks. Native voice settings: `scripts/rothschild.delivery.json`; cache/stems/manifest: `work/rothschild-directed/`; source-safe JSON exception added to `.gitignore`. `voice_direction.py`, `render_video.py`, `src/Environments.tsx` are new. See `PRODUCTION_STANDARD.md`, `AUDIO_PRODUCTION.md`, and current backlog table.
- **Acceptance still open:** no agent continuous subjective listening or finished 10–12-minute episode; pacing controls are not a human/emotion-conditioned performance, and acoustic prominence is not validated linguistic stress detection. Do not claim verified Alux parity or turn those into completed checkboxes.
- **New local review:** `aurelis_vector/out/rothschild-polished.mp4`, 49.53s, 1080×1920, 30fps. Original stereo music and paper/pen/map/data/transition effects, speech ducking, phrase-anchored prop motion, paper/brass/ink wipes, office depth, point/present gestures, same-character explanatory inserts, selective text emphasis and brass/compass motifs. No paid services or borrowed audio samples. See `aurelis_vector/AUDIO_PRODUCTION.md` and the completion table in `aurelis_vector/ALUX_GAP_BACKLOG.md`.
- **Verification:** TypeScript/Python compilation and three production tests passed; final media decodes and passes the audio audit: **-14.05 LUFS / -2.13 dBTP**, stereo, music ducked 6.16 dB during speech and 17.31 dB below voice. Scene samples reviewed; subjective listening quality and Alux parity are not established. Remaining: expressive voice delivery, richer environments beyond the office, full-body actions when needed, actual vocal-stress analysis. Keep one consistent character.
- **Publication:** corrected pronunciation render was published at https://youtu.be/bzfDABo6zkA on Sep 19. The prior upload remains https://youtu.be/XAHb1EufSG4 because the channel token has upload-only scope and YouTube rejected the privacy update with insufficient authentication scopes. The replacement manifest records both IDs. The new video is the corrected public version; the old video's current live status is unverified.
- **Reference evidence correction:** Alux was reviewed through storyboard/motion samples and stream metadata, not continuous audio playback. User identified missing music/SFX; the reference's exact effects and voice processing were not established. The old audio-deferral priority is superseded by this implemented pass.
- **Publication fixes completed:** `out/rothschild.mp4` and `out/rothschild-illustrated.mp4` now contain the corrected 49.53s render. Ending explicitly says “Rothschild banking continues today,” with “Still banking. Still evolving.” on screen and a Rothschild & Co source tag. Narration and captions were regenerated. Final encoded audio measures **-14.66 LUFS / -1.39 dBTP** (previously about -24 LUFS). Builder now validates cached narration against script text and uses two-pass loudness normalization. Pre-fix illustrated copy: `out/rothschild-before-fixes.mp4`; original rough copy: `out/rothschild-rough.mp4`. Baseline upload recorded; see publication status above.
- **User-approved direction after reviewing the render:** keep ONE consistent recurring Aurelis character across every video, like Alux. Use the new illustrated character as the foundation; preserve face, hair, proportions, silhouette, palette, and rig across topics. Change actions, props, and settings to tell each story, rather than creating a new protagonist per historical subject. The banker is fictional, not an authenticated Rothschild likeness.
- **First real narrated visual benchmark is rendered:** `aurelis_vector/out/rothschild-illustrated.mp4` (now 49.53s after publication fixes, 1080×1920, 30fps, H.264/AAC). Storyboard: `out/rothschild-illustrated-storyboard.jpg`, updated to match. Earlier rough `out/rothschild-rough.mp4` is retained for comparison. Baseline upload recorded; see publication status above.
- User asked for Alux-level visuals using free tools, starting from `aurelis_vector/scripts/rothschild.md`. Kept Remotion and the existing Kokoro narration; all new artwork is original code-native SVG, with **no paid image generation**.
- New `src/Banker.tsx`: fictional period banker with independently animated head, upper arm, forearm, wrist, and attached letter/quill. New `src/RothschildScenes.tsx`: paneled office, desk, geographic city network, five-city correspondence, Suez ledger reconstruction, private/public capital comparison, insight diagram, and adaptation ending. These replace the eight Rothschild placeholder scenes through `rothschild-*` scene keys.
- Frame-zero headline, brief ink transitions, final-scene hold, and caption cutoff are implemented. `build.py` now pads audio to preserve the final hold. Existing duplicate `Pose` type and scene fallback typing errors were fixed; TypeScript and Python compilation pass.
- **Quality status:** the first illustrated direction was approved; the new polished pass awaits listening/playback critique, not verified Alux parity. Earlier blanket “Alux-tier” descriptions below are aspirational. Do not speculatively build a huge pose library or migrate frameworks.
- Design and reproduction notes: `aurelis_vector/VISUAL_DIRECTION.md`. `build.py rothschild` rebuilds from script + cached narration and writes `out/rothschild.mp4`; the separate illustrated filename preserves the before/after review copy.
- Reference review used the downloaded Alux video `pMoCzfIlT8o`, sampling frames across the video and closely spaced motion sequences. It was not continuous playback with audio. Observed strengths: consistent shaded illustrations, restrained motion, recurring scene assets, environments, and explanatory graphics.

---

## ⭐ MAJOR PIVOT (Sep 18 2026) — AURELIS IS NOW FLAT-VECTOR ANIMATION (read `~/.claude/.../memory/alux-visual-reference.md` for full detail)
**Aurelis pivoted from the photoreal ffmpeg pipeline to a flat-vector animated engine (Alux-style: blue-figure-equivalent + coins/tower metaphors + dark+gold editorial).** Key decisions this session:
- **Alux = FLAT 2D VECTOR ANIMATION** (not photoreal) — earlier notes saying "we are NOT cloning that / Aurelis = photoreal editorial" are REVERSED. User wants the actual Alux flat-vector look, custom character, "same bar or better".
- **NEW ENGINE: `aurelis_vector/`** — a Remotion project (React→MP4, headless Chrome + ffmpeg, **NO GPU, local, free**). `build.py <script_id>` reads `scripts/<id>.json` → Kokoro VO (`kokoro_align.py`, bf_emma) → timing.json → renders `ScriptScene` → muxes audio → `out/<id>.mp4`. Scene library in `src/components.tsx` (BrandMark, ProgressRing, Caption, Hook, Coin, Tower, TycoonImg, Wipe transitions). Proven end-to-end (`out/demo.mp4`, 3-beat "How Empires Die" arc, narrated, Alux-tier).
- **CHARACTER: `TycoonImg`** = AI flat-vector businessman generated on **fal.ai/FLUX** (commercial-licensed; key at `.fal_key`, gitignored). 4-pose library (neutral/triumph/despair/point) at `character/poses/*.jpg` → bg-removed `public/poses/*.png`. Endpoint `POST https://fal.run/fal-ai/flux/dev`. Add more poses via fal (seed 778001 + same char desc).
- **RUNPOD / WAN / FLUX-on-GPU: FULLY OBSOLETE for Aurelis.** Pod + volume TERMINATED. §9e/§9f WAN plan below is DEAD for Aurelis (kept for history). Flat-vector needs no GPU.
- **ENGINE LICENSE:** Remotion is paid for teams(4+)/commercial; fine while user is SOLO. Migrate to free headless-Chrome+ffmpeg if a team forms (identical quality — Remotion IS that under the hood).
- **Photoreal builders (`build_*.py`, `gen_*.py`) = LEGACY** (made the currently-live videos; kept as reference). Night File NOT decided — may stay photoreal; user will spec separately.
- **All work committed + pushed to git (Sep 18)** — commit cd7d5f1, origin github.com/Shuraim66/youtube-pipeline.

---

## 1. What this project is
Faceless, automated YouTube Shorts (+ TikTok/IG/FB Reels) operation. **Two live channels** (legacy photoreal builders + the NEW Aurelis flat-vector engine — see PIVOT banner). VO = **Kokoro (local, free)** — ElevenLabs RETIRED (see §4). Goal: retention-optimized shorts → algorithmic breakout → monetization. Mostly free tools.

### Channel A — **Aurelis** (wealth / history / business)
Niche: "quiet wealth" + rise-and-fall history + business-collapse stories. Energetic **female** narrator (ElevenLabs Alice), **GOLD** word-pop captions, warm cinematic grade.
- Validated winner: **Vanderbilt** short ~89% avg view duration.
- Uploaded (all public): Hughes `5p6lIhCLQYw`, Hutton `VmAfHIyMz-s`, Croesus `54BQYAknwlw`, Cleopatra `adqsrr7fHlY`, **Blockbuster** `BO7UG194IIQ`, **Kodak** `BVPyWyY2Zv8`, **Nokia** `sQKGLmVqYH4`, **Xerox** `8Sk9wTPmIsc`, **Yahoo** `ap5PUwBsrVg`, **Sears** `3IN06ITRZZ4`, **Fugger** `lDfJIwM3_x4`, **Tesla** `oxSWahp84jY`, **Rockefeller** `6fuQ-2N_gcY`, **Carnegie** `f06jr3l4pJ0`, **J.P. Morgan** `89ZBG5KO7bM` (v2 engine). **SPEC CHANGE (Sep 11, per user playbook):** from build_morgan_v2.py onward Aurelis uses **Liam** voice `TX3LPaxmHKxFdv7VOQHJ` (was Alice), `model_id=eleven_turbo_v2_5`, voice_settings 0.35/0.80/0.15, min-clip 1.15 (faster ~1.2s cuts), audio-loop scripting (last beat rephrases the hook). Apply the same to future Aurelis builds. Retention (v2): Tesla 15 views / 28.6% stayed / 18s AVD (~47%) — Aurelis retains ~45-100% AVD, genuinely good; bottleneck is distribution/cold-start, not content.
- Manifest: `aurelis_manifest.json`; token: `token.json`. (Single/scheduled uploads used `aurelis_one.json` / `aurelis_sched.json` — pattern: one-entry manifest to upload/schedule a single video without touching others.)

### Channel B — **The Night File** (creepy TRUE unsolved mysteries) — NEW
Handle **@thenightfilehq** (same on IG/TikTok; FB Page created + IG linked). Tagline "The cases nobody solved." MrBallen-style but FACELESS. Deep **male** narrator (ElevenLabs Daniel), **BLOOD-RED** word-pop captions, cold desaturated horror grade + heavy vignette + grain, original synthesized dread music.
- Uploaded (public): **Hinterkaifeck** (pilot) `ekv3g7OIWkc`, **Dyatlov Pass** `GwDy666svHc`, **Sodder** `PW8QIibrkFs`, **Somerton Man** `anMftvnysec` (last 2 v2 engine). Pilot stats @22h: 8 views, 20% stayed, 8s AVD; whole operation still ~0 traction as of Sep 8 (distribution/cold-start problem, NOT content — 0 impressions on a new channel). Discussed pivot to selling services (user declined); continuing channels for now.
- Builders build_dyatlov/sodder_v2/somerton_v2/roanoke_v2.py. Uploaded also: **Roanoke** `Y1fMZ27aRHU`, **Flight 19 / Bermuda** `TFRkWDq3EZo` (build_flight19_v2.py). Also uploaded: **Dancing Plague 1518** `uckkE3hotXg` (build_dancingplague_v2.py; real Bruegel/Hondius engraving; turbo model + faster cuts per playbook). Reddit-story tests posted here: `hUjppOXGUl4` ("man in the walls") + `IQPlm3garrc` ("dating-app photo", free piper voice) — both got ~0 reach, confirming the format needs its OWN channel + TikTok, not Night File — testing that format on a creepy-aligned channel. Night File retains ~18-20% AVD (much worse than Aurelis) — v2 SFX/pacing did NOT lift it.

### NEW FORMAT (Sep 9 2026): Reddit-story-over-gameplay
`build_redditstory.py` — the viral faceless format. **NOW USES FREE LOCAL TTS (no ElevenLabs quota):** piper `~/piper-voices/en_US-ryan-high.onnx` generates the VO, then `faster_whisper` model "small" (cached at ~/.cache/huggingface, works offline) gives word timestamps → `subs_words()` builds the captions. This makes the format quota-proof + unlimited (ElevenLabs free tier is only ~10k chars ≈ 20 shorts and keeps exhausting; this pipeline can be ported to the other builders too if needed). Format: original gripping story over vertical background footage, big CENTERED word-by-word Anton captions (white + cyan-gold pop, Alignment 5), frame-0 hook. **BACKGROUND SORTED FOR MONETIZATION SAFETY (Sep 12 2026):** DROPPED the archive.org Minecraft clip — an archive.org "no copyright" label is user-asserted, not a real license, so reusing that exact recording was a reused-content risk (and the same-loop-every-video was a mass-produced flag). User has Minecraft on Xbox but can't play/record it. REPLACED with a durable, pre-vetted **Pexels background pool** at `assets/bg_pool/<theme>/NN.mp4` (built by `build_bgpool.py`; Pexels license = commercial use, no attribution required, verifiable). Themes: paint, drone, satisfying, drive, water (~27 clips, all normalized to 1080x1920/24fps). `build_redditstory.py` now has `build_bg()` which picks a theme (random, or `BG_THEME` env override), shuffles its clips, concats enough to cover the VO, re-encodes to exact length → **every video gets a different background** (de-templates it). Story is ORIGINAL (no scraped-Reddit content) = the key originality signal. Output `prototypes/short_<ID>.mp4` (~35-47s; send a compressed `_preview.mp4` since ~30MB SendUserFile practical cap). **Monetization verdict:** doable but this format sits CLOSEST to YouTube's reused/mass-produced line — safe only with (1) original scripts [have], (2) clean+varied bg [now fixed], (3) real engagement [the 30-day test]. AI/TTS voice is the residual flag (user can't do VO); disclose AI where required. NO channel yet — needs its own "scary/creepy stories" channel; do NOT put on Aurelis/Night File brands. `assets/bg_pool` is gitignored (*.mp4) but durable on disk + reproducible via build_bgpool.py (ids in credits.json).
- Manifest: `nightfile_manifest.json`; token: `nightfile_token.json` (separate OAuth for this channel).
- Brand assets: `brand/nightfile/nightfile_pfp.png` (folder + red UNSOLVED stamp), `brand/nightfile/nightfile_banner.png`. Generator: `gen_nightfile_brand.py`.
- Why this channel: Aurelis is slow (Blockbuster 5 views/20h, Kodak 17/17h; retention body OK but 60-78% swipe away in first 1-2s). Horror = highest watch-time niche; fear stops the thumb.

---

## 2. The engine (how a short is built)
Base builders: `build_blockbuster.py` (Aurelis/gold) and `build_hinterkaifeck.py` (Night File/horror). Each new short = clone one and edit `IMG` path + `SHORTS` (id, hook, punch, punch_beat, cta, beats). A `beat` = (VO line, [list of image terms]). Term prefixes: `img:` = AI still (color grade), `rimg:` = real archival photo (Night File builder only — near-monochrome archival wash). Builder splits each beat's time window across its images (min ~1.4-1.6s/clip), so more images = faster cuts.

**The proven recipe (do not break):**
- Frame-0 **hook**: bold serif text HARD-ON (no fade-in), ≤5 words, readable silent (muted autoplay). Gold last line (Aurelis) / red last line (Night File). PLUS a spoken cold-open paradox/unease in first ~5s.
- **Dense phrase-matched visuals**: ~12-18 images, one per phrase, no adjacent reuse, cut every ~2-2.7s (target 1.5-2.5s). Fixes the old "only 4-5 reused images" problem.
- **Karaoke captions** (Anton ALL-CAPS, whop-clipper/openshorts style): ~96px, Outline=6 black, Bold, 3 words/cue, active word pops (`\fscx90\fscy90\t(0,110,\fscx108\fscy108)`) — gold `&H00E5FF` (Aurelis) or red `&H0000FF` (Night File). Burn with `ass=...:fontsdir=/home/alpha/products/openshorts/fonts` (NOT subtitles=force_style).
- **Bright first frame** (GRADE_OPEN) to pop in the feed and cut early swipe.
- **~40-45s**, escalating structure, **loop-back tail** (~1.4s zoom on a closing frame).
- Length: shorter = higher completion. Keep 40-45s; the hook does the work.

**Motion (Night File builder):** varied Ken Burns via `kb()`/`MOVES` (push-in / panL / panR / up + `in_fast` zoom-punch on the punch beat) instead of one slow zoom.

**v2 ENGINE (Sep 5 2026 — retention upgrade, being tested):** `build_fugger_v2.py` is the reference. Changes vs v1: (1) **SOUND DESIGN** — synthesized `scratchpad/fugger/sfx/{boom,riser,whoosh}.wav` (ffmpeg: boom = pitch-drop low sine `aevalsrc='sin(2*PI*t*(110-120*t))'`; riser = rising pink noise; whoosh = band-swept pink noise). Mixed in the final ffmpeg via asplit+adelay: riser+boom on the hook (t≈0), boom on the punch beat, whoosh on every beat-cut. This is the biggest "feel" upgrade. (2) faster ~2.2s cuts (min clip 1.3s), (3) varied punch-in motion (kb/MOVES, in_fast on first + punch), (4) ~30-33s (shorter = higher completion), (5) punchy first second: strong real-portrait open + fast zoom + impact SFX, no "In 20XX…" throat-clearing, (6) more visceral/relatable hook (billionaire comparison) over corporate. **Why:** Aurelis retention was flat/dropping (~20% stayed, first-1-2s swipe). If Fugger's retention beats the v1 batch, port SFX+motion+pacing into all builders. Reason for the drop diagnosed: slow openings, 2.7-3.3s cuts, no sound design, sameness/banner-blindness, cold-start throttling.

---

## 3. Visual sourcing
- **AI stills — Pollinations Flux (keyless, free):** `https://image.pollinations.ai/prompt/{urlencoded}?width=832&height=1472&model=flux&nologo=true&seed=N`. Rate-limits (429) → retry w/ backoff, run gen scripts in background. **WATERMARK (Sep 11 2026):** Pollinations now stamps a "pollinations.ai" watermark bottom-right EVEN with `nologo=true` (regenerating doesn't remove it). FIX baked into builders: the image `vf` pre-crops the bottom ~6% (`[0:v]crop=iw:ih*0.94:0:0,scale=...`) on both bg+fg to cut the watermark. Ported to build_crassus_v2 / build_maxheadroom_v2 — **apply this crop to every builder going forward** (older builders lack it; re-add if reusing). GOOD at atmosphere/objects/landscapes/silhouettes; BAD at faces, text, character consistency (this is why the potato character channel was abandoned). Gen scripts: `gen_*_imgs.py`.
- **Real stock VIDEO — Pexels (`vid:` beat prefix, Sep 12 2026):** the anti-"mass-produced" upgrade. Key file `.pexels_key`. Builders now support three beat prefixes: `img:` (AI still → blurred-fill Ken Burns + watermark-crop), `rimg:` (real archival photo → near-monochrome RGRADE wash), and **`vid:` (Pexels stock video → REAL motion, scaled/cropped to 1080x1920 + channel GRADE)**. Helpers `pexels(term,need)` (searches portrait then landscape, returns highest-res mp4 link ≥ clip duration) + `dl()` + `VID_FALLBACK` live at the top of the builder; the beat loop downloads to `c{i}_{k}.mp4`, transcodes to `s{i}_{k}.mp4` with `-ss 0.3`. Pexels licensed/free/no-watermark/attribution-optional. **Reference builders with full vid:/rimg:/img: parity: `build_somerton_v2.py` (Night File) + `build_morgan_v2.py` (Aurelis).** Mix `vid:` beats with AI stills to de-template the channel for the 2025 inauthentic-content review. Port these helpers+branch to other builders as they're refreshed. Verified end-to-end via `build_viddemo.py`.
- **Real archival photos — Wikimedia:** sandbox + WebFetch CANNOT reach commons.wikimedia.org, but CAN reach **upload.wikimedia.org**. Get a file's direct URL WITHOUT the API:
  ```python
  fn=title.replace(' ','_'); h=md5(fn.encode()).hexdigest()
  url=f"https://upload.wikimedia.org/wikipedia/commons/{h[0]}/{h[0:2]}/{quote(fn)}"
  ```
  Find filenames via WebSearch ("... File wikimedia commons"). Space requests ~17-18s (429). Only use files hosted on Commons (license-vetted). Prefer CC-BY / PD; CC-BY-SA works but add credit line in description. **Copyright rule:** OLD subjects (pre-1929/PD-by-age) → real photos great; MODERN subjects → press imagery is copyrighted, use AI, BUT old *product/hardware* shots are often CC on Wikimedia (used real Nokia 3310, Xerox Alto+mouse, Blockbuster aisle, Netflix envelope). Credit CC images in the YouTube description.

---

## 4. Voices, music, keys
- **⭐ PRIMARY VOICE = KOKORO (local, free, no GPU) — this is the current standard.** Helper `kokoro_align.py` → `vo.mp3` + `vo.json` (ElevenLabs alignment format, so caption/timing code is unchanged). Aurelis `bf_emma` (lang `b`), Night File `am_michael` (lang `a`). Installed in the whop-clipper venv (`pip install kokoro soundfile`, CPU-OK). **The vector engine (`aurelis_vector/build.py`) and the legacy builders both use Kokoro.**
- **ElevenLabs — RETIRED (legacy, kept for reference only):** key file `.elevenlabs_key`, gitignored. Endpoint: `/v1/text-to-speech/{voice}/with-timestamps`, model `eleven_multilingual_v2`.
  - Aurelis voice: **Alice** `Xb7hH8MSUJpSbSDYk0k2`, speed 1.05, style 0.55, stability 0.38 (energetic).
  - Night File voice: **Daniel** `onwK4e9ZLuTAKqWW03F9`, speed 0.97, style 0.22, stability 0.5 (deep, ominous). Other deep options that work: Bill `pqHfZKP75CvOlQylNhV4`, George `JBFqnCBsd6RMkjVDRZzb`, Brian `nPczCjzI2devNBz1zQrb`.
  - Quota gotcha: pay-as-you-go accounts run out (10k char cap). If 401/quota, user must top up or swap key in `.elevenlabs_key`.
- **Music/SFX are now DURABLE in the repo (Sep 12 2026 fix):** SFX at `assets/sfx/{boom,riser,whoosh}.wav` and the Night File dread bed at `assets/horror_bed.wav` (previously lived in the session-ephemeral scratchpad → wiped between sessions → build failures with "Error opening input file .../scratchpad/.../horror_bed.wav"). All builders were sed-repointed to `SFX=ROOT+"/assets/sfx"` and horror `MUSIC=ROOT+"/assets/horror_bed.wav"`. Regen commands unchanged if ever needed (boom = pitch-drop low sine; riser = rising pink noise; whoosh = band-swept; horror_bed = layered low sines 55/58/41Hz + brown-noise wind + tremolo + lowpass).
- **Music:** Aurelis uses `quietwealth/ep2/episode/music.wav` (persists in repo). Night File uses `assets/horror_bed.wav` (now durable, see above). Music volume ~0.13 (Aurelis) / 0.20 (Night File), then loudnorm I=-14.
- **Pexels** key file `.pexels_key` — now the PRIMARY real-footage source via the `vid:` beat prefix (see §3), not just a fallback.

---

## 5. Uploading (YouTube Data API)
Script: `upload_yt.py` (manifest-driven, resume-safe, skips entries already marked `"uploaded"`). Run:
```
/home/alpha/products/whop-clipper/.venv/bin/python upload_yt.py \
  --manifest <manifest>.json \
  --secret "/home/alpha/products/whop-clipper/client_secret_666488958119-mu73lurf5ouooi8d99p1u7c9joq03i4v.apps.googleusercontent.com.json" \
  --token <token>.json
```
- Aurelis: `--manifest aurelis_manifest.json` (token defaults to `token.json`).
- Night File: `--manifest nightfile_manifest.json --token nightfile_token.json`.
- First run per token opens a **browser** (`run_local_server`) for Google OAuth — user must sign in AND pick the correct channel in Google's selector. The two channels use SEPARATE tokens.
- Quota ~6 uploads/day. Manifest entry fields: file, title, description, tags[], privacyStatus, madeForKids:false, optional publishAt (ISO, for scheduling). Emoji in titles OK.
- Python interpreter for everything: `/home/alpha/products/whop-clipper/.venv/bin/python`.

---

## 6. Sandbox reachability (tested)
### YouTube reference downloads (verified Sep 18, 2026)
- The older workaround is recorded in `~/.claude/projects/-home-alpha-products-whop-clipper/memory/youtube-sabr-hd-download.md`: `--extractor-args "youtube:player_client=tv_embedded"`, without cookies or `player_skip=configs`.
- **yt-dlp 2026.07.04 now reports `tv_embedded` unsupported.** On Alux reference `pMoCzfIlT8o`, that option fell back to **android_vr**; selecting 720p H.264 + M4A (formats 136+140) successfully downloaded and merged the full video after an earlier automatic 480p video selection returned HTTP 403. This does not establish the precise cause of the earlier 403.
- Equivalent command using the client actually selected: `yt-dlp --extractor-args 'youtube:player_client=android_vr' --no-playlist -f 'bv*[vcodec^=avc1][height<=720]+ba[ext=m4a]/b[height<=720]' --merge-output-format mp4 -o '/tmp/alux-reference/%(id)s.%(ext)s' 'https://www.youtube.com/watch?v=pMoCzfIlT8o'`. The successful invocation used the old `tv_embedded` option and its logged Android VR fallback; explicit `android_vr` was not separately retested.
- Reference copy: `/tmp/alux-reference/pMoCzfIlT8o.mp4` (temporary). Network sandbox DNS failures require an approved network-enabled command; they are separate from YouTube HTTP 403 responses.

CAN reach: pexels, api.elevenlabs.io, image.pollinations.ai, **upload**.wikimedia.org, archive.org, oauth2/youtube.googleapis.com, fal.run, together.
CANNOT reach: **commons**.wikimedia.org (use the MD5 upload.wikimedia.org trick), huggingface, Google Flow/Veo/Kling generation UIs.
TTS = **Kokoro is now the STANDARD/PRIMARY** (local, free, via `kokoro_align.py`; bf_emma=Aurelis, am_michael=Night File). ElevenLabs RETIRED (§4). Piper (`en_US-ryan-high/amy/hfc_male` .onnx in `~/piper-voices`) + faster_whisper remain as extra local fallbacks.

---

## 7. Retention learnings (2026 benchmarks)
- Push-wider thresholds: ~65% AVD for sub-30s, ~50% for 30-60s. 70%+ = keeps getting served.
- Pacing: a visual change every 1.5-2s; <1.2s reads as noise, >2.5s dips. No dead zones. Pacing should increase around 5-10s (main drop-off).
- The whole battle is the **first 1-2 seconds** (swipe-away). Body retention holds once they stay.
- Horror = highest watch time of any short-form niche; faceless makes it scarier (never use talking-head/AI-avatar for it).
- Aurelis actuals: Blockbuster AVD 44s on a 41s clip (looping!) / 40% stayed; Kodak 21s / 21% stayed. Hook strength = everything.

---

## 8. Builders & key files
- Aurelis builders: `build_hughes.py`, `build_hutton.py`, `build_croesus.py`, `build_cleopatra.py`, `build_blockbuster.py`, `build_kodak.py`, `build_nokia.py`, `build_xerox.py`, base `build_wealthstory.py`.
- Night File builders: `build_hinterkaifeck.py`, `build_dyatlov.py`, `build_sodder.py`, `build_somerton.py`.
- Image generators: `gen_<name>_imgs.py`, `gen_batch3_imgs.py`, `gen_aurelis2_imgs.py`, `gen_nightfile_brand.py`.
- Manifests/tokens: `aurelis_manifest.json` + `token.json`; `nightfile_manifest.json` + `nightfile_token.json`.
- Finished videos: `prototypes/short_<id>.mp4`. Brand assets: `brand/nightfile/`.
- **Scratchpad is session-temporary** (`/tmp/claude-1000/.../scratchpad/`): holds img/, real/, vo, downloaded pexels clips (`c*.mp4`), segments. If cleared, the builders just re-fetch/re-render. **SFX + horror_bed are NO LONGER in scratchpad** — they now live durably in `assets/` (Sep 12 fix). Final mp4s and .py builders in the repo are the durable copies.

---

## 9. Social / platforms
- Post the same `prototypes/short_<id>.mp4` to YouTube (via uploader), TikTok, IG Reels, FB Reels (manual on TikTok/IG/FB).
- FB/IG captions: standalone (NO "follow the channel/full video" — those don't exist on FB/IG); hook + hashtags. TikTok bio limit 80 chars.
- The Night File FB Page linked to IG for cross-posting via Meta Business Suite. IG set to **Creator** account (keeps trending-audio access).

---

## 9b. Playbooks (Sep 10 2026)
`playbooks/AURELIS_PLAYBOOK.md` and `playbooks/NIGHTFILE_PLAYBOOK.md` — voice/audio config (ElevenLabs sliders stability 0.35 / sim 0.80 / style 0.15; switch model to `eleven_turbo_v2_5` to halve credit cost; free piper fallback), full hook-first + audio-loop example scripts, Night File editing/pacing checklist. Aurelis also has a **storefront**: aurelispk.com (sells watches, Cash-on-Delivery, PK market) — playbook has rewritten "quiet luxury" product copy (with `[bracketed]` spec placeholders to fill with real attributes — don't fabricate specs). Reconciliation recorded: Night File core = archival/AI engine (NOT gameplay); the gameplay-background reddit-story is a separate format for its own channel.

## 9c. Uploaded Sep 12 2026 (Crassus + Max Headroom)
- **Crassus** `p6gkLJLl2fQ` (Aurelis, Liam voice, real bust, ~30s) — build_crassus_v2.py
- **Max Headroom** `rPXhalx5Koo` (Night File, ~31s) — build_maxheadroom_v2.py
Both have the watermark-crop fix + ~30s target length. Gotcha logged: nightfile_token uploads sometimes HANG in get_service before printing "uploading" — the MH upload took 3 tries; the run that succeeded still wrote the URL to its manifest. If an upload hangs, check the manifest for an `uploaded` URL before re-running (avoid duplicates).

## 9d. Uploaded Sep 12 2026 — FIRST HYBRID vid: SHORTS (real footage + AI stills)
- **MySpace** `Sz3Zhp9UF3Y` (Aurelis, Liam/turbo, ~28s) — `build_myspace_v2.py`. First Aurelis short using `vid:` real Pexels footage led beats + a few AI stills. LESSON: Pollinations stills came out too dark under the Aurelis GRADE (opening was near-black) → fixed by (a) leading each beat with the `vid:` clip so the visible/opening frame is bright real footage, and (b) writing img prompts with explicit "bright, high-key, well lit, vivid". Apply this to future Aurelis hybrids: LEAD WITH vid: and brighten img prompts.
- **Elisa Lam** `k1HACFqD4rM` (Night File, Daniel voice, ~39s) — `build_elisalam_v2.py`. Hybrid `vid:` (real hotel hallway / elevator / rooftop water tank at dusk — a perfect match) + moody AI stills. Dark aesthetic is ON-brand for Night File so no brightening needed.
- **New self-contained builder pattern:** both new builders have an INLINE Pollinations generator (`genimg()` + `IMGPROMPTS` dict + a pre-pass `for name,pr in IMGPROMPTS.items(): genimg(...)` before the beat loop) so a fresh topic builds in one command — no separate gen_*.py needed. Copy `build_myspace_v2.py` (Aurelis) or `build_elisalam_v2.py` (Night File) as the template for new hybrid shorts.
- **Reddit-story for the new channel:** `build_redditstory.py` ID=`reddit3` ("doorbell camera recorded me while asleep", ~52s, drive theme) built + preview sent for review; NOT uploaded (channel doesn't exist yet). Awaiting user OK on length/vibe before batch of 5.
- **ElevenLabs quota:** was 5411/10000 used at start of this batch; MySpace+Elisa VO consumed some — check before next VO batch (`/v1/user/subscription`). ~4k chars left ≈ 4-5 more shorts this cycle.

## 9e. STRATEGY DECISION (Sep 13 2026): DOUBLE DOWN ON AURELIS, level it up to be non-slop
User asked directly: is reddit-story monetizable / not-AI-slop? Honest verdict given: **reddit-story is a strong VIEWS/growth niche but a WEAK, risky MONETIZATION niche** — it's the exact "story + background + TTS" format YouTube's 2025 mass-produced/inauthentic crackdown targets; many such channels get rejected at the 1000-sub review. Swapping gameplay→stock fixed LICENSE risk, not the slop problem (AI voice over generic B-roll remains). YouTube's real bar = meaningful human value-add. **User chose: double down on Aurelis** (best retainer ~28-47%, genuinely informative = defensible originality, natural on-ramp to long-form). Reddit-story demoted to optional top-of-funnel. NOTE: the #1 monetization lever is a real human voice — user declined (non-native English); told them an accented real voice is usually fine and is the biggest single upgrade, left it their call (currently still TTS).
- **"Leveled-up Aurelis" = the non-slop formula (now the template):** (1) deeper RESEARCHED scripts with real numbers + a non-obvious insight, (2) real Pexels `vid:` footage LEADS every beat (bright), AI stills only as accents, (3) **ORIGINAL on-screen DATA CARDS** we render ourselves (real numbers) — clearest "not mass-produced" signal, (4) a named SERIES for binge retention: **"How Empires Die"**.
- **NEW `card:` beat type** (in `build_toysrus_v2.py`): `render_card(path,big,label,sub)` draws a premium dark-gradient card (big GOLD number + serif label + gold rule + faint frame) to IMG; a `CARDS={name:(big,label,sub)}` dict + pre-pass renders them; the beat loop's `iscard` branch renders full-frame with a gentle zoom (NO blur-fill, NO watermark-crop since it's our own asset). Reference/template builder for leveled-up Aurelis = **`build_toysrus_v2.py`** (also has inline genimg + brighter img STYLE "bright high-key well lit vivid").
- **Toys R Us SCHEDULED** `Id4HaxIt0OA` (Aurelis, private→publishAt **2026-09-14T21:00Z**) — `build_toysrus_v2.py`, "How Empires Die" ep1, ~45s, 2 data cards. Template LOCKED for Aurelis.
- **Night File ALSO leveled up (Sep 13 2026):** same non-slop formula adapted for mystery niche. NEW **case-file card** = `render_casefile(path,case,fields,stamp)` in `build_yubacounty_v2.py` — dark dossier (CASE FILE header, red field labels, ivory values, rotated blood-red UNSOLVED stamp); `CASES={name:(case,fields)}` dict + pre-pass + `iscard` branch (same full-frame/gentle-zoom/no-crop handling as Aurelis data cards). Reference/template for leveled-up Night File = **`build_yubacounty_v2.py`**. **Yuba County Five SCHEDULED** `xPVp1fYim_8` (Night File, private→publishAt **2026-09-14T23:00Z**), ~48s. Template LOCKED for Night File.
- **COMPETITOR RESEARCH done (Sep 13 2026)** → `playbooks/COMPETITOR_ANALYSIS.md`. Headlines: quality bar = MagnatesMedia (~1.9M, "How X Lost Everything", real voice — but ~9mo HIATUS = opening) + Company Man (1.5M, collapse case studies) + ColdFusion/Alux; Shorts-first business space is dominated by UNNAMED AI-automation accounts = the exploitable gap. Biggest differentiators we should own: (1) original cited data/case cards [done], (2) rigid rise-and-fall micro-arc [done], (3) show SOURCES on screen ~1s [TODO: add `source:` micro-overlay], (4) lean into obscure-historical-wealth lane (Crassus/Fugger/Getty/Mansa Musa — less saturated than MySpace/Blockbuster), (5) standardized title syntax, (6) real/better voice is the #1 lever. Shorts = funnel; real money = long-form + sponsorships.
- **CLOUD GPU PROVISIONED (Sep 15 2026) — RunPod RTX 3090 (24GB, $0.50/hr on-demand).** Template: Runpod PyTorch 2.8.0 (torch 2.8.0+cu128, Python 3.12, CUDA OK). **50GB persistent volume at `/workspace`** (survives pod stop). Workflow = generate assets on GPU → scp back → STOP pod → assemble locally with ffmpeg (GPU only for the heavy gen, save cost).
  - **SSH:** account key = local `~/.ssh/id_ed25519` (pubkey added to RunPod). Connect via DIRECT tcp: `ssh -i ~/.ssh/id_ed25519 -p <PORT> root@<IP>` (IP/PORT change each spin-up — get from pod Connect panel; `scp -P <PORT>` works too). NOTE: the `ssh.runpod.io` PROXY is interactive-only (ignores exec, no scp) — do NOT use for automation. If direct tcp gives "Permission denied (publickey)" after a fresh pod, append the pubkey to the container via the web terminal: `mkdir -p ~/.ssh && echo "<pubkey>" >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys`.
  - **SSH KEY DOESN'T SURVIVE POD RESTART** — container disk (incl. /root/.ssh) is wiped on stop/restart; only /workspace persists. After every restart, re-append the pubkey via the web terminal (command above). Pod restart also gives a NEW port (was 40052, then 40089).
  - **VOICE — DECIDED: Kokoro runs LOCALLY (free, no pod/GPU needed).** Tested F5-TTS (robotic, clone failed), Chatterbox (natural but dependency hell — needs `transformers==4.46.3` + `torchvision==0.21.0` matched to its torch 2.6), Kokoro-82M (natural, fast, has a preset voice LIBRARY). **User picked Kokoro voices: `bf_emma` (British female, Alux-style) for Aurelis, `am_michael` (American male) for Night File.** Kokoro installed LOCALLY in the whop-clipper venv (`pip install kokoro soundfile`; works on CPU, no espeak-ng needed — misaki+spaCy handle G2P). Local gen: `KPipeline(lang_code='a'|'b')` then `pipe(text, voice=v)`. Samples in `voice_candidates/`. **So voice = $0, local, done — no pod for voice.** LESSON: each TTS model needs its OWN clean venv (they conflict on transformers/torch).
  - **IMAGES — FLUX on the pod.** All TTS venvs/models DELETED from /workspace (freed ~25GB) since voice is local. FLUX venv `/workspace/venv_flux` (diffusers 0.40, torch 2.8). **FLUX.1-schnell is now GATED** → needs HF token (accept license at hf.co/black-forest-labs/FLUX.1-schnell). User's HF **read** token stored at `/workspace/hf/token` (chmod 600; HF_HOME=/workspace/hf); user should rotate it (was pasted plaintext). Gen script `/workspace/flux_gen.py` (FluxPipeline, enable_model_cpu_offload, 4 steps, 832x1472). Batch gen: `/workspace/flux_batch.py` reads `/workspace/prompts.json` {name:prompt}. No-token alt = SDXL/Juggernaut (ungated). FLUX gen ~16s/image; whole-model download+first-gen was <2min (HF CDN fast, ~25MB/s).

## 9f. FULL HYBRID PIPELINE WIRED (Sep 16 2026) — reference builders `build_wework_v2.py` (Aurelis) + `build_bella_v2.py` (Night File)
Direction locked = **C hybrid** (editorial base + brand identity). WORKFLOW: generate FLUX stills on GPU → pull to durable `flux_images/<short>/` → **STOP pod** → assemble locally (voice+cards+Pexels+emblem all local/free).
- **IMAGES:** FLUX stills pre-generated on the GPU (beat-matched prompts) into durable `flux_images/wework/` and `flux_images/bella/` (NOT scratchpad). Builders reference `img:{IMG}/<name>.jpg` where `IMG=ROOT+"/flux_images/<short>"`. The Pollinations `genimg()` pre-pass is REMOVED; the img: branch NO LONGER crops the bottom 6% (that was only for Pollinations watermarks — FLUX is clean). Still hybrid: most beats LEAD with real Pexels `vid:` (motion+credibility); FLUX stills are accents; cards for facts.
- **VOICE (local, free):** builders call `kokoro_align.py` (KEY NEW HELPER) via `subprocess.run([sys.executable, ROOT+"/kokoro_align.py", full, VOICE_K, LANG_K, D])` → writes `vo.mp3` + `vo.json` in **ElevenLabs alignment format** (Kokoro TTS + faster-whisper word timestamps mapped onto the input text chars) so the existing `subs()` + beat-timing code works UNCHANGED. Aurelis `VOICE_K="bf_emma" LANG_K="b"`; Night File `VOICE_K="am_michael" LANG_K="a"`. ElevenLabs fully retired.
- **CARD FIXES (user-reported bugs):** (1) card text now AUTO-FITS inside the border — `render_card` uses `_wrap`+`_fit` (wrap+shrink) for label/sub; `render_casefile` uses `_fit1` (shrink) for title/values. No more clipped labels. (2) The big serif HOOK/PUNCH overlay no longer collides with cards — RULE: `punch_beat` must be a NON-card beat and beat 0 is never a card (hook shows 0-2.6s). Karaoke caption still passes over cards (user OK'd; can suppress per card-beat window if wanted).
- **EMBLEM:** Aurelis brand mark = gold laurel + serif "A" (FLUX-generated `emblem_options/emblem1.jpg`, refined to transparent `assets/emblem.png` + `assets/emblem_watermark.png`). Overlaid top-right (`overlay=W-w-40:44`, alpha 0.55, 104px) in the Aurelis final ffmpeg (input [9], EMBLEM var). Night File gets NO Aurelis emblem (wrong brand — needs its own blood-red mark, TODO).
- **BUILT (NOT uploaded, awaiting user review Sep 16):** `prototypes/short_wework.mp4` (~30s, WeWork, cards $47B/$1.9B) + `prototypes/short_bella.mp4` (~30s, Bella in the Wych Elm, case card). Both verified: cards fit, no overlay collision, emblem on Aurelis.
- **WAN/LTX I2V (deferred phase 2):** image-to-video micro-motion (1-1.5s subtle motion on FLUX stills, NOT text-to-video) is the Alux-tier polish layer — legit & non-slop per user research, but heavy; do AFTER this pipeline proves out. Motion today = Ken Burns on stills + real Pexels video.
- **ALUX STYLE NOTE — ⚠️ SUPERSEDED Sep 18 (see PIVOT banner at top):** this old note said "we are NOT cloning Alux's flat vector; Aurelis = photoreal editorial." REVERSED — Aurelis IS now flat-vector (aurelis_vector/ Remotion engine). Kept for history only.
- **LIVE SHORTS HAVE THE OLD CARD BUG:** Mansa Musa / Toys R Us / Yuba County / Elisa Lam / Max Headroom (already published) have card text overflow + punch-on-card. User said SKIP fixing them.

## 9g. Sep 16 batch 2 — 4 more shorts on the pipeline + Night File emblem
- **Uploaded UNLISTED** (privacyStatus unlisted; uploader prints "PUBLIC now" but sends unlisted): WeWork `BNPj7UYOOZc` + Bella `s_5desdp7NI` (batch 1); Enron `mGmBCMKasOE` + Zodiac `QjKsr2aMbos` (batch 2). Builders: `build_wework_v2.py`, `build_bella_v2.py`, `build_enron_v2.py`, `build_zodiac_v2.py`. FLUX stills in `flux_images/<short>/`. FB descriptions for all in `FB_DESCRIPTIONS.md`.
- **NIGHT FILE EMBLEM created:** FLUX-generated blood-red **crescent-moon + watching-eye** mark → refined to `assets/emblem_nf.png` (transparent) + `assets/emblem_nf_watermark.png`. Wired into Night File builders (`EMBLEM=ROOT+"/assets/emblem_nf_watermark.png"`, top-right overlay). Alt option (raven) was `emblem_options_nf/nf_emblem2.jpg`. Aurelis still uses gold laurel `assets/emblem_watermark.png`.
- **YouTube title limit = 100 chars** (Bella upload first failed "invalid title" at 106 chars → shortened). Keep titles ≤100.
- **I2V MICRO-MOTION = LTX-Video (WAN abandoned, Sep 16):** WAN2.2-TI2V-5B was too big — FLUX model alone is **32GB** of the 50GB volume (~16GB free) and WAN needs >30GB even on the container disk (ran out of space, os error 28). **Pivoted to LTX-Video** (`Lightricks/LTX-Video`), which FITS and does the same I2V job, faster. WORKS: `/workspace/ltx_i2v.py` (LTXImageToVideoPipeline, cpu offload, 704x1280, num_frames=25≈1.5s@16fps, 30 steps) — gen ~27s per clip, tested on a FLUX still → subtle push-in/parallax, no warping. Installed to container disk `HF_HOME=/root/ltx_hf` (EPHEMERAL — re-downloads each restart; LTX is smaller so cheap to re-pull). Deps in venv_flux: ftfy, imageio, imageio-ffmpeg. **LTX WIRED INTO BUILDERS (Sep 17):** the `img:` branch now checks for `<still>_mo.mp4` next to the still — if present, it uses the LTX motion clip (scale/crop 1080x1920 + channel grade + trim to beat `sub`) instead of Ken Burns; else falls back to Ken Burns (backward-compatible). Workflow to add motion: pod-side `/workspace/ltx_batch.py` reads `/workspace/ltx_list.json` (still basenames in /workspace/out), animates each → `<name>_mo.mp4` (49 frames ≈3s @16fps, ~50s each); pull the `_mo.mp4` into `flux_images/<short>/`. DONE + proven on **build_enron_v2.py** (all 4 stills animated, rebuilt). TODO: apply the same img:-branch edit to build_wework_v2 / build_bella_v2 / build_zodiac_v2 (identical insertion before `style=...`), then animate their stills. DISK: LTX is **27GB** (not small) — to keep FLUX(32GB)+LTX both permanent, switch FLUX→fp8 (17GB → 17+27=44GB fits 50GB volume, FREE, recommended) or expand volume to ~70GB; currently LTX on ephemeral container disk `/root/ltx_hf`. WAN dropped (better quality but too big for disk + slower; LTX good enough for subtle micro-motion).
- **WAN 2.2 I2V RECONSIDERED (Sep 17 2026) — the quality upgrade over LTX:** re-evaluated for "Alux-tier" polish. WAN 2.2 I2V is the open-source photoreal/motion-coherence leader; it was dropped before ONLY over disk, which fp8 solves. **Path chosen = raw diffusers `WanImageToVideoPipeline` (fp8 layerwise casting + `enable_model_cpu_offload()`), NOT Wan2GP and NOT ComfyUI.** Rejected Wan2GP (its `--process` batch mode requires building the queue in the web UI first — bad for a headless pod) and ComfyUI (API-server orchestration = more moving parts than needed). Diffusers path mirrors the existing `ltx_i2v.py` exactly. **WRITTEN (local repo, scp to pod): `wan_batch.py`** (reads `/workspace/wan_list.json` basenames → `/workspace/out/<name>_mo.mp4`, drop-in for `ltx_batch.py`, ZERO builder changes since the img: branch already prefers `<still>_mo.mp4`) + **`WAN_SETUP.md`** (install/disk/run/pull steps). Model `Wan-AI/Wan2.2-I2V-A14B-Diffusers` (720p, ~15-18GB fp8), reuses `HF_HOME=/workspace/hf`. Fits 24GB VRAM comfortably. ~1-3min/clip (vs LTX ~50s — quality trade). **DISK: user agreed to expand the RunPod volume to 80GB** → FLUX-fp8(17)+WAN-fp8(17)+LTX(27)≈61GB all permanent, no re-downloads. **NOT YET RUN on the pod** (user to expand volume + run wan_batch.py on one short, compare vs LTX, then roll out to WeWork/Bella/Enron/Zodiac). LTX stays as fast fallback. **"ALUX LEVEL" HONEST NOTE:** WAN is the last ~10% (polish). The real gap to Alux = (1) script depth / non-obvious insight, (2) a real human voice or top-tier expressive TTS (biggest single perceived-quality signal; user on Kokoro), THEN visuals. Motion won't fix swipe-away.
- **AURELIS RETENTION DIAGNOSED (Sep 17 2026) — pulled real YT Studio data via browser.** Channel = **Aurelis HQ** (@aurelishq, brand channel under ShuraimImran66@gmail.com; Night File = @nightfilehq, also there; other channels: clutchcutsmedia, Clutch Clips, Shuraim Imran). Channel-wide (28d Shorts): **40.1% stayed-to-watch / 59.9% swiped away**; 92.9% of views from Shorts FEED (cold swipe) → first-1-2s hook is everything. **KEY FINDING: it's not a steady decline, it's huge VARIANCE.** Per-video stayed-to-watch: WINNERS 58-65% (Nokia 65.4%, Richest-Man-Died-Unrecognizable 61.6%, Vanderbilts 61.3%, Mansa Musa 61.3%, Toys R Us 60.9%, Rockefeller 58.3%); DISASTERS <20% (J.P. Morgan "Saved the US Economy" **9.0%**, 24-hour-rule 7.2%, WeWork 15.8%, raise-that-keeps-you-broke 18.2%). The <20% flops drag the avg to 40%. Newest uploads underperformed (WeWork 15.8%, Enron 27.1%, Carnegie 38.2% despite 1,182 views). **DIAGNOSIS = HOOK QUALITY, not motion/visuals** (WAN can't save a 9% hook — they swipe before any clip plays). PATTERN: winners = *named subject + concrete catastrophic verb* ("Vanderbilts LOST the fortune", "Richest man you've NEVER HEARD of", "DIED unrecognizable"); losers = abstract framings ("saved the economy") or generic money-mindset tips (all 7-20%, off-brand for "How Empires Die"). **FIXES (no GPU, highest ROI): (1) standardize frame-0 hook = named subject + catastrophic verb (LOST/VANISHED/DIED BROKE/NEVER HEARD OF), kill abstract openings; (2) rewrite first spoken line + first-frame text of the 3 worst recent builders (JP Morgan/WeWork/Enron) to the winning pattern; (3) RETIRE the money-mindset tip shorts (salary trap / 24-hour rule / raise-that-keeps-you-broke — 7-20%, tanking the avg).**
- **HOOK REWRITES DONE (Sep 17 2026):** rewrote the frame-0 `hook` + `beat[0]` VO for the 3 worst recent builders to the winning PEAK->COLLAPSE + hard-number + short-time-window pattern (all py_compile OK):
  - **build_morgan_v2.py** (was 9%): hook `["He locked the richest","men in a room."]`, VO leads with the locked-in-the-library image (was abstract "saved the economy alone").
  - **build_wework_v2.py** (was 15.8%): hook `["Worth $47 billion.","Gone in 6 weeks."]` (was 3-line "It was worth $47B / then it imploded").
  - **build_enron_v2.py** (was 27.1%): hook `["A $70 billion giant.","Gone in weeks."]` (was 3-line "America's 7th biggest company / all a lie").
  - **HOOK STANDARD baked into the template** (`build_wework_v2.py` comment block above `SHORTS=[`): frame-0 = EXACTLY 2 lines peak->collapse + hard number + time window; beat[0] VO restates it + leads with the most visceral concrete image, no "In 20XX" setup; catastrophic verb (LOST/GONE/VANISHED/IMPLODED/DIED BROKE/CRASHED); NO money-mindset tip shorts. **Winners this is derived from: Nokia 65.4% / Vanderbilt 61.3% / Mansa Musa 61.3% / Toys R Us 60.9%.**
  - **NOT YET REBUILT/RE-UPLOADED.** The 3 are already live (public) — rebuilding replaces the file but a re-upload = a NEW video (new URL, resets analytics). DECISION NEEDED: rebuild+reupload the 3 as fresh videos, OR just apply the locked hook standard to all FUTURE builds and leave the live 3 as-is. Kokoro re-VO needed if rebuilt (beat[0] text changed).
- **RETENTION FEATURES #1 + #2 SHIPPED (Sep 17 2026) in build_wework_v2.py (reference builder) — competitor-derived (see COMPETITOR_ANALYSIS.md retention section):**
  - **(1) TRUE SEAMLESS LOOP:** tail_still now cut at `-ss 0` (EXACT frame 0, was 0.3s in); tail zoompan changed to zoom OUT 1.10->1.0 so its FINAL frame lands on frame-0 scale → near-invisible restart (re-watch lever; competitors' biggest retention trick). VERIFIED: last frame == frame-0 composition. TODO for full narrative loop: make each short's LAST beat VO a near-verbatim call-back to the hook line (script-side, per-short).
  - **(2) `source:` MICRO-OVERLAY:** new `source_png()` helper + optional `"source":"<citation>"` field on a short → small gold-accented "Source: ..." card, bottom-left, fades in/out ~1.4s just after the punch beat (input [10], conditional in the filtergraph). Credibility beat + 2025/26 inauthentic-content policy insurance; nobody in the lane does it. WeWork given `"source":"WeWork S-1 filing, 2019"`. VERIFIED rendering on the rebuilt short.
  - Both documented in the HOOK STANDARD comment block. REBUILT + VERIFIED end-to-end: `prototypes/short_wework.mp4` (32.2s, 1080x1920, Kokoro re-VO, new hook + loop + source all correct). **TO PROPAGATE:** port the seamless-loop edit (tail -ss 0 + zoom-out) and the source_png/`source:`/[10]-input block to the other v2 builders (enron/morgan/bella/zodiac/etc.) as they're touched; add a real `"source":` citation per short.
- **POD:** new IP/port every restart (now 213.192.2.111:40102); container SSH key wiped each restart → re-add pubkey via web terminal each time.
- **Image-source option (open):** user wants no watermark + better quality. Best free path = **Together.ai FLUX.1-schnell-Free** (needs a free Together API key from the user; hosts together/fal/stability are reachable but all need keys — none on disk). If user provides a Together key, switch gen_*.py from Pollinations to Together FLUX (clean, no watermark). New builds: target ~30s.

## 10. Current status / open TODOs
- **V3 batch (Oct 20 2026, `empires_short/V3_BATCH_BRIEF.md`):** all 6 rendered and **waiting at Gate 2** (Flight 19 approved with shot-2 swap, re-rendered). Final files `empires_short/out/{nightfile_flight19,nightfile_voynich,nightfile_collapsiblea,aurelis_fisher,aurelis_tulip,aurelis_newton}.mp4`; manifest entries in `nightfile_manifest.json` + `aurelis_{fisher,tulip,newton}_short.json` (no `uploaded`, pinnedComment field included); record in `empires_short/experiments/v3_test_2026-10.json`. Publish per brief §4: Day 1 Flight 19 + Newton, Day 2 Collapsible A + Tulip, Day 3 Voynich + Fisher. Gate 2 round 2 (Oct 20): Flight 19 + Voynich approved; Newton re-voiced (+6 words, atempo 0.92, 34.1 s), Tulip fallback ending (22.1 s, stamp dropped), Collapsible A + Fisher reframed (`fit: "contain"` near the top lifts a low subject above the hook card; `nyt_banner.jpg` crop). All 6 approved. **Uploaded 2026-10-20, scheduled 05:00 PKT (2026-10-20T00:00Z):** Newton → Aurelis HQ https://youtu.be/ayECFmpsvpY . Flight 19 → The Night File https://youtu.be/DuxwoL44jvk (same slot; title shortened to 98 chars — YouTube max 100). **ACCIDENT:** the first Flight 19 attempt hit invalidTitle and upload_yt.py moved on to the next entry, uploading **Voynich early as PRIVATE, unscheduled** (https://youtu.be/GFGIg9AFpN8). **Day 2 uploaded 2026-10-22 00:07 PKT, scheduled 05:00 PKT (2026-10-22T00:00Z):** Collapsible A → The Night File https://youtu.be/FHV6ch_kh60 (title shortened to 87 chars); Tulip → Aurelis HQ https://youtu.be/JsV6ntY_2S0 . **Day 3:** Voynich (GFGIg9AFpN8) scheduled by the user in Studio; Fisher → Aurelis HQ https://youtu.be/1SjIywDzAcE scheduled 2026-10-24T00:00Z (title shortened to 89 chars). All 6 V3 Shorts now uploaded. Tokens expire (invalid_grant) and need browser re-auth roughly weekly. Day 2: Collapsible A + Tulip; Day 3: Voynich + Fisher. Image licences: commons.wikimedia.org is unreachable, but the en.wikipedia API (`prop=imageinfo&iiprop=extmetadata`) returns Commons licences + download URLs via curl (Python DNS fails; curl works with network enabled).
- **⭐ ACTIVE WORK (Sep 18 2026) = the flat-vector engine (`aurelis_vector/`, see PIVOT banner at top).** Aurelis STATUS: engine built + proven (narrated demo renders, Alux-tier character with 4-pose library, captions/transitions/audio all working, bg cleaned). **NEXT: write the first REAL "How Empires Die" script → `scripts/<id>.json`, build any new scene types it needs (data-chart card / map / rising-graph) on demand, render.** The items below are LEGACY (photoreal pipeline) — kept for reference / Night File, but Aurelis no longer uses them.
- **MASS-PRODUCED-SAFETY UPGRADE (Sep 12 2026, per user "make content safer to survive the mass produced content review" + "can't do VO, upgrade the builders"):** added `vid:` real-Pexels-footage beat prefix to the two reference builders (`build_somerton_v2.py`, `build_morgan_v2.py`) so shorts mix real motion footage with AI stills instead of being 100% AI-image+AI-voice. User CANNOT do own VO (not native English) → keep ElevenLabs TTS, de-template via real footage + variety. Verified end-to-end (`build_viddemo.py` → real underwater footage + captions, 1080x1920). **Next: build actual Night File + Aurelis shorts using `vid:` beats and hold for user review before upload.** Also consider more template variation (caption position, opening styles).
- **CORRECTION (Sep 12 2026):** user says **Night File retention is actually FINE** (earlier "~10%" reading was wrong) → KEEP Night File in the rotation, don't pause it. All 3 formats stay live.
- **REDDIT-STORY = spinning up its own channel (Sep 12 2026):** it's the best performer (most views + first 3 subs). Gameplay/background monetization risk now SORTED (Pexels pool, see §NEW FORMAT). Plan agreed: get the clean bg base done [DONE], then create the dedicated "creepy/scary stories" channel + first batch of ~5, hold for review before upload. Channel does NOT yet exist — needs OAuth token like nightfile_token.json.
- [ ] Upload remaining Night File batch: **Sodder** + **Somerton** (built, in nightfile_manifest, not uploaded) — space them out (1/day).
- [ ] Post Hinterkaifeck + Dyatlov (and the rest) to TikTok/IG/FB — captions given per-video in chat.
- [ ] Watch retention on all uploads; the first-1-2s hook is the lever. If horror completion stays low (~20%), cut openings tighter / try ~30-35s.
- Builders/gen scripts for Sodder/Somerton already exist (build_sodder.py, build_somerton.py).
- Queued Night File cases: Dancing Plague, Max Headroom intrusion, Roanoke, Elisa Lam.
- Queued Aurelis business: (Blockbuster/Kodak/Nokia/Xerox/Yahoo/Sears done) — e.g. Pan Am, Toys R Us, MySpace, Atari.

Related file-based memory: `~/.claude/projects/-home-alpha-products-youtube-pipeline/memory/` (MEMORY.md index + the-night-file-horror-channel.md, shorts-retention-hook-first.md, faceless-video-pipeline.md).

## Empires That Died — `empires_short/` (added 2026-09-25)
Standalone Remotion + Tailwind v4 + Recharts + Lucide project (separate from aurelis_vector; does not reuse its visuals).
Data-driven: `src/empire/types.ts` schema, episode data in `src/empire/data/*.ts` (baseline: `blockbuster.ts`, revenue figures approximate — verify).
Obsidian/crimson/gold theme, word-pop spring headlines, frame-driven Recharts "bleeding" area chart, deterministic screen shake on failure beats.
`npm run render` → `out/blockbuster.mp4` (1080x1920, 30.5s, no audio yet). Not uploaded. TODO: VO + music, fact-check numbers.
- 2026-09-25: new `CinematicDataShort` composition (`empires_short/src/cinematic/`): word-by-word kinetic captions (white + #D4AF37 gold keywords), 60-frame camera punch-in loop, neon spring-entry Recharts centerpiece, feTurbulence grain. Character path (`src/alux/AluxExecutive.tsx`) dropped from the blueprint (file kept). Sample: `out/cinematic_blockbuster.mp4`. Captions currently auto-timed by word length — swap in VO word timestamps.
- 2026-09-25: CHOSEN DIRECTION = `EmpireShort` (blockbuster base) + cinematic chart treatment. `blockbuster_v2.mp4` (23.7s): frame-0 hook fully visible, beats 3.2s (Netflix $50M at 2.0s), BleedingChart now dashed ghost trajectory + neon-glow trail, shake + red "STRUCTURAL FAILURE" pill on 2009/2010/2014. `CinematicDataShort` kept as an alternate.
- 2026-09-25 (later): `blockbuster_v3.mp4` (graphics only) + `blockbuster_v3_footage.mp4` (EmpireShortFootage comp, Pexels bg per beat from `scripts/fetch_bg.py` → `public/bg/`). Added per-beat scenes (`node.scene`: split / stores dot-grid / vhs / chart+zoom), chart event markers, cut flash + whip-in + failure glitch, readout punch, procedural SFX (`scripts/gen_sfx.py` → `public/sfx/`: drone, whoosh, impact, tick, glitch). Pexels credits: MART PRODUCTION, Ronie Aristosa, Ron Lach, Jakub Zerdzicki, Kampus Production, cottonbro studio.
- 2026-09-25 (upload prep): FINAL `empires_short/out/blockbuster-short.mp4` (23.8s, 1080x1920/30, loudnorm -15.4 LUFS / -1.9 dBTP, decode OK) from comp `EmpireShortFootage`. Aurelis emblem + wordmark top-left, emblem end card "FOLLOW FOR THE NEXT FALL". User rule: NO "How Empires Die" text on screen and NOT in TTS. Layout kept out of Shorts UI (right rail x>940 y1000–1650, bottom y>1600); chart zoom removed (clipped axes). Manifest `aurelis_blockbuster_short.json` (unlisted, cat 27). Numbers not web-verified (user declined the lookup).
- 2026-09-25 (fact-check done): all Blockbuster figures verified vs SEC 10-Ks as originally reported (2000 $4,960.1M; 2004 ~$6.05B; 2007 $5,542.4M; 2009 $4,062.4M; 2010 $3,240.7M) + press (9,000+ stores 2004, ~$900M debt, DISH ~$320M, corporate stores closed Jan 2014). Sublines fixed: 2007 "Blockbuster bet on stores." (it did NOT ignore streaming — Total Access 2006, Movielink 2007); 2010 "Buried under $900M of debt." `blockbuster-short.mp4` re-rendered. **UPLOADED UNLISTED 2026-09-26: https://youtu.be/kE5_16GRbJ8**; FB copy #13 in FB_DESCRIPTIONS.md.
- 2026-09-26: NightfileHQ template `empires_short/src/nightfile/NightfileDecoder.tsx` (comp `NightfileDecoder`, data `zodiacSample.ts`): CRT scanlines + vertical grid, decoder frame (hash-driven vector glyph matrix + Z408/Z340 decoded / Z13/Z32 scrambling rows) over rotating reticle, hard-cut JetBrains Mono captions with amber step-scale triggers, zero fade at frame 0, safe-zone centred (SAFE_CX=500). Sample `out/nightfile_zodiac_sample.mp4` (15 s, SFX only, no VO).
- 2026-09-26: NightfileHQ case-file template `src/nightfile/NightfileCaseFile.tsx` (comp `NightfileCaseFile`, data `caseFileSample.ts`): mono briefing header, hairline evidence window w/ 1.0→1.03→1.0 linear drift, Inter Black word-by-word captions (11 f/word, inactive 30%, active amber 1.1x), vignette, seamless loop (last frame == frame 0, verified). Evidence `src` optional (built-in document plate otherwise). Sample `out/nightfile_casefile_sample.mp4`.
- 2026-09-26: FIRST case-file Night File Short — **Ricky McCormick's encrypted notes**: `empires_short/out/mccormick-short.mp4` (24.5 s, -14.1 LUFS, decode OK; comp `NightfileMcCormick`, data `src/nightfile/mccormick.ts`). Kokoro am_michael VO (`public/vo/mccormick/`), captions synced to VO word starts, real FBI note scans (Wikimedia, PD) + 2 Pexels photos labelled ILLUSTRATIVE, horror_bed at 0.2, seamless loop (last frame == frame 0 verified). Template `NightfileCaseFile` now supports evidence arrays (`fromWord`), `timings`, `loop`, `vo`, `bed`. Facts: cause of death UNDETERMINED (do not say "murdered"). **UPLOADED UNLISTED 2026-09-26: https://youtu.be/xskEtuPTBS0** (nightfile_manifest.json).
- 2026-09-26: **Blockbuster Short had NO VOICEOVER when first uploaded (kE5_16GRbJ8) — mistake.** Rebuilt with Kokoro bf_emma VO (`scripts/gen_vo_blockbuster.py` → `public/vo/blockbuster/vo.wav` + timing.json; beat atSec/durationSec now derived from VO; SFX ducked under voice). `out/blockbuster-short-vo.mp4` (33.8 s, -15.2 LUFS, Whisper transcript verified). **Uploaded UNLISTED: https://youtu.be/qeYOyV7goSc**. Old kE5_16GRbJ8 marked SUPERSEDED in the manifest — user to delete it in Studio (upload scope can't delete). RULE: never package/upload a Short without VO unless the user explicitly asks for a silent cut.
- 2026-09-27: **Template v2 + BlackBerry Short** `empires_short/out/blackberry-short.mp4` (29.3 s, -14.8 LUFS, Whisper-verified bf_emma VO; comp `BlackBerryShort`, data `src/empire/data/blackberry.ts`, VO `scripts/gen_vo_blackberry.py`). v2 = instant split hook (`hookScene`), `minimal` beats (no icon/subline), `outroOverLast` (no static end card). **Anti-sameness rule (user, re: mass-produced policy): brand stays fixed, visuals vary per episode** — new scene library `components/Scenes2.tsx`: `image` (real photo + counting number), `bigNumber`, `ruler` (timeline), `bars`, plus company objects `keyboardBreak` + `noService` (BlackBerry). Chart now proportional time axis, white readout + ▲/▼ marker (dataviz skill). No two consecutive beats share a layout. Real photo: Bold 9000, Wojciech30 CC BY-SA 4.0. Map graphic NOT built yet. Manifest `aurelis_blackberry_short.json` (unlisted) — NOT uploaded.
- 2026-09-27: Night File **Villisca axe murders** `empires_short/out/villisca-short.mp4` (32.4 s, -14.5 LUFS, Whisper-verified am_michael VO; comp `NightfileVillisca`, data `src/nightfile/villisca.ts`). Per-episode variation: `NightfileCaseFile` evidence now has layouts `window | full | clock | count | checklist` (+ `invert` for maps) — Villisca uses full-bleed → map → clock → count(8, 6 children) → checklist → 1912 newspaper → full-bleed (loop; last frame == frame 0 verified). Images: house CC BY-SA 4.0 (Jason McLaren), Day Book 1912 PD, map CC BY-SA 3.0; Wikipedia attic photo is FAIR USE → not used. Manifest entry in `nightfile_manifest.json` (unlisted) — NOT uploaded. BlackBerry (`aurelis_blackberry_short.json`) also still NOT uploaded.
- 2026-09-28: **Hook upgrades (from Studio: APV up on both — Villisca 68.4%, BlackBerry 75.1% — but stayed-to-watch 29.2% / 27.3%)** built into both templates: frame-0 impact hit (Aurelis already had one; Night File `hitSfx` = `public/audio/boom.wav`) + `hookPunch` 1.04→1.0 over 10 frames (frame 0 still fully composed; Night File loop still frame-identical, verified). Aurelis `prompt` field = on-screen comment prompt during the outro (text only, keeps the spoken loop clean). Script rule: **cold-open on the strangest detail / the contradiction** (see playbooks/NIGHTFILE_PLAYBOOK.md). Applies to NEXT Shorts — live videos unchanged. Manual now: pin a comment question on SWXCm4bDVHE / 1Q4FKQU3YAU.
- 2026-09-28: Built (NOT uploaded) **Lehman Brothers** (Aurelis) `empires_short/out/lehman-short.mp4` 32.6 s, -15.7 LUFS — comp `LehmanShort`, data `src/empire/data/lehman.ts`, VO via new generic `scripts/gen_vo.py scripts/vo/lehman.json`; layouts split→photo+$86→bigNumber −93%→custom `days` weekend cards→photo(HQ on 9/15/2008)+$600B→bars ($600B vs $1.37B); prompt "Could it happen again?". And **Mary Celeste** (Night File) `out/celeste-short.mp4` 32.7 s, -14.8 LUFS (2-pass loudnorm) — comp `NightfileCeleste`, data `src/nightfile/celeste.ts`; full→clock(Nov 7/Nov 25/Dec 4)→count 10 (3 family)→checklist→1873 newspaper→full; cold-opens on the vanished crew; the "untouched dinner/galley fire" MYTH (1883 invention) deliberately excluded. Both Whisper-verified VO. Manifests: `aurelis_lehman_short.json` + last entry of `nightfile_manifest.json` (both privacy public).
- 2026-09-28: **UPLOADED PUBLIC** (API confirmed privacy=public): Lehman https://youtu.be/V71gzCp5hGY (Aurelis), Mary Celeste https://youtu.be/jscux_XXL_o (Night File).
- 2026-09-29: **3D + maps added to `empires_short/`.** New deps: `@remotion/three` + three/@react-three/fiber, `d3-geo` + `topojson-client` + `world-atlas` (Natural Earth, PD), plus `@remotion/transitions`/`motion-blur`/`noise`/`paths` (installed, not used yet). New Aurelis scene `kind: "object3d"` (`src/three/Objects3D.tsx`: `vial` | `phone`, frame-driven shatter, RoomEnvironment reflections, optional counting number) — render with `--gl=angle`. Look test `BlackBerry3D` comp (`out/blackberry-3d-sample.mp4`). New Night File evidence `kind: "map"` (`src/nightfile/MapBeat.tsx`: real coastline zoom + pins + dashed distance line; gotchas: fit the projection to corner MultiPoint, not a Polygon — winding makes d3 fit the whole globe). Ruler: no tick labels within 3 yrs of the ends.
- 2026-09-29: BUILT, NOT uploaded: **Theranos** (Aurelis) `empires_short/out/theranos-short.mp4` (33.0 s, -15.4 LUFS, Whisper-verified bf_emma; comp `TheranosShort`, data `src/empire/data/theranos.ts`, VO `scripts/vo/theranos.json`, manifest `aurelis_theranos_short.json`) and **Flannan Isles** (Night File) `empires_short/out/flannan-short.mp4` (28.5 s, -15.0 LUFS two-pass, Whisper-verified am_michael; comp `NightfileFlannan`, data `src/nightfile/flannan.ts`, appended to `nightfile_manifest.json`; loop frame 0 == 850 verified). Whisper splits "Flannan" → realigned timings manually.
- 2026-09-29: **Per-episode FORMAT rotation (user: last 3 videos had identical structure).** Aurelis `timeline.format` (`src/empire/formats.tsx`): `stack` (old default) | `poster` (Anton headline top-left + mask reveal, scene lower, vertical push + gold wipe, segmented progress, emblem top-right, desaturated freeze outro) | `chapters` (full-screen outlined year card as the cut, typewriter lower-third, left vertical rail, span-card outro) | `dossier` (tilted gold-framed card, Playfair serif, iris reveal, "02 / 05" counter, FALLEN stamp outro). Night File `format`: `casefile` | `tape` (REC/timecode, scanlines, subtitle-box captions) | `polaroid` (UNSOLVED stamp, pinned tilted polaroid per exhibit, Special Elite typewriter captions). Used: Theranos=poster, Flannan=polaroid. NEXT: Aurelis=chapters, Night File=tape. Both re-rendered. **UPLOADED PUBLIC 2026-09-30: Theranos https://youtu.be/xbjB76UAkEw (Aurelis), Flannan https://youtu.be/Hp5_V_92vhM (Night File)**; FB #18–#19.
- 2026-09-30: Theranos Studio (18 h): stayed-to-watch **63.6%** (typical 20.7–34.4%) but APV 52.1%, drop-off at ~17 s mid-point. Applied to next Aurelis: shorter (~23 s), shorter lines + 0.1 s VO gaps + speed 1.16, **spoken loop** (outro "And that's the story of how…" → hook), pin a comment question. BUILT, NOT uploaded: **Quibi** `empires_short/out/quibi-short.mp4` (23.3 s, -14.5 LUFS, Whisper-verified; comp `QuibiShort`, data `src/empire/data/quibi.ts`, VO `scripts/vo/quibi.json`, format `chapters`, manifest `aurelis_quibi_short.json`). Next Aurelis format: `dossier`.
- 2026-09-30: Flannan Studio: 174 views, **80.2% APV**, 34.4% stayed-to-watch (typical), 5 likes, 0 comments. Night File template now has `hookCard` (bold frame-0 card over the evidence until word N + `audio/static.wav` burst) + `OpeningGlitch` (frames 1–8, frame 0 clean, loop intact) + `prompt` (amber theory pill from word N). BUILT, NOT uploaded: **D.B. Cooper** `empires_short/out/cooper-short.mp4` (27.1 s, -15.2 LUFS, Whisper-verified am_michael, loop frame 0 == 810 verified; comp `NightfileCooper`, data `src/nightfile/cooper.ts`, format `tape`, in `nightfile_manifest.json`). Night File river-scale maps don't work (Natural Earth land has no rivers) — use clock/timeline beats instead. Next Night File format: casefile or polaroid (not tape).
- 2026-10-01: **UPLOADED PUBLIC: Quibi https://youtu.be/fFnUTb5C18Q (Aurelis), D.B. Cooper https://youtu.be/Atc1j0IW4Ns (Night File)**; FB #20–#21. Pin comments manually in Studio.
- 2026-10-02: **Retention rules applied to both templates** (see playbooks/NIGHTFILE_PLAYBOOK.md "Retention rules"): Aurelis hook ≥118px in chapters/dossier, `promptAtSec` mid-video prompt pill, loop bridge (last 8 frames dissolve into the frame-0 hook) for non-stack formats; Night File hook card moved into the caption slot (captions hidden meanwhile), prompt pill single-line. New Aurelis scene `loopTimer` (`components/LoopTimer.tsx`). BUILT, NOT uploaded: **Vine** (Aurelis, dossier, question opener) `empires_short/out/vine-short.mp4` (24.25 s, -14.4 LUFS, Whisper-verified; `aurelis_vine_short.json`) and **MH370** (Night File, casefile, statement opener) `empires_short/out/mh370-short.mp4` (30.1 s, -14.9 LUFS, VO sped 1.15x, loop frame 0 == 900 verified; in `nightfile_manifest.json`). Next formats: Aurelis poster/chapters (not dossier), Night File polaroid/tape (not casefile).
- 2026-10-02: **UPLOADED PUBLIC: Vine https://youtu.be/YhLjQDKJwnY (Aurelis), MH370 https://youtu.be/7DOd8G3aJ5w (Night File)**; FB #22–#23.
- 2026-10-03: **STRATEGY RESET** (see playbooks/NIGHTFILE_PLAYBOOK.md "STRATEGY RESET"): vidIQ shows person+money+reversal Shorts (432–1,132 views) beat company obituaries (25–214) ~4x; long-form 2–3 views. Next Aurelis Shorts = real people, open on a face, cut every 1–2 s, 35–50 s, twist mid-video, 3-word question. Pause long-form. Needs a new "archival montage" template (portrait push-ins + fast cuts + persistent hook overlay) — not built yet.
- 2026-10-03: NEW template **`ArchivalShort`** (`empires_short/src/archival/ArchivalShort.tsx`): face on frame 0 (hook below the face, docks to a banner at 3.4 s), cut every ~1–2 s with Ken Burns per shot over blurred fill, word captions, number/quote/stamp cards, amber grade → cold grade at `twistAt`, mid-video question pill, 8-frame loop dissolve. BUILT, NOT uploaded: **Andrew Carnegie** `empires_short/out/carnegie-short.mp4` (33.5 s, -14.4 LUFS, Whisper-verified bf_emma; comp `CarnegieShort`, data `src/archival/carnegie.ts`, 23 shots / 18 PD-CC images in `public/img/carnegie/`, manifest `aurelis_carnegie_short.json`). Facts corrected vs vidIQ script: sale $303M (not $480M), ~3,000 libraries. Night File research saved to the playbook.
- 2026-10-03: `ArchivalShort` gains `brand: "nightfile"` (cold B&W grade + blue multiply, amber accents, grain flicker, horror bed + boom) and `question.windows` (short mid flash + final line; captions centred in an 800 px box at y 1360). BUILT, NOT uploaded: **Louis Le Prince** (Night File, question opener) `empires_short/out/leprince-short.mp4` (37.4 s, -14.8 LUFS, Whisper-verified am_michael; comp `NightfileLePrince`, data `src/archival/leprince.ts`, in `nightfile_manifest.json`). Carnegie re-rendered with centred/lowered captions.
- 2026-10-03: **UPLOADED PUBLIC: Carnegie https://youtu.be/k09pWIiKoOM (Aurelis), Louis Le Prince https://youtu.be/uNNHwHHhsrI (Night File)**; FB #24–#25. First Shorts under the strategy reset — compare stayed-to-watch vs the company-obituary batch.

### Oct 4 2026 — Livermore Short (uploaded Oct 4 2026)
- Carnegie Studio (24 h): 1,037 views (10x channel typical), 67.4% APV, but stayed-to-watch 28.8%. Bottleneck = first 2 s swipe.
- Research (1of10 / vidIQ / JoinBrands 2026): swipe decision in first 2 s; open on conflict + payoff, no logo/intro on frame 0, immediate motion; community benchmark 70–80% viewed = working.
- ArchivalShort changes: AURELIS emblem hidden until 3.6 s; new `hookTop` prop (hook sits below face; captions hidden while big hook shows); new Shot `fit: "contain"` for low-res portraits; final question window pill 58px.
- `src/archival/livermore.ts` / comp `LivermoreShort` → `empires_short/out/livermore.mp4` (39.7 s, -14.5 LUFS, Whisper-verified). Question opener ("How do you make $100M in a crash and still go broke?") — A/B vs Carnegie statement opener. Manifest `aurelis_livermore_short.json`. Pin: "Skill or luck? 👇"
- Le Prince Studio (21 h): 342 views, stayed 40% (channel best; typical 32–35%), APV 132.8% (loop works), 0 comments.
- Night File Theodosia Burr (uploaded Oct 4 2026): `src/nightfile/theodosia.ts`, comp `NightfileTheodosia`, format polaroid (rotated away from Le Prince's archival), STATEMENT opener (A/B vs Le Prince question), face + hook card on frame 0, evidence switch every ~1.5–2 s + route map → `empires_short/out/theodosia.mp4` (38.6 s, −15 LUFS, loop cmp OK, Whisper-verified). Manifest entry appended to nightfile_manifest.json. Pin: "Storm, pirates, or wreckers? Drop your theory 👇"
- Uploaded Oct 4 2026: Livermore https://youtu.be/4j9170Wx4UY (Aurelis), Theodosia https://youtu.be/VlYRG-ageF8 (Night File). FB #26/#27.
- **INCIDENT Oct 4 2026:** Theodosia was uploaded with `--token nightfile_token.json` but landed on AURELIS (VlYRG-ageF8, user deleted it). The token (upload-only scope) can't be inspected, so the cause is unconfirmed (likely the OAuth consent picked the wrong channel). FIX: `upload_yt.py` now requires `--expect-channel "<exact title>"` plus youtube.readonly scope, and aborts if the token's channel doesn't match. Both tokens must be re-consented once (browser). Theodosia re-upload is pending; its manifest `uploaded` field has been cleared.
- Both tokens were re-consented with readonly scope and verified: token.json → "Aurelis HQ", nightfile_token.json → "The Night File". Theodosia was re-uploaded to The Night File: https://youtu.be/VzcKvEAP_LI. Upload commands now always take `--expect-channel "Aurelis HQ"` or `--expect-channel "The Night File"`.
- **Studio results, ~18–19 h (Oct 5 2026):** Livermore: stayed 43.2% (Carnegie 28.8%), APV 48% (below typical); viewers drop during the 1906–07 setup, and the twist at 25.8 s comes too late. Theodosia: stayed 28.8% (Le Prince 40%), APV 60%.
  → Question opener + full-bleed face on frame 0 won on BOTH channels (Livermore 43%, Le Prince 40%). Statement opener / small framed visual lost (Carnegie 28.8%, Theodosia polaroid 28.8%).
  → Next builds: question opener, full-bleed image at 0:00, twist by 12–15 s, cut the milestone list to one beat, 0 comments everywhere so the question must be sharper/binary.
- **Oct 5 2026 builds (UPLOADED: Durant https://youtu.be/92vKF92541A on Aurelis HQ, Arnold https://youtu.be/12G595DEEI0 on The Night File, both channel-verified; FB #28/#29):** applied the Oct 5 learnings (question opener, full-bleed, twist ≤ ~16 s).
  - Template SFX change in ArchivalShort: the per-cut whoosh is REMOVED. Now `sfx/beat.wav` (soft low thump) plays when a card lands, plus `sfx/riser.wav` into the twist.
  - Aurelis Durant: `src/archival/durant.ts`, comp DurantShort → out/durant.mp4 (29.5 s, −14.7 LUFS, Whisper OK), twist 10.5 s, manifest `aurelis_durant_short.json`. Pin: "Genius or gambler? 👇"
  - Night File Dorothy Arnold: `src/archival/arnold.ts` (ArchivalShort brand nightfile, every shot cover-fit), comp NightfileArnold → out/arnold.mp4 (31.3 s, −14.9 LUFS, Whisper OK), twist 15.9 s, appended to nightfile_manifest.json. Pin: "Ran away or taken? Drop your theory 👇"
- **Oct 6 2026 Studio:** Durant (Aurelis) is the BEST EVER: 1,089 views/21 h, stayed 43%, APV 96% (twist at 10.5 s, 29.5 s length), 0 comments. This confirms question opener + early twist + ~30 s.
  Arnold (Night File) has 0 views after ~1 day. The API shows processed/public/not made-for-kids/no region restriction, so the Shorts feed never tested it. Theodosia has stalled at 151 views. Ask the user to check Studio Restrictions/Checks; don't re-upload a duplicate immediately.
- **Oct 6 2026 builds (UPLOADED + channel-verified: Insull https://youtu.be/NOukITKfdu4 on Aurelis HQ, Bierce https://youtu.be/oCcnCHwc9Z4 on The Night File; FB #30/#31):** ArchivalShort gains a `look` prop ("film" | "vhs" | "ticker", with `lookText`) so format varies per episode while staying full-bleed.
  - Insull (Aurelis, look ticker): `src/archival/insull.ts`, comp InsullShort → out/insull.mp4 (28.7 s, twist 9.4 s), manifest `aurelis_insull_short.json`. Pin: "Villain or victim? 👇"
  - Bierce (Night File, look vhs): `src/archival/bierce.ts`, comp NightfileBierce → out/bierce.mp4 (26.1 s, twist 14.7 s), appended to nightfile_manifest.json. Pin: "Shot, or planned it? Drop your theory 👇"
- **Oct 7 2026 Studio:**
  - Insull: 287 views, stayed 47.4% (Aurelis best), APV 54%. The audience leaves mid-story: too many post-twist events (collapse → flight → arrest → trial → acquittal).
  - Bierce: 173 views, stayed 44.7% (Night File best), APV 69%, first comment. The channel's distribution is fine, so Arnold's 0 views was a one-off.
  - Durant (APV 96%) had a tight post-twist run ending on one vivid image (the bowling alley).
  - NEXT: max ~3 beats after the twist, each with a number/stamp card; no process/legal steps. Add a VERBAL loop: the last line runs grammatically into the opening question.
- **Oct 7 2026 builds, first Shorts with a VERBAL loop (UPLOADED + channel-verified: Drew https://youtu.be/jF2XRPByXJc on Aurelis HQ, Miller https://youtu.be/w7gmLIn_sqs on The Night File; FB #32/#33):**
  - Drew (Aurelis, look film): out/drew.mp4, 23.3 s, twist 11.5 s, manifest aurelis_drew_short.json. Pin: "Genius or crook? 👇"
  - Glenn Miller (Night File, look film): out/miller.mp4, 28.7 s, appended to nightfile_manifest.json. Pin: "Fog, or friendly bombs? 👇"
  - Wikimedia upload.wikimedia.org returned 429s for ~20 min. Retry loop with 2-min sleeps works.
- **Oct 8 2026 Studio:** Drew stayed 46.4% / APV 75% / 581 views (the loop helped APV vs Insull 54%, but Studio flagged that "Now ask yourself:" sounds cut off). Miller (Night File) stayed 43.4% / APV 67% / +2 subs. Aurelis 28-day average: stayed 37.8%, APV 78.9%.
  The 60%+ stayed-to-watch Shorts are all from SEPTEMBER: Mansa Musa 61.5%, Nokia 65.4%, Vanderbilts 61.3%, Toys R Us 60.9%. They differ from the current ones in:
  (1) ElevenLabs "Alice" voice instead of Kokoro;
  (2) a superlative + paradox statement with a catastrophic verb ("The richest man ever gave away so much gold…");
  (3) riser + boom on the frame-0 hook.
  ElevenLabs free tier: 1,875 chars left (resets on the date shown by `date -d @1791620588`).
- **Oct 8 2026 builds, the superlative/paradox STATEMENT-opener test (UPLOADED + channel-verified: Hetty https://youtu.be/ar-98pd9ZGE on Aurelis HQ, Cyclops https://youtu.be/SU1WI00LY1E on The Night File; FB #34/#35):**
  - Template: frame-0 `audio/boom.wav` on both brands (+ impact on Aurelis), and `sfx/riser.wav` over the last ~0.9 s so each loop lands on the boom.
  - Hetty Green (Aurelis, ticker): out/hetty.mp4, 21.2 s, loop "And yet, until the very end," → "the richest woman in America wore…". Manifest aurelis_hetty_short.json. Pin "Genius or miser? 👇"
  - USS Cyclops (Night File, vhs): out/cyclops.mp4, 26.6 s, loop "…nobody can explain how" → "a giant navy ship vanished…". Appended to nightfile_manifest.json. Pin "Storm, or sabotage? 👇"
- **Oct 9 2026 Studio:**
  - Hetty (statement opener): stayed 47.4% (same as the question openers, so opener style is NOT the lever), APV 51%, with drop-off at the abstract Panic-of-1907 beat.
  - Cyclops: FLOP, stayed 19.4% / APV 36%. Frame 0 was a distant ship in fog with no face, and the first words were vague.
  - Web research: (a) a faceless-history experiment found visuals changing every 5–7 s beat 2–4 s (80%+ APV, lower swipe); ours cut every ~1.2 s. (b) Pattern interrupts every 8–12 s. (c) Open loops planted early and paid off. (d) Caption every word.
  - NEXT TEST: slower shots (3–5 s each, with motion inside the shot), a mid-video re-hook line at ~40% ("But that's not the strangest part."), concrete/human details only, and ALWAYS a face on frame 0.
- **Oct 9 2026 builds, the SLOW-PACING + mid re-hook test (UPLOADED + channel-verified: Ponzi https://youtu.be/z4mA6qaOGBE on Aurelis HQ, Crater https://youtu.be/Ey0xzSARmB4 on The Night File; FB #36/#37):** shots of ~3–4 s (vs ~1.2 s), "But that's not the strangest part." at ~45%, face on frame 0, concrete details, complete-sentence loop.
  - Ponzi (Aurelis, film): out/ponzi.mp4, 28.0 s, manifest aurelis_ponzi_short.json. Pin "Genius or fraud? 👇"
  - Judge Crater (Night File, film): out/crater.mp4, 28.8 s, appended to nightfile_manifest.json. Pin "Ran, or silenced? 👇"

### Studio @21h — Ponzi / Crater (2026-10-10)
- Ponzi (Aurelis): 9 views, stayed 50.0% (best ever on Aurelis), APV 106% (30s on 29s). Slow shots + mid re-hook look positive; sample is tiny.
- Crater (Night File): 29 views, stayed 52.0% (best ever on NF), APV 55.8% (below 61–65% typical). Drop at 15–18 s on the "nearly a month passed" time jump.
- Learnings: dated/number hooks + face on frame 0 now reliably give 50%+ stayed. Never narrate a time jump as a slow lull; skip straight to the next clue. Reach (views) is now the bottleneck, not the hook.
- Uploaded Oct 10 (channel-verified): Kreuger https://youtu.be/XgPF6B01Pc4 (Aurelis HQ), Earhart https://youtu.be/Vg6z0DVG3_8 (The Night File); FB #38/#39. Built: KreugerShort → empires_short/out/aurelis_kreuger.mp4 (28.0 s, ticker; manifest aurelis_kreuger_short.json) and NightfileEarhart → out/nightfile_earhart.mp4 (33.5 s, vhs; appended to nightfile_manifest.json). Test: no time-jump lull + VO ends on the spoken question that matches the pinned comment. Ticker tape moved to top 340 (was clipping docked hook line 2).
- Studio Kreuger (Aurelis): 156 views, stayed 34.6% (vs Ponzi 50% on only 9 views), APV 74.9% (21 s / 28 s), 7 likes, +1 sub. Reading: the body + spoken-question ending hold well; the opener was a name + a static fact. Ponzi's opener was a CONTRAST (from $2.50 to $1M a day). Rule: line 1 = paradox/contrast, name later.
- Studio Earhart (Night File, ~18 h): 225 views (above typical), stayed 41.5%, APV 64.1% (21 s / 33.5 s), 3 likes, 2 comments (a real back-and-forth thread). The paradox opener ("loudest signal / nobody saw her") is good. A famous name gave reach. Dip at 18–20 s: the "But that's not the strangest part" bridge into the bones. Next: keep NF ≤30 s and land the bridge as a hard beat (an impact sound plus the stamp landing ON the bridge word), with no breath-gap after it.
- Uploaded Oct 11 as UNLISTED (channel-verified): Capone https://youtu.be/Ku-Cji5q1z4 (Aurelis HQ), Fawcett https://youtu.be/ssnu9B_In2c (The Night File); FB #40/#41. Built: CaponeShort → out/aurelis_capone.mp4 (23.4 s, film; aurelis_capone_short.json), NightfileFawcett → out/nightfile_fawcett.mp4 (28.7 s, film; nightfile_manifest.json). Test: contrast line 1, name second, famous person + little-known detail, ≤30 s. NOTE: Tesla (Aurelis, Sep) and D.B. Cooper (Night File, Oct 1) were ALREADY DONE; grep PROJECT_CONTEXT before picking a topic.

## ArchivalShort V2 template experiment (2026-10-12)
- **Opt-in per episode:** `templateVersion: "v2"` + a `v2` block (`hook {lines, until≤3 s, emphasis?, shot?, top?}`, `payoff {at, kind resolved|explanation|unresolved, text, source, show?}`, `overlayDensity`). Leaving it out = V1, verified pixel/bit-identical (28 baseline stills across film/ticker/vhs episodes + full Capone and Fawcett V1 renders, same video and audio md5).
- **V2 behaviour:**
  - The hook shows only during 0–2 s, under the face, then fades out and never docks or repeats. Captions run from the first word.
  - A white flash marks only narrative-role changes (`Shot.role`).
  - One overlay shows at a time (priority hook > payoff > card > question).
  - The ticker and date stamp are hidden at reduced density. The question pill is optional, and a payoff card closes the video.
- **Code:**
  - `empires_short/src/archival/v2.ts`: types, timing helpers, `validateEpisode`.
  - `src/archival/registry.ts`: comp id → props, for tooling.
  - Variants: `capone_v2.ts` and `fawcett_v2.ts`, registered as `CaponeShortV2` and `NightfileFawcettV2`.
- **Checks:**
  - `npm test` runs tsc plus node:test (10 tests). `npm run validate [-- ids]` runs the episode validator.
  - `python validate_script_v2.py scripts_v2/*.json` checks scripts against `playbooks/V2_SCRIPT_SPEC.json`, plus `python -m unittest discover -s tests`.
- **A/B renders:** `python empires_short/scripts/experiment.py <ids>` runs `scripts/finish.sh` (now tracked; same -14 LUFS chain). It writes a contact sheet and a validation report to `out/experiments/`, and an entry to `empires_short/experiments/manifest.json`. It never uploads and never touches the upload manifests.
- Known (pre-existing, unchanged): final renders measure −15.1…−15.3 LUFS, not −14. The raw mix is −18.4 LUFS with LRA 12.4 and true peak −0.19 dBTP. The +4.4 dB linear gain would break the −1.5 dBTP ceiling (and LRA is over 11), so loudnorm falls back to dynamic mode and lands ~1 LU low. Fix later with a limiter before pass 2 or a lower LRA bed, but only as an explicit decision.

## Permanent V2 editorial workflow (2026-10-12)
- **Canonical procedure:** `playbooks/V2_WORKFLOW.md`, linked from `CLAUDE.md`. It covers triggers, Gate 1 (topic pick) and Gate 2 (upload approval), channel profiles, stages 1–7, the quality gate, and a precedence table over the older playbooks, which now carry a "historical reference" banner.
- **Topic discovery:** `research/topics_<channel>_<date>.json` + `validate_topics.py`, which requires ≥10 candidates scored 1–5 on six criteria and the top 3 with a hook and sources. It also warns on topics already in the upload manifests or `FB_DESCRIPTIONS.md`.
- **Script spec:** `playbooks/V2_SCRIPT_SPEC.json` (+ `validate_script_v2.py`) now adds:
  - recommended fields `hook_candidates` (3), `hook_rationale` and `beats` (setup, conflict, evidence, reveal, payoff);
  - an `unsourced-quote` check;
  - per-channel `avoid_phrases` (Aurelis: no "lesson" or "you should" framing).
  - `scripts_v2/capone.json` and `fawcett.json` predate this, so they warn on the missing fields. Not backfilled, to avoid inventing hook history.
- **Analytics:** `record_metrics.py add|summary` → `analytics/metrics.csv`, at checkpoints early, 48h and 7d. Seeded with the four snapshots the user pasted (Ponzi, Crater, Kreuger, Earhart), all marked `early`.
- **Tests:** `python -m unittest discover -s tests -p 'test_*.py'` (15 tests) and `cd empires_short && npm test` (10 tests).

### First V2 production cycle (2026-10-12) — at Gate 2, NOT uploaded
- Gate 1 picks: Night File **Agatha Christie 1926 disappearance**, Aurelis **Richard Whitney**. Research in `research/topics_*_2026-10-12.json`.
- Built `NightfileChristieV2` (`src/archival/christie_v2.ts`, vhs) → `out/nightfile_christie.mp4` (31.6 s) and `WhitneyShortV2` (`whitney_v2.ts`, ticker) → `out/aurelis_whitney.mp4` (36.4 s). Scripts `scripts_v2/christie.json`, `whitney.json`. Report `reports/gate2_2026-10-12_christie_whitney.md`.
- New tracked VO helper `empires_short/scripts/vo_v2.py <ep> <voice> <lang> <atempo> "<text>"`: Kokoro → atempo → faster-whisper → difflib-aligned `words.json` + `transcript.txt`. Whitney uses atempo 1.0 (1.08 gave 3.17 w/s, too fast).
- Manifests ready without `uploaded`: appended entry in `nightfile_manifest.json`, new `aurelis_whitney_short.json`.
- Wikimedia originals often 429; standard thumbnail widths (`/thumb/.../1280px-<name>`) still download.
- **Round 2 (same day, after Gate 2 review):**
  - Both episodes rewritten: Whitney "tried to stop the crash", Christie hook without the alias, plus a documented-vs-disputed ending.
  - V2-only, opt-in template additions:
    - `Shot.credit` (on-screen label for what an image shows);
    - `payoff.style: "hero"` + `kicker`;
    - `payoff.until`;
    - validator warning `hook-echoes-captions`.
  - V1 28/28 stills byte-identical.
  - Round-1 renders in `empires_short/out/gate2_r1/`. Report `reports/gate2_2026-10-12_round2.md`.
  - Round 3: Christie ending condensed to one disputed-explanations line, card removed, 34.2 s (round 2 in out/gate2_r2/).
  - Commons downloads: build the `/thumb/<h>/<hh>/<name>/1280px-<name>` URL from md5(name) when the API is rate-limited.
- **UPLOADED 2026-10-12 (public, channel-verified):**
  - Christie: https://youtu.be/oy6w-LNW8ag (The Night File). FB #42.
  - Whitney: https://youtu.be/olt8XOXJYms (Aurelis HQ). FB #43.
- **⚠ TOKEN FILES ARE SWAPPED (verified by `--expect-channel` on 2026-10-12):**
  - `token.json` → The Night File.
  - `nightfile_token.json` → Aurelis HQ.
  - Always keep `--expect-channel`; it aborted the mismatched attempt with nothing uploaded.
  - Upload also needs `--secret` (the client_secret path is in the upload section above).
- **Next:** record 48h / 7d metrics with `record_metrics.py` from pasted Studio data.
- 2026-10-13: **Hook experiment `hook_test_2026-10` — 8 Shorts built, at Gate 2, NOT uploaded.**
  - **Uploaded 2026-10-18, scheduled 5:00 AM PKT (2026-10-18T00:00Z):** Mallory → The Night File https://youtu.be/OjfAV2iPfjI ; Baby Doe → Aurelis HQ https://youtu.be/HjIoaPyhZs0. All 8 experiment Shorts are now uploaded; next: 48 h / 7 d metrics, then the comparison report.
  - **Uploaded 2026-10-16 ~03:00 PKT, PUBLIC:** Anna Anderson → The Night File https://youtu.be/YbvlMkwh4x0 ; John Law → Aurelis HQ https://youtu.be/6RxUSyWLdcI. Remaining: Mallory, Baby Doe.
  - **Uploaded 2026-10-14 ~05:00 PKT, PUBLIC immediately (user request):** Andrée → The Night File https://youtu.be/GUjAX6uV8jo ; Ward → Aurelis HQ https://youtu.be/P5SuksflOYM. Slot 2 ran 1 day after slot 1 (plan said 2), so exposure differs. explorers.jpg was confirmed PD on Commons. Remaining: Anderson, Law, Mallory, Baby Doe.
  - **Uploaded 2026-10-13 (approved by user), scheduled 4:30 AM PKT (2026-10-12T23:30Z):** Lady Be Good → The Night File https://youtu.be/GV-oM9mET6A ; MacGregor → Aurelis HQ https://youtu.be/9tt1hLEsSq8. Metrics due at 48 h (Oct 15, ~04:30 PKT) and 7 d (Oct 20). The other 6 are not uploaded.
  - Editorial revisions applied 2026-10-13: Lady Be Good hook ("Presumed lost at sea."), Anderson (courts never established), MacGregor (real land, invented nation), Law (bank issuing paper notes), Baby Doe (1893 panic and silver collapse). Four narrations were regenerated and five Shorts re-rendered; QA passed. Anderson 39.9 s and Law 38.3 s are slightly over 38 s. Details: `reports/gate2_2026-10-13_hook_experiment.md`. Still not uploaded.
  - Plan and video list: `empires_short/experiments/hook_test_2026-10.json`.
  - Gate 2 report: `reports/gate2_2026-10-13_hook_experiment.md`.
  - The hook type is recorded per manifest entry: `hookType`, `hook`, `experimentOrder`, `experiment`.
  - Night File, appended to `nightfile_manifest.json`, in order: Lady Be Good (C), Andrée (M), Anna Anderson (M), Mallory (C).
  - Aurelis, in `aurelis_{macgregor,ward,law,babydoe}_short.json`, in order: MacGregor (C), Ward (M), John Law (M), Baby Doe (C).
  - MP4s are `empires_short/out/{nightfile,aurelis}_<ep>.mp4`, with matching `_transcript.txt`.
  - Compositions are registered in `Root.tsx` and `registry.ts`: NightfileLadyBeGoodV2, NightfileAndreeV2, NightfileAndersonV2, NightfileMalloryV2, MacGregorShortV2, WardShortV2, LawShortV2, BabyDoeShortV2.
  - The V2 template was not changed.
  - Confound: both channels run C,M,M,C, because the user chose MacGregor first.
  - **Next:** user approval → schedule in the 3–5 AM PKT window → `record_metrics.py` at 48h and 7d → comparison report after all 8.

### Full video "Money Psychology Explained: 10 Mental Traps" - Gate 1 plan (2026-11-07; nothing generated or uploaded)
`scripts/moneypsych_plan.py` (single source; validates then writes) -> `empires_short/out/aurelis_moneypsych_v2/script.md` (1,349 words, ~9:25 est., claims/source table) and `beats.md` (116 beats: line, library plate + cut-out, overlays, camera). Checks: library filenames exist, no plate/cut-out repeat in adjacent beats, no plate+cut-out pair twice, same plate never repeats its previous camera move, every number is in the source pack. 0 images need generating; optional `mascot_asleep_threeq` $0.025. Tier 2 of the library was cancelled by the user. NEXT after approval: convert to `scripts_v2/<ep>.json` with `claims`, Kokoro VO + Whisper word timings, Remotion composition (AluxTest style).

### Money Psychology full video: Gate 2 build (2026-11-08; local only, nothing uploaded)
"Money Psychology Explained: 10 Mental Traps That Keep Smart People Broke" in the AluxTest style. Pipeline (all scripts in `scripts/`, run with the whop-clipper venv): `moneypsych_plan.py` (narration + beats; writes `empires_short/out/aurelis_moneypsych_v2/{script,beats}.md`) -> `moneypsych_vo.py` (Kokoro bf_emma, speed 1.12 + atempo 1.06, 0.24 s gap per beat; spoken-only respellings for numbers/names; per-beat wavs cached in `out/aurelis_moneypsych_v2/audio/`; `--force` regenerates) -> `moneypsych_whisper.py` (faster-whisper small, word times) -> `moneypsych_check.py` (every spoken number vs script, `number_check.md`; exit 1 on mismatch) -> `moneypsych_mix.py` (bed -22 dB under speech, two-pass loudnorm -14 LUFS) -> `moneypsych_build_data.py` (+ `moneypsych_spec.py` structured overlays) -> `empires_short/src/moneypsych/data.json` -> Remotion comp `MoneyPsych` (`src/moneypsych/{MoneyPsych,props}.tsx`, `entry.tsx`): `npx remotion render src/moneypsych/entry.tsx MoneyPsych out/aurelis_moneypsych.mp4 --crf=18 --concurrency=3` (about 12 min, 400 MB). Then `moneypsych_report.py` (duration, loudness, static-stretch, contact sheet, stills) and `moneypsych_package.py` (SRT + `aurelis_moneypsych.json` manifest entry, private, no `uploaded` field).
Learned: Whisper mishears several surnames (Kuhn, Kooreman, Soetevent, Kapteyn, Skiba, Prelec, Mani) even with respellings: listen to those beats by ear. Library plates have NO baked text (SOLD OUT / CARD / CASH are Remotion tags); `two_houses_new_car` had a BMW-like emblem (painted out, original in `library/raw/*_pre_clean.png`) and `lottery_kiosk` a stray glyph (painted out). Never `pkill -f <pattern>` from the shell tool when the pattern appears in the command itself.
Sources/script edits approved by the user are in `AURELIS_MONEYPSYCH_SOURCE_PACK.md` (trap 1 order). Optional asleep cut-out NOT generated. RunPod spend total for the library: $2.825 (balance about $0.865); tier 2 cancelled.
Gate 2 round 2 (2026-11-08): overlays of a section's last beat now clear 0.4 s early (`last` flag in data.json), title card shows 0-2 s only (mascot beat 1 moved to x=1620), trap-4 bars slate/gold with aligned tracks, `NAMES_IPA` hook added to `moneypsych_vo.py` (empty until the user lists mispronounced names; then delete those beats' `audio/line_NNN.wav`, rerun vo -> whisper -> check -> build_data -> mix -> render). Final MP4 `empires_short/out/aurelis_moneypsych.mp4` (520.9 s, -14.0 LUFS). Manifest `/home/alpha/products/youtube-pipeline/aurelis_moneypsych.json` (private, not uploaded).
Typography pass (2026-11-08, stills only, full render NOT yet done): `empires_short/src/moneypsych/theme.ts` = the only fonts for this video (Fraunces Bold for big numbers/title/chapter names; Inter SemiBold/Bold for all else; no Space Grotesk, no Fraunces Black). Pills = Inter Bold 40 px-class, #1E1612 on gold. Tracker/chip are rendered last (above dimming overlays) which removed the faint ghost "10". NAMES_IPA in `moneypsych_vo.py` = Kapteyn kæptˈIn, Skiba skˈibɑ (Whisper still hears "Captain"/"Skibar": judge by ear). Review stills + phone sheet: `empires_short/out/aurelis_moneypsych_v2/typo/`.
FINAL RENDER (2026-11-08): `empires_short/out/aurelis_moneypsych.mp4` 521.0 s, -14.0 LUFS / -1.4 dBTP, 403.7 MB. Source lines shortened (author · journal · year, 36 px; full titles stay in the manifest description), drawn moon removed from the opening (plate moon only), trap-4 caption removed. Review frames `out/aurelis_moneypsych_v2/final/`, phone sheet `out/experiments/AurelisMoneyPsych_phone_sheet.png`. Not uploaded.
Thumbnails (2026-11-08, library only, nothing generated/uploaded): `empires_short/src/thumbs/Thumbs.tsx` (comps ThumbA/B/C, 1280x720); render `npx remotion still src/thumbs/Thumbs.tsx ThumbA out/thumbs/aurelis_moneypsych_thumb_A.png`; sheet `out/thumbs/aurelis_moneypsych_thumbs_sheet.png`.

### Money Psychology long-form UPLOADED + SCHEDULED (2026-11-08 04:51 PKT)
https://youtu.be/zfCzxWiK14k - Aurelis HQ (channel verified), private, `publishAt 2026-11-08T00:00:00Z` (05:00 PKT), category 27, manifest `aurelis_moneypsych.json` (has `uploaded`). Token had expired; user re-consented in browser. STILL MANUAL in Studio: thumbnail `/home/alpha/Downloads/Smart But Broke_ Piggy Bank Panic.png`, captions `empires_short/out/aurelis_moneypsych.en.srt`, pinned comment "Which trap do you fall into most? 👇" after it is live. Open: user's listen of beats 25 (Kapteyn) and 36 (Skiba). upload_yt.py cannot set thumbnails/captions/comments (scope is upload+readonly).

### Aurelis SVG puppet (2026-11-10, free, no generation, local only)
`empires_short/src/puppet/Puppet.tsx` = reusable `<Puppet>` (SVG parts with pivots, front view): expressions (neutral/happy/worried/shocked/angry/thinking/sad) or eyes/brows/mouth overrides; gesture presets (rest, explain, pointLeft/Right, wave, shrug, thumbsUp, celebrate, worriedHead, holdProp) as timed cues `gestures=[{name,from,to}]` (seconds, overlapping cues blend); props via `prop` (SVG node, `propHand`); auto breathing + blink; `talkSrc={staticFile(..)}` makes the mouth follow audio volume (`@remotion/media-utils`, `talkGain` ~6), or `talk` 0..1. Test: `src/puppet/PuppetTest.tsx` (15.6 s, narration beats 43-45 of the Money Psychology video, plate bank_counter): render `npx remotion render src/puppet/entry.tsx PuppetTest out/puppet/puppet_test.mp4`; QA sheet comp `PuppetSheet`, side-by-side comp `PuppetSideBySide`. Outputs in `empires_short/out/puppet/`. Redrawn (the canvas chibi rig in `brand/mascot` has different proportions and is not SVG). Not done: three-quarter view, lip-sync by phoneme (volume only), puppet-specific hand-on-prop gripping.
Puppet tightened (2026-11-10): library frame geometry (459x806, feet y 781), swept asymmetric hair with fringe, wider hem, shorter legs, small round shoes, continuous sleeves with cuffs near the elbow, mitten hands (holdProp fingers wrap over the prop), dark brows with light outline. Extra comps: `SwitchTest` (labelled) / `SwitchTestClean` (6 s library<->puppet cuts, plate bank_counter). Outputs `empires_short/out/puppet/`.
Puppet hybrid head (2026-11-10): head = layer `empires_short/public/img/aurelis/puppet/head_front.png` (rows 0-380 of `mascot_idle_front.png`, eyes/mouth painted out with flat skin #F3D0A1; SVG hair removed); SVG eyes at (161,266)/(279,266), mouth (222,322), brows above; head rotates on neck pivot (218,392). Hands now library-size, curled at rest. Plan for three-quarter (NOT built): same recipe from `mascot_idle_threeq.png` (measure its feature positions, cut head rows, paint out eyes/mouth, add `view="threeq"` with its own torso/arm geometry and a head-turn blend by swapping layers); needs the threeq body redrawn (pocket side, one shoulder foreshortened).
**FRONT PUPPET LOCKED v1.0 (2026-11-10)**: `empires_short/src/puppet/Puppet.tsx` (snapshot `Puppet.v1.locked.tsx`). Final pass: longer/thicker arms (hands hang to about mid-thigh), fuller sleeves with the cuff just above the elbow, bell-shaped shirt widening to the hem, head tilt clamped to +-6 deg (head layer edge never shows), hybrid head from `public/img/aurelis/puppet/head_front.png`. Three-quarter view skipped. Beat-planning rules (puppet = talk/explain/point-at-card/reaction; library = props/movement poses; never cut puppet<->library on the same plate in back-to-back beats): `playbooks/PUPPET_BEAT_RULES.md`. Outputs `empires_short/out/puppet/`.

**PUPPET v1.0 UNLOCKED (2026-11-10, user rejected: legs/shoes join, puffy shoulders, collar, hands).** v2 in progress, NOT locked until the user approves: the body is now CUT FROM THE LIBRARY ART instead of drawn in SVG. `scripts/puppet_cut_body.py` -> `empires_short/public/img/aurelis/puppet/v2/` (`body.png` torso+collar+pocket+legs+shoes, `upper_L/R.png` sleeves with cuffs, `fore_rest_L/R.png` forearm+curled hand, `parts.json`); `scripts/puppet_cut_hands.py` -> `hand_{fist,open,point,thumbs,spread,shrug}.png` cropped from other library cut-outs (angry_front, explaining_front, alux_point_left, thumbs_up_front, celebrate_front, shrug_front; right arm = mirrored). `Puppet.tsx` is the v2 component (pivots: shoulders (120,440)/(320,440), elbows (86,528)/(354,528); breathing 1.25 %; head tilt +-6). Rest pose recomposites to the original art (diff only along the cuff line). `Puppet.v1.locked.tsx` kept only as history.
**PUPPET v3 pose-snap (2026-11-10, UNLOCKED, awaiting approval):** gestures now snap to full library poses with the head removed (`scripts/puppet_cut_poses.py` -> `puppet/v2/pose_*.png` + `poses.json`; explain, pointL/R (mirrored), thumbs, shrug, celebrate, worried, 11 prop poses); puppet head + SVG face drawn on top at the pose's face offset; rest = v2 cut-out body with arm swings (+-8/+-10 deg while talking). Snap = 3 frames, ~3 % squash/stretch, 2-frame anticipation, no crossfade. Comps: `PuppetSheet`, `SnapTest` (10 s). Cropped raised-arm/hand gestures removed (wave gone).
**PUPPET v2.0 LOCKED (2026-11-10, user approved pose-snap with fixes).** `empires_short/src/puppet/Puppet.tsx` (snapshot `Puppet.v2.0.locked.tsx`; v1 snapshot deleted). Rest = v2 cut-out body (talking arm swings +-8/+-10 deg); gestures = pose snaps (3 frames, ~3 % squash/stretch, 2-frame anticipation): explain, pointLeft (only `alux_point_left`, no mirror, pen painted out, library idle shoes pasted), thumbsUp, shrug, celebrate, worriedHands (renamed from worriedHead), holdProp -> 11 prop poses (card = `alux_card_hold_up`, single card). Head layer scaled per sprite to that sprite's own head size and centred on its face; neck filled; every sprite anchored by the leg centre/bottom row. Sprites: `scripts/puppet_cut_poses.py` -> `public/img/aurelis/puppet/v2/pose_*.png` + `poses.json`. Rule added to `playbooks/PUPPET_BEAT_RULES.md`: puppet stands frame-right, card frame-left. Comps `PuppetSheet`, `SnapTest`.

### Money Psychology: 3 vertical Shorts (2026-11-10, local only, nothing uploaded)
`scripts/shorts_build.py` (plan + validation via `scripts/beat_rules.py` + audio + data + manifest) -> `empires_short/src/shorts/{ShortComp,entry}.tsx` (comps Short1/2/3, 1080x1920) -> `out/aurelis_moneypsych_short{1_card_blindness,2_default_trap,3_scarcity_tax}.mp4` (42.2 / 42.2 / 40.9 s, -14.1 LUFS). Render: `npx remotion render src/shorts/entry.tsx Short1 out/...mp4 --crf=18 --concurrency=3` (about 1.5 min each). Narration = verbatim video lines (reordered so the strongest line leads), puppet v2.0 for talk/point/reaction, library cut-outs for prop poses, CTA "ALL 10 TRAPS in the full video" with the puppet pointing (silent 3.4 s). Reports: `scripts/shorts_report.py` -> `out/experiments/AurelisMoneyPsychShorts_{sheet_short1..3,phone_sheet}.png`, `out/aurelis_moneypsych_shorts/{plan.md,gate_summary.json}`. Manifest `/home/alpha/products/youtube-pipeline/aurelis_moneypsych_shorts.json` (private, no `uploaded`; `relatedVideo` = https://youtu.be/zfCzxWiK14k must be set in Studio; pinned comments manual). Never `pkill -f` a pattern that appears in the shell command itself.
Shorts revision (2026-11-10): 28.1 / 28.0 / 29.4 s, -14.1 LUFS; source-reading lines cut, spoken Kokoro CTA "All ten traps are in the full video." (2.6 s), 0.5 s loop tail repeating frame 0, hook on a dark 88 % panel at frame 0, cards/fix/why panels 85 % width in the upper half, puppet 864 px (45 %) lower half. Short 3 hook "MONEY WORRY ≈ A 13-POINT IQ DROP". Phone sheet = hook/card/fix/ending.
**Money Psychology Shorts UPLOADED (2026-11-11 00:0x PKT, Aurelis HQ verified, private + publishAt 05:00 PKT):** Short 1 card blindness https://youtu.be/kD9QHA8tRzM (Nov 11), Short 2 default trap https://youtu.be/j7WJYtP3cWc (Nov 12), Short 3 scarcity tax https://youtu.be/j9pLpxtRIWw (Nov 13). Manifests `aurelis_moneypsych_short{1,2,3}_sched.json`. STILL MANUAL in Studio: Related video = https://youtu.be/zfCzxWiK14k (no API for it), pinned comments.

**Short 2 HOOK TEST (2026-11-12, local only, NOT uploaded):** Short 1 got 6% stayed-to-watch, so Short 2 (default trap) was rebuilt as a hook test. Only the opening changed. `scripts/short2_hooktest.py` (reuses `shorts_build.py`; writes `src/shorts/data/short2_hook.json`, `public/audio/moneypsych_shorts/short2hook_*.wav`) -> comp `Short2Hook` (closeup puppet + `caption` overlay + `sourceFrom` added to `ShortComp.tsx`; Shorts 1-3 unchanged). Opens with a new Kokoro question (bf_emma 1.12 + atempo 1.06, 4.4 s), shocked close-up with push-in, caption "SUDDENLY / START SAVING?", no panel, source line from 2 s. Card 37% at 5.0 s, 86% at 5.8 s. Line 74 dropped to fit. Output `empires_short/out/aurelis_moneypsych_short2_default_trap_hooktest.mp4` (29.4 s, -14.0 LUFS / -1.5 dBTP, Whisper OK). Phone sheet `empires_short/out/experiments/AurelisMoneyPsychShort2_hooktest_phone_sheet.png`. The original Short 2 (j7WJYtP3cWc) is already scheduled/public. If the test replaces it, that needs a new upload.
**Hook test UPLOADED (2026-11-11 21:5x UTC, Aurelis HQ verified):** https://youtu.be/D86McvFqkrY, private, publishAt 2026-11-12T00:00:00Z (the original Short 2 slot). Manifest `aurelis_moneypsych_short2_hooktest_sched.json`. The user must set the original j7WJYtP3cWc to Private with no schedule in Studio, and set Related video and the pinned comment on D86McvFqkrY. Compare its stayed-to-watch with Short 1's 6%.

**Old Money long-form UPLOADED 2026-11-14 to Aurelis HQ: https://youtu.be/LIuFknnHsVg** (private, scheduled publishAt 2026-11-14T00:00Z = 05:00 PKT; user asked to move it to 05:30 PKT, which must be done in Studio because token.json lacks the `youtube` scope for videos.update). Thumbnail `empires_short/out/thumbnails/grandkids_of_the_top_1_didn_t_stay_rich_1.jpg` (made by `scripts/thumb_finish.py`, logo `brand/aurelis_logo.png`); upload_yt.py now sets `thumbnail` from the manifest. Captions SRT + pinned comment still manual in Studio.

**Long-form retention rules (2026-11-14):** `playbooks/LONGFORM_RETENTION.md` (R1 length 7–10 min, 8–10 preferred, no filler; R2 open loop < 0:30 + explicit payoff; R3 rehook every ≤ 90 s; R4 pattern interrupt at each rehook; R5 no wrap-up phrases before the final item, CTA < 10 s at the end; R6 rehooks use pack facts only). Checker `scripts/retention_rules.py` (`retention_errors`), wired into `oldmoney_plan.py` and `moneypsych_plan.py` via a `RETENTION` table (text prefix → rehook/loop/sfx/cta) + `FINAL_ITEM`. Both existing plans now FAIL it (they predate the rules): Old Money = open loop at ~0:47, 0:53–5:02 without a rehook; Money Psych = no open loop, no rehooks marked. New planners must pass it before voicing.

**Old Money late-reveal Shorts (2026-11-15, local only, NOT uploaded):** `scripts/oldmoney_shorts.py` (lines, Kokoro for new lines with the video settings, Whisper timing + number check, mix -14 LUFS / bed -22 dB, rule checks: 20-25 s, close-up + 3-5 word caption at frame 0, key number in the last 25 %, no clue card with the key number, tension beat, spoken CTA last, 0.5 s dissolve to frame 0) -> `empires_short/src/oldmoney_shorts/{OMShort,entry}.tsx` (comps OldMoneyShortA/B/C; A now draws its own vertical guess layer (GuessLayer: 85%-wide options, gold C, 300 px 93%, puppet 45% height; "Lock in your answer." replaced "Most people guess wrong."); `GuessShort` earlier gained optional `cards[].sec`, `closing.sec`, `stampHoldSec`, `noBridge`, `noAudio`, existing comps unchanged) -> `out/aurelis_oldmoney_short_{a_guess,b_myth,c_will}.mp4` (23.4 / 25.0 / 22.7 s, reveal at 82 / 75 / 76 %; C approved 2026-11-15, B hook now HEARD THIS? “70% LOSE IT”). Openings address the viewer (user data point: scarcity-tax Short 50% stayed but 13 s avg of 29 s). Phone sheets `out/experiments/AurelisOldMoneyShort{A,B,C}_phone_sheet.png` via `scripts/oldmoney_shorts_report.py`. Manifest `aurelis_oldmoney_shorts.json` (private, relatedVideo https://youtu.be/LIuFknnHsVg to set in Studio, pinned comments manual). No spend.
**Old Money Shorts SCHEDULED on Aurelis HQ (uploaded 2026-11-15, private + publishAt, 05:00 PKT):** C will https://youtu.be/P8tRALI4PL0 (Nov 15), A guess https://youtu.be/XTFsue0i-88 (Nov 16), B myth https://youtu.be/_1Q-j1srOwY (Nov 17). Related video (old money long-form) + pinned comments still to set manually in Studio. One-entry manifests `aurelis_oldmoney_short_*.upload.json`.

**Aurelis long-form "How the Rich Use Debt to Get Richer" (2026-11-17, SCRIPT APPROVED, Gate 2 pending — local production only, NOT rendered or uploaded):** Gate 1 topic picked from 11 candidates (research `research/topics_aurelis_2026-11-17.json`, scored; top 3 were debt / brain-never-rich / scarcity tax). Central person Bill Hwang / Archegos; planned 8:50, ~1,500 words; voice switch THIS VIDEO ONLY: Kokoro am_michael (language a, atempo 1.1) instead of the Aurelis default bf_emma (b, 1.08) — atempo applied before Whisper so words.json matches the played audio. Retention R1–R6 pass: open loop <0:30 ($20B forced sale), rehooks at 1:20 / 2:50 / 4:20 / 5:50 / 7:20, pattern interrupt at each rehook, no wrap-up before the final item, CTA <10 s at the end. Claims C1–C14 re-verified 2026-11-17 against primary sources (SEC/FINRA alert, Fed G.19, IRS, ProPublica); 3 fixes applied: Example A $116,600 → about $116,700 (exact $116,658.89), Credit Suisse raise $1.9B → $1.92B, ProPublica $401B wealth growth flagged as a Forbes estimate, not an IRS figure. Thumbnails A/B/C (gold-on-charcoal), recommended A "$20 BILLION / SOLD IN DAYS". Archival footage NOT planned — archival-style stills only for the Archegos section. Script package PDF lives in the Muse workspace (goal files), not in git (binary). Next: voiceover + render + quality-gate on the local pipeline machine; upload only on explicit approval, with --expect-channel Aurelis HQ.
