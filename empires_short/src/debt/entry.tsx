// debt/entry.tsx — Remotion entry for the debt preview (v3).
// Mirrors the moneypsych pattern: `npx remotion render src/debt/entry.tsx
// DebtPreview out/debt_preview/preview.mp4 --crf=18 --concurrency=1`
// (low concurrency: the machine is short on free RAM).
// This entry is separate from src/Root.tsx so the preview does not touch the
// registered compositions.

import React from "react";
import { Composition, registerRoot } from "remotion";
import { DebtPreview } from "./DebtPreview";
import { PuppetSheet } from "./PuppetSheet";
import { DURATION_FRAMES } from "./data";

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="DebtPreview"
				component={DebtPreview}
				durationInFrames={DURATION_FRAMES}
				fps={30}
				width={1920}
				height={1080}
			/>
			<Composition
				id="PuppetSheet"
				component={PuppetSheet}
				durationInFrames={1}
				fps={30}
				width={1920}
				height={1080}
			/>
		</>
	);
};

registerRoot(RemotionRoot);
