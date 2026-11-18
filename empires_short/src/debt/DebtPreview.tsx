// DebtPreview.tsx — 30 s debt preview (Hook A) on the real long-form workflow.
// MoneyPsych pattern: library plates (no baked text) + rewritten Puppet v2.0
// + Remotion overlays (Fraunces/Inter) + camera moves, driven by word timings.
// VO is the existing Kokoro am_michael take (public/vo/debt/vo.wav, -14 LUFS).
//
// v4 (2026-11-18): overlays rebuilt to the Old Money DC format, measured from
// aurelis_oldmoney.mp4 (2026-11-14) at full res — centred DC card (double
// gold border, eyebrow, big Fraunces figure, divider, sub-line), two-line
// brand chip, "7 → 1" tracker with numbered circles, SOURCE bar for cited
// figures. The v3 cards were left-anchored plain bands with no eyebrow,
// divider, source or tracker, and frame 0 was bare text with no box at all.

import React from "react";
import {
	AbsoluteFill,
	Audio,
	Img,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { Puppet } from "../puppet/Puppet.rewrite-2026-11-18";
import {
	BEATS,
	DURATION_FRAMES,
	FPS,
	GESTURES,
	PUPPET_GROUND_Y,
	PUPPET_HEIGHT,
	PUPPET_X,
	STACK_LINES,
	VO_SRC,
	type Beat,
} from "./data";

const inter = loadInter("normal", { weights: ["500", "600", "800", "900"], subsets: ["latin"] }).fontFamily;
const serif = loadFraunces("normal", { weights: ["600", "800"], subsets: ["latin"] }).fontFamily;

const GOLD = "#E0B54A";
const INK = "#2B2B31";
const BONE = "#F4ECD8";
const CARD_BG = "rgba(35,35,43,0.94)";

const f = (s: number) => Math.round(s * FPS);
const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

const plateSrc = (id: string) => staticFile(`img/aurelis/library/${id}.png`);

/** Plate with a camera move + the LongForm grade (gradient, gold tint, vignette). */
const Plate: React.FC<{ beat: Beat }> = ({ beat }) => {
	const frame = useCurrentFrame();
	const p = ease((frame - f(beat.start)) / Math.max(1, f(beat.end) - f(beat.start)));
	let transform = "scale(1.27)";
	if (beat.camera === "push") transform = `scale(${1.25 + 0.08 * p})`;
	if (beat.camera === "pull") transform = `scale(${1.33 - 0.08 * p})`;
	if (beat.camera === "panL") transform = `scale(1.3) translateX(${-50 * p}px)`;
	if (beat.camera === "panR") transform = `scale(1.3) translateX(${50 * p}px)`;
	return (
		<AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
			<AbsoluteFill style={{ transform, transformOrigin: "50% 50%" }}>
				<Img src={plateSrc(beat.plate)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					background:
						"linear-gradient(180deg, rgba(9,10,15,0.55) 0%, rgba(9,10,15,0.05) 38%, rgba(9,10,15,0.72) 100%)",
				}}
			/>
			<AbsoluteFill style={{ background: "rgba(217,119,6,0.07)", mixBlendMode: "soft-light" }} />
			<AbsoluteFill style={{ boxShadow: "inset 0 0 220px rgba(0,0,0,0.65)" }} />
		</AbsoluteFill>
	);
};

/** Pop-in wrapper: opacity + rise + settle, starting at `from` seconds. */
const Pop: React.FC<{ from: number; delay?: number; children: React.ReactNode }> = ({
	from,
	delay = 0,
	children,
}) => {
	const frame = useCurrentFrame();
	const p = ease((frame - f(from + delay)) / 8);
	return (
		<div style={{ opacity: p, transform: `translateY(${(1 - p) * 24}px) scale(${0.94 + 0.06 * p})` }}>
			{children}
		</div>
	);
};

/**
 * Brand chip, Old Money format: two lines — "AURELIS HQ" (gold) over the
 * chapter title (white serif). Measured: x 40, y 28, gold 3px border.
 */
