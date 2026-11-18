import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { INTER, PAL } from "../moneypsych/theme";
import { EXPRESSIONS, Expression, GestureName, Puppet, PropKind } from "./Puppet";

type Item = { g: GestureName; prop?: PropKind; label: string };
const ITEMS: Item[] = [
  { g: "rest", label: "rest" }, { g: "explain", label: "explain" }, { g: "pointLeft", label: "pointLeft" }, { g: "thumbsUp", label: "thumbsUp" },
  { g: "shrug", label: "shrug" }, { g: "celebrate", label: "celebrate" }, { g: "worriedHands", label: "worriedHands" }, { g: "holdProp", prop: "cash", label: "hold cash" }, { g: "holdProp", prop: "card", label: "hold card" },
  { g: "holdProp", prop: "piggy_bank", label: "hold piggy bank" }, { g: "holdProp", prop: "phone", label: "hold phone" }, { g: "holdProp", prop: "receipt", label: "hold receipt" }, { g: "holdProp", prop: "calendar", label: "hold calendar" }, { g: "holdProp", prop: "lottery_ticket", label: "hold lottery ticket" },
  { g: "holdProp", prop: "pay_slip", label: "hold pay slip" }, { g: "holdProp", prop: "clipboard", label: "hold clipboard" }, { g: "holdProp", prop: "test_paper", label: "hold test paper" }, { g: "holdProp", prop: "car_keys", label: "hold car keys" },
];
const EXPR = Object.keys(EXPRESSIONS) as Expression[];
const Lab: React.FC<{ x: number; y: number; t: string }> = ({ x, y, t }) => <div style={{ position: "absolute", left: x - 190, top: y, width: 380, textAlign: "center", fontFamily: INTER, fontWeight: 700, fontSize: 30, color: PAL.gold }}>{t}</div>;

/** QA sheet: every gesture snapped (pose-snap sprite + puppet head + SVG face), then the expressions. Frame 40 = well after every snap. */
export const PuppetSheet: React.FC = () => (
  <AbsoluteFill style={{ background: PAL.charcoal }}>
    {ITEMS.map((it, i) => { const x = 192 + (i % 5) * 384, y = 400 + Math.floor(i / 5) * 440; return <React.Fragment key={it.label}>
      <Puppet gesture={it.g} propKind={it.prop} height={360} x={x} feetY={y} blinkOffset={-3} />
      <Lab x={x} y={y + 8} t={it.label} /></React.Fragment>; })}
    {EXPR.map((e, i) => { const x = 140 + i * 265, y = 2290; return <React.Fragment key={e}><Puppet expression={e} height={300} x={x} feetY={y} blinkOffset={-3} /><Lab x={x} y={y + 8} t={e} /></React.Fragment>; })}
  </AbsoluteFill>
);

export const PuppetSideBySide: React.FC = () => (
  <AbsoluteFill style={{ background: PAL.charcoal }}>
    <Puppet height={880} x={560} feetY={960} still blinkOffset={-5} shadow={false} />
    <Img src={staticFile("img/aurelis/library/mascot_idle_front.png")} style={{ position: "absolute", left: 1360 - (880 * 459) / 806 / 2, top: 960 - 880 * 781 / 806, height: 880 }} />
    <Lab x={560} y={985} t="PUPPET" /><Lab x={1360} y={985} t="LIBRARY mascot_idle_front" />
  </AbsoluteFill>
);
