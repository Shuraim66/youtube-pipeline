// Builds dist/mascot.browser.js (IIFE, global `Mascot`) for browser canvases (stick-figure engine, Remotion <canvas>).
import { build } from "esbuild";
import fs from "node:fs";
fs.mkdirSync("dist", { recursive: true });
fs.writeFileSync("dist/shim-canvas.js", `export const createCanvas = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };\nexport const Path2D = window.Path2D;\n`);
await build({ entryPoints: ["mascot.mjs"], bundle: true, format: "iife", globalName: "Mascot", outfile: "dist/mascot.browser.js", alias: { "@napi-rs/canvas": "./dist/shim-canvas.js" } });
console.log("wrote dist/mascot.browser.js");
