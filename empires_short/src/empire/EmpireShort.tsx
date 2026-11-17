import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { BleedingChart, type ChartPoint } from "./components/BleedingChart";
import { KineticHeadline } from "./components/KineticHeadline";
import { ScreenShake } from "./components/ScreenShake";
import { TimelineBeat } from "./components/TimelineBeat";
import { Scene } from "./components/Scenes";
import type { SceneSpec, TimelineNode } from "./types";
import { palette } from "./theme";
import { BeatText, BeatTransition, Emblem, HookText, OutroText, Progress, SceneFrame, WipeLine, YearCard } from "./formats";
import type { EmpireTimeline } from "./types";

const { fontFamily } = loadFont("normal", { weights: ["600", "700", "800", "900"], subsets: ["latin"] });

export type EmpireShortProps = {
  timeline: EmpireTimeline;
  /** Show per-beat background footage (node.bg). */
  footage?: boolean;
  /** Mix in procedural SFX + drone. */
  sound?: boolean;
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** White flash + horizontal whip at every cut. */
const CutFlash: React.FC<{ at: number[] }> = ({ at }) => {
  const frame = useCurrentFrame();
  const since = Math.min(...at.map((a) => (frame >= a ? frame - a : 999)));
  const o = interpolate(since, [0, 5], [0.55, 0], clamp);
  return o > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: o, mixBlendMode: "screen" }} /> : null;
};

/** Short digital glitch (RGB-shifted slices) on failure cuts. */
const Glitch: React.FC<{ at: number[] }> = ({ at }) => {
  const frame = useCurrentFrame();
  const since = Math.min(...at.map((a) => (frame >= a ? frame - a : 999)));
  if (since > 6) return null;
  const bands = [0.12, 0.31, 0.47, 0.66, 0.83];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {bands.map((b, i) => {
        const h = 20 + ((i * 37 + since * 13) % 70);
        const dx = (((i * 53 + since * 29) % 90) - 45) * 1.6;
        return (
          <div
            key={i}
            className="absolute left-0 w-full"
            style={{
              top: `${b * 100}%`,
              height: h,
              transform: `translateX(${dx}px)`,
              background: i % 2 ? "rgba(239,68,68,0.45)" : "rgba(56,189,248,0.3)",
              mixBlendMode: "screen",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Whip-in wrapper for a beat's content. */
const WhipIn: React.FC<{ children: React.ReactNode; dir?: 1 | -1; from?: number }> = ({ children, dir = 1, from = 0 }) => {
  const frame = useCurrentFrame() - from;
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 20, stiffness: 260, mass: 0.6 } });
  const x = interpolate(p, [0, 1], [dir * 160, 0]);
  return (
    <AbsoluteFill style={{ transform: `translateX(${x}px)`, filter: `blur(${Math.abs(x) / 40}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

const Footage: React.FC<{ src: string }> = ({ src }) => (
  <AbsoluteFill>
    <OffthreadVideo
      src={staticFile(src)}
      muted
      style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(6px) saturate(0.6) brightness(0.45)" }}
    />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(9,10,15,0.55), rgba(9,10,15,0.85))" }} />
  </AbsoluteFill>
);

/** Outro sign-off: emblem + follow line (no "full video" claim — there is no long-form). */
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 14, fps, config: { damping: 16, stiffness: 180 } });
  return (
    <div
      className="mt-14 flex flex-col items-center gap-4"
      style={{ opacity: p, transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px)` }}
    >
      <Img src={staticFile("emblem.png")} style={{ width: 150, height: 150 }} />
      <span className="text-[30px] font-black uppercase tracking-[0.25em]" style={{ color: palette.gold }}>
        Follow for the next fall
      </span>
    </div>
  );
};

/** A scene frozen at its end state, so it can continue under the outro without replaying. */
const holdEnd = (spec: SceneSpec): SceneSpec =>
  spec.kind === "stores" ? { ...spec, litFrom: spec.litTo } : spec.kind === "noService" ? { ...spec, hold: true } : spec;

/**
 * Frame-0 punch: the first frame is fully composed (no fade/offset), then a quick
 * push from 1.04 → 1.0 over 10 frames gives the feed something moving in the first
 * third of a second.
 */
const hookPunch = (frame: number) => interpolate(frame, [0, 10], [1.04, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => 1 - Math.pow(1 - t, 3) });

const LoopBridge: React.FC<{ frames: number; children: React.ReactNode }> = ({ frames, children }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: interpolate(frame, [0, frames - 1], [0, 1], { extrapolateRight: "clamp" }) }}>{children}</AbsoluteFill>;
};

const MidPrompt: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 14, stiffness: 220 } });
  return (
    <div className="absolute flex justify-center" style={{ top: 1470, left: 40, right: 150 }}>
      <span className="rounded-full px-7 py-3 text-[36px] font-black uppercase tracking-[0.06em]" style={{ background: palette.gold, color: palette.obsidian, transform: `scale(${p})` }}>
        {text} 👇
      </span>
    </div>
  );
};

