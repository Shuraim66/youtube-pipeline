// node sheet.mjs  ->  character_sheet.png (poses, props, flip, palette). The reference every format must match.
import fs from "node:fs";
import { createCanvas } from "./vendor/core.mjs";
import { drawMascot, POSES, PROPS, PALETTE, LOOK } from "./mascot.mjs";
const W = 2400, H = 1500, c = createCanvas(W, H), ctx = c.getContext("2d");
ctx.fillStyle = PALETTE.charcoal; ctx.fillRect(0, 0, W, H);
const txt = (s, x, y, size, col, al = "center", w = "bold") => { ctx.font = `${w} ${size}px 'DejaVu Sans'`; ctx.fillStyle = col; ctx.textAlign = al; ctx.fillText(s, x, y); };
txt("AURELIS HQ · MASCOT CHARACTER SHEET", 80, 90, 44, PALETTE.gold, "left"); txt("one rig for 16:9 and 9:16 · brand/mascot/mascot.mjs", 80, 130, 26, PALETTE.ivory, "left", "normal");
const row = (y, items, label, sc = 1.15) => { txt(label, 80, y - 418, 28, PALETTE.goldDark, "left"); items.forEach((it, i) => { const x = 280 + i * 460; ctx.fillStyle = "#1F1F24"; ctx.fillRect(x - 210, y - 410, 420, 460); ctx.strokeStyle = PALETTE.goldDark; ctx.lineWidth = 3; ctx.strokeRect(x - 210, y - 410, 420, 460);
  drawMascot(ctx, x, y, sc, it.o); txt(it.name, x, y + 90, 30, PALETTE.ivory); }); };
row(560, Object.keys(POSES).map((k) => ({ name: k, o: { pose: k, t: 0.3 } })), "POSES");
row(1120, [["cash", "hesitant", { armR: [70, 70] }], ["card", "happy", { armR: [70, 70] }], ["phone", "neutral", { armR: [70, 70] }], ["receipt", "pointing", { arms: "rest", armR: [70, 70] }], ["ticket", "happy", { armR: [70, 70] }]].map(([p, pose, ex]) => ({ name: `prop: ${p}`, o: { pose, prop: p, propArg: p === "cash" ? 3 : undefined, ...ex, arms: undefined, t: 0.3 } })), "PROPS (right hand)");
// palette
[["gold", PALETTE.gold], ["goldDark", PALETTE.goldDark], ["ivory", PALETTE.ivory], ["charcoal", PALETTE.charcoal], ["skin", LOOK.skin], ["pants", LOOK.pants], ["bill", PALETTE.bill]].forEach(([n, col], i) => { ctx.fillStyle = col; ctx.fillRect(80 + i * 150, 1390, 120, 50); ctx.strokeStyle = PALETTE.ivory; ctx.strokeRect(80 + i * 150, 1390, 120, 50); txt(n, 140 + i * 150, 1465, 20, PALETTE.ivory); });
fs.writeFileSync("character_sheet.png", c.toBuffer("image/png")); console.log("wrote character_sheet.png");
