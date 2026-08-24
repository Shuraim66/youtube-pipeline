# Producing a video end to end

Everything below has been run on this machine for the Port Royal episode. Paths
assume you are in the repo root.

## 1. Script

```bash
go run ./cmd/script -topic topic_001 -title "The Sunken City of Port Royal" -duration 10
```

The generator validates its own output (`internal/script/validator.go`): banned
phrases, unsourced claims, wrong dates, missing concrete detail, and an
engagement score. Treat a failing score as a signal to regenerate, not as
something to edit around — the model's own claim that it "used only verified
facts" means nothing (Rule 24).

Reviewed output lands in `data/scripts/`. The Port Royal episode ships as
`script_port_royal_validated.json`.

## 2. Narration audio

```bash
python3 scripts/generate_tts.py \
  --script data/voice/port_royal_voice_script.txt \
  --output data/voice/port_royal_voice.wav
```

Two backends:

- **Piper** (preferred): fully local, nothing leaves the machine. Pass
  `--piper-model /path/to/voice.onnx`. You need both the `piper-tts` binary and
  a real voice model — a valid model is several megabytes. Note that
  `/home/alpha/piper-voices/en-us-amy-low.onnx` is currently **14 bytes**, a
  failed download, and the GitHub release URL for it returns 9 bytes from this
  network. Re-download from a working mirror before relying on this path.
- **gTTS** (fallback, used for the shipped audio): **sends the narration text to
  Google's servers.** Fine for public-history scripts, wrong for anything
  confidential. It also narrates at ~250 wpm, so the script time-stretches the
  result with ffmpeg to the `--wpm` target (default 140).

The shipped `port_royal_voice.wav` is 4:12, 44.1 kHz PCM.

## 3. Still images

```bash
python3 scripts/generate_images.py \
  --prompts data/scripts/script_port_royal_validated_prompts.json \
  --output  data/images/port_royal \
  --width 768 --height 432 --steps 20
```

Stable Diffusion 1.5 on CPU, roughly 70 s per image, so ~25 min for 20 shots.
Existing files are skipped, so deleting a single `scene_NN.png` and re-running
regenerates just that shot. Writes a `manifest.json` next to the images.

Three things this pipeline learned the hard way:

- **Diffusion cannot render legible text.** Never prompt for a title card or a
  "SUBSCRIBE" screen — you get garbled lettering. Generate a clean plate with
  negative space and add wording in the editor. Text is suppressed in the
  global negative prompt.
- **Abstract prompts fail.** "Scientific visualization of liquefaction" and
  "animation showing buildings sinking" both produced modern suburbs and rubble
  — the second actively contradicting the narration. Describe a photograph:
  concrete subject, camera position, lighting.
- **Period scenes need their own exclusions.** Add a `"negative"` field to a
  prompt entry to append per-scene terms (`modern buildings, skyscrapers,
  cars`) without affecting the deliberately contemporary shots.

Every image must correspond to something the narration actually says. Scene 11
was originally a Henry Morgan portrait — he died in 1688, four years before the
earthquake, and the script never mentions him. Rules 21 and 22 apply to
pictures, not just prose.

## 4. Diagrams

Processes that diffusion cannot depict get drawn deterministically:

```bash
python3 scripts/make_liquefaction_diagram.py --output data/images/port_royal --name scene_12.png
```

## 5. Rough cut

```bash
python3 scripts/assemble_video.py \
  --prompts data/scripts/script_port_royal_validated_prompts.json \
  --images  data/images/port_royal \
  --audio   data/voice/port_royal_voice.wav \
  --output  data/videos/port_royal_rough_cut.mp4
```

Each scene's `duration_seconds` is a relative weight, scaled so the slideshow
lands exactly on the voiceover length. Adds a slow push-in per shot. This is a
review cut for checking pacing and image-to-narration fit — the finished edit
still wants a real NLE for transitions, music, and titles.

## 6. Metadata

`data/metadata/port_royal_metadata.json` holds the title, description, tags,
chapter markers, and thumbnail text options.

## Checklist before upload

- [ ] Script validates clean and reads well aloud
- [ ] Every image matches a line of narration
- [ ] No invented specifics in either script or visuals
- [ ] Chapter timings match the assembled cut
- [ ] Title and thumbnail agree with what the video actually delivers
