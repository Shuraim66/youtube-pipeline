# CLAUDE.md

**This is a YouTube Shorts automation project. At the START of every session, READ [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) in full** — it is the single source of truth carrying context across chats (channels, recipe/engine, voices & keys, visual sourcing, upload process, sandbox reachability, current status, and open TODOs).

**At the END of any significant work, UPDATE `PROJECT_CONTEXT.md`** so the next chat picks up everything:
- New uploads → add the video ID/URL under the right channel and mark the manifest entry.
- New builders / gen scripts / recipe or engine changes → record them.
- Status changes → update the "Current status / open TODOs" section and the "Last updated" date.

Rules:
- Keep it accurate and current; treat stale claims as bugs.
- **Never write raw API keys/secrets** into `PROJECT_CONTEXT.md` or any tracked file — reference the key *files* (`.elevenlabs_key`, `.pexels_key`, `token.json`, etc.), which are gitignored.
- Use the Python at `/home/alpha/products/whop-clipper/.venv/bin/python` for all scripts.
- The file-based memory in `~/.claude/projects/-home-alpha-products-youtube-pipeline/memory/` complements this file; PROJECT_CONTEXT.md is the consolidated handoff doc.

## Producing episodes — follow [`playbooks/V2_WORKFLOW.md`](./playbooks/V2_WORKFLOW.md)
Every new Short for **Aurelis HQ** or **The Night File** goes through that workflow (it supersedes conflicting rules in the older playbooks; its "Precedence" table lists which).
- **Triggers:** "New Aurelis episode" / "New Night File episode" (optionally `: <topic>`), "Approve topic <n>", "Upload <name>", "Record metrics" + pasted Studio data.
- **Gate 1:** without a given topic, research ≥10 candidates, score them (`research/topics_*.json` + `validate_topics.py`, which also flags already-published topics) and present the top 3 — then STOP until the user picks.
- **Gate 2:** after the local V2 render + quality-gate report, STOP. Never upload, schedule or post without explicit approval; uploads always use `--expect-channel`.
- Scripts: `scripts_v2/<ep>.json` (3 hook candidates + rationale, five beats, every number/date/quote in `claims` with a source) → `validate_script_v2.py` 0 errors. Never invent facts, quotes, numbers or references.
- Render: `ArchivalShort` with `templateVersion: "v2"`; `npm test` + `npm run validate` + `scripts/experiment.py` in `empires_short/`. V1 rendering must not change.
- Metrics: `record_metrics.py` → `analytics/metrics.csv` at 48 h / 7 d from numbers the user pastes (no direct Analytics access). Treat patterns as hypotheses.

