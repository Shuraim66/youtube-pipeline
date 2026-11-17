# Aurelis production improvements (formerly Alux gap backlog)

## Sep 23: Pan Am Short uploaded

The refined Pan Am Short is uploaded Unlisted at https://youtu.be/luVzeRelCRE,
Education category (27). It is a standalone `How Empires Die` episode with no
companion long-form or Related video.

## Sep 22: Money-habits companion Short built locally

`out/money-traps-short.mp4` is a 30-second, 1080×1920 H.264/AAC stereo teaser
with word-synced captions, the recurring Aurelis guide, and a direct Related-video
call to action. It gives one actionable step from the 15-money-traps long-form.
Render, duration, decode, TypeScript and audio checks passed; report:
`out/money-traps-short-review.md`. Uploaded Unlisted on Sep 22 as
https://youtu.be/0mk_mbhkT4E, category Education (27). The clickable Related video
association to https://youtu.be/IwNvOsAiECw remains to be set in Studio; current
OAuth has upload-only scope. Metadata and upload record:
`scripts/money_traps_short.package.json`, `../aurelis_money_traps_short.json`.

## Active direction — production baseline approved

**Sep 21: Rothschild art-direction revision v3 delivered locally.**
Latest: `out/money_habits-v3.mp4`, 15:32.30 at 1080p/30fps. Implemented consistent
ink/patina/brass palette, detailed supporting woman, richer architectural sets and
furniture, physical parchment props, revised bank/meal illustrations, and compact
emblem + Aurelis wordmark. V2 source and previous masters preserved.
All 191 stills reviewed, plus encoded representative scenes and opening motion
samples. TypeScript, 11 regressions, captions, full decode and audio audit passed
(-14.06 LUFS / -1.41 dBTP). Audio stream is byte-identical to v2; all approved
narration/caption/storyboard timing retained. Comparison:
`out/money-habits-v3-before-after.jpg`; delivery: `out/money_habits-v3-review.md`.
Published publicly to Aurelis on Sep 21: https://youtu.be/IwNvOsAiECw.
Custom thumbnail attached Sep 21: `out/money-habits-v3-thumbnail.jpg` (1280x720),
using a short bold hook, wallet/coins focal visual and the established Aurelis
illustration style.
User playback/art-direction acceptance remains.
Technical defect fixes in v2 alone had not established visual consistency; this
separate edition addresses the identified style mismatch.

**Sep 21: money-habits v2 visual correction delivered.**
`out/money_habits-v2.mp4` is complete: 15:32.30, 1080p/30fps, 191 authored views
across the approved narration. Restored/enlarged the original emblem, removed
persistent top-right copy, replaced fixed slide staging, corrected the woman's
standing/seated legs, removed cropped phone closeup copy and separated phone-label
fades. The original v1 is preserved and the silent opening preview is refreshed.
All 191 stills rendered; storyboard sheets and encoded defect-specific samples
reviewed. Full decode and audio audit passed (-14.06 LUFS / -1.41 dBTP), as did
TypeScript, 11 production regressions, captions and timing/cue-sheet checks.
See `out/money_habits-v2-review.md`. User playback/listening review is next;
no upload was performed. This does not close the interaction capabilities below.

**New concrete gap identified by user: character interactions and inhabited settings.**
Fresh Alux frame sequences at 05:06, 09:48 and 13:26 show people working with
props and facing one another; much of the animation is restrained held posing.
Money-habits production now adds a distinct supporting person, two-person desk
staging/document holding, room scenery, and a bank facade illustration. Remaining:
shared document/cash ownership changes, credible handovers, bank-counter exchanges,
and entering a building. See `INTERACTION_REFERENCE.md` for precise status and
reference evidence. The new desk scenes use held poses and restrained motion;
they do not close the full interaction gap. Build with content rather than
restarting parity work.

The user rates the current quality **very good**. Produce content now and improve
quality alongside production. Aurelis does not need to copy Alux completely;
Alux remains an optional reference, not a completion target or release gate.
Older sections below describe implementation history and superseded priorities.