const BrandChip: React.FC = () => (
	<div
		style={{
			position: "absolute",
			left: 40,
			top: 28,
			border: `3px solid ${GOLD}`,
			borderRadius: 10,
			padding: "14px 28px",
			background: "rgba(20,20,24,0.72)",
		}}
	>
		<div style={{ fontFamily: inter, fontWeight: 800, fontSize: 40, color: GOLD, letterSpacing: 2 }}>
			AURELIS HQ
		</div>
		<div style={{ fontFamily: serif, fontWeight: 800, fontSize: 36, color: BONE, letterSpacing: 1, marginTop: 2 }}>
			HOW THE RICH USE DEBT
		</div>
	</div>
);

/**
 * Tracker, Old Money format: "7 → 1" + numbered circles, top-right.
 * Done beats = gold fill, current = gold fill + outer ring, upcoming =
 * outline only. Measured: circles ~56 px, gap ~8 px, right edge 1880.
 */
const Tracker: React.FC<{ current: number }> = ({ current }) => {
	const total = BEATS.length;
	const d = 56;
	const gap = 8;
	const right = 1880;
	const top = 30;
	const circles = [];
	for (let i = 0; i < total; i++) {
		const n = total - i; // 7, 6, 5, 4, 3, 2, 1
		const isCurrent = i === current;
		const isDone = i < current;
		circles.push(
			<div
				key={n}
				style={{
					width: d,
					height: d,
					borderRadius: "50%",
					border: `3px solid ${GOLD}`,
					background: isDone || isCurrent ? GOLD : "transparent",
					color: isDone || isCurrent ? INK : GOLD,
					fontFamily: inter,
					fontWeight: 800,
					fontSize: 30,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					boxShadow: isCurrent ? `0 0 0 4px rgba(224,181,74,0.35)` : undefined,
				}}
			>
				{n}
			</div>,
		);
	}
	return (
		<div style={{ position: "absolute", right: 1920 - right, top, display: "flex", alignItems: "center", gap: 18 }}>
			<div style={{ fontFamily: inter, fontWeight: 800, fontSize: 36, color: GOLD, letterSpacing: 2 }}>
				7 → 1
			</div>
			<div style={{ display: "flex", gap }}>{circles}</div>
		</div>
	);
};

/**
 * Data card, Old Money DC format (measured from aurelis_oldmoney.mp4):
 * x 100, w 1020, double gold border (outer 4px + inner 2px inset 14px),
 * eyebrow (small caps gold, centred), big Fraunces figure (centred), ivory
 * divider rule, sub-line (centred ivory). The v3 card was a left-anchored
 * plain band with no eyebrow, divider or centring — that is what made it
 * look different from the long-form.
 */
const DataCard: React.FC<{ beat: Beat }> = ({ beat }) => {
	const card = beat.card;
	if (!card) return null;
	// Fit the big line inside the ~920 px interior. Fraunces 800 caps run
	// ~0.73 em per char — the v4 0.62 factor let "BILL HWANG" and
	// "BORROWED HIS WAY" overflow the card borders by ~100 px. Two-line
	// cards get smaller sizes so eyebrow + both lines + divider + sub fit.
	const twoLine = Boolean(card.big2);
	const bigSize = (txt: string) =>
		Math.min(twoLine ? 115 : 140, Math.floor(920 / Math.max(1, txt.length * 0.73)));
	const big2Size = (txt: string) => Math.min(105, Math.floor(920 / Math.max(1, txt.length * 0.73)));
	return (
		<div style={{ position: "absolute", left: 100, top: card.top, width: 1020, height: card.height }}>
			<Pop from={card.from}>
				<div
					style={{
						width: "100%",
						height: "100%",
						background: CARD_BG,
						border: `4px solid ${GOLD}`,
						borderRadius: 14,
						padding: "40px 44px",
						boxSizing: "border-box",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						// Spread the rows across the box like the long-form
						// (eyebrow near the top, sub-line near the bottom);
						// v4's centred cluster left ~200 px empty at the
						// bottom of the tall box.
						justifyContent: "space-between",
						textAlign: "center",
					}}
				>
					{/* inner thin gold rule, like the long-form's double border */}
					<div
						style={{
							position: "absolute",
							left: 14,
							top: 14,
							right: 14,
							bottom: 14,
							border: `2px solid rgba(224,181,74,0.55)`,
							borderRadius: 8,
							pointerEvents: "none",
						}}
					/>
					<div
						style={{
							fontFamily: inter,
							fontWeight: 800,
							fontSize: 40,
							color: GOLD,
							letterSpacing: 2,
						}}
					>
						{card.eyebrow}
					</div>
					<div
						style={{
							fontFamily: serif,
							fontWeight: 800,
							fontSize: bigSize(card.big),
							lineHeight: 1.05,
							color: GOLD,
							letterSpacing: -1,
							whiteSpace: "nowrap",
						}}
					>
						{card.big}
					</div>
					{card.big2 ? (
						<div
							style={{
								fontFamily: serif,
								fontWeight: 800,
								fontSize: big2Size(card.big2),
								lineHeight: 1.05,
								color: BONE,
								letterSpacing: -1,
								whiteSpace: "nowrap",
								marginTop: 6,
							}}
						>
							{card.big2}
						</div>
					) : null}
					<div
						style={{
							width: 800,
							height: 3,
							background: BONE,
							opacity: 0.9,
						}}
					/>
					{card.sub ? (
						<div
							style={{
								fontFamily: inter,
								fontWeight: 600,
								fontSize: 36,
								color: BONE,
								lineHeight: 1.3,
							}}
						>
							{card.sub}
						</div>
					) : null}
				</div>
			</Pop>
		</div>
	);
};

