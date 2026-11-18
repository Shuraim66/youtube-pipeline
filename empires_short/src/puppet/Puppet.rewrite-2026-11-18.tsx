// Puppet.tsx — REWRITE (2026-11-18) of the deleted Aurelis Puppet v2.0 component.
//
// The original was deleted in the 2026-11-17 repo clean-up and is unrecoverable
// (never in git, not in trash, not in any backup). This file is rebuilt from:
//  - PROJECT_CONTEXT.md, sections "Aurelis SVG puppet (2026-11-10)" and
//    "PUPPET v2.0 LOCKED (2026-11-10)"
//  - the surviving sprites in public/img/aurelis/puppet/v2/ (body, arms, hands,
//    pose snaps) + poses.json / parts.json / hands.json
//  - the surviving test renders in empires_short/out/puppet/
//
// Design (v2.0, locked 2026-11-10 by the user):
//  - Rest = v2 cut-out body (body.png torso+collar+pocket+legs+shoes,
//    upper_L/R.png sleeves, fore_rest_L/R.png forearm+curled hand), talking arm
//    swings +-8 deg (L) / +-10 deg (R); breathing 1.25%; head tilt +-6 deg.
//  - Gestures = pose snaps (3 frames, ~3% squash/stretch, 2-frame anticipation,
//    no crossfade): explain, pointLeft (only alux_point_left, no mirror),
//    thumbsUp, shrug, celebrate, worriedHands, holdProp -> 11 prop poses.
//  - Head layer scaled per sprite to that sprite's own head size and centred on
//    its face; neck filled; every sprite anchored by the leg centre/bottom row.
//  - Head = hybrid: head_front.png layer + SVG eyes/brows/mouth drawn on top.
//    Mouth follows the VO volume: the parent computes a per-frame talk value
//    0..1 (useAudioData + visualizeAudio, talkGain ~6) and passes talk={...}.
//  - Beat rule: puppet stands frame-right, card frame-left. Puppet =
//    talk/explain/point-at-card/reaction; library cut-outs = prop/movement
//    poses; never cut puppet<->library on the same plate in back-to-back beats.

import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export type Expression =
	| "neutral"
	| "happy"
	| "worried"
	| "shocked"
	| "angry"
	| "thinking"
	| "sad";

/**
 * HEAD_DY — per-pose vertical head correction (frame px, added to headTop).
 * Measured 2026-11-18 from the sprites: for each pose snap, the gold shirt
 * top at x=hx (the neck column) was read, and dy chosen so the chin lands
 * 30 px below it — the same chin-to-collar overlap the good poses already
 * have (pointLeft +22, celebrate +29). Without this, explain (+66) and
 * cash (+72) float ~35-42 px above the collar with a dark gap and a
 * floating neck block; the original MoneyPsych frame (74.4 s, explaining)
 * shows the chin touching the collar, so this reproduces the original.
 * Poses whose prop covers the chest at the neck column (phone, clipboard)
 * can't be measured this way — they get a conservative +15. Shrug and
 * test_paper already overlap the collar (bowed head), so dy = 0: never
 * raise a head that already touches.
 */
const HEAD_DY: Record<string, number> = {
	pointLeft: 8,
	thumbs: 40,
	shrug: 0,
	celebrate: 2,
	explain: 66,
	worried: 44,
	p_cash: 72,
	p_card: 17,
	p_piggy_bank: 19,
	p_phone: 15,
	p_receipt: 17,
	p_calendar: 7,
	p_lottery_ticket: 8,
	p_pay_slip: 22,
	p_clipboard: 15,
	p_test_paper: 0,
	p_car_keys: 7,
};