Near-term priorities:
1. Test a specific, compelling first spoken line with a matching opening visual.
2. Strengthen researched story structure, pacing and payoff.
3. Improve voice, acting, sound or typography when a concrete issue is observed
   or a new script needs it. Reuse the approved character and production system.

Prefer one main deliberate experiment per video. Track the hypothesis, what
changed, upload ID, observation window and results. Topic/audience differences
mean sequential uploads are not controlled A/B tests. Do not keep reopening the
completed four-area pass as a prerequisite for new content.

Initial user-reported Rothschild snapshot: 88 views, 35.8% stayed to watch, 32s
AVD. Upload ID/time window unspecified. AVD is 54.2% if the video is the 59s
corrected upload. Sample is small: stronger opening is a candidate experiment,
not an established diagnosis; these results do not measure the newer studio pass.

_User's gap analysis (Sep 18 2026). This is the prioritized backlog for reaching Alux-tier.
**Sequencing principle: ship one real video first, then pull from this backlog based on what that
video actually lacked — don't pre-build all of it (that contradicts "validate Shorts first").**_

## Current status — focused four-area studio pass

Latest local review: **`out/rothschild-studio.mp4`**. This pass addresses the four
specific items the user selected; do not re-list the implemented features below
as missing in future status reports without identifying a concrete new defect.

Final artifact: **60.7667 seconds / 1823 frames**, 1080×1920, 30fps, stereo;
**-14.01 LUFS / -1.69 dBTP**, music ducked **6.24 dB** during speech and
**17.59 dB below voice**. Final encoded-file audit passed. All eight scene samples
and the opening reading motion sequence were inspected. Review audio excerpts
were regenerated from this final file.

| Requested area | Delivered in this pass | Status |
| --- | --- | --- |
| Voice delivery/pronunciation | Clause-specific speeds and pauses for amount/lesson; differentiated ending cadence; whole-word pronunciation aliases; fixed non-monotonic space timestamps in alias alignment | Implementation complete; bf_emma retained; subjective performance acceptance open |
| Music/SFX adjustments | Effects now duck under speech as well as music, with modest 2 dB pre-duck boost to preserve accents between phrases; audit checks the actual mixed effects stem | Engineering pass complete; listening-based tuning remains unverified because the agent cannot listen subjectively here |
| Acting/scene polish | Reading glance with coordinated head/arm, visible pupil and blink, gesture reach/hold/recovery, pen lift after completed signature | Implemented and rendered; scene samples reviewed |
| Typography/transitions | Fixed phrase captions instead of a sliding word window; punctuation/silence/scene boundaries; overlap prevention; eased wipe entry/exit | Implemented; caption regression checks and TypeScript pass |

Phoneme inspection: default `Rothschild` → `ɹˈɒθskIld`, override
`Roths-child` → `ɹˈɒθsʧˈIld`, plural → `ɹˈɒθsʧˈIldz`. This verifies
the intended /ch/ in the engine input; it is not a claim of subjective listening.
Eleven Python regression tests pass. Complete native timestamps are monotonic;
all words have positive frame durations; no scene cue falls back to estimates.
Automatic transcription recovers the revised narration from the mixed programme.

`review_delivery.py` creates `out/rothschild-studio-review/README.md`, a storyboard
and short listening excerpts for the opening, amount, lesson and adaptation.
These make the remaining listening acceptance concrete. The published corrected
version remains the separate earlier artifact recorded below.

## Previous status — Sep 19 directed edition

Latest production review: `out/rothschild-corrected.mp4`, 59.0s; the directed
edition before the pronunciation correction was 58.93s. The corrected version is
published at the URL recorded below. Earlier sections below
are dated history, not the current list of unimplemented features.

