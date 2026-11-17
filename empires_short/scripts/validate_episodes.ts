/**
 * Deterministic episode checks (errors vs warnings) for ArchivalShort compositions.
 *   npm run validate                       # all registered archival episodes
 *   npm run validate -- CaponeShortV2 ...  # selected composition ids
 *   npm run validate -- --json             # machine-readable report
 * Exit code 1 if any selected episode has an error.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ARCHIVAL_EPISODES } from "../src/archival/registry";
import { validateEpisode } from "../src/archival/v2";

const FPS = 30;
const PUBLIC = join(__dirname, "..", "public");

/** duration of a PCM WAV from its header (no ffprobe dependency) */
export function wavSeconds(path: string): number | undefined {
  try {
    const b = readFileSync(path);
    if (b.toString("ascii", 0, 4) !== "RIFF") return undefined;
    let off = 12, byteRate = 0;
    while (off + 8 <= b.length) {
      const id = b.toString("ascii", off, off + 4);
      const size = b.readUInt32LE(off + 4);
      if (id === "fmt ") byteRate = b.readUInt32LE(off + 16);
      if (id === "data") return byteRate ? size / byteRate : undefined;
      off += 8 + size + (size % 2);
    }
  } catch {}
  return undefined;
}

const args = process.argv.slice(2);
const json = args.includes("--json");
const ids = args.filter((a) => !a.startsWith("--"));
const selected = ids.length ? ids : Object.keys(ARCHIVAL_EPISODES);
const report: Record<string, unknown> = {};
let errors = 0;
for (const id of selected) {
  const ep = ARCHIVAL_EPISODES[id];
  if (!ep) {
    console.error(`unknown composition id: ${id}`);
    errors++;
    continue;
  }
  const audioSec = wavSeconds(join(PUBLIC, ep.props.vo));
  const issues = validateEpisode(ep.props, { fps: FPS, assetExists: (src) => existsSync(join(PUBLIC, src)), audioSec });
  const e = issues.filter((i) => i.level === "error").length;
  errors += e;
  const hook = ep.props.templateVersion === "v2" && ep.props.v2 ? ep.props.v2.hook.lines : ep.props.hook;
  report[id] = { channel: ep.channel, templateVersion: ep.props.templateVersion ?? "v1", hook, durationSec: ep.props.durationSec, audioSec, issues };
  if (!json) {
    console.log(`${e ? "✗" : "✓"} ${id} [${ep.props.templateVersion ?? "v1"}] ${e} error(s), ${issues.length - e} warning(s)`);
    for (const i of issues) console.log(`    ${i.level === "error" ? "ERROR" : "warn "} ${i.code}: ${i.msg}`);
  }
}
if (json) console.log(JSON.stringify(report, null, 2));
process.exit(errors ? 1 : 0);