const sceneOf = (n: TimelineNode) => n.scene ?? { kind: "chart" as const };

/** Total frames for a timeline: last beat end + outro. */
export const getEmpireDuration = (t: EmpireTimeline, fps: number): number => {
  const last = t.nodes[t.nodes.length - 1];
  const beatsEnd = last ? last.atSec + last.durationSec : 0;
  return Math.ceil((beatsEnd + t.outroDurationSec) * fps);
};

const FilmGrain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07] mix-blend-screen">
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 12} />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
};

const Backdrop: React.FC<{ danger: number }> = ({ danger }) => (
  <>
    <AbsoluteFill style={{ background: palette.obsidian }} />
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 80% 55% at 50% 30%, ${palette.obsidianLift} 0%, ${palette.obsidian} 70%)`,
      }}
    />
    {/* Crimson bleed rising from the bottom as the empire declines. */}
    <AbsoluteFill
      style={{
        background: `linear-gradient(to top, ${palette.crimsonDeep} 0%, rgba(127,29,29,0) 55%)`,
        opacity: danger,
      }}
    />
    <AbsoluteFill style={{ boxShadow: "inset 0 0 260px 80px rgba(0,0,0,0.9)" }} />
  </>
);

export const EmpireShort: React.FC<EmpireShortProps> = ({ timeline, footage = false, sound = true }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const fmt = timeline.format ?? "stack";
  const { durationInFrames } = useVideoConfig();
  const BRIDGE = 8;

  const firstBeat = Math.round((timeline.nodes[0]?.atSec ?? 0) * fps);
  const lastNode = timeline.nodes[timeline.nodes.length - 1];
  const outroStart = Math.round(lastNode ? (lastNode.atSec + lastNode.durationSec) * fps : 0);

  const chartPoints = useMemo<ChartPoint[]>(
    () =>
      timeline.nodes
        .filter((n): n is typeof n & { value: number } => n.value !== undefined)
        .map((n) => ({ label: n.label, value: n.value, marker: n.marker, atFrame: Math.round(n.atSec * fps) })),
    [timeline, fps],
  );

  // Shake fires ~8 frames into a failure beat — when the line reaches the new low.
  const impacts = useMemo(
    () =>
      timeline.nodes
        .filter((n) => n.shake)
        .map((n) => ({ frame: Math.round(n.atSec * fps) + 8, intensity: 34 })),
    [timeline, fps],
  );

  const failuresSoFar = timeline.nodes.filter((n) => n.severity === "failure" && frame >= n.atSec * fps).length;
  const totalFailures = Math.max(1, timeline.nodes.filter((n) => n.severity === "failure").length);
  const danger = interpolate(failuresSoFar, [0, totalFailures], [0.1, 0.75]);

  // v2 outro continues the last scene, so it is not a cut (no flash / whoosh).
  const cuts = timeline.nodes.map((n) => Math.round(n.atSec * fps)).concat(timeline.outroOverLast ? [] : [outroStart]);
  const failureCuts = timeline.nodes.filter((n) => n.severity === "failure").map((n) => Math.round(n.atSec * fps));
  const active = timeline.nodes.find((n) => frame >= n.atSec * fps && frame < (n.atSec + n.durationSec) * fps);
  const activeScene = active ? sceneOf(active) : null;
  const showChart = activeScene?.kind === "chart";
  const zoomSpec = activeScene?.kind === "chart" && activeScene.zoom;
  const zoom =
    zoomSpec && active
      ? spring({ frame: frame - Math.round(active.atSec * fps) - 6, fps, config: { damping: 22, stiffness: 90 } })
      : 0;

  return (
    <AbsoluteFill style={{ fontFamily, background: palette.obsidian }}>
      <AbsoluteFill style={{ transform: `scale(${hookPunch(frame)})` }}>
      <ScreenShake impacts={impacts}>
        <Backdrop danger={danger} />
        {footage &&
          timeline.nodes.map((n) =>
            n.bg ? (
              <Sequence key={`bg-${n.id}`} from={Math.round(n.atSec * fps)} durationInFrames={Math.round(n.durationSec * fps)} layout="none">
                <Footage src={n.bg} />
              </Sequence>
            ) : null,
          )}

        <Progress format={fmt} nodes={timeline.nodes} fps={fps} />
        <Emblem format={fmt} />

        {/* Hook — frame 0, full bleed */}
        {fmt !== "stack" && (
          <Sequence durationInFrames={firstBeat} layout="none">
            {timeline.hookScene && (
              <SceneFrame format={fmt}>
                <Scene spec={timeline.hookScene} beatFrames={firstBeat} />
              </SceneFrame>
            )}
            <HookText format={fmt} text={timeline.hook} emphasis={timeline.hookEmphasis} />
          </Sequence>
        )}
        {fmt === "stack" && <Sequence durationInFrames={firstBeat} layout="none">
          {timeline.hookScene && (
            <div className="absolute left-0 w-full" style={{ top: 200, height: 760 }}>
              <Scene spec={timeline.hookScene} beatFrames={firstBeat} />
            </div>
          )}
          <AbsoluteFill
            className={timeline.hookScene ? "items-center" : "items-center justify-center px-12"}
            style={timeline.hookScene ? { top: 990, left: 40, right: 150 } : undefined}
          >
            {!timeline.hookScene && (
              <span className="mb-10 text-[44px] font-black uppercase tracking-[0.4em]" style={{ color: palette.gold }}>
                {timeline.company}
              </span>
            )}
            <KineticHeadline
              text={timeline.hook}
              emphasis={timeline.hookEmphasis}
              // Negative delay: every word is already settled on frame 0 — no entry lag on the hook.
              delay={-24}
              stagger={3}
              wordsPerLine={timeline.hookScene ? 3 : 2}
              fontSize={timeline.hookScene ? 92 : 150}
            />
          </AbsoluteFill>
        </Sequence>}

        {/* Chart: the through-line — shown on chart beats, keeps drawing underneath the others */}
        {showChart && (
          // Not wrapped in a Sequence: the chart needs the absolute frame to keep its full history.
          <WhipIn from={Math.round((active?.atSec ?? 0) * fps)}>
              <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 200 }}>
                <BleedingChart
                  points={chartPoints}
                  width={width - 80}
                  height={760}
                  zoom={zoom}
                  unitPrefix={timeline.unitPrefix}
                  unitSuffix={timeline.unitSuffix}
                  metricLabel={timeline.metricLabel}
                />
              </div>
          </WhipIn>
        )}

        {/* Timeline beats — non-stack formats */}
        {fmt !== "stack" &&
          timeline.nodes.map((node, i) => (
            <Sequence key={node.id} from={Math.round(node.atSec * fps)} durationInFrames={Math.round(node.durationSec * fps)} layout="none">
              <BeatTransition format={fmt} dir={node.severity === "failure" ? -1 : 1}>
                <SceneFrame format={fmt}>
                  <Scene spec={sceneOf(node)} beatFrames={Math.round(node.durationSec * fps)} />
                </SceneFrame>
                <BeatText format={fmt} node={node} index={i} total={timeline.nodes.length} />
              </BeatTransition>
              {fmt === "chapters" && <YearCard node={node} />}
            </Sequence>
          ))}

        {/* Timeline beats — stack */}
        {fmt === "stack" && timeline.nodes.map((node) => (
          <Sequence
            key={node.id}
            from={Math.round(node.atSec * fps)}
            durationInFrames={Math.round(node.durationSec * fps)}
            layout="none"
          >
            <WhipIn dir={node.severity === "failure" ? -1 : 1}>
              {sceneOf(node).kind !== "chart" && (
                <div className="absolute left-0 w-full" style={{ top: 200, height: 760 }}>
                  <Scene spec={sceneOf(node)} beatFrames={Math.round(node.durationSec * fps)} />
                </div>
              )}
              {/* right padding keeps text clear of the Shorts action rail */}
              <div className="absolute" style={{ top: 990, left: 40, right: 150 }}>
                <TimelineBeat node={node} minimal={timeline.minimal} />
              </div>
            </WhipIn>
          </Sequence>
        ))}

        {/* Outro (v2): keep the last scene moving under the closing line — no static end card */}
        {fmt !== "stack" && lastNode && (
          <Sequence from={outroStart} layout="none">
            {fmt !== "chapters" && (
              <SceneFrame format={fmt}>
                <div style={{ width: "100%", height: "100%", filter: fmt === "poster" ? "grayscale(1) brightness(0.6)" : undefined }}>
                  <Scene spec={holdEnd(sceneOf(lastNode))} beatFrames={Math.round(lastNode.durationSec * fps)} />
                </div>
              </SceneFrame>
            )}
            <OutroText format={fmt} text={timeline.outro} emphasis={timeline.outroEmphasis} span={timeline.span ?? ""} prompt={timeline.prompt} />
          </Sequence>
        )}
        {fmt === "stack" && timeline.outroOverLast && lastNode && (
          <Sequence from={outroStart} layout="none">
            {sceneOf(lastNode).kind !== "chart" && (
              <div className="absolute left-0 w-full" style={{ top: 200, height: 760 }}>
                {/* hold the last scene's end state (no restart) */}
                <Scene spec={holdEnd(sceneOf(lastNode))} beatFrames={Math.round(lastNode.durationSec * fps)} />
              </div>
            )}
            <div className="absolute flex justify-center" style={{ top: 1000, left: 40, right: 150 }}>
              <KineticHeadline text={timeline.outro} emphasis={timeline.outroEmphasis} delay={2} stagger={3} wordsPerLine={3} fontSize={96} />
            </div>
            {/* on-screen comment prompt (text only, so the spoken loop stays clean) */}
            {timeline.prompt && (
              <div className="absolute flex justify-center" style={{ top: 1360, left: 40, right: 150 }}>
                <span
                  className="rounded-full px-8 py-3 text-[40px] font-black uppercase tracking-[0.08em]"
                  style={{ background: palette.gold, color: palette.obsidian }}
                >
                  {timeline.prompt}
                </span>
              </div>
            )}
          </Sequence>
        )}

        {/* Outro (v1) */}
        {fmt === "stack" && !timeline.outroOverLast && <Sequence from={outroStart} layout="none">
          <AbsoluteFill className="items-center justify-center" style={{ paddingLeft: 40, paddingRight: 150 }}>
            <KineticHeadline
              text={timeline.outro}
              emphasis={timeline.outroEmphasis}
              stagger={4}
              wordsPerLine={3}
              fontSize={104}
            />
            <EndCard />
          </AbsoluteFill>
        </Sequence>}

        {/* mid-video comment prompt (viewers leave before the outro) */}
        {timeline.promptAtSec !== undefined && timeline.prompt && (
          <Sequence from={Math.round(timeline.promptAtSec * fps)} durationInFrames={Math.max(1, outroStart - Math.round(timeline.promptAtSec * fps))} layout="none">
            <MidPrompt text={timeline.prompt} />
          </Sequence>
        )}

        {/* loop bridge: the last frames dissolve back into the frame-0 hook so the replay is one continuous shot */}
        {fmt !== "stack" && (
          <Sequence from={durationInFrames - BRIDGE} layout="none">
            <LoopBridge frames={BRIDGE}>
              <Backdrop danger={0.1} />
              {timeline.hookScene && (
                <SceneFrame format={fmt}>
                  <Scene spec={timeline.hookScene} beatFrames={firstBeat} />
                </SceneFrame>
              )}
              <HookText format={fmt} text={timeline.hook} emphasis={timeline.hookEmphasis} />
              <Progress format={fmt} nodes={timeline.nodes} fps={fps} />
              <Emblem format={fmt} />
            </LoopBridge>
          </Sequence>
        )}

        <FilmGrain />
      </ScreenShake>
      </AbsoluteFill>
      {fmt === "stack" || fmt === "dossier" ? <CutFlash at={cuts} /> : null}
      {fmt === "poster" && <WipeLine at={cuts} />}
      <Glitch at={failureCuts} />

      {sound && (
        <>
          {timeline.vo && <Audio src={staticFile(timeline.vo)} volume={1} />}
          {/* beds and SFX sit under the voice */}
          <Audio src={staticFile("sfx/drone.wav")} volume={timeline.vo ? 0.14 : 0.35} loop />
          <Audio src={staticFile("sfx/impact.wav")} volume={0.7} />
          {cuts.map((c) => (
            <Sequence key={`w${c}`} from={Math.max(0, c - 4)} durationInFrames={20} layout="none">
              <Audio src={staticFile("sfx/whoosh.wav")} volume={0.35} />
            </Sequence>
          ))}
          {failureCuts.map((c) => (
            <Sequence key={`g${c}`} from={c} durationInFrames={10} layout="none">
              <Audio src={staticFile("sfx/glitch.wav")} volume={0.4} />
            </Sequence>
          ))}
          {impacts.map((im) => (
            <Sequence key={`i${im.frame}`} from={im.frame} durationInFrames={48} layout="none">
              <Audio src={staticFile("sfx/impact.wav")} volume={0.55} />
            </Sequence>
          ))}
          {chartPoints.flatMap((p) =>
            [0, 4, 8, 12].map((d) => (
              <Sequence key={`t${p.atFrame}-${d}`} from={p.atFrame + d} durationInFrames={3} layout="none">
                <Audio src={staticFile("sfx/tick.wav")} volume={0.2} />
              </Sequence>
            )),
          )}
        </>
      )}
    </AbsoluteFill>
  );
};
