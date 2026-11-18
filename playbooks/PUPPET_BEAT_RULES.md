# Puppet vs library cut-out: beat-planning rules (from 2026-11-10; applies to every future long-form / explainer plan)

The front puppet (`empires_short/src/puppet/Puppet.tsx`, locked v1.0) and the library cut-outs (`empires_short/public/img/aurelis/library/`) are the same character, used for different jobs.

**Use the PUPPET for**
- talking beats (mouth follows the narration audio), explaining (explain gesture), pointing at cards (pointLeft/pointRight timed to the key word), reaction beats (shrug, worried hand on head, thumbs up, celebrate, wave), and any beat that needs blinking/breathing for a long hold.

**Use LIBRARY cut-outs for**
- poses with props or movement: sitting, running, walking, holding a piggy bank / phone / receipt / cash / card / ticket / calendar / clipboard / car keys / fence, and any pose the puppet has no gesture for.

**Sequencing**
- A plate may repeat in adjacent beats ONLY when both beats use the puppet (one continuing talking character); library-to-library repeats are not allowed.
- Do NOT cut between puppet and library cut-out on the SAME plate in back-to-back beats (the head matches but the arms/torso differ, so the swap is noticeable). If a puppet beat is followed by a library beat, change the plate (or insert a no-mascot beat) between them.
- Existing rules still apply: no plate+cut-out pair repeated, no plate in adjacent beats, vary camera and overlays.
- In the beat table, mark the mascot column `puppet:<expression>/<gesture>` or the library filename, so `moneypsych_plan.py`-style validators can check the rule.

**Pointing at a card:** the puppet points only with `pointLeft` (the single library pose `alux_point_left`, never mirrored), so the puppet stands FRAME-RIGHT and the data card sits FRAME-LEFT.

**Puppet limits (v2.0)**: front view only; gestures are pose snaps to library poses (explain, pointLeft, thumbsUp, shrug, celebrate, worriedHands, holdProp with 11 prop poses); mouth follows volume (no phonemes); head tilt clamped to +-6 deg. No wave, no pointRight. Three-quarter view not built.

**Enforced in code:** `scripts/beat_rules.py` (`puppet_rule_errors`), called by `scripts/moneypsych_plan.py` (cut strings `puppet:<expression>/<gesture>@R|C|L`) and `scripts/shorts_build.py`.