| Remaining gap from first pass | Work now delivered | Acceptance boundary |
| --- | --- | --- |
| Voice direction | Per-scene speeds, phrase and scene pauses, same bf_emma identity; native Kokoro alignment with strict text matching | More directed pacing, not human-level emotional performance |
| Character acting | Cue-driven anticipation, nod/brow response, point/present follow-through, open palm, standing anatomy; same character | Hands and expressiveness still require artistic judgment |
| Richer scenes | Atlas, correspondence desk, exchange street, drafting set; distinct adaptation ending | Review at phone size; do not add density merely to fill space |
| Visual storytelling | Relationships-to-capabilities ending with envelope handoff; lesson reveal tied to speech; repeated ending thesis removed | Conceptual metaphor, not measured financial data |
| Sound arc | Varying note patterns/density, market pulse, space around amount and before lesson, continuous ducked mix | Subjective listening not performed by the agent |
| Speech-aware text | Measured word energy/duration modulate selected emphasis; captions stay within scene boundaries | Acoustic salience proxy, not validated linguistic stress detection |
| Long-form infrastructure | Source-hashed, resumable frame-range renders and continuous audio mux; 12-minute range coverage test | No actual 10–12-minute editorial episode has been produced or assessed |
| Consistent process | `PRODUCTION_STANDARD.md`, delivery sidecar, source notes, preserved review editions and timing manifests | New episodes still need research and bespoke direction |

Validation: eight focused tests; TypeScript/Python compilation; native timestamps
monotonic and in bounds, positive word frame durations, continuous scene ranges,
zero cue fallbacks. Full-mix automatic transcription recovered the script including
the names and £4m fact. This establishes an intelligibility check, not listening taste.
The video was also rendered and joined in four 15-second frame ranges: **1768
frames / 58.933s**, matching the unchunked frame count and duration.
Encoded mix: **-14.06 LUFS / -1.71 dBTP**, stereo; speech ducking **6.23 dB**,
music **17.56 dB below voice**. All eight scene samples and standing-gesture
extremes were inspected; overlap corrections were made before final delivery.

**Do not mark “Alux parity” verified.** Implemented feature gaps are substantially
addressed for this Short. Continuous subjective audiovisual comparison, emotional
voice quality, and sustained quality in a real long-form episode remain unverified.
There is no numerical parity score supported by the available evidence.

## Sep 19 pronunciation correction and publication

The TTS-only alias maps `Rothschild` → `Roths-child` and `Rothschilds` →
`Roths-childs`; captions, on-screen text and source spelling remain `Rothschild`.
Native Kokoro timings are mapped back to the display spelling and pass regression
tests. Corrected render: `out/rothschild-corrected.mp4`, 59.0s. Audio audit:
**-14.04 LUFS / -1.68 dBTP**, stereo, 6.21 dB speech ducking.

Published corrected video: https://youtu.be/bzfDABo6zkA. Previous video:
https://youtu.be/XAHb1EufSG4. The upload-only OAuth token cannot update the old
video's privacy; YouTube returned insufficient authentication scopes. A token with
video-management permission is required to hide/delete the old item. No claim of
full one-ID replacement is made until that permission is available.

## Priority order (by real ROI, per honest review)

### ⭐ P0 — Script depth (#4) — FREE, highest lever, do EVERY time
The #1 thing separating Alux from slop AND what YouTube monetizes. No engineering.
- Deeper research → the **non-obvious insight** / counterintuitive truth
- Narrative arc in 60s: hook → problem → insight → collapse/consequence → one-line lesson
- Specific cited numbers (feed the `stat` DataCard + `source` tags)
- Actionable/memorable takeaway

### ⭐ P1 — Visual metaphor library (#2) — highest-value BUILD, on-demand
The main driver of visual VARIETY (retention + non-mass-produced signal). Build each as a
component in `components.tsx` WHEN a script needs it, not speculatively:
- Charts: line / bar / pie (animated draw-on) — for wealth/financials
- Historical timeline; map (locations/expansion)
- Luxury item icons: watch, car, yacht, real estate, jet
- Business process / flowchart diagrams
- Before/after comparison split
- Symbolic metaphors: ladder, bridge, mountain, domino, iceberg

### P2 — Kinetic typography (#5) — high-value, moderate effort
Beyond word-pop: scale-up on stressed words, color shift on key terms, float/bounce-in,
meaning-reinforcing effects ("GROW" grows). Sync to vocal STRESS, not just word timing.

