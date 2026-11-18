# Prompt for Muse AI — fix round for AURELIS TEST 30

Pull the latest repo state first and re-read `playbooks/LONGFORM_BUILD.md` (new sections: "Real run order" and "Known gotchas"). Same rules as before: no upload/commit/spend, no deleting or overwriting existing files, never edit `Puppet.v2.0.locked.tsx`, work only in your `muse30_*` copies and `src/muse30/`. Do not change a check or a rule to make something pass; if you must, mark the test FAIL and explain.

I reviewed `muse_test30.mp4`. Fix exactly these, re-render, and stop at Gate 2 again.

1. **Title card overlap.** The brand chip ("AURELIS HQ / AURELIS TEST 30") sits on top of the "A" of the big title, and "AURELIS HQ" is repeated just above the title. Hide the chip while the title card is on screen and remove the duplicate "AURELIS HQ" line. Nothing may overlap the title.
2. **CHALLENGED stamp.** At 36 px it sits on the "%" of the struck-through 70% and touches the red banner. Move it so it does not cover the figure or touch the banner (e.g. lower right of the card, below the figure), keep it legible at 390 px wide, and keep it landing on the spoken word "challenged". Verify at phone size, not only in a zoomed crop.
3. **Beat 3 source pill.** The two-source line wraps to two lines and touches the pill border. Shorten it to one line (e.g. "Williams Group · Grubman 2022 (via InvestmentNews)") while keeping both sources named. Check every other source line for wrapping.
4. **End-card CTA.** Remove "NINE HABITS IN THE FULL VIDEO" (that long-form does not exist). Replace the question "Which one are you starting with?" with a line that makes sense after one habit, e.g. "Which habit would you automate first?". Keep "Education only · not financial advice".
5. **Beat 2 pointing.** The puppet points left before the card appears. Start `pointLeft` only when the 93% card is visible (use the card-in time), explain/neutral before that.
6. **Puppet variation.** Vary the puppet x/scale slightly across puppet beats (e.g. x 1450–1560, height 600–660) so it is not identical in every beat. Keep it frame-right on any beat with a card frame-left. Do not touch the locked rig.
7. **Wave pose.** The new `mascot_wave_front` has open-palm fingers while the library uses mitten hands. Regenerate it with mitten hands (same prompt template, same references, 3–4 candidates, identity checklist, `library_add_image.py` WITHOUT `--force`). Do not overwrite the existing file: add it as `mascot_wave_front_v2` and point the end card at it. Side-by-side vs `mascot_idle_front.png` again.
8. **Number check.** Re-run `muse30_check.py` honestly. Keep only the number-word/digit normalisation. Restore "2022" to the must-be-heard list only if it is spoken; otherwise state that it is on-screen only. Report the two Whisper mishears (beats 4, 5) as FAIL with the G2P evidence — do not rework the check. Alternatively, if the spoken text can be made unambiguous with a respelling in `PRON` (not a wording change), try that and report it as a change.

Then redo the checks that depend on the render: contact sheet + 390 px stills of every card (include the title card and the stamp frame), loudness (-14.0 ±0.3 LUFS, TP ≤ -1.4 dBTP, measured on the MP4), duration 28–33 s, 1920×1080 30 fps.

Deliver: new MP4 `muse_test30_v2.mp4` (keep the old one), `REPORT_v2.md` with a PASS/FAIL table, one line per fix above saying what changed, any workaround quoted exactly, and the timestamps. Be strict: if you could not see the fix in the final render, it is not a PASS.
