// debt/data.ts — beat plan for the 30 s debt preview (Hook A, 0:00-0:30).
// MoneyPsych pattern: line, library plate + puppet/cut-out, overlays, camera.
// Plates are library ids (public/img/aurelis/library/, no baked text).
// Timings are the real Kokoro beat timings (words.json, Whisper word times).
// Puppet stands frame-right, cards frame-left. Never cut puppet<->library on
// the same plate in back-to-back beats; no plate repeats in adjacent beats.
//
// v4 (2026-11-18): cards rebuilt to the Old Money DC format, measured from
// aurelis_oldmoney.mp4 (2026-11-14) at full res: card x 100, y 275, w 1020,
// h 515, double gold border, eyebrow (small caps gold, centred), big Fraunces
// figure (centred), ivory divider rule, sub-line (centred ivory). Frame 0
// uses a shorter box (y 200, h 470) so the falling chart below it stays
// clear. Sub-lines echo the VO. Source bar only where a figure is cited
// (frame 0, $20B — SEC PR 2022-70).

import type { Expression, GestureName } from "../puppet/Puppet";

export const FPS = 30;
export const DURATION_FRAMES = 908; // 30.26 s
export const VO_SRC = "vo/debt/vo.wav";

export type CardSpec = {
	eyebrow: string;
	big: string;
	big2?: string;
	sub?: string;
	source?: string;
	from: number; // seconds
	top: number; // px, card top edge
	height: number; // px, card height
};

export type Beat = {
	id: string;
	start: number;
	end: number;
	plate: string;
	camera: "push" | "pull" | "panL" | "panR" | "hold";
	puppet: { gesture: GestureName; prop?: string; expression: Expression };
	card?: CardSpec;
	chart?: { from: number; to: number }; // falling chart draw window
	extra?: "fortuneBar" | "questionStack" | "dueStrip" | "progressLine" | "endPlate";
};

export const BEATS: Beat[] = [
	{
		id: "frame0",
		start: 0.0,
		end: 5.68,
		plate: "plate_alux_stage_spotlight",
		camera: "push",
		puppet: { gesture: "rest", expression: "shocked" },
		card: {
			eyebrow: "ARCHEGOS CAPITAL · MARCH 2021",
			big: "$20 BILLION",
			big2: "SOLD IN DAYS",
			sub: "one man's stocks — sold by his banks",
			source: "SEC · PR 2022-70 (Archegos complaint)",
			from: 0,
			top: 200,
			height: 470,
		},
		chart: { from: 3.78, to: 5.28 },
	},
	{
		id: "banks",
		start: 5.68,
		end: 10.82,
		plate: "plate_bank_counter",
		camera: "push",
		puppet: { gesture: "explain", expression: "neutral" },
		card: {
			eyebrow: "MARCH 2021",
			big: "SOLD BY THE BANKS",
			sub: "not because he wanted to sell",
			from: 5.68,
			top: 275,
			height: 515,
		},
	},
	{
		id: "bill",
		start: 10.82,
		end: 14.38,
		plate: "plate_payday_desk",
		camera: "pull",
		puppet: { gesture: "holdProp", prop: "receipt", expression: "worried" },
		card: {
			eyebrow: "THE MARGIN CALL",
			big: "COULDN'T PAY",
			big2: "THE BILL",
			sub: "and the banks took the stock instead",
			from: 10.82,
			top: 275,
			height: 515,
		},
		extra: "dueStrip",
	},
	{
		id: "name",
		start: 14.38,
		end: 19.9,
		plate: "plate_alux_arena_skyline_spotlight",
		camera: "panR",
		puppet: { gesture: "pointLeft", expression: "neutral" },
		card: {
			eyebrow: "THE MAN AT THE CENTRE",
			big: "BILL HWANG",
			sub: "the man behind Archegos Capital",
			from: 14.38,
			top: 275,
			height: 515,
		},
	},
	{
		id: "fortune",
		start: 19.9,
		end: 23.8,
		plate: "plate_trading_screens",
		camera: "push",
		puppet: { gesture: "holdProp", prop: "cash", expression: "happy" },
		card: {
			eyebrow: "THE ARCHEGOS FORTUNE",
			big: "BORROWED HIS WAY",
			sub: "to one of the largest fortunes on Wall Street",
			from: 19.9,
			top: 275,
			height: 515,
		},
		extra: "fortuneBar",
	},
	{
		id: "number",
		start: 23.8,
		end: 27.0,
		plate: "plate_office_desk",
		camera: "panL",
		puppet: { gesture: "explain", expression: "thinking" },
		card: {
			eyebrow: "THE QUESTION",
			big: "THE ONE NUMBER",
			sub: "three questions · one answer",
			from: 23.8,
			top: 275,
			height: 515,
		},
		extra: "questionStack",
	},
	{
		id: "close",
		start: 27.0,
		end: 30.26,
		plate: "plate_alux_stage_spotlight",
		camera: "push",
		puppet: { gesture: "celebrate", expression: "happy" },
		card: {
			eyebrow: "THE LESSON",
			big: "NEVER GET",
			big2: "THAT CALL",
			sub: "the one number decides",
			from: 27.0,
			top: 275,
			height: 515,
		},
		extra: "progressLine",
	},
];

// Puppet placement (frame-right) and gestures, derived from BEATS.
export const PUPPET_X = 1420;
export const PUPPET_GROUND_Y = 950;
export const PUPPET_HEIGHT = 700;

export const GESTURES = BEATS.map((b) => ({
	name: b.puppet.gesture,
	from: b.start,
	to: b.end,
	prop: b.puppet.prop,
	expression: b.puppet.expression,
}));

// Question-stack lines for the "number" beat (word-anchored).
export const STACK_LINES = [
	{ text: "WHY DID THOSE BANKS SELL?", at: 23.9 },
	{ text: "THE ONE NUMBER THAT", at: 24.4 },
	{ text: "SEPARATED HWANG", at: 25.04 },
];
