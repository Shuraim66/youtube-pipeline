# V2 Episode Workflow — Aurelis HQ + The Night File

_Canonical procedure for every new Short (adopted 2026-10-12). `CLAUDE.md` points here. Where an older playbook
section disagrees, **this file wins** (see "Precedence" at the end)._

## Triggers

| You say | Claude does |
|---|---|
| `New Night File episode` / `New Aurelis episode` | Stage 1 (topic discovery) → stops at **Gate 1** |
| `New Night File episode: <topic>` (topic given) | Skips discovery, runs a duplicate check, starts Stage 2 |
| `Approve topic <n>` / `Go with <name>` | Stages 2–5 → stops at **Gate 2** with the local render |
| `Upload <name>` (+ `unlisted` if wanted) | Stage 6: upload with `--expect-channel`, FB description |
| `Record metrics` + pasted Studio data | Stage 7: appends rows to `analytics/metrics.csv` |

## Approval gates (hard stops)

- **Gate 1 — topic.** After discovery Claude presents the top 3 and waits. Nothing is researched in depth, voiced or rendered before you pick.
- **Gate 2 — publish.** Claude renders locally and reports the quality gate. Nothing is uploaded, scheduled or posted anywhere until you say so, and the privacy setting (public / unlisted) is yours.
- One version per story is ever published. V1/V2 test variants stay local.

## Channel profiles

**The Night File** — historical mysteries, disappearances, unexplained events, unusual documented cases.
- Lead with what was actually found or recorded (the evidence), then what investigators established.
- Suspense comes from documented facts, never from implied uncertainty. If the case is solved or the explanation is accepted, say so. `payoff.kind = "unresolved"` only when reliable sources say it is unresolved.
- No crime-scene or aftermath imagery, no AI-simulated real people, prefer historical over recent mass-casualty events.

**Aurelis HQ** — historical wealth, business empires, financial scandals, power, extraordinary fortunes.
- Lead with the financial contradiction (small → huge, rich → broke, power → undone) and the decision that caused it.
- One person at the centre; companies appear through the person who made the call.
- End on the concrete outcome (sentence, fortune lost, what the money became). No generic money lessons, no "the lesson is…", no "you should…".

## Stage 1 — Topic discovery (skip only when you name the topic)

1. Gather **≥10 candidates** for the channel from credible sources (Wikipedia + its cited sources, museum / archive / government pages).
2. **Duplicate check:** `python validate_topics.py <file>` flags anything already in the upload manifests or `FB_DESCRIPTIONS.md` (Tesla and D.B. Cooper were nearly redone on Oct 11).
3. Score each 1–5 on six criteria — these are **editorial judgments, not view predictions**:
   `curiosity` (stakes / emotional pull), `contradiction` (strength of the central contradiction or mystery),
   `sources` (reliable sourcing), `visuals` (PD/CC images incl. a usable face), `fit` (works as a 20–35 s story),
   `audience` (fits what this channel's viewers already watch — use `analytics/` rows, don't over-read them).
4. Save as `research/topics_<channel>_<YYYY-MM-DD>.json` (shape below) and run `python validate_topics.py` on it.
5. Present the **top 3** with their best hook, sources and why. **Stop at Gate 1.**

```json
{"channel": "The Night File", "date": "2026-10-12",
 "candidates": [{"name": "…", "summary": "…", "hook": "…", "sources": ["https://…"],
                 "scores": {"curiosity": 4, "contradiction": 5, "sources": 4, "visuals": 3, "fit": 4, "audience": 4},
                 "notes": "…"}],
 "top3": ["…", "…", "…"]}
```

## Stage 2 — Research + script (`scripts_v2/<episode>.json`)

1. Read the sources. Every number, date, name and quotation in the script must come from a source listed in `claims`. **Never invent facts, quotes, numbers or references.** If a popular detail can't be verified (e.g. "100 people died searching"), leave it out.
2. Write **three distinct hooks** (`hook_candidates`), pick one (`hook.lines`, ≤7 words preferred, hard max 10) and write `hook_rationale`.
3. Write the narration as five beats — `setup`, `conflict`, `evidence`, `reveal`, `payoff` (record them in `beats`):
   - line 1 establishes the conflict/consequence — no biography, no "Have you ever…", no "In this video…";
   - every sentence adds new information; no restating the hook; no time-jump lull ("a month passed…") — cut straight to the next fact;
   - end on the factual payoff that answers the hook. A closing question is optional, never required, and never replaces the payoff;
   - target 20–35 s (~2.9 words/s) but don't cram a story that needs 40 s.
4. Fill `payoff {kind, text, source}`.
5. `python validate_script_v2.py scripts_v2/<episode>.json` → **0 errors**. Every warning is either fixed or reported at Gate 2.

## Stage 3 — Assets

