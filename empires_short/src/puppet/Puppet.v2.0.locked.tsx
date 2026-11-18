// LOCKED puppet v2.0 (2026-11-10): snapshot of Puppet.tsx at lock time. Change Puppet.tsx for v2.1+ and note it in PROJECT_CONTEXT.md.
// Aurelis mascot PUPPET v3 (UNLOCKED, awaiting approval). Rest = v2 cut-out body with small talking arm swings; every gesture = POSE SNAP to a full library cut-out (head removed) with the puppet head + SVG face on top.
// (v2 notes:) every body part is CUT FROM THE LIBRARY ART (mascot_idle_front.png) instead of redrawn:
// head layer (head_front.png) + static body layer (torso with collar and pocket, legs, shoes) + per-side upper arm (sleeve + cuff) and forearm/hand pieces with
// pivots at the shoulder and elbow; gesture hands are cropped from other library cut-outs. Assets: public/img/aurelis/puppet/v2 (scripts/puppet_cut_body.py, puppet_cut_hands.py).
// Only the eyes, brows, mouth, sweat and the torso-edge ink line are SVG. Front view only.
// Automatic: idle breathing, blink every few seconds, mouth follows narration volume (@remotion/media-utils) when `talkSrc` is given.
import React from "react";
import { staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import POSES_JSON from "../../public/img/aurelis/puppet/v2/poses.json";

export const PUPPET_W = 460, PUPPET_H = 806;                       // local drawing space = the library cut-out frame; feet at y = 781, centre x = 220
const C = { gold: "#E0B54A", goldDark: "#9A7524", goldShade: "#C9A03F", skin: "#F2CFA0", skinShade: "#E4BC8A", pants: "#4A4A56", cuff: "#5C5C69", ink: "#1E1612", shoe: "#16161A", sole: "#F4F4F2", hair: "#16161A", light: "#F4ECD8", mouth: "#7A1E26", tongue: "#E86A74", sweat: "#9CCBEA" };
const SW = 6;                                                       // outline weight (matches the library cut-outs at this size)
const ln = { stroke: C.ink, strokeWidth: SW, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export type Eyes = "open" | "closed" | "wide" | "happy";
export type Brows = "neutral" | "worried" | "angry" | "raised";
export type Mouth = "closed" | "half" | "open" | "smile" | "frown" | "o";
export type Expression = "neutral" | "happy" | "worried" | "shocked" | "angry" | "thinking" | "sad";
export type GestureName = "rest" | "explain" | "pointLeft" | "shrug" | "thumbsUp" | "celebrate" | "worriedHands" | "holdProp";

export const EXPRESSIONS: Record<Expression, { eyes: Eyes; brows: Brows; mouth: Mouth; sweat?: boolean; look?: [number, number] }> = {
  neutral: { eyes: "open", brows: "neutral", mouth: "closed" },
  happy: { eyes: "happy", brows: "raised", mouth: "smile" },
  worried: { eyes: "open", brows: "worried", mouth: "frown", sweat: true },
  shocked: { eyes: "wide", brows: "raised", mouth: "o" },
  angry: { eyes: "open", brows: "angry", mouth: "frown" },
  thinking: { eyes: "open", brows: "raised", mouth: "closed", look: [9, -8] },
  sad: { eyes: "open", brows: "worried", mouth: "frown" },
};

// ----------------------------------------------------------------------- gestures = pose snaps
export type PropKind = "cash" | "card" | "piggy_bank" | "phone" | "receipt" | "calendar" | "lottery_ticket" | "pay_slip" | "clipboard" | "test_paper" | "car_keys";
export type GestureCue = { name: GestureName; from: number; to: number; prop?: PropKind };      // seconds
const POSE_OF: Record<Exclude<GestureName, "rest">, string> = { explain: "explain", pointLeft: "pointL", shrug: "shrug", thumbsUp: "thumbs", celebrate: "celebrate", worriedHands: "worried", holdProp: "p_" };
type PoseMeta = { ox: number; oy: number; w: number; h: number; hx: number; hy: number; hs: number };
const POSES = POSES_JSON as Record<string, PoseMeta>;
const SNAP_F = 3, ANT_F = 2;                                         // snap lasts 3 frames, anticipation 2 frames
/** which cue (if any) is showing at time t, plus the squash/stretch scale for the snap (about 3 %) */
function resolveSnap(t: number, fps: number, cues: GestureCue[]): { cue?: GestureCue; sx: number; sy: number } {
  const f = t * fps; let cue: GestureCue | undefined; let sx = 1, sy = 1;
  for (const c of cues) {
    const a = c.from * fps, b = c.to * fps;
    if (f >= a && f < b) cue = c;
    if (f >= a - ANT_F && f < a) { sy = 0.97; sx = 1.015; }                                  // anticipation: slight crouch before the pose appears
    else if (f >= a && f < a + SNAP_F) { const u = (f - a) / SNAP_F; sy = 1.03 - 0.03 * u; sx = 0.985 + 0.015 * u; }   // stretch, settles
    else if (f >= b && f < b + SNAP_F) { const u = (f - b) / SNAP_F; sy = 0.975 + 0.025 * u; sx = 1.012 - 0.012 * u; } // squash back to rest
  }
  return { cue, sx, sy };
}

// ----------------------------------------------------------------------- parts
const Eye: React.FC<{ x: number; kind: Eyes; look: [number, number]; closed: boolean }> = ({ x, kind, look, closed }) => {
  const y = 266, lx = look[0], ly = look[1];
  if (closed || kind === "closed") return <path d={`M${x - 13},${y + 2} Q${x},${y + 10} ${x + 13},${y + 2}`} fill="none" {...ln} strokeWidth={5} />;
  if (kind === "happy") return <path d={`M${x - 13},${y + 8} Q${x},${y - 10} ${x + 13},${y + 8}`} fill="none" {...ln} strokeWidth={5.5} />;
  if (kind === "wide") return <g><ellipse cx={x} cy={y} rx={21} ry={25} fill="#fff" {...ln} strokeWidth={5} /><ellipse cx={x + lx * 0.6} cy={y + ly * 0.6} rx={9} ry={12} fill={C.ink} /><circle cx={x + lx * 0.6 - 3} cy={y + ly * 0.6 - 4} r={3.4} fill="#fff" /></g>;
  return <g><ellipse cx={x + lx} cy={y + ly} rx={9.5} ry={14.5} fill={C.ink} /><circle cx={x + lx - 3} cy={y + ly - 5} r={3.2} fill="#fff" /></g>;
};
const Brow: React.FC<{ kind: Brows; side: -1 | 1; x: number }> = ({ kind, side, x }) => {
  if (kind === "neutral") return null;
  const y = kind === "raised" ? 234 : 240, tilt = kind === "worried" ? -side * 10 : kind === "angry" ? side * 11 : 0, lift = kind === "raised" ? -4 : 0;
  const d = `M${x - 21},${y + 4 + tilt + lift} Q${x},${y - 6 + lift} ${x + 21},${y + 4 - tilt + lift}`;
  return <g><path d={d} fill="none" stroke={C.light} strokeWidth={13} strokeLinecap="round" opacity={0.9} />{/* thin light outline so the brow reads over the black fringe */}
    <path d={d} fill="none" stroke={C.ink} strokeWidth={7.5} strokeLinecap="round" /></g>;
};
const MouthShape: React.FC<{ kind: Mouth; open: number }> = ({ kind, open }) => {
  const x = 222, y = 322;
  if (kind === "closed") return <path d={`M${x - 24},${y - 2} Q${x},${y + 14} ${x + 24},${y - 2}`} fill="none" {...ln} strokeWidth={5.5} />;
  if (kind === "frown") return <path d={`M${x - 22},${y + 8} Q${x},${y - 8} ${x + 22},${y + 8}`} fill="none" {...ln} strokeWidth={5.5} />;
  if (kind === "smile") return <g><path d={`M${x - 32},${y - 6} Q${x},${y + 34} ${x + 32},${y - 6} Z`} fill={C.mouth} {...ln} strokeWidth={5} /><path d={`M${x - 24},${y - 3} L${x + 24},${y - 3}`} stroke="#fff" strokeWidth={6} strokeLinecap="round" /></g>;
  if (kind === "o") return <ellipse cx={x} cy={y + 4} rx={12} ry={15} fill={C.mouth} {...ln} strokeWidth={5} />;
  const k = kind === "half" ? 0.6 : 1, ry = 9 + 30 * open * k;
  return <g><ellipse cx={x} cy={y + 4} rx={18 + 12 * open * k} ry={Math.max(6, ry)} fill={C.mouth} {...ln} strokeWidth={5} /><ellipse cx={x} cy={y + 4 + Math.max(6, ry) * 0.55} rx={10 + 4 * open} ry={Math.max(3, ry * 0.35)} fill={C.tongue} /></g>;
};


// ----------------------------------------------------------------------- cut-out parts (rest body)
const V2 = "img/aurelis/puppet/v2/";
const FRAME_W = 459, FRAME_H = 806;
const PIV = { L: { sh: [120, 440], el: [86, 528] }, R: { sh: [320, 440], el: [354, 528] } } as const;
const NAT_UPPER = 20;                                               // the hanging upper arm in the art sits about 20 deg outward

/** rest arm: sleeve (upper) + forearm with the curled hand, small swings only: shoulder +-8 deg, elbow +-10 deg */
const ArmV2: React.FC<{ side: "L" | "R"; shoulder: number; elbow: number }> = ({ side, shoulder, elbow }) => {
  const sg = side === "L" ? 1 : -1, P = PIV[side]; const [sx, sy] = P.sh, [ex, ey] = P.el;
  return (
    <g transform={`rotate(${sg * (shoulder - NAT_UPPER)} ${sx} ${sy})`}>
      <g transform={`rotate(${sg * (elbow + NAT_UPPER)} ${ex} ${ey})`}><image href={staticFile(`${V2}fore_rest_${side}.png`)} x={0} y={0} width={FRAME_W} height={FRAME_H} /></g>
      <image href={staticFile(`${V2}upper_${side}.png`)} x={0} y={0} width={FRAME_W} height={FRAME_H} />
    </g>
  );
};

// ----------------------------------------------------------------------- audio
/** mouth openness 0..1 from the narration file's volume (smoothed over 3 frames). `startFrom` = seconds into the file at composition frame 0. */
export function useTalk(src: string | undefined, startFromSec = 0, gain = 3.2): number {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const data = useAudioData(src ?? "");
  if (!src || !data) return 0;
  let acc = 0, n = 0;
  for (let d = 0; d < 3; d++) {
    const f = Math.max(0, frame - d + Math.round(startFromSec * fps));
    const v = visualizeAudio({ fps, frame: f, audioData: data, numberOfSamples: 32 }).slice(0, 14); acc += v.reduce((a, b) => a + b, 0) / v.length; n++;
  }
  return Math.min(1, (acc / n) * gain);
}

// ----------------------------------------------------------------------- the puppet
export type PuppetProps = {
  expression?: Expression; eyes?: Eyes; brows?: Brows; mouth?: Mouth;                // overrides
  gesture?: GestureName; gestures?: GestureCue[];                                      // one persistent gesture, or timed cues (seconds)
  propKind?: PropKind;                                                                  // for the holdProp gesture: which library prop pose to snap to
  talk?: number; talkSrc?: string; talkStartSec?: number; talkGain?: number;           // 0..1 openness, or an audio file to follow
  height?: number; x?: number; feetY?: number; flip?: boolean; blinkOffset?: number; shadow?: boolean; still?: boolean; style?: React.CSSProperties;
};

const PuppetCore: React.FC<PuppetProps> = ({ expression = "neutral", eyes, brows, mouth, gesture, gestures, propKind, talk, talkSrc,
  height = 700, x, feetY, flip, blinkOffset = 0.7, shadow = true, still, style }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const t = frame / fps;
  const lvl = talk ?? 0;
  const ex = EXPRESSIONS[expression];
  const cues: GestureCue[] = gestures ?? (gesture ? [{ name: gesture, from: -10, to: 1e9, prop: propKind }] : []);
  const snap = resolveSnap(t, fps, cues);
  let poseKey: string | undefined;
  if (snap.cue && snap.cue.name !== "rest") { const base = POSE_OF[snap.cue.name]; poseKey = base === "p_" ? `p_${snap.cue.prop ?? propKind ?? "cash"}` : base; }
  const pose = poseKey ? POSES[poseKey] : undefined;
  const talking = !!talkSrc || talk !== undefined;
  const amp = still ? 0 : talking ? 1 : 0.25;                                          // rest arm swings: +-8 deg shoulder, +-10 deg elbow while talking
  const sL = 20 + 8 * amp * Math.sin(t * 1.9), eL = -20 + 10 * amp * Math.sin(t * 2.6 + 1), sR = 20 + 8 * amp * Math.sin(t * 1.5 + 2), eR = -20 + 10 * amp * Math.sin(t * 2.2 + 3);
  const breath = still ? 0 : Math.sin(t * 2.2) * 0.0125, sway = still ? 0 : Math.sin(t * 1.1);      // body breathing <= 1.5 %
  const bt = t + blinkOffset, blinkT = ((bt % 3.7) + 3.7) % 3.7, blink = !still && (blinkT < 0.12 || (blinkT > 1.55 && blinkT < 1.65 && ((Math.floor(bt / 3.7) % 3) + 3) % 3 === 1));
  const e = eyes ?? ex.eyes, b = brows ?? ex.brows;
  let m: Mouth = mouth ?? ex.mouth, open = 0;
  if (lvl > 0.16) { open = Math.min(1, lvl); m = lvl < 0.42 ? "half" : "open"; if (mouth === "o" || (!mouth && ex.mouth === "o")) m = lvl > 0.45 ? "open" : "o"; }
  const look: [number, number] = ex.look ?? [0, 0];
  const w = (height * PUPPET_W) / PUPPET_H, sc = height / PUPPET_H;
  const pos: React.CSSProperties = x !== undefined && feetY !== undefined ? { position: "absolute", left: x - (w * 220) / PUPPET_W, top: feetY - sc * 781 } : {};
  const sweatY = ((t * 0.9) % 1) * 26;
  const bobY = still ? 0 : sway * 1.0;
  const tilt = Math.max(-6, Math.min(6, sway * 0.4));
  const hx = pose ? pose.hx : 218, hy = pose ? pose.hy : 285, hs = pose ? pose.hs : 1;       // head layer centred on the sprite's face, scaled to the sprite's own head size
  return (
    <svg width={w} height={height} viewBox={`0 0 ${PUPPET_W} ${PUPPET_H}`} style={{ overflow: "visible", transform: flip ? "scaleX(-1)" : undefined, ...pos, ...style }}>
      {shadow && <ellipse cx={220} cy={782} rx={150} ry={14} fill="rgba(0,0,0,.38)" />}
      <g transform={`translate(0 ${bobY}) translate(220 781) scale(${snap.sx} ${(1 + breath) * snap.sy}) translate(-220 -781)`}>
        {pose
          ? <image href={staticFile(`${V2}pose_${poseKey}.png`)} x={pose.ox} y={pose.oy} width={pose.w} height={pose.h} />
          : <>
              <ArmV2 side="L" shoulder={sL} elbow={eL} />
              <ArmV2 side="R" shoulder={sR} elbow={eR} />
              <image href={staticFile(`${V2}body.png`)} x={0} y={0} width={FRAME_W} height={FRAME_H} />
            </>}
        {/* head: library head layer aligned to the sprite's face (offset hx, hy), rotates on the neck pivot (clamped to +-6 deg); the SVG face is part of this group */}
        <g transform={`translate(${hx} ${hy}) scale(${hs}) translate(-218 -285) rotate(${tilt} 218 392)`}>
          <image href={staticFile("img/aurelis/puppet/head_front.png")} x={0} y={0} width={459} height={380} />
          <Brow kind={b} side={-1} x={161} /><Brow kind={b} side={1} x={279} />
          <Eye x={161} kind={e} look={look} closed={blink} /><Eye x={279} kind={e} look={look} closed={blink} />
          <MouthShape kind={m} open={open} />
          {ex.sweat && <path d={`M352,${236 + sweatY} Q364,${254 + sweatY} 352,${264 + sweatY} Q340,${254 + sweatY} 352,${236 + sweatY}`} fill={C.sweat} {...ln} strokeWidth={4} opacity={1 - sweatY / 30} />}
        </g>
      </g>
    </svg>
  );
};

const WithAudio: React.FC<PuppetProps & { talkSrc: string }> = (p) => { const lvl = useTalk(p.talkSrc, p.talkStartSec ?? 0, p.talkGain ?? 3.2); return <PuppetCore {...p} talk={p.talk ?? lvl} />; };
/** the puppet. Give `talkSrc` (a staticFile audio path) to make the mouth follow that file's volume, or `talk` (0..1) to drive it yourself. */
export const Puppet: React.FC<PuppetProps> = (p) => (p.talkSrc ? <WithAudio {...p} talkSrc={p.talkSrc} /> : <PuppetCore {...p} />);