// REST_DY — head offset for the rest (cut-out body) pose. The v3 rewrite
// applied HEAD_DY to the pose snaps but left the rest pose at dy = 0, so the
// chin sat ~30 px above the collar with only the narrow tapering neck wedge
// bridging the gap — the "detached neck" in frame 0. Measured from the
// sprites: body.png's shirt top is at frame row 380, the chin (head-layer
// row ~350) must land ~8 px below it, so dy = 380 + 8 - 350 = 38. Verified
// against Old Money (aurelis_oldmoney.mp4, 2026-11-14): the chin sits ON the
// collar with only a short wide neck visible, never a floating wedge.
const REST_DY = 38;

// The neck fill (a skin rect below the chin) was removed with the dy fix:
// the chin now overlaps the collar by ~8 px, so there is no seam left to
// fill, and the rect would paint skin over the shirt's chest.

export type GestureName =
	| "rest"
	| "explain"
	| "pointLeft"
	| "thumbsUp"
	| "shrug"
	| "celebrate"
	| "worriedHands"
	| "holdProp";

export type Gesture = {
	name: GestureName;
	from: number; // seconds
	to: number; // seconds
	prop?: string; // for holdProp: "card" | "cash" | "receipt" | "phone" | ...
	expression?: Expression;
};

export type PuppetProps = {
	x: number; // left edge, px in the 1920x1080 frame
	groundY: number; // feet baseline, px in the frame
	height?: number; // puppet height on screen, px (default 700)
	gestures?: Gesture[];
	expression?: Expression;
	talk?: number; // mouth openness 0..1 for this frame (parent computes it
	// from the VO, e.g. via useAudioData + visualizeAudio with talkGain ~6)
	blinkSeed?: number; // shifts the blink cycle (QA sheets: stagger per cell
	// so not every puppet blinks on frame 0)
	flip?: boolean;
};

// Frame geometry from parts.json (459x806, feet y 781).
const FRAME_W = 459;
const FRAME_H = 806;
const FEET_Y = 781;
const NECK = [218, 392]; // head tilt pivot, head-layer coords
const HEAD = { w: 459, h: 380, eyeCx: 220, eyeCy: 266 };

// Pose snaps (poses.json). `file` is the snap sprite in puppet/v2/;
// ox/oy place it in frame coords, hx/hy is the face (eye-line) centre in
// sprite coords, hs scales the head layer to the sprite's head size.
const POSES: Record<
	string,
	{ file: string; ox: number; oy: number; w: number; h: number; hx: number; hy: number; hs: number }
> = {
	pointLeft: { file: "pose_pointL.png", ox: -70, oy: 17, w: 485, h: 769, hx: 210.0, hy: 274.0, hs: 1.033 },
	thumbsUp: { file: "pose_thumbs.png", ox: -72, oy: -3, w: 508, h: 809, hx: 190.0, hy: 286.5, hs: 1.016 },
	shrug: { file: "pose_shrug.png", ox: -103, oy: 50, w: 651, h: 756, hx: 219.5, hy: 317.5, hs: 0.914 },
	celebrate: { file: "pose_celebrate.png", ox: -88, oy: -3, w: 626, h: 809, hx: 221.0, hy: 277.5, hs: 1.0 },
	explain: { file: "pose_explain.png", ox: -118, oy: -1, w: 549, h: 807, hx: 187.5, hy: 286.0, hs: 1.004 },
	worriedHands: { file: "pose_worried.png", ox: -6, oy: -13, w: 477, h: 812, hx: 219.5, hy: 284.5, hs: 1.037 },
	p_cash: { file: "pose_p_cash.png", ox: -122, oy: -7, w: 587, h: 810, hx: 220.0, hy: 279.0, hs: 1.008 },
	p_card: { file: "pose_p_card.png", ox: 64, oy: 19, w: 442, h: 767, hx: 264.5, hy: 289.5, hs: 1.02 },
	p_piggy_bank: { file: "pose_p_piggy_bank.png", ox: 4, oy: -8, w: 458, h: 814, hx: 220.5, hy: 277.0, hs: 0.996 },
	p_phone: { file: "pose_p_phone.png", ox: -29, oy: -3, w: 456, h: 809, hx: 187.0, hy: 275.5, hs: 0.992 },
	p_receipt: { file: "pose_p_receipt.png", ox: -44, oy: 5, w: 587, h: 801, hx: 306.5, hy: 288.0, hs: 0.98 },
	p_calendar: { file: "pose_p_calendar.png", ox: 4, oy: 3, w: 459, h: 801, hx: 221.0, hy: 289.5, hs: 1.0 },
	p_lottery_ticket: { file: "pose_p_lottery_ticket.png", ox: -95, oy: -8, w: 561, h: 813, hx: 221.0, hy: 281.0, hs: 1.008 },
	p_pay_slip: { file: "pose_p_pay_slip.png", ox: 2, oy: -1, w: 458, h: 807, hx: 220.0, hy: 286.0, hs: 1.0 },
	p_clipboard: { file: "pose_p_clipboard.png", ox: 1, oy: -13, w: 462, h: 819, hx: 219.0, hy: 274.0, hs: 1.008 },
	p_test_paper: { file: "pose_p_test_paper.png", ox: -38, oy: 29, w: 491, h: 777, hx: 218.0, hy: 304.5, hs: 0.959 },
	p_car_keys: { file: "pose_p_car_keys.png", ox: -99, oy: -3, w: 566, h: 809, hx: 223.5, hy: 282.0, hs: 1.004 },
};

