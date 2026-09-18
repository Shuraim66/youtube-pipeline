# Aurelis HQ — Shorts Optimization Playbook
_Business / money / stealth-wealth Shorts (@aurelishq) + aurelispk.com storefront_
_Last updated: 2026-09-10_

> Ties to the real pipeline: builders (`build_*_v2.py`) read the key from `.elevenlabs_key`, hold the voice ID in the `VOICE` constant, and set `model_id`/`voice_settings` in the ElevenLabs request. Change those to apply this spec.

---

## 1. Voice & Audio Configuration (ElevenLabs)

### Voice assignments (real IDs pulled from the account's `/v1/voices`)
| Use case | Character wanted | `VOICE` = |
|---|---|---|
| Money/hustle shorts (default) | fast, punchy, low scroll-away | **Liam** `TX3LPaxmHKxFdv7VOQHJ` ("Energetic, Social Media Creator") |
| Quiet-luxury / stealth wealth | calm, authoritative, deep | **Brian** `nPczCjzI2devNBz1zQrb` ("Deep, Resonant, Comforting") — or **Bill** `pqHfZKP75CvOlQylNhV4` ("Wise, Mature") |

**Not in the library:** "Alex" and "Robert" don't exist on this ElevenLabs account. Punchy alt to Liam = **Charlie** `IKne3meq5aSn9XLyUdCD` ("Deep, Confident, Energetic"). To use Alex/Robert specifically, add them from ElevenLabs → Voice Library, then read their IDs from `/v1/voices`. (Alice `Xb7hH8MSUJpSbSDYk0k2` is the old energetic pick, still valid.)

### Generation constraints
- **Free tier ≈ 10,000 characters/month** (~10–20 shorts). **Real-world note:** this exhausts fast — we've rotated keys several times. When it dies, use the free fallback below.
- **≤ 2,500 characters per request.** Our scripts are ~600–900 chars, so one short = one request.
- **Model:** switch `model_id` to `eleven_turbo_v2_5` (or `eleven_flash_v2_5`) — roughly **half the credit cost** of `eleven_multilingual_v2` with near-identical clarity. Doubles how many shorts the free tier covers.
- **Synthesis sliders** (`voice_settings`): `stability: 0.35`, `similarity_boost: 0.80`, `style: 0.15`, `use_speaker_boost: true`, `speed: 1.05`.

### Free fallback when quota is out (validated, $0, unlimited)
`build_redditstory.py` uses **piper** (local neural voice) + **faster-whisper** for word-timed captions — no ElevenLabs, no quota. Voice quality is a step below ElevenLabs but it never blocks. This can be ported into the Aurelis builders if you want to stop paying/rotating keys.

### Script formatting for human pacing (how ElevenLabs reads punctuation)
- `-` (spaced hyphen) → a short beat/pause.
- `...` → a longer, dramatic pause — use right before a reveal.
- `CAPS` → punch/stress on that word.
- `.` and line breaks → full stops.
- Example: `The raise felt like winning... but it's the exact reason you're STILL broke.`

---

## 2. High-Retention Short — "The Raise That Keeps You Broke"
_Target 30–45s · hook-first · open loop · seamless audio loop (>100% APV)_

### VO script (paste into the builder, ElevenLabs formatting included)
```
The raise that felt like winning - is the exact reason you're still broke.
You got the promotion. Bigger paycheck... same empty account. How?
It's called lifestyle creep. Every time your income rises, your spending quietly rises to match it - the nicer car, the bigger apartment, the upgraded everything.
So you earn more - and you keep exactly ZERO more.
The wealthy do the opposite. When their income jumps, their lifestyle stays FLAT... and that gap becomes wealth.
The whole game is one line: don't spend the raise. BANK the raise.
Because the raise that felt like winning-
```
**Loop:** the final words "the raise that felt like winning-" flow straight back into the first line "is the exact reason you're still broke." → seamless replay.

### Visual direction
- **0–2s:** open ON the hook line as kinetic gold text over a fast paycheck→empty-wallet cut. No intro, no logo, no "hey guys."
- **Cut every 1.2–1.5s:** paycheck → wallet → car/apartment "upgrade" b-roll → a flat lifestyle line vs a rising income line → cash stacking.
- **Captions:** Anton ALL-CAPS, gold word-pop (our `subs()` style), centered/lower-third.
- **Audio:** energetic VO + low music bed; optional whoosh on each hard cut (we have `scratchpad/fugger/sfx/whoosh.wav`).
- **Last frame = first frame** (same visual) to reinforce the loop.

---

## 3. Storefront Copy — aurelispk.com (2 listings rewritten)

> ⚠️ **Fill the `[bracketed]` specs with the watch's real attributes.** Don't claim a material/movement the watch doesn't have — false specs drive returns and kill the "quiet luxury" trust you're building. COD + easy-returns are strong trust levers in the PK market; keep them prominent.

### Listing 1 — "moonston high quality watch avail now"
**New title:** The Aurelis Moonstone — Stealth Luxury Edition

> Understated by design. The Moonstone is built for the person who doesn't need to announce success — the dial speaks quietly, and only the right people notice.

- **Movement:** [quartz / automatic — fill in] for reliable, low-maintenance timekeeping
- **Case & strap:** [stainless steel / genuine leather — fill in], [XX]mm case — substantial without shouting
- **Dial:** minimalist moonstone-tone face, anti-glare, reads clean in any light
- **Water resistance:** [XX ATM — fill in]
- **Wears well with:** business casual to formal — a "quiet flex," not a loud one
- ✅ **Cash on Delivery** across Pakistan · ✅ **Easy 7-day returns** · ✅ Ships in [24–48h]

### Listing 2 — "citizen red interior watch"
**New title:** The Aurelis Chrono — Crimson Dial

> Restraint with one deliberate detail: a crimson dial that catches the light for a half-second and disappears. Precision engineering, zero noise.

- **Movement:** [chronograph — fill in caliber] with working sub-dials
- **Case & strap:** [material — fill in], [XX]mm — balanced weight on the wrist
- **Dial:** deep crimson face with contrast markers — the one flash of color in an otherwise stealth piece
- **Crystal:** [mineral / sapphire — fill in], scratch-resistant
- **Water resistance:** [XX ATM — fill in]
- ✅ **Cash on Delivery** · ✅ **Easy 7-day returns** · ✅ 1-year [movement] warranty

**Positioning line for both / the store banner:** _"Quiet luxury. Loud precision. Aurelis."_
