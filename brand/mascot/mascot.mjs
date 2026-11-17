// Aurelis HQ mascot - ONE rig for every format (16:9 films, 9:16 Shorts, Remotion stills).
// Rig: vendored claude-animation `chibi` (MIT, see vendor/LICENSE-claude-animation). Draws into any 2D canvas context.
//
//   import { drawMascot, POSES, PROPS, LOOK, HEAD } from ".../brand/mascot/mascot.mjs";
//   drawMascot(ctx, x, groundY, scale, { pose: "hesitant", prop: "cash", t, flip: false });
//
// Units: scale 1 = 310 px tall; origin = ground between the feet. Faces right when flip=false (the booth is on the right).
// View (extra): pass view:"front"|"threeq"|"side"|"back" (default front). Poses: neutral | hesitant | happy | shocked | pointing.  Props (right hand unless hand:"L"): cash | card | phone | receipt | ticket.
// Any chibi pose field (gait, armR [shoulder,elbow], eyes, brows, mouth, sweat, headTilt, look, blush ...) can be passed to override.
import { chibi } from "./vendor/rigs/chibi.mjs";
import { at, poly, fill, stroke, ellipse, rrect, line, INK } from "./vendor/core.mjs";

export const PALETTE = { gold: "#E0B54A", goldDark: "#9A7524", ivory: "#F4ECD8", charcoal: "#2B2B31", charcoalDeep: "#1B1B1F", ink: INK, bill: "#B9C79A" };
export const LOOK = { skin: "#F2CFA0", shirt: PALETTE.gold, pants: "#4A4A55", shoes: "#1E1E22", hair: "#16161A", pocket: PALETTE.goldDark, pen: PALETTE.ivory, glasses: false, spikes: 16 };
export const HEIGHT = 310;
export const HEAD = { x: 0, y: -234, r: 62 };           // head centre / radius in local units (for overlays such as "card over the eyes")

export const POSES = {
  neutral:  { arms: "rest", eyes: "neutral", brows: "neutral", mouth: "rest" },
  hesitant: { arms: "shrug", eyes: "side", brows: "worried", mouth: "flat", sweat: 1, headTilt: 0.08, look: [-0.6, 0.2] },
  happy:    { arms: "cheer", eyes: "happy", brows: "raised", mouth: "smile", blush: 0.6 },
  shocked:  { arms: "up", eyes: "wide", brows: "raised", mouth: "O", sweat: 0.4 },
  pointing: { arms: "pointR", eyes: "neutral", brows: "neutral", mouth: "smile" },
};

const Pr = PALETTE;
export const PROPS = {
  cash: (n = 3) => (ctx) => { for (let k = 0; k < n; k++) at(ctx, k * 9 - n * 4, -k * 3, 1, -0.5 + k * 0.14, () => { const R = rrect(-8, -62, 58, 30, 3); poly(ctx, R); fill(ctx, Pr.bill); poly(ctx, R); stroke(ctx, 2.6, INK); ellipse(ctx, 21, -47, 7, 7); stroke(ctx, 2, "#6C7A52"); }); },
  card: () => (ctx) => at(ctx, 20, -28, 1, 0, () => { const R = rrect(-40, -26, 80, 52, 7); poly(ctx, R); fill(ctx, Pr.gold); poly(ctx, R); stroke(ctx, 3, INK); poly(ctx, rrect(-34, -12, 20, 15, 3)); fill(ctx, Pr.ivory); line(ctx, [[-34, 12], [30, 12]], 2.4, Pr.goldDark); }),
  phone: () => (ctx) => at(ctx, 12, -34, 1, -0.15, () => { const R = rrect(-22, -40, 44, 80, 7); poly(ctx, R); fill(ctx, "#18181C"); poly(ctx, R); stroke(ctx, 3, INK); poly(ctx, rrect(-17, -33, 34, 60, 3)); fill(ctx, Pr.gold); line(ctx, [[-11, -20], [11, -20]], 3, Pr.goldDark); line(ctx, [[-11, -8], [8, -8]], 3, Pr.goldDark); line(ctx, [[-11, 4], [11, 4]], 3, Pr.goldDark); }),
  receipt: () => (ctx) => at(ctx, 14, -44, 1, -0.1, () => { const P = [[-28, -50], [28, -50], [28, 50], [19, 44], [9, 50], [0, 44], [-9, 50], [-19, 44], [-28, 50]]; poly(ctx, P); fill(ctx, Pr.ivory); poly(ctx, P); stroke(ctx, 3, INK); for (let k = 0; k < 4; k++) line(ctx, [[-18, -36 + k * 14], [18 - (k % 2) * 10, -36 + k * 14]], 3, "#8f8a7c"); line(ctx, [[-18, 24], [18, 24]], 3.4, INK); line(ctx, [[-14, 34], [-6, 40], [10, 26]], 4, Pr.gold); }),
  ticket: () => (ctx) => at(ctx, 16, -30, 1, -0.2, () => { const R = rrect(-34, -20, 68, 40, 5); poly(ctx, R); fill(ctx, Pr.ivory); poly(ctx, R); stroke(ctx, 3, INK); line(ctx, [[10, -16], [10, 16]], 2, Pr.goldDark); line(ctx, [[-26, -6], [2, -6]], 3, "#8f8a7c"); line(ctx, [[-26, 6], [-4, 6]], 3, "#8f8a7c"); }),
};

export function drawMascot(ctx, x, groundY, scale = 1, o = {}) {
  const { pose = "neutral", prop = null, hand = "R", propArg, flip = false, ...rest } = o;
  const p = { ...POSES[pose], ...rest, flip };
  if (prop) { const fn = typeof prop === "function" ? prop : PROPS[prop](propArg); if (hand === "L") p.holdL = fn; else p.holdR = fn; }
  chibi(ctx, x, groundY, scale, p, LOOK);
}