/** SOURCE bar, Old Money format: centred pill at the bottom of the frame. */
const SourceBar: React.FC<{ text: string; from: number }> = ({ text, from }) => (
	<div
		style={{
			position: "absolute",
			left: 0,
			right: 0,
			bottom: 36,
			display: "flex",
			justifyContent: "center",
		}}
	>
		<Pop from={from + 0.4}>
			<div
				style={{
					border: `2px solid ${GOLD}`,
					borderRadius: 10,
					padding: "14px 30px",
					background: "rgba(20,20,24,0.85)",
					fontFamily: inter,
					fontWeight: 600,
					fontSize: 34,
					color: BONE,
					whiteSpace: "nowrap",
				}}
			>
				<span style={{ fontWeight: 800, color: GOLD }}>SOURCE · </span>
				{text}
			</div>
		</Pop>
	</div>
);

/** Falling chart with a $ counter anchored to its live endpoint (frame 0). */
const Chart: React.FC<{ from: number; to: number }> = ({ from, to }) => {
	const frame = useCurrentFrame();
	const p = ease((frame - f(from)) / Math.max(1, f(to) - f(from)));
	const value = Math.round(20 * p);
	return (
		<div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080 }}>
			<svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
				<path
					d="M150,720 L350,758 L550,788 L750,828 L900,868 L1050,905"
					fill="none"
					stroke={GOLD}
					strokeWidth={7}
					strokeLinecap="round"
					strokeLinejoin="round"
					pathLength={1000}
					strokeDasharray={1000}
					strokeDashoffset={1000 * (1 - p)}
				/>
				<circle cx={150} cy={720} r={10} fill={BONE} opacity={p > 0 ? 1 : 0} />
				<circle cx={1050} cy={905} r={12} fill={GOLD} opacity={p > 0.95 ? 1 : 0} />
			</svg>
			<div
				style={{
					position: "absolute",
					left: 1085,
					top: 850,
					fontFamily: serif,
					fontWeight: 800,
					fontSize: 72,
					color: BONE,
					opacity: p > 0 ? 1 : 0,
				}}
			>
				${value}B
			</div>
		</div>
	);
};

const DueStrip: React.FC = () => (
	<Pop from={11.2}>
		<div style={{ position: "absolute", left: 100, top: 830 }}>
			<div
				style={{
					width: 460,
					background: BONE,
					color: INK,
					fontFamily: inter,
					fontWeight: 800,
					fontSize: 40,
					letterSpacing: 6,
					textAlign: "center",
					padding: "22px 0 30px",
					clipPath:
						"polygon(0 0, 100% 0, 100% 78%, 95% 100%, 90% 78%, 85% 100%, 80% 78%, 75% 100%, 70% 78%, 65% 100%, 60% 78%, 55% 100%, 50% 78%, 45% 100%, 40% 78%, 35% 100%, 30% 78%, 25% 100%, 20% 78%, 15% 100%, 10% 78%, 5% 100%, 0 78%)",
				}}
			>
				DUE
			</div>
		</div>
	</Pop>
);

