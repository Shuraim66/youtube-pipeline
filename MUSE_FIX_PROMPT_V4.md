# Prompt for Muse AI — fix round 4 for AURELIS TEST 30 (final polish)

Pull the latest repo and re-read `playbooks/LONGFORM_BUILD.md` ("Known gotchas"). Same rules: no upload/commit/spend, no deleting or overwriting existing files (keep v1/v2/v3 MP4s and all `_v1`/`_v2` copies), never edit `Puppet.v2.0.locked.tsx`, work only in `muse30_*` and `src/muse30/`. Do not loosen any check or rule; a fix is PASS only if you SEE it in the final render at the exact frames named.

v3 is accepted except two items. Apply only these, render `muse_test30_v4.mp4`, stop at Gate 2.

1. **Static stretch (v3 measured 2.25 s at 10.25–12.5 s; guide ≈ ≤ 1.2 s).** Add a pattern interrupt inside beat 2 while the 93% card is up, WITHOUT changing the narration or beat order: e.g. a slow camera move on the plate (PUSH or DRIFT, never ZOOM on the puppet), and/or the caption "did not reach the top 1% themselves" revealing word by word on the spoken words, and/or the 93% figure counting up from 0. Keep the card layout, fonts and min 36 px. Re-measure with `muse30_report.py` and report the real number; if it is still above ~1.2 s, say so and where.
2. **Stamp breathing room.** In v3 the CHALLENGED stamp has only ~5 px of clearance from the "%" / strikethrough tip. Give it at least ~25 px of clear space from the figure, strikethrough, banner, divider and caption (nudge position, e.g. further right/lower within the card; keep 36 px, rotate(-12deg), landing on the spoken word "challenged"). Verify full-size crop at ~19.5 s and 390 px.

Also: keep the beat-4 `PRON` respelling and say in the report whether beat 4 sounds natural when listened to (play it, do not assume).

Deliver: `muse_test30_v4.mp4`, `REPORT_v4.md` (PASS/FAIL table, one line per item with the frame time/file where you saw it, workarounds quoted exactly, timestamps), contact sheet, 390 px stills incl. stamp, and 3 frames from beat 2 showing the interrupt (~9, ~10.5, ~12 s). Loudness −14.0 ±0.3 LUFS, TP ≤ −1.4, duration 28–33 s must still hold.