### P3 — More character poses (#1) — good but DIMINISHING RETURNS
Add 8-12 dynamic actions (walking, pointing, gesturing, interacting) via fal.ai (seed 778001 +
same char desc). ⚠️ CAUTION: each fal gen drifts from the character — consistency degrades past
~10-12 poses. Most Alux scenes are metaphor-objects NOT the character, so prioritize #2 over pose count.

### P4 — Brand polish (#6) — ongoing, low-effort passes
Sparingly: gradients, subtle glows, tighter/signature transitions, contrast checks. Continuous, not a project.

### P5 — Audio sophistication (#3) — original priority, superseded Sep 19
Themed SFX (cha-ching/coin/ticker; era sounds; luxury sounds), audio punctuation, custom music,
dynamic music shifts. Real work for a barely-conscious signal, AND it polishes around the AI-voice
weakness rather than fixing it. This initial deferral was superseded by the user's request
after reviewing the real Short; the initial audio pass is now implemented below.

## The trap to avoid
Polishing the engine indefinitely without shipping. Build → ship one real video → critique vs Alux →
pull the NEXT item from this backlog based on what was actually missing.

## Sep 18: Rothschild visual benchmark

The first real script now uses original layered SVG artwork and complete scenes
(`src/Banker.tsx`, `src/RothschildScenes.tsx`). This implements subtle independent
joint/prop motion, a banking office, city correspondence, a reconstructed ledger,
and conceptual financial graphics without paid asset generation. See
`VISUAL_DIRECTION.md` for design decisions and reproducibility.

**Next: critique the rendered Rothschild video.** Alux parity is not established.
Judge illustration quality, hand/arm anatomy, motion, and scene relevance before
buying assets, changing frameworks, or generating a large new pose library.

## Sep 19: Reference comparison — gaps found in the rendered Rothschild Short

Compared the current 49.5s Rothschild render against the downloaded Alux reference
(`pMoCzfIlT8o`) using full-video storyboard samples, close-spaced motion samples,
audio stream inspection, silence checks, and frame review. This was not continuous
listening: music/SFX omissions were reported by the user; stream metadata does not
establish the reference's individual effects or voice processing. These are production
gaps, not a request to clone Alux's artwork.

### P0 — Audio bed and punctuation (missing entirely)

- Current render has one **mono AAC narration stream** and no music or effects.
- The Alux reference has a **stereo AAC mix**; the user identified music and
  sound effects as missing from our version. Exact source stems are unavailable,
  so add musical texture, transitions, and object/graphic punctuation
  with an original low-volume Aurelis bed and a small reusable SFX kit.
- Add an audio bus in `build.py`: narration, music bed, transition whoosh/ink,
  data-card tick/count, map connection ping, paper/ledger movement, and one
  restrained accent on the thesis. Duck music under speech and normalize the
  final mix to the existing -14 LUFS / -1.5 dBTP target. Keep effects sparse;
  silence between phrases is useful and should not become constant noise.

### P1 — Continuous acting and prop motion

- The banker has real independent head/arm/wrist motion in the office, but most
  diagram scenes are still compositions with reveal opacity or line drawing.
- Alux's held poses breathe, lean, gesture, and interact with props while the
  camera/environment continues a small parallax drift. Extend the common rig with
  3–5 brand-safe actions (walk/point, read/write, present, react, hold object)
  and make at least one meaningful character/prop action per narrative beat.
- Animate the actual information: envelopes travel between cities, ledger ink is
  written, the four-million figure counts in, network nodes pulse on arrival, and
  the public-capital grid expands with a sound accent.

### P1 — Layered scene depth and illustration density

- Alux routinely combines foreground character, mid-ground furniture/objects,
  environmental linework, atmospheric accents, and a moving camera. Our scenes
  are clean and readable but often have one dominant flat layer.
- Build a reusable depth recipe: background architecture, mid-ground set dressing,
  character/diagram, foreground desk/papers, and 2–4 restrained ambient details.
  Use it selectively; empty space is part of the Aurelis identity.

### P1 — Scene-to-scene transition language

