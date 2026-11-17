import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { palette, springs } from "../empire/theme";

/**
 * 3D sample: a BlackBerry-style handset whose QWERTY keys break off one by one.
 * Fully frame-driven (no useFrame clock). Frame 0 is composed: phone intact, lit.
 */

const COLS = 10;
const ROWS = 4;
const KEY_W = 0.26;
const KEY_H = 0.17;

// Deterministic pseudo-random per key.
const rand = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

type KeyInfo = { ch: string; x: number; y: number; start: number; vx: number; vy: number; vz: number; rx: number; ry: number };

const LETTERS = ["QWERTYUIOP", "ASDFGHJKL⌫", "ZXCVBNM$.↵", "⇧ 0 ␣ SYM"];

const keyTexture = (ch: string) => {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 84;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 84);
  grad.addColorStop(0, "#f4f4f5"); grad.addColorStop(1, "#b8bcc4");
  g.fillStyle = grad; g.fillRect(0, 0, 128, 84);
  g.fillStyle = "#18181b"; g.font = "bold 50px Inter, Arial, sans-serif";
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(ch.trim(), 64, 46);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const Key: React.FC<{ k: KeyInfo & { ch: string }; frame: number; fps: number }> = ({ k, frame, fps }) => {
  const t = Math.max(0, (frame - k.start) / fps);
  const g = 9;
  const x = k.x + k.vx * t;
  const y = k.y + k.vy * t - 0.5 * g * t * t;
  const z = 0.2 + k.vz * t;
  const popped = t > 0;
  const tex = useMemo(() => keyTexture(k.ch), [k.ch]);
  return (
    <mesh position={[x, y, z]} rotation={[k.rx * t, k.ry * t, k.rx * 0.5 * t]}>
      <boxGeometry args={[KEY_W * 0.88, KEY_H * 0.82, 0.08]} />
      <meshStandardMaterial attach="material-0" color="#9ca3af" metalness={0.6} roughness={0.3} />
      <meshStandardMaterial attach="material-1" color="#9ca3af" metalness={0.6} roughness={0.3} />
      <meshStandardMaterial attach="material-2" color="#9ca3af" metalness={0.6} roughness={0.3} />
      <meshStandardMaterial attach="material-3" color="#9ca3af" metalness={0.6} roughness={0.3} />
      <meshStandardMaterial
        attach="material-4"
        map={tex}
        roughness={0.25}
        metalness={0.1}
        emissive={popped ? palette.crimson : "#000"}
        emissiveIntensity={popped ? Math.max(0, 0.9 - t * 1.5) : 0}
      />
      <meshStandardMaterial attach="material-5" color="#52525b" />
    </mesh>
  );
};

