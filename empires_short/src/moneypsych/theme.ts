// Theme for the Money Psychology video. Two fonts only: Fraunces Bold (big numbers, title, chapter names) and Inter SemiBold/Bold (everything else).
// Deliberately independent of src/cardblind/shared.tsx so no other font (Space Grotesk, Fraunces Black) is bundled into this video.
import { Easing, interpolate } from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

export const FRAUNCES = loadFraunces("normal", { weights: ["700"], subsets: ["latin"] }).fontFamily;
export const INTER = loadInter("normal", { weights: ["600", "700"], subsets: ["latin"] }).fontFamily;
export const PAL = {
  charcoal: "#2B2B31", charcoalDeep: "#1B1B1F", charcoalLift: "#3A3A42", gold: "#E0B54A", goldDark: "#9A7524",
  ivory: "#F4ECD8", ink: "#16161A", pillInk: "#1E1612", bill: "#B9C79A", skin: "#F2CFA0", danger: "#C24B4B", ok: "#6BD08A", slate: "#6B7687",
};
export const SHADOW = "0 2px 10px rgba(0,0,0,.85), 0 0 2px rgba(0,0,0,.9)";   // soft dark shadow behind small text
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const win = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
export const PREMIUM = Easing.bezier(0.05, 0.7, 0.1, 1);        // motion-design skill, Premium archetype: decelerating entrance, 0% overshoot
export const pop = (t: number, a: number, d = 0.5) => interpolate(t, [a, a + d], [0, 1], { ...clamp, easing: PREMIUM });
export const kf = (t: number, times: number[], vals: number[]) => interpolate(t, times, vals, { ...clamp, easing: Easing.inOut(Easing.cubic) });
