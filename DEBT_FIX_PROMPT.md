# Prompt — fix round 1 for the AURELIS DEBT long-form ("How the Rich Use Debt to Get Richer")

Pull the latest repo and re-read `playbooks/LONGFORM_BUILD.md` (Known gotchas). Same rules: no upload/schedule/post, no commit/push, no spend, no deleting or overwriting existing files (keep the current `aurelis_debt.mp4` as `aurelis_debt_v1.mp4` and all intermediates as `_v1` copies), never edit `Puppet.v2.0.locked.tsx`, narration wording unchanged (approved script) unless an item below says otherwise. Do not loosen any check or rule; a fix is PASS only if you SEE it in the final render at the named frames, FULL SIZE and at 390 px.

I reviewed the render. Apply these, re-render, stop at Gate 2.

1. **$401 BILLION card (~7:02–7:08, beats 70–74).** The caption "combined, 25 richest Americans — a Forbes estimate, not an IRS figure" prints over the bottom of "BILLION". This is the disclaimer for a contested number, so it must be fully readable. Re-lay the card (smaller figure line, or two-line label above, caption clearly below, card taller if needed). Then inspect EVERY data card in the video at full size (list them with frame times) for figure/caption/divider collisions; fix any other you find.
2. **End card (~9:47–9:55).** "The next fortune is already borrowed." is white text on the mansion image (poor contrast, touches the roofline) and sits tight under "Subscribe to Aurelis.". Give the text a dark scrim/panel or move it onto clear space; keep it in Fraunces, min 36 px; keep the education-only footer.
3. **Title bands on busy plates** ("MORTGAGE INTEREST DEDUCTIBLE", "LEVERAGE MULTIPLIES BOTH", "SHELTERS REAL RENT", and any similar): add a backing panel/scrim or reposition so no text sits on building/street detail. List every title band you checked.
4. **Phone-size legibility.** At 390 px wide, check chapter chips, caption bands, source lines and every card. Report the smallest rendered text size (px at 1080p) and fix anything below 36 px.
5. **Pacing (honest numbers, no check changes).** (a) Beat 15 (12.36 s, longest beat): add a visible pattern interrupt mid-beat (new overlay, camera change or plate change on a spoken anchor) — do NOT change narration. (b) Static stretches: 64.0–66.25 s (beat 10), 53.0–54.75 s (beat 9), 332.0–333.5, 424.75–426.25, 448.75–450.25 — add motion/interrupts inside those windows (count-up, word-by-word caption reveal, slow camera PUSH/DRIFT, never ZOOM on the puppet). Re-run `debt_report.py` and report the real longest static stretch and longest beat; if still over guide, say where.
6. **Number check.** Re-run `debt_check.py` unchanged. Beat 73 will likely still show the Whisper "11" artifact: keep it as FAIL with the RMS evidence. No dedup hacks.
7. **Report accuracy.** Your contact-sheet PASS missed item 1. In `REPORT_v2.md`, for every "verified" claim name the frame time/file you looked at, and say which cards you inspected at full size. Update the SRT/manifest chapter timings only if the re-render shifted them (and say so).

Do NOT change: the thumbnail (I will decide), the manifest sources list, the title, or the narration.

Deliver: `aurelis_debt.mp4` (new) + `aurelis_debt_v1.mp4` (old), `REPORT_v2.md` (PASS/FAIL table, one line per item with frame evidence, workarounds quoted exactly, timestamps), contact sheet + 390 px stills incl. the $401 card, the end card, and the three title bands.