- The Rothschild pass uses short ink dips. Alux uses designed shape wipes and
  visual handoffs that feel motivated by the story, usually supported by audio.
- Create 2–3 Aurelis transitions (ink fold, brass rule sweep, paper turn) and pair
  each with a matching whoosh/paper hit. Reserve hard cuts for intentional shocks.

### P2 — Character presence across the narrative

- The recurring banker is established, but the Rothschild render leaves the
  character out of map, correspondence, and finance-comparison scenes. Alux often
  returns the same figure as a visual narrator even when a chart or object carries
  the explanation.
- Keep the one-character rule. Add small branded figure appearances or silhouette
  inserts to key explanatory scenes without forcing a character into every frame.

### P2 — Selective kinetic typography and graphic polish

- Our captions are useful word-sync, but the reference uses selective large labels,
  chart annotations, rules, and numbers that enter with the idea they explain.
- Add stress-aware emphasis for one or two words per beat, animated chart labels,
  count-up/underline timing, and a consistent source/citation treatment. Avoid
  making every line bounce; the reference stays editorial.

### P2 — Signature brand ornament and palette discipline

- Alux has a persistent logo treatment plus recurring ornamental linework and
  environmental motifs. Aurelis has the emblem and palette, but not yet a small
  signature motif library.
- Define 3–4 Aurelis motifs (brass rule, laurel/compass mark, paper edge, subtle
  network thread) and use them consistently. This creates identity without
  copying Alux's clouds or exact blue figure.

### P3 — Voice and mix expressiveness

- Kokoro is intelligible and now correctly normalized, but it is a dry mono voice.
  Stereo music and punctuation can improve production; specific room/air and
  compression settings in the reference were not established. A new voice model is
  a separate decision and should not block the visual system.

### Scope note

The reference is a roughly 16.5-minute Alux episode while the Rothschild artifact
is a 49.5-second Short. Compare treatment and craft, not shot count or pacing.
Ship the audio-bed/SFX pass on the next real Short, then re-evaluate the remaining
gaps from audience retention before building a long-form scene library.

## Sep 19: Implemented refinement pass

Review artifact: `out/rothschild-polished.mp4` (49.53s, 1080×1920, 30fps).
This is a local version; the previously uploaded baseline is unchanged.

| Gap | Implemented | Remaining |
| --- | --- | --- |
| P0 music/SFX | Original procedural stereo score; paper, pen, map pings, data ticks, transition accents; speech ducking; final normalization | Listening review for musical taste and effect audibility |
| P1 acting/props | Same rig now has letter/write/consider/present/point actions; traveling envelopes, arrival rings, signature, £4m count, expanding capital grid | More expressive full-body acting when a script needs it |
| P1 depth | Office foreground/background drift, window dust and additional desk detail | Richer bespoke environments beyond the office |
| P1 transitions | Paper-fold, brass-rule and ink wipes with matching sounds | Evaluate pacing in playback |
| P2 recurring guide | Same character appears in map and insight medallions | Continue identity discipline across future episodes |
| P2 typography | Selected phrase emphasis, narration-timed count and underline | Actual acoustic stress detection is not implemented |
| P2 motifs | Brass rule, compass, paper edges, network threads | Apply consistently to future scripts |
| P3 voice | Centered narration, stereo accompaniment, high-pass filtering and loudness control | Kokoro delivery remains unchanged; expressive voice direction remains open |

Visual and sound cues share `production.py` phrase anchors, with reported fallbacks
when script wording changes. Current Rothschild build has no cue fallbacks.
`audio_mix.py` creates original stems locally; no paid service or borrowed samples.
See `AUDIO_PRODUCTION.md` for reproduction and tuning.

Validation: TypeScript/Python compilation and three focused production tests passed.
Final file fully decodes; audit measures **-14.05 LUFS / -2.13 dBTP**, stereo,
with music reduced **6.16 dB** during speech and **17.31 dB below voice** in speech
windows. Scene samples were visually reviewed. These checks do not establish
subjective listening quality or Alux parity. The remaining items above stay open.