- Images only from Wikimedia/Wikipedia with `LicenseShortName` = public domain / CC0 / CC BY / CC BY-SA (never fair use, never "None"). Record each file + licence in the episode file header and credit CC files in the YouTube description.
- A real **face for frame 0**. Crop a head-and-shoulders version when the portrait is full-length or the face sits in a document (`ffmpeg crop`).
- Each image must match what the narration says at that moment.

## Stage 4 — Voice + alignment (unchanged pipeline)

- Kokoro via `kokoro_align.py "<text>" <voice> <lang> <dir>`: Aurelis `bf_emma` / `b` / `atempo=1.08`; Night File `am_michael` / `a` / `atempo=1.1`. **Never ElevenLabs.**
- Apply `atempo` **before** Whisper so `words.json` timings match the audio the video plays.
- Re-transcribe and compare with the script; fix mispronounced names with phonetic spelling (e.g. "Eevar Kroogger").

## Stage 5 — Build + local render

1. `empires_short/src/archival/<episode>.ts` with `templateVersion: "v2"`, a `v2` block (`hook`, `payoff`), `Shot.role` on every shot, few cards (one per beat at most). Register it in `src/Root.tsx` and `src/archival/registry.ts`.
2. `cd empires_short && npm test && npm run validate -- <CompId>` → 0 errors.
3. `python scripts/experiment.py <CompId>` → `out/exp_<CompId>.mp4`, `out/experiments/<CompId>_sheet.png`, validation report, entry in `experiments/manifest.json`.
4. Look at the contact sheet plus stills at the hook (frame 0, ~45), each role change and the payoff.
5. Write the upload manifest entry (`aurelis_<ep>_short.json` / `nightfile_manifest.json`) **without** an `uploaded` field.

## Quality gate (report every line at Gate 2)

| Check | How it is verified |
|---|---|
| Opening gives a reason to watch within ~2 s | hook text + frame 0 still; contradiction/consequence in line 1 |
| Every beat advances the story | `beats` + validator `beat-repeats`; read-through |
| Visuals match narration | contact sheet + role-change stills vs `words.json` |
| Ending delivers what the hook promised | `payoff` text vs hook |
| Sources support claims | `claims[]` + `payoff.source`; validator `unsourced-number`, `unsourced-quote` |
| Captions, overlays, faces don't overlap | `hook-overlaps-captions` check + stills |
| Audio/video timing | `speech-cut`, `audio-tail-trimmed`, ffprobe Δ ≤ 0.15 s, Whisper transcript matches script |
| Licences | every image's licence in the episode header; no fair-use / unknown |
| Loudness | report measured LUFS (currently lands −15.1…−15.3; known, see PROJECT_CONTEXT) |

Anything that fails is reported as a warning or blocker, never silently accepted.

## Stage 6 — Upload (only after Gate 2 approval)

`upload_yt.py --manifest … --token token.json|nightfile_token.json --expect-channel "Aurelis HQ"|"The Night File"`, then the FB description in `FB_DESCRIPTIONS.md`, then update `PROJECT_CONTEXT.md`. No analytics row is created at publish time; rows come only from Studio data you paste (Stage 7).

## Stage 7 — Analytics feedback (`analytics/metrics.csv`)

- At **48 h** and **7 d** after publishing, paste the Studio numbers; Claude records them with
  `python record_metrics.py add --video <id> --checkpoint 48h|7d|early --hours <h> --views … --stayed … --apv … [--engaged …] [--likes …] [--subs …]`.
  Missing fields stay blank — never estimated. Claude has **no direct YouTube Analytics access**; it only records what you paste.
- `python record_metrics.py summary` prints per-channel tables (by template version and hook type).
- Use the table to steer topic and hook choices **as hypotheses**: small samples (often <300 views), different topics and publish times confound everything. Say "suggests", not "proves".

## Precedence over older instructions

| Older rule (source) | V2 rule |
|---|---|
| ElevenLabs voices (AURELIS/NIGHTFILE_PLAYBOOK §1) | Kokoro only (user decision) |
| Persistent hook overlay the whole video (NIGHTFILE_PLAYBOOK reset #5) | Hook only during 0–2 s, then gone |
| Comment prompt from mid-video + pinned question (reset #7, retention #4) | Optional; payoff first. A pinned comment is still fine |
| 35–50 s runtime (reset #6) | 20–35 s target, longer only if the story needs it |
| A cut every 1–2 s (reset #4) | Cuts follow narration beats (~3 s holds with motion); flash only on role changes |
| Captions hidden under the frame-0 hook (retention #2) | Captions from the first word; hook sits between face and captions |
| "Obscure > mainstream" (Night File research) | Score it per candidate (`audience`, `curiosity`); recent data had famous names reaching more viewers — treat both as hypotheses |

Still in force: face on frame 0; one person + money + reversal (Aurelis); cold-open on the strangest documented detail (Night File); no whoosh on every cut; never upload without VO; always `--expect-channel`; PD/CC images only; vary the look per episode; no secrets in tracked files.