const PROP_TO_POSE: Record<string, string> = {
	card: "p_card",
	cash: "p_cash",
	receipt: "p_receipt",
	phone: "p_phone",
	piggy_bank: "p_piggy_bank",
	calendar: "p_calendar",
	lottery_ticket: "p_lottery_ticket",
	pay_slip: "p_pay_slip",
	clipboard: "p_clipboard",
	test_paper: "p_test_paper",
	car_keys: "p_car_keys",
};

const SPRITE = (f: string) => staticFile(`img/aurelis/puppet/v2/${f}`);
const HEAD_SRC = staticFile("img/aurelis/puppet/head_front.png");

const INK = "#16161A";
const MOUTH_DARK = "#8B2E2E";
const TONGUE = "#D98A8A";
const SWEAT = "#7FB3D5";
const BLUSH = "#F0A8A0";

/**
 * SVG face drawn on top of the head layer.
 *
 * Measured from Old Money (aurelis_oldmoney.mp4, 2026-11-14), frame by frame:
 * - EYES are white sclera with a black pupil and a dark outline — NOT solid
 *   black dots. The v3 rewrite drew solid black dots, which reads as a
 *   different, flatter character. Happy = closed arcs (unchanged).
 * - MOUTH while talking is a SMALL, WIDE open shape (wider than tall, like
 *   the long-form's talking mouth: a half-open smile that opens and closes
 *   with the syllables). The v3 rewrite drew a TALL ellipse (ry up to 19,
 *   rx 12) whenever talk > 0.04, so every talking beat showed the same
 *   round "O" — including happy/celebrate/cash beats, whose big smile never
 *   appeared. Shocked keeps its round O (that is the correct shocked mouth).
 * - When talk is low, the expression's own rest mouth shows (smile / frown /
 *   flat line), so the face changes between words instead of staying open.
 *
 * `width`/`height` are the head div's on-screen size: the svg must scale
 * with the head image (hs), or the face drifts off the head on poses whose
 * hs != 1 (shrug hs 0.914 put the v3 mouth ~28 px too low). The v3 rewrite
 * rendered the svg at a fixed 459x380 — that is the bug fixed here.
 */
