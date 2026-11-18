# Long-form retention rules (Aurelis long-form scripts and beat plans)

Applies to every long-form script and to every `*_plan.py` beat planner (the `oldmoney_plan.py` pattern).
Checked by `scripts/retention_rules.py` (`retention_errors()`); a planner exits non-zero while any rule fails.
Times are the planner's estimates from word count (`dur()`), so they are checked at step 2, before voicing.

| # | Rule | How the checker tests it |
|---|------|--------------------------|
| R1 | **Length 7–10 min, 8–10 preferred.** Never add filler lines to reach it; if a script is short, add a researched item or a deeper finding from the pack, or accept a shorter video. | Error if the estimate is under 7:00 or over 10:00; warning (printed, not blocking) if under 8:00. |
| R2 | **An open loop in the first 30 s, paid off explicitly later** ("this is the one I told you about"). | A beat marked `loop="open"` must start before 0:30, and a later beat marked `loop="payoff"` must exist. |
| R3 | **A rehook every 60–90 s:** a question, "but here's the catch", a teaser for an upcoming item, or a callback to the open loop. | Beats marked `rehook=<kind>` (`question` / `catch` / `teaser` / `callback`). Error for any stretch over 90 s without one, measured from 0:00, between rehooks, and to the start of the CTA. The open loop and its payoff count as rehooks. |
| R4 | **A visual pattern interrupt at every rehook:** new plate, camera punch-in, or a short sound effect. | The rehook beat's plate differs from the previous beat's, or its camera move is a punch-in (`PUNCH…` / `ZOOM…`), or the beat has `sfx`. |
| R5 | **No "to wrap up / finally / in conclusion" (or "wrapping up", "last but not least") before the final item.** The CTA stays under 10 s and comes at the very end. | Error if a banned phrase appears in any beat before the final item's first beat. CTA beats (`cta=True`) must be the last beats and total < 10 s. |
| R6 | **Rehooks may only use facts already in the source pack.** No new numbers, names or claims to create suspense. | Every number in a rehook beat must appear in the source pack (the planner's other checks already cover the rest of the narration). |

## Writing guidance

- Rehook kinds that work: "But here's the catch…", "Coming up: the habit even most wealthy people haven't done", a direct question to the viewer, "Remember habit number three?".
- Place rehooks at section seams (end of an item's lesson or start of the next item) so they don't interrupt a finding.
- The open-loop payoff must say plainly that this is the promised item.
- Close: a short recap is fine, but the CTA itself (comment prompt) is one or two lines at the very end, under 10 s.

## Planner integration

Mark beats in the plan with keyword args to `b()`: `rehook="question|catch|teaser|callback"`, `loop="open|payoff"`, `sfx="<name>"`, `cta=True`, and set `FINAL_ITEM` to the final item's section. The planner passes beats with `start`, `dur`, `plate`, `cam` to `retention_rules.retention_errors(beats, pack_text, final_item_index)`.
