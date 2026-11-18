// 10 s pose-snap test (puppet frame-right, card frame-left): narration beats 44-45 (Money Psychology video), plate bank_counter. Talking at rest -> snap to pointLeft at the "63%" data card
// -> back to rest -> shrug on "more than a third would not". Expressions and the talking mouth continue across every snap.
import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FRAUNCES, INTER, PAL, clamp, pop } from "../moneypsych/theme";
import { GestureCue, Puppet } from "./Puppet";

const FPS = 30, SECONDS = 10; export const SNAP_FRAMES = FPS * SECONDS;
const AUDIO = staticFile("audio/puppet/snap_line.wav");
const T63 = 2.32;                                              // "63" in this clip (faster-whisper); the shrug lands at "third" (9.66 s)
const CUES: GestureCue[] = [{ name: "pointLeft", from: 1.7, to: 6.0 }, { name: "shrug", from: 9.4, to: 10 }];
const Card: React.FC<{ t: number }> = ({ t }) => {
  const k = pop(t, T63, 0.6) * (1 - interpolate(t, [6.0, 6.3], [0, 1], clamp)); if (k <= 0.001) return null; const num = pop(t, T63 + 0.15, 0.7);
  return (
    <div style={{ position: "absolute", left: 150, top: 250, width: 760, height: 470, boxSizing: "border-box", borderRadius: 22, background: PAL.charcoalDeep, border: `7px solid ${PAL.gold}`, opacity: k, transform: `scale(${0.88 + 0.12 * k})`, textAlign: "center" }}>
      <div style={{ margin: 16, height: 424, boxSizing: "border-box", borderRadius: 14, border: `2px solid ${PAL.goldDark}`, position: "relative" }}>
        <div style={{ position: "absolute", top: 28, width: "100%", fontFamily: INTER, fontWeight: 700, fontSize: 40, color: PAL.gold }}>FEDERAL RESERVE · 2025</div>
        <div style={{ position: "absolute", top: 100, width: "100%", fontFamily: FRAUNCES, fontWeight: 700, fontSize: 190, lineHeight: 1, color: PAL.gold, opacity: num, transform: `scale(${0.8 + 0.2 * num})` }}>63%</div>
        <div style={{ position: "absolute", bottom: 28, width: "100%", padding: "0 40px", boxSizing: "border-box", fontFamily: INTER, fontWeight: 600, fontSize: 36, lineHeight: 1.2, color: PAL.ivory }}>would cover a $400 emergency expense with cash or its equivalent</div>
      </div>
    </div>
  );
};
export const SnapTest: React.FC = () => {
  const t = useCurrentFrame() / FPS; const expression = t < 9.4 ? "neutral" : "sad";
  return (
    <AbsoluteFill style={{ background: PAL.charcoalDeep }}>
      <Audio src={AUDIO} />
      <Img src={staticFile("img/aurelis/library/plate_bank_counter.png")} style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, filter: "brightness(0.78)" }} />
      <AbsoluteFill style={{ background: "rgba(14,14,18,.22)" }} />
      <Puppet x={1330} feetY={985} height={780} expression={expression} gestures={CUES} talkSrc={AUDIO} talkGain={6} />
      <Card t={t} />
    </AbsoluteFill>
  );
};