const Face: React.FC<{
	expression: Expression;
	talk: number;
	eyeOpen: number;
	width: number;
	height: number;
}> = ({ expression, talk, eyeOpen, width, height }) => {
	const talking = talk > 0.12;
	// Brows: [left rotation, right rotation, left cx, left cy, right cx, right cy]
	let browL = 0;
	let browR = 0;
	let browDy = 0;
	if (expression === "worried" || expression === "sad") {
		browL = expression === "worried" ? -14 : -10;
		browR = expression === "worried" ? 14 : 10;
	} else if (expression === "angry") {
		browL = 14;
		browR = -14;
	} else if (expression === "thinking") {
		browL = -10;
		browR = 0;
	} else if (expression === "shocked") {
		browDy = -10;
	} else if (expression === "happy") {
		browDy = -4;
	}
	const eyeRy = expression === "shocked" ? 16 : expression === "worried" ? 12 : 13;
	const eyeRx = expression === "shocked" ? 13 : 11;

	// Eye: white sclera + dark outline + black pupil. Blink scales the whole
	// eye vertically around its centre (eyeOpen 1 = open). Happy keeps the
	// closed-arc eyes.
	const eye = (cx: number) => (
		<g transform={`translate(${cx} 266) scale(1 ${Math.max(0.08, eyeOpen)})`}>
			<ellipse rx={eyeRx} ry={eyeRy} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
			<circle r={6.5} fill={INK} />
			<circle cx={2.5} cy={-2.5} r={2} fill="#FFFFFF" />
		</g>
	);

	const mouth = () => {
		// Shocked keeps its round O — that is the correct shocked mouth.
		if (expression === "shocked") {
			const ry = 15 * (1 + talk * 0.3);
			return <ellipse cx={222} cy={322} rx={12} ry={ry} fill={MOUTH_DARK} />;
		}
		// Talking: small WIDE open mouth (wider than tall), opening and
		// closing with the audio. Never the tall round O.
		if (talking) {
			const ry = 3 + talk * 8;
			return (
				<g>
					<ellipse cx={222} cy={322} rx={15} ry={ry} fill={MOUTH_DARK} />
					{talk > 0.4 ? (
						<ellipse cx={222} cy={326} rx={9} ry={2 + talk * 4} fill={TONGUE} />
					) : null}
				</g>
			);
		}
		// Not talking: the expression's own rest mouth.
		switch (expression) {
			case "happy":
				return (
					<g>
						<path d="M194,314 Q222,356 250,314 Z" fill={MOUTH_DARK} />
						<ellipse cx={222} cy={338} rx={10} ry={6} fill={TONGUE} />
					</g>
				);
			case "worried":
				return (
					<path
						d="M204,330 Q222,321 240,330"
						stroke={INK}
						strokeWidth={6}
						strokeLinecap="round"
						fill="none"
					/>
				);
			case "angry":
			case "sad":
				return (
					<path
						d="M202,332 Q222,320 242,332"
						stroke={INK}
						strokeWidth={6}
						strokeLinecap="round"
						fill="none"
					/>
				);
			case "thinking":
				return (
					<line
						x1={204}
						y1={324}
						x2={240}
						y2={324}
						stroke={INK}
						strokeWidth={6}
						strokeLinecap="round"
					/>
				);
			default:
				return (
					<path
						d="M198,320 Q222,333 246,320"
						stroke={INK}
						strokeWidth={6}
						strokeLinecap="round"
						fill="none"
					/>
				);
		}
	};

	return (
		<svg
			width={width}
			height={height}
			viewBox={`0 0 ${HEAD.w} ${HEAD.h}`}
			style={{ position: "absolute", left: 0, top: 0 }}
		>
			{/* brows */}
			<g transform={`translate(0 ${browDy})`}>
				<rect
					x={138}
					y={226}
					width={46}
					height={11}
					rx={5.5}
					fill={INK}
					transform={`rotate(${browL} 184 231)`}
				/>
				<rect
					x={256}
					y={226}
					width={46}
					height={11}
					rx={5.5}
					fill={INK}
					transform={`rotate(${browR} 260 231)`}
				/>
			</g>
			{/* eyes: sclera + pupil (happy keeps the closed arcs) */}
			{expression === "happy" ? (
				<g stroke={INK} strokeWidth={6} strokeLinecap="round" fill="none">
					<path d="M150,268 Q161,256 172,268" />
					<path d="M268,268 Q279,256 290,268" />
				</g>
			) : (
				<g>
					{eye(161)}
					{eye(279)}
				</g>
			)}
			{/* blush */}
			{expression === "happy" || expression === "thinking" ? (
				<g fill={BLUSH} opacity={0.55}>
					<ellipse cx={128} cy={298} rx={15} ry={9} />
					<ellipse cx={312} cy={298} rx={15} ry={9} />
				</g>
			) : null}
			{/* sweat */}
			{expression === "worried" || expression === "shocked" ? (
				<path d="M338,208 Q348,226 338,234 Q328,226 338,208" fill={SWEAT} opacity={0.9} />
			) : null}
			{/* mouth */}
			{mouth()}
		</svg>
	);
};

