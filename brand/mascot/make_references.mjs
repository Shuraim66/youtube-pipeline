// Renders the two identity references the Qwen generator sends with every mascot prompt (front + three-quarter, neutral pose, light grey background).
// Free, local. Run from the repo root:  node brand/mascot/make_references.mjs   ->  assets/mascot/rig_reference_{front,threeq}.png (rig likeness only; the generator uses scripts/make_mascot_references.py)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas } from "./vendor/core.mjs";
import { drawMascot } from "./mascot.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
fs.mkdirSync(path.join(root, "assets/mascot"), { recursive: true });
for (const view of ["front", "threeq"]) {
  const c = createCanvas(1024, 1024), x = c.getContext("2d");
  x.fillStyle = "#F4F4F4"; x.fillRect(0, 0, 1024, 1024);
  drawMascot(x, 512, 960, 2.35, { pose: "neutral", t: 1.0, view });
  fs.writeFileSync(path.join(root, `assets/mascot/rig_reference_${view}.png`), c.toBuffer("image/png"));
}
console.log("wrote assets/mascot/rig_reference_front.png and rig_reference_threeq.png");
