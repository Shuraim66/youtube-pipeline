# The Night File — Shorts Overhaul Playbook
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