const screenTexture = (glitch: number) => {
  const c = document.createElement("canvas");
  c.width = 640; c.height = 480;
  const g = c.getContext("2d")!;
  const bg = g.createLinearGradient(0, 0, 0, 480);
  bg.addColorStop(0, "#1e3a8a"); bg.addColorStop(1, "#0b1226");
  g.fillStyle = bg; g.fillRect(0, 0, 640, 480);
  g.fillStyle = "rgba(255,255,255,0.85)"; g.font = "600 26px Inter, Arial";
  g.textAlign = "right"; g.fillText("▂▄▆ 3G", 616, 40); g.textAlign = "left";
  g.font = "800 92px Inter, Arial"; g.fillStyle = "#fff"; g.fillText("10:32", 24, 150);
  g.font = "500 26px Inter, Arial"; g.fillStyle = "rgba(255,255,255,0.7)"; g.fillText("Monday, March 14 · 2011", 28, 190);
  const icons = ["✉", "☎", "◷", "✈", "♫", "☰", "⚙", "✎"];
  const cols = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4", "#64748b", "#eab308"];
  icons.forEach((ic, i) => {
    const x = 28 + (i % 4) * 150, y = 230 + Math.floor(i / 4) * 118;
    g.fillStyle = cols[i]!; g.beginPath(); g.roundRect(x, y, 104, 96, 20); g.fill();
    g.fillStyle = "#fff"; g.font = "56px Arial"; g.textAlign = "center"; g.fillText(ic, x + 52, y + 68); g.textAlign = "left";
  });
  g.fillStyle = "#ef4444"; g.beginPath(); g.arc(122, 236, 17, 0, 7); g.fill();
  g.fillStyle = "#fff"; g.font = "700 22px Inter, Arial"; g.textAlign = "center"; g.fillText("47", 122, 244);
  if (glitch > 0) {
    for (let i = 0; i < 14; i++) {
      const y = rand(i, glitch) * 480, h = 6 + rand(i, glitch + 9) * 30;
      g.drawImage(c, 0, y, 640, h, (rand(i, glitch + 3) - 0.5) * 120, y, 640, h);
      g.fillStyle = i % 2 ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.18)"; g.fillRect(0, y, 640, 3);
    }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

export const Phone: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const keys = useMemo<KeyInfo[]>(() => {
    const out: KeyInfo[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c;
        const u = (c - (COLS - 1) / 2) / ((COLS - 1) / 2);
        out.push({
          ch: LETTERS[r]![c] ?? " ",
          x: (c - (COLS - 1) / 2) * KEY_W,
          y: -0.62 - r * KEY_H * 1.2 + 0.09 * u * u,
          start: 28 + Math.floor(rand(i, 1) * 64),
          vx: (rand(i, 2) - 0.5) * 3,
          vy: 1.5 + rand(i, 3) * 2.5,
          vz: 1.5 + rand(i, 4) * 2.5,
          rx: (rand(i, 5) - 0.5) * 16,
          ry: (rand(i, 6) - 0.5) * 16,
        });
      }
    }
    return out;
  }, []);

  // Screen glitches ~frame 80–100, then dies.
  const glitchSeed = frame >= 80 && frame < 100 ? 1 + Math.floor(frame / 3) : 0;
  const screenTex = useMemo(() => screenTexture(glitchSeed), [glitchSeed]);
  const screenOn = frame < 100 ? (frame > 90 && frame % 4 < 2 ? 0.35 : 1) : 0;

  // Slow orbit + a hit shake when keys start popping.
  const rotY = interpolate(frame, [0, 150], [-0.35, 0.35]);
  const shake = frame >= 30 && frame < 40 ? Math.sin(frame * 3) * 0.03 * (40 - frame) / 10 : 0;

  const body = useMemo(() => {
    const s = new THREE.Shape();
    const w = 1.5, h = 2.6, r = 0.3;
    s.moveTo(-w + r, -h);
    s.lineTo(w - r, -h); s.quadraticCurveTo(w, -h, w, -h + r);
    s.lineTo(w, h - r); s.quadraticCurveTo(w, h, w - r, h);
    s.lineTo(-w + r, h); s.quadraticCurveTo(-w, h, -w, h - r);
    s.lineTo(-w, -h + r); s.quadraticCurveTo(-w, -h, -w + r, -h);
    return s;
  }, []);

  return (
    <group rotation={[-0.15, rotY, shake]} position={[0, 0.2, 0]} scale={0.66}>
      <mesh position={[0, 0, -0.2]}>
        <extrudeGeometry args={[body, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 4 }]} />
        <meshStandardMaterial color="#2b2e36" metalness={0.45} roughness={0.35} />
      </mesh>
      {/* chrome side frame */}
      <mesh position={[0, 0, -0.26]} scale={[1.035, 1.02, 1]}>
        <extrudeGeometry args={[body, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 6 }]} />
        <meshStandardMaterial color="#e5e7eb" metalness={1} roughness={0.15} />
      </mesh>
      {/* chrome band */}
      <mesh position={[0, -0.25, 0.19]}>
        <boxGeometry args={[2.9, 0.06, 0.03]} />
        <meshStandardMaterial color="#e5e7eb" metalness={1} roughness={0.15} />
      </mesh>
      {/* screen */}
      <mesh position={[0, 1.22, 0.175]}>
        <planeGeometry args={[2.62, 2.0]} />
        <meshBasicMaterial color="#050507" />
      </mesh>
      <mesh position={[0, 1.22, 0.18]}>
        <planeGeometry args={[2.5, 1.88]} />
        <meshBasicMaterial map={screenTex} transparent opacity={screenOn} toneMapped={false} />
      </mesh>
      {/* trackpad */}
      <mesh position={[0, -0.05, 0.2]}>
        <boxGeometry args={[0.36, 0.24, 0.05]} />
        <meshStandardMaterial color="#d4d4d8" metalness={1} roughness={0.12} />
      </mesh>
      {keys.map((k, i) => (
        <Key key={i} k={k} frame={frame} fps={fps} />
      ))}
    </group>
  );
};

export const BlackBerry3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const punch = interpolate(frame, [0, 10], [1.04, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const numIn = spring({ frame: frame - 100, fps, config: springs.pop });
  const revenue = interpolate(frame, [100, 140], [19.9, 1.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  return (
    <AbsoluteFill style={{ background: palette.obsidian, transform: `scale(${punch})` }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, #5b2a1a 0%, #2a1512 38%, #121019 75%)` }} />
      <ThreeCanvas width={width} height={height} camera={{ position: [0, 0, 8.2], fov: 42 }}>
        <hemisphereLight args={["#fff7ed", "#1f1f2b", 1.4]} />
        <directionalLight position={[2, 5, 7]} intensity={3.2} />
        <directionalLight position={[-5, 2, 4]} intensity={1.2} color="#fde68a" />
        <pointLight position={[-3.5, -2, 2.5]} intensity={45} color={palette.crimson} />
        <pointLight position={[3.5, 3, -1.5]} intensity={40} color={palette.gold} />
        <spotLight position={[0, 6, 5]} angle={0.5} penumbra={0.8} intensity={60} />
        <Phone frame={frame} fps={fps} />
      </ThreeCanvas>
      <div style={{ position: "absolute", top: 170, width: "100%", textAlign: "center", fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 92, color: palette.bone, letterSpacing: -2 }}>
        Sales <span style={{ color: palette.crimson }}>crash.</span>
      </div>
      <div style={{ position: "absolute", top: 1440, width: "100%", textAlign: "center", fontFamily: "Inter, sans-serif", opacity: numIn, transform: `scale(${0.8 + 0.2 * numIn})` }}>
        <div style={{ fontSize: 150, fontWeight: 900, color: palette.crimson }}>${revenue.toFixed(1)}B</div>
        <div style={{ fontSize: 38, color: palette.bone, fontWeight: 600 }}>annual revenue · FY2017</div>
      </div>
    </AbsoluteFill>
  );
};