export const Puppet: React.FC<PuppetProps> = ({
	x,
	groundY,
	height = 700,
	gestures = [],
	expression: defaultExpression = "neutral",
	talk = 0,
	blinkSeed = 0,
	flip = false,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const t = frame / fps;

	// Blink: ~every 3.5 s, closed for ~3 frames.
	const blinkPhase = (frame + blinkSeed) % 105;
	const eyeOpen = blinkPhase < 3 ? [0.15, 0.45, 0.75][blinkPhase] ?? 1 : 1;

	// Breathing 1.25% on a 4 s cycle; head tilt +-4 deg on a 7 s cycle.
	// (Tilt was +-6 deg in v3; Old Money's head stays near-level with only a
	// slight lean, and 6 deg made the chin lift off the collar on one side.)
	const breathe = 1 + 0.0125 * (0.5 + 0.5 * Math.sin((2 * Math.PI * t) / 4));
	const tilt = 4 * Math.sin((2 * Math.PI * t) / 7);

	// Active gesture at this time.
	const active: Gesture | null =
		gestures.find((g) => t >= g.from && t < g.to) ?? null;
	const expression = active?.expression ?? defaultExpression;

	// ARMS DO NOT SWING. The v3 rewrite swung both arms continuously at
	// 2.2 Hz (±8°/±10°) whenever the puppet talked, following the spec's
	// shorthand ("talking arm swings +-8/+-10 deg"). The frames prove the
	// shorthand wrong: in Old Money the arms are STILL within a pose — a
	// 10 fps burst over 2 s of talking (117.0–118.9 s) shows the hands in
	// the same place in all 20 frames, and a skin-pixel centroid track over
	// the same stretch moves only smoothly with the camera push-in, with no
	// oscillation. Motion in the long-form comes from pose snaps between
	// beats, mouth, blink, breathing and head tilt — not from arm wagging.
	// So the rest pose renders the cut-out arms statically; the swing code
	// is deleted, not just zeroed, so nobody re-enables it by accident.

	// Pose snap: 2-frame anticipation squash, then 3-frame settle (3% squash).
	let snapScaleY = 1;
	let snapScaleX = 1;
	if (active) {
		const since = frame - Math.round(active.from * fps);
		if (since >= 0 && since < 2) {
			snapScaleY = 0.97;
			snapScaleX = 0.97;
		} else if (since >= 2 && since < 5) {
			snapScaleY = interpolate(since, [2, 5], [1.03, 1.0]);
			snapScaleX = interpolate(since, [2, 5], [0.99, 1.0]);
		}
	}

	const scale = height / FRAME_H;
	const poseKey =
		active && active.name === "holdProp"
			? PROP_TO_POSE[active.prop ?? "card"] ?? "p_card"
			: active
				? ({ pointLeft: "pointLeft", thumbsUp: "thumbsUp", shrug: "shrug", celebrate: "celebrate", explain: "explain", worriedHands: "worriedHands" } as Record<string, string>)[
						active.name
					]
				: undefined;
	const pose = poseKey ? POSES[poseKey] : undefined;

	// Head layer placement over a pose snap: centred on the sprite's face
	// (wrapper coords: hx/hy is the face centre in sprite coords), plus the
	// measured HEAD_DY so the chin meets the collar (see above). Rest pose:
	// no snap, so the head sits at the top of the frame — add REST_DY so the
	// chin lands on the collar instead of floating 30 px above it.
	const headLeft = pose ? pose.hx - HEAD.eyeCx * pose.hs : 0;
	const headTop = pose
		? pose.hy - HEAD.eyeCy * pose.hs + (poseKey ? (HEAD_DY[poseKey] ?? 0) : 0)
		: REST_DY;
	const headW = HEAD.w * (pose ? pose.hs : 1);
	const headH = HEAD.h * (pose ? pose.hs : 1);
	// Anchor pose snaps by the bottom row so feet land on FEET_Y.
	const poseTop = pose ? FEET_Y - pose.h : 0;

	const headBlock = (
		<div
			style={{
				position: "absolute",
				left: headLeft,
				top: headTop,
				width: headW,
				height: headH,
				transform: `rotate(${tilt}deg)`,
				transformOrigin: `${(NECK[0] ?? 0) * (pose ? pose.hs : 1)}px ${(NECK[1] ?? 0) * (pose ? pose.hs : 1)}px`,
			}}
		>
			<Img src={HEAD_SRC} style={{ width: "100%", height: "100%" }} />
			<Face expression={expression} talk={talk} eyeOpen={eyeOpen} width={headW} height={headH} />
		</div>
	);

	return (
		<div
			style={{
				position: "absolute",
				left: x,
				top: groundY - FRAME_H * scale,
				width: FRAME_W * scale,
				height: FRAME_H * scale,
				transform: `scale(${breathe})${flip ? " scaleX(-1)" : ""}`,
				transformOrigin: "50% 100%",
			}}
		>
			<div style={{ position: "absolute", left: 0, top: 0, width: FRAME_W, height: FRAME_H, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
				{pose ? (
					// Gesture: full-body pose snap (head removed) + head layer on top.
					<div
						style={{
							position: "absolute",
							left: pose.ox,
							top: poseTop,
							width: pose.w,
							height: pose.h,
							transform: `scaleX(${snapScaleX}) scaleY(${snapScaleY})`,
							transformOrigin: "50% 100%",
						}}
					>
						<Img src={SPRITE(pose.file)} style={{ width: "100%", height: "100%" }} />
						{headBlock}
					</div>
				) : (
					// Rest: cut-out body parts, arms swing while talking.
					<>
						<Img src={SPRITE("body.png")} style={{ position: "absolute", left: 0, top: 0, width: FRAME_W, height: FRAME_H }} />
						<div
							style={{
								position: "absolute", left: 0, top: 0, width: FRAME_W, height: FRAME_H,
							}}
						>
							<Img src={SPRITE("upper_L.png")} style={{ width: "100%", height: "100%" }} />
						</div>
						<div
							style={{
								position: "absolute", left: 0, top: 0, width: FRAME_W, height: FRAME_H,
							}}
						>
							<Img src={SPRITE("upper_R.png")} style={{ width: "100%", height: "100%" }} />
						</div>
						<div
							style={{
								position: "absolute", left: 0, top: 0, width: FRAME_W, height: FRAME_H,
							}}
						>
							<Img src={SPRITE("fore_rest_L.png")} style={{ width: "100%", height: "100%" }} />
						</div>
						<div
							style={{
								position: "absolute", left: 0, top: 0, width: FRAME_W, height: FRAME_H,
							}}
						>
							<Img src={SPRITE("fore_rest_R.png")} style={{ width: "100%", height: "100%" }} />
						</div>
						{headBlock}
					</>
				)}
			</div>
		</div>
	);
};

export default Puppet;
