// PuppetSheet.tsx — QA sheet for the rewritten Puppet v2.0.
// One frame, 1920x1080: every pose + expression, each puppet labelled.
// Render: npx remotion still src/debt/entry.tsx PuppetSheet out/debt_preview/puppet_sheet.png

import React from "react";
import { AbsoluteFill } from "remotion";
import { Puppet, type Expression, type Gesture } from "../puppet/Puppet.rewrite-2026-11-18";

const INK = "#2B2B31";
const GOLD = "#E0B54A";
const BONE = "#F4ECD8";

const CELLS: { label: string; gesture?: Gesture; expression: Expression; talk?: number }[] = [
	{ label: "rest / neutral", expression: "neutral" },
	{ label: "rest / shocked", expression: "shocked" },
	{ label: "rest / happy (talk 0.6)", expression: "happy", talk: 0.6 },
	{ label: "explain", gesture: { name: "explain", from: 0, to: 99 }, expression: "neutral" },
	{ label: "pointLeft", gesture: { name: "pointLeft", from: 0, to: 99 }, expression: "neutral" },
	{ label: "thumbsUp", gesture: { name: "thumbsUp", from: 0, to: 99 }, expression: "happy" },
	{ label: "shrug", gesture: { name: "shrug", from: 0, to: 99 }, expression: "worried" },
	{ label: "celebrate", gesture: { name: "celebrate", from: 0, to: 99 }, expression: "happy" },
	{ label: "worriedHands", gesture: { name: "worriedHands", from: 0, to: 99 }, expression: "worried" },
	{ label: "holdProp receipt", gesture: { name: "holdProp", prop: "receipt", from: 0, to: 99 }, expression: "worried" },
	{ label: "holdProp cash", gesture: { name: "holdProp", prop: "cash", from: 0, to: 99 }, expression: "happy" },
	{ label: "holdProp card", gesture: { name: "holdProp", prop: "card", from: 0, to: 99 }, expression: "happy" },
];

export const PuppetSheet: React.FC = () => {
	return (
		<AbsoluteFill style={{ background: INK }}>
			<div
				style={{
					position: "absolute",
					left: 40,
					top: 24,
					fontFamily: "Inter, sans-serif",
					fontWeight: 800,
					fontSize: 36,
					color: GOLD,
					letterSpacing: 2,
				}}
			>
				PUPPET v2.0 (REWRITE) — QA SHEET
			</div>
			{CELLS.map((c, i) => {
				const col = i % 6;
				const row = Math.floor(i / 6);
				const x = 60 + col * 310;
				const groundY = 470 + row * 500;
				return (
					<div key={c.label}>
						<div
							style={{
								position: "absolute",
								left: x,
								top: groundY - 400,
								width: 300,
								textAlign: "center",
								fontFamily: "Inter, sans-serif",
								fontWeight: 700,
								fontSize: 26,
								color: BONE,
							}}
						>
							{c.label}
						</div>
						<Puppet
							x={x + 40}
							groundY={groundY}
							height={380}
							gestures={c.gesture ? [c.gesture] : []}
							expression={c.expression}
							talk={c.talk ?? 0}
							blinkSeed={i * 37}
						/>
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

export default PuppetSheet;
