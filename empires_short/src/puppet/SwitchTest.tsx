// 6 s switch test: library cut-out -> puppet -> library cut-out -> puppet -> library on the SAME plate, same position and height, hard cuts at 1.2 s intervals.
// Every cut is labelled with a small corner tag (remove LABELS for the real test). Poses are matched: idle front, then the puppet idles with the same neutral face.
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { INTER, PAL } from "../moneypsych/theme";
import { Puppet } from "./Puppet";

const FPS = 30, SECS = 6; export const SWITCH_FRAMES = FPS * SECS;
const X = 960, FEET = 985, H = 760;
const CUTS = [0, 1.2, 2.4, 3.6, 4.8];             // library, puppet, library, puppet, library
export const SwitchTest: React.FC<{ labels?: boolean }> = ({ labels = true }) => {
  const t = useCurrentFrame() / FPS; const idx = CUTS.filter((c) => t >= c).length - 1; const puppet = idx % 2 === 1;
  const w = (H * 459) / 806;
  return (
    <AbsoluteFill style={{ background: PAL.charcoalDeep }}>
      <Img src={staticFile("img/aurelis/library/plate_bank_counter.png")} style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, filter: "brightness(0.78)" }} />
      <AbsoluteFill style={{ background: "rgba(14,14,18,.22)" }} />
      {puppet
        ? <Puppet x={X} feetY={FEET} height={H} expression="neutral" shadow />
        : <><div style={{ position: "absolute", left: X - w * 0.34, top: FEET - 14, width: w * 0.68, height: 28, borderRadius: "50%", background: "rgba(0,0,0,.4)", filter: "blur(5px)" }} />
            <Img src={staticFile("img/aurelis/library/mascot_idle_front.png")} style={{ position: "absolute", left: X - (w * 220) / 459, top: FEET - (H * 781) / 806, height: H }} /></>}
      {labels && <div style={{ position: "absolute", left: 40, top: 36, padding: "8px 24px", borderRadius: 12, background: "rgba(27,27,31,.9)", border: `3px solid ${PAL.gold}`, fontFamily: INTER, fontWeight: 700, fontSize: 36, color: PAL.gold }}>{puppet ? "PUPPET" : "LIBRARY"}</div>}
    </AbsoluteFill>
  );
};
