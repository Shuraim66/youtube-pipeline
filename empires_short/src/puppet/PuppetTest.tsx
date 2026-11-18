// 15.6 s puppet test: narration beats 43-45 of the Money Psychology video (real Kokoro audio), on library plate `bank_counter`.
// The puppet talks (mouth follows the volume), points at the data card on the key word "63%", then shrugs at "would not".
import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FRAUNCES, INTER, PAL, clamp, pop } from "../moneypsych/theme";
import { GestureCue, Puppet } from "./Puppet";

const FPS = 30, SECONDS = 15.6; export const TEST_FRAMES = Math.round(SECONDS * FPS);
const AUDIO = staticFile("audio/puppet/test_line.wav");
// key word times from faster-whisper (seconds into this clip): "63" 6.93 s, "would not" 14.47 s
const T63 = 6.93;
const CUES: GestureCue[] = [
  { name: "explain", from: 0.5, to: 3.9 },
  { name: "pointLeft", from: T63 - 0.7, to: 12.7 },        // arm is up before the number is said, held through the sentence
  { name: "shrug", from: 13.85, to: 15.7 },
];

const Card: React.FC<{ t: number }> = ({ t }) => {
  const k = pop(t, T63, 0.6) * (1 - interpolate(t, [13.2, 13.5], [0, 1], clamp)); if (k <= 0.001) return null;
  const num = pop(t, T63 + 0.15, 0.7);
  return (
    <div style={{ position: "absolute", left: 1010, top: 250, width: 760, height: 470, boxSizing: "border-box", borderRadius: 22, background: PAL.charcoalDeep, border: `7px solid ${PAL.gold}`, opacity: k, transform: `scale(${0.88 + 0.12 * k})`, textAlign: "center" }}>
      <div style={{ margin: 16, height: 424, boxSizing: "border-box", borderRadius: 14, border: `2px solid ${PAL.goldDark}`, position: "relative" }}>
        <div style={{ position: "absolute", top: 28, width: "100%", fontFamily: INTER, fontWeight: 700, fontSize: 40, color: PAL.gold }}>FEDERAL RESERVE · 2025</div>
        <div style={{ position: "absolute", top: 100, width: "100%", fontFamily: FRAUNCES, fontWeight: 700, fontSize: 190, lineHeight: 1, color: PAL.gold, opacity: num, transform: `scale(${0.8 + 0.2 * num})` }}>63%</div>
        <div style={{ position: "absolute", bottom: 28, width: "100%", padding: "0 40px", boxSizing: "border-box", fontFamily: INTER, fontWeight: 600, fontSize: 36, lineHeight: 1.2, color: PAL.ivory }}>would cover a $400 emergency expense with cash or its equivalent</div>
      </div>
    </div>
  );
};

export const PuppetTest: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const expression = t < 13.6 ? "neutral" : "sad";
  return (
    <AbsoluteFill style={{ background: PAL.charcoalDeep }}>
      <Audio src={AUDIO} />
      <Img src={staticFile("img/aurelis/library/plate_bank_counter.png")} style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, filter: "brightness(0.78)" }} />
      <AbsoluteFill style={{ background: "rgba(14,14,18,.22)" }} />
      <Puppet x={560} feetY={985} height={780} expression={expression} gestures={CUES} talkSrc={AUDIO} talkGain={6} />
      <Card t={t} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 28, textAlign: "center", opacity: pop(t, T63 + 0.3, 0.5) * (1 - interpolate(t, [13.2, 13.5], [0, 1], clamp)) }}>
        <span style={{ padding: "10px 32px", borderRadius: 14, background: "rgba(27,27,31,.92)", border: `3px solid ${PAL.gold}`, fontFamily: INTER, fontWeight: 600, fontSize: 36, color: PAL.ivory }}><b style={{ color: PAL.gold }}>SOURCE · </b>Federal Reserve · Well-Being of US Households · 2025</span>
      </div>
    </AbsoluteFill>
  );
};
