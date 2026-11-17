import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { palette } from "../empire/theme";

const inter = loadInter("normal", { weights: ["800", "900"], subsets: ["latin"] }).fontFamily;
const serif = loadFraunces("normal", { weights: ["800"], subsets: ["latin"] }).fontFamily;

/** 1280×720 thumbnail: no faces, one rising-bars visual, only the 62% the video supports (PwC 2026) */
export const SkillsThumb: React.FC = () => {
  const bars = [0.22, 0.3, 0.38, 0.5, 0.62, 0.8, 1];
  return (
    <AbsoluteFill style={{ background: palette.obsidian }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 75% 60%, rgba(217,119,6,0.38), rgba(9,10,15,0) 62%)" }} />
      <div style={{ position: "absolute", left: 800, right: 60, bottom: 70, top: 120, display: "flex", alignItems: "flex-end", gap: 18 }}>
        {bars.map((h, i) => (
          <div key={i} style={{ flex: 1, height: `${h * 100}%`, background: i === bars.length - 1 ? palette.gold : "rgba(245,245,244,0.2)", borderRadius: 6 }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 60, top: 60, fontFamily: inter, fontWeight: 900, fontSize: 30, letterSpacing: 9, color: palette.gold }}>AURELIS</div>
      <div style={{ position: "absolute", left: 56, top: 120, fontFamily: serif, fontWeight: 800, color: palette.gold, lineHeight: 0.92, letterSpacing: -4 }}>
        <div style={{ fontFamily: inter, fontWeight: 900, fontSize: 44, letterSpacing: 10, color: palette.bone, marginBottom: 14 }}>AI SKILLS</div>
        <div style={{ fontSize: 270 }}>62%</div>
        <div style={{ fontSize: 112, color: palette.bone, letterSpacing: -2, marginTop: 6 }}>MORE PAY</div>
      </div>
      <div style={{ position: "absolute", left: 62, bottom: 62, fontFamily: inter, fontWeight: 900, fontSize: 44, letterSpacing: 6, color: palette.bone, borderLeft: `8px solid ${palette.gold}`, paddingLeft: 20 }}>15 SKILLS · BY 2030</div>
    </AbsoluteFill>
  );
};
