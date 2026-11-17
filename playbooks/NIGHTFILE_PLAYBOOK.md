# The Night File — Shorts Overhaul Playbook

> **Status (2026-10-12):** historical reference. New Night File episodes follow [`V2_WORKFLOW.md`](./V2_WORKFLOW.md), which supersedes the ElevenLabs voice sections (Kokoro only) and any rule listed in its Precedence table.
_Horror / mystery Shorts (@thenightfilehq)_
_Last updated: 2026-09-10_

> **Format reconciliation (important):** The Night File's core engine (`build_hinterkaifeck.py` / `build_*_v2.py`) already uses **archival photos + AI atmosphere**, not Roblox/gameplay. The gameplay-background clip you saw was the separate **reddit-story test** (`hUjppOXGUl4`). So "STRICTLY NO GAMEPLAY" = keep Night File on its archival/atmospheric engine, and let the gameplay-story format live on its **own** channel. This playbook is for the archival engine.

---

## 1. Voice & Audio Configuration (ElevenLabs)

### Voice assignment
- **Deep, eerie narrator:** **Daniel** `onwK4e9ZLuTAKqWW03F9` ("Steady Broadcaster" — this IS your "Dan"; verified, already in use). Deep alt: **Brian** `nPczCjzI2devNBz1zQrb` ("Deep, Resonant, Comforting") or **Bill** `pqHfZKP75CvOlQylNhV4` ("Wise, Mature"). ("Robert" is not in the account's ElevenLabs library — add it from the Voice Library if you want it, then read its ID from `/v1/voices`.)
- **Sliders** (`voice_settings`): `stability: 0.50`, `similarity_boost: 0.80`, `style: 0.15`, `speed: 0.95` (slower = more dread).
- **Model:** `eleven_turbo_v2_5` to save credits; free tier ≈ 10k chars/month (exhausts fast — free piper fallback available, see AURELIS_PLAYBOOK §1).

### Audio design strategy (sound = the scare, since there's no face)
Use explicit cue callouts in the script. **Pipeline note:** our builder currently mixes VO + dread music + `boom/whoosh/riser` SFX (`scratchpad/fugger/sfx/`). Per-line cues like the ones below are an **edit-layer TODO** — to honor them exactly, extend the builder to drop a named SFX at a given timestamp. Cue vocabulary:
- `[AUDIO: creaking floorboard]`
- `[AUDIO: sub-bass drop]` — on a reveal
- `[AUDIO: 1s complete silence]` — on the punchline (silence hits harder than noise)
- `[AUDIO: distant whisper]`, `[AUDIO: single heartbeat]`

---

## 2. High-Retention Short — "The Secret Behind the Wall (Phrogging)"
_Target 30–45s · sensory hook · open loop · audio loop_

### VO + audio-cue script
```
The family kept hearing footsteps at night - in a house with no second floor.
[AUDIO: creaking floorboard]
For weeks, food vanished from the fridge. Small things moved on their own. They blamed themselves.
Then one night, the father climbed into the crawlspace with a flashlight...
[AUDIO: sub-bass drop]
and the beam caught two eyes, staring back.
A stranger had been living inside their walls. Eating their food. Watching them sleep. For MONTHS.
[AUDIO: 1s complete silence]
Police call it phrogging - when someone secretly lives inside your home.
And most victims never find out... until they start hearing footsteps at night-
```
**Loop:** final words "footsteps at night-" flow into the opening "in a house with no second floor." → seamless replay.

### Visual direction (NO gameplay / NO Roblox)
- **0–2s:** open on an extreme sensory image — a dark ceiling with a flashlight beam, hook text on frame 0. No context, no "today we discuss."
- **Cut every 1.0–1.5s:** dark floor-plan diagram → flashlight beam in a crawlspace → a vent grille → empty hallway → an archival/real photo with a **red circle callout** → two glowing eyes in black.
- **Grade:** cold, desaturated, crushed blacks, heavy vignette ring, grain (our `HGRADE`).
- **Captions:** Anton ALL-CAPS, **white with blood-red** active-word pop (our Night File `subs`).
- **Ending:** last shot = first shot, to loop.

---

## 3. Editing & Pacing Benchmark — checklist for every Night File short

**Pacing / visuals**
- [ ] Frame change **every 1.0–1.5s** (no clip longer than ~1.6s).
- [ ] **No dead zones** — every 2–3s window has a new image, a zoom-punch, or a caption change.
- [ ] Frame 0 opens on the **densest/most unsettling** image + the bold hook text (readable silent).
- [ ] Varied motion (push-in / pan / zoom-punch), not one slow zoom.
- [ ] Cold horror grade + heavy vignette + film grain on every clip.
- [ ] **Strictly no gameplay/Roblox** backgrounds — archival photos, AI atmosphere, floor plans, flashlight b-roll only.
- [ ] Final frame == opening frame (visual loop).

**Audio**
- [ ] Deep narrator VO, slow (speed ≤ 0.97).
- [ ] Dread bed underneath; layer sub-bass drop on reveals, creaks for tension.
- [ ] **1s of complete silence on the punchline** before the resolution.
- [ ] Loudness normalized to ~ -14 LUFS.

**Typography**
- [ ] High-contrast **white/yellow** captions, black outline (Outline≥6), subtle dark backdrop where needed.
- [ ] Active word pops (scale + red/gold), 2–3 words per cue.
- [ ] Text clear of the bottom progress-bar safe zone.

**Structure / retention**
- [ ] Hook = extreme sensory detail in 0–2s, zero filler.
- [ ] Open loop: resolution withheld until the **last 3 seconds**.
- [ ] Audio loop: last sentence flows into sentence 1.
- [ ] Length 30–45s.
- [ ] CTA/question end card ("What would you do?" / "Who was in the attic?") to drive comments.

## Hook rules (Sep 28 2026, from Studio data on Villisca / BlackBerry)
- **Cold-open on the strangest physical detail** ("Every mirror in the house was covered."), THEN the setup. Studio: the bizarre clues drove completion (Villisca APV 68%); stayed-to-watch (29%) is the bottleneck.
- Frame 0 fully composed (no fade) + **impact hit on frame 0** + a 10-frame 1.04→1.0 punch-in (built into `NightfileCaseFile`: `hitSfx`, `hookPunch`).
- Vary the beat layouts per episode (`window | full | clock | count | checklist`).

## Retention rules (Oct 2 2026 — from Studio data on Theranos / Quibi / Flannan / D.B. Cooper) — BOTH channels
1. **Frame-0 hook text is HUGE in every format (≥110 px), high contrast.** Formats rotate layout, never hook size. (Quibi's 78 px typewriter hook → 16.4% stayed.)
2. **Hook card sits in the caption slot, never over the scroll-stopping visual** (a face, the key object). Captions are hidden while it shows.
3. **Every beat is a new strange detail.** Context/setup and stats go ON SCREEN under the voice; the voice never reads a stats line as its own beat (drop-offs hit at Theranos WSJ stats, Quibi subscriber numbers, Cooper checklist/map).
4. **Comment prompt appears from mid-video**, not at the end (viewers leave ~50–55%). Pin the same question in Studio.
5. **Loop line is a complete sentence** that also leads into the hook ("Neither was he." → "A man hijacked…"), never a dangling "that's how…". Aurelis non-stack formats dissolve the last 8 frames into the frame-0 hook; Night File loops are frame-identical.
6. **A/B the opener**: alternate a question opener and a statement opener across episodes and compare stayed-to-watch. Vine = question, MH370 = statement.
7. Prefer famous names + a concrete catastrophic outcome; keep runtime ~24–30 s.

## STRATEGY RESET (Oct 3 2026) — out of "<500 views jail"
Evidence: vidIQ channel analysis (own data) + 2026 creator guides (Reddit was not reachable from tooling).
**Own data (strongest signal):** Aurelis Sep 9–15 person+money+reversal Shorts (Carnegie "Richest Man Alive Then Gave It All Away" 1,132; Vanderbilt; Toys R Us) = 432–1,132 views. Sep 22–Oct 1 company obituaries (Vine, Quibi, Atari, Theranos, Lehman, BlackBerry) = 25–214. Long-form = 2–3 views. 8 subs / 51 videos. The infographic engine got MORE polished while views fell → visuals weren't the lever, SUBJECT + opening frame were.
Rules from now on (Aurelis; Night File where it applies):
1. **Subject = one PERSON + money + one reversal** ("He was the richest man alive — then gave it all away", "He turned down Netflix and lost $3B"). Companies only through the person who made the fatal call. Name in title + first 2 s.
2. **Frame 0 = a FACE** (archival PD portrait), slow push-in — not a chart, split card or logo. Most striking frame of the video first.
3. **First spoken word within 0.5 s; captions from the first word; hook ≤ 1 short sentence (~3 s)** that opens a gap the ending closes.
4. **Something changes every 1–2 s** (winner had ~12 cuts in first 12 s). Several images per beat with push/pan; beats are not 3–5 s holds.
5. **Persistent short hook overlay** (e.g. "RICHEST MAN ALIVE. GAVE IT ALL AWAY.") the whole way through.
6. **Story shape: status → decision → twist mid-video → payoff that answers the hook.** 35–50 s (the 24–30 s cuts left no room for the twist).
7. **One question answerable in ~3 words**, on screen from mid-video + pinned ("Would you have taken that deal?").
8. **Focus the channel:** stop long-form and off-niche tests on Aurelis until 500+ subs; same niche every upload so the seed audience is right.
9. Track per upload: stayed-to-watch, APV, views at 48 h → keep a table in PROJECT_CONTEXT.
Caveats: vidIQ's title "scores" and keyword volumes are model estimates; "algorithm favors faces (Jun 2026)" is a blog claim, unverified. A 0-view Short is usually not seeded at all — check Studio → traffic source; MH370 (a recent tragedy with deaths) may also be limited as a sensitive event (unconfirmed).

## Night File research (Oct 3 2026 — creator guides + YouTube policy; Reddit not reachable from tooling)
- **Open loop is the format's engine**: named person + key facts + a REAL unanswered question; audiences punish manufactured mystery. Our best (Flannan, 80% viewed) fits this.
- **Lead with the person**: victim/subject name + one human detail before the strange facts → emotional investment (same "person, not event" lesson as Aurelis). Frame 0 = their face/photo when PD exists.
- **Obscure > mainstream**: true-crime viewers already know Zodiac/Cooper/MH370; lesser-known cases perform better. Favour obscure-but-documented cases.
- **Policy/reach**: no crime-scene/aftermath imagery (removed/age-restricted); never AI-simulate real victims; recent tragedies with many deaths (e.g. MH370) risk sensitive-content limits → prefer historical cases. True-crime Shorts RPM is low ($0.03–0.12) — growth channel, not a money channel.
- **Sound**: subtle dread (creaks, abrupt silences) beats loud jump-stings; keep the bed, add one silence drop before the twist.
- **Avoid horror-bait framing** (clickbait titles/thumbnails get suppressed by quality classifiers).
- Next Night File build: obscure historical person-led case, archival-montage style (face on frame 0, cuts every 1–2 s), 35–45 s, real open question, prompt from mid-video.
