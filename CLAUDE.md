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