const FortuneBar: React.FC<{ from: number; to: number }> = ({ from, to }) => {
	const frame = useCurrentFrame();
	const p = ease((frame - f(from)) / Math.max(1, f(to) - f(from)));
	return (
		<div style={{ position: "absolute", left: 100, top: 830 }}>
			<div style={{ width: 900, height: 26, background: "rgba(244,236,216,0.25)", borderRadius: 13 }}>
				<div style={{ width: 900 * p, height: 26, background: GOLD, borderRadius: 13 }} />
			</div>
			{/* No caption under the bar: the card's sub-line already says it
				(v4 repeated the line twice). */}
			<Pop from={21.86}>
				<div style={{ fontFamily: inter, fontWeight: 800, fontSize: 40, color: GOLD, marginTop: 16 }}>
					why did those banks sell?
				</div>
			</Pop>
		</div>
	);
};

const QuestionStack: React.FC = () => (
	<div style={{ position: "absolute", left: 100, top: 830 }}>
		{STACK_LINES.map((l, i) => (
			<Pop key={l.text} from={l.at}>
				<div
					style={{
						fontFamily: inter,
						fontWeight: 800,
						fontSize: 40,
						color: i === 1 ? GOLD : BONE,
						marginBottom: 14,
						letterSpacing: 1,
					}}
				>
					{l.text}
				</div>
			</Pop>
		))}
	</div>
);

export const DebtPreview: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const t = frame / fps;

	// Mouth volume from the VO (talkGain ~6, per the puppet spec).
	const audioData = useAudioData(staticFile(VO_SRC));
	const talk = audioData
		? Math.min(1, (visualizeAudio({ fps, frame, audioData, numberOfSamples: 1 })[0] ?? 0) * 6)
		: 0;

	const beatIndex = BEATS.findIndex((b) => t >= b.start && t < b.end);
	const beat = BEATS[beatIndex >= 0 ? beatIndex : BEATS.length - 1]!;
	const idx = beatIndex >= 0 ? beatIndex : BEATS.length - 1;

	return (
		<AbsoluteFill style={{ background: INK }}>
			<Audio src={staticFile(VO_SRC)} />
			<Plate beat={beat} />
			<BrandChip />
			<Tracker current={idx} />

			<DataCard beat={beat} />
			{beat.card?.source ? <SourceBar text={beat.card.source} from={beat.card.from} /> : null}

			{beat.chart ? <Chart from={beat.chart.from} to={beat.chart.to} /> : null}
			{beat.extra === "dueStrip" ? <DueStrip /> : null}
			{beat.extra === "fortuneBar" ? <FortuneBar from={beat.start} to={beat.end} /> : null}
			{beat.extra === "questionStack" ? <QuestionStack /> : null}

			{/* gold progress line + end plate (close beat) */}
			{beat.extra === "progressLine" ? (
				<div
					style={{
						position: "absolute",
						left: 0,
						bottom: 0,
						width: 1920 * (frame / DURATION_FRAMES),
						height: 6,
						background: GOLD,
					}}
				/>
			) : null}
			{t >= 29.2 ? (
				<div
					style={{
						position: "absolute",
						left: 0,
						top: 880,
						width: 1920,
						textAlign: "center",
						fontFamily: serif,
						fontWeight: 800,
						fontSize: 64,
						color: GOLD,
						letterSpacing: 6,
						opacity: interpolate(frame, [f(29.2), f(30.0)], [0, 1]),
					}}
				>
					AURELIS HQ
				</div>
			) : null}

			{/* the puppet: frame-right, pose/prop changes per beat, mouth on VO */}
			<Puppet
				x={PUPPET_X}
				groundY={PUPPET_GROUND_Y}
				height={PUPPET_HEIGHT}
				gestures={GESTURES}
				talk={talk}
			/>
		</AbsoluteFill>
	);
};

export default DebtPreview;
