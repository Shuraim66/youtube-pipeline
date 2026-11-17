import React, { useLayoutEffect, useMemo } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { palette, springs } from "../empire/theme";
import { Phone } from "./BlackBerry3D";

/**
 * Reusable 3D "company object" scene for EmpireShort beats (fits the 1080×760 scene slot).
 * Frame-driven only. Each object has an intact state on local frame 0, then breaks.
 */

export type Object3DSpec = {
  kind: "object3d";
  object: "vial" | "phone";
  /** local frame the break starts */
  breakAt?: number;
  number?: { from: number; to: number; prefix?: string; suffix?: string; decimals?: number; label: string; tone?: "gold" | "red" };
};

const rand = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Studio reflections so chrome / glass read as real materials instead of flat grey. */
const Env: React.FC = () => {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = tex;
    return () => {
      tex.dispose();
      pm.dispose();
    };
  }, [gl, scene]);
  return null;
};

const SHARDS_AROUND = 7;
const SHARDS_UP = 4;

/** Blood-test vial ("nanotainer" style): a drop falls in, then the glass shatters and the sample spills. */
const Vial: React.FC<{ frame: number; fps: number; breakAt: number }> = ({ frame, fps, breakAt }) => {
  // slow-motion shatter so the debris hangs in frame for the whole beat
  const t = Math.max(0, (frame - breakAt) / fps) * 0.45;
  const broken = frame >= breakAt;
  const H = 2.2, R = 0.55;
  const fill = breakAt > 60 ? interpolate(frame, [0, 18], [0.35, 0.55], { extrapolateRight: "clamp" }) : 0.55;
  const dropY = interpolate(frame, [0, 16], [2.6, 0.3], { extrapolateRight: "clamp", easing: Easing.in(Easing.quad) });
  const rotY = interpolate(frame, [0, 150], [-0.4, 0.5]);
  const shake = frame >= breakAt && frame < breakAt + 8 ? Math.sin(frame * 3.3) * 0.06 : 0;

  const shards = useMemo(() => {
    const out: { i: number; a: number; y: number; vx: number; vy: number; vz: number; r: number }[] = [];
    for (let u = 0; u < SHARDS_UP; u++)
      for (let a = 0; a < SHARDS_AROUND; a++) {
        const i = u * SHARDS_AROUND + a;
        const ang = (a / SHARDS_AROUND) * Math.PI * 2;
        const sp = 1.6 + rand(i, 1) * 2.2;
        out.push({ i, a: ang, y: -H / 2 + (u + 0.5) * (H / SHARDS_UP), vx: Math.cos(ang) * sp, vz: Math.sin(ang) * sp + 1.2, vy: 1 + rand(i, 2) * 2.5, r: (rand(i, 3) - 0.5) * 14 });
      }
    return out;
  }, []);

  const drops = useMemo(() => Array.from({ length: 26 }, (_, i) => ({ vx: (rand(i, 7) - 0.5) * 3.4, vy: 0.5 + rand(i, 8) * 3, vz: (rand(i, 9) - 0.6) * 1.2, s: 0.05 + rand(i, 10) * 0.09 })), []);

  const glass = <meshPhysicalMaterial color="#f8fbff" metalness={0.1} roughness={0.02} transparent opacity={0.16} envMapIntensity={3} clearcoat={1} clearcoatRoughness={0} specularIntensity={1} side={THREE.DoubleSide} depthWrite={false} />;

  return (
    <group rotation={[0.18, rotY, 0.12 + shake]} position={[0, 0.45, 0]}>
      {/* cap */}
      {!broken && (
        <mesh position={[0, H / 2 + 0.22, 0]}>
          <cylinderGeometry args={[R * 1.08, R * 1.08, 0.45, 48]} />
          <meshStandardMaterial color="#e7e5e4" metalness={0.9} roughness={0.2} />
        </mesh>
      )}
      {broken && (
        <mesh position={[0.6 * t, H / 2 + 0.22 + 2.2 * t - 4.5 * t * t, 1.2 * t]} rotation={[3 * t, 0, 5 * t]}>
          <cylinderGeometry args={[R * 1.08, R * 1.08, 0.45, 48]} />
          <meshStandardMaterial color="#e7e5e4" metalness={0.9} roughness={0.2} />
        </mesh>
      )}
      {/* glass body — intact, or shards flying outward */}
      {!broken ? (
        <mesh>
          <cylinderGeometry args={[R, R, H, 48, 1, true]} />
          {glass}
        </mesh>
      ) : (
        shards.map((s) => (
          <mesh
            key={s.i}
            position={[s.vx * t, s.y + s.vy * t - 2.2 * t * t, s.vz * t]}
            rotation={[s.r * t, s.a + s.r * 0.4 * t, s.r * 0.6 * t]}
          >
            <cylinderGeometry args={[R, R, H / SHARDS_UP, 6, 1, true, s.a, (Math.PI * 2) / SHARDS_AROUND]} />
            {glass}
          </mesh>
        ))
      )}
      {!broken && (
        <>
          <mesh position={[0, -H / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[R, 0.025, 12, 64]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.25} transparent opacity={0.6} />
          </mesh>
          <mesh position={[-R * 0.7, 0.1, R * 0.7]}>
            <boxGeometry args={[0.04, H * 0.85, 0.01]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.45} />
          </mesh>
        </>
      )}
      {/* sample */}
      {!broken ? (
        <mesh position={[0, -H / 2 + (H * fill) / 2, 0]}>
          <cylinderGeometry args={[R * 0.93, R * 0.93, H * fill, 48]} />
          <meshPhysicalMaterial color="#7f0a0a" roughness={0.08} clearcoat={1} emissive="#3b0404" emissiveIntensity={0.5} />
        </mesh>
      ) : (
        drops.map((d, i) => (
          <mesh key={i} position={[d.vx * t, -0.4 + d.vy * t - 2.2 * t * t, d.vz * t]}>
            <sphereGeometry args={[d.s, 16, 16]} />
            <meshPhysicalMaterial color="#8b0c0c" roughness={0.05} clearcoat={1} emissive="#450a0a" emissiveIntensity={0.6} />
          </mesh>
        ))
      )}
      {/* the finger-prick drop */}
      {frame < 18 && breakAt > 60 && (
        <mesh position={[0, dropY, 0]} scale={[1, 1.3, 1]}>
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshPhysicalMaterial color="#9f1212" roughness={0.05} clearcoat={1} />
        </mesh>
      )}
    </group>
  );
};

export const Object3DScene: React.FC<{ spec: Object3DSpec; beatFrames: number }> = ({ spec, beatFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const breakAt = spec.breakAt ?? Math.round(beatFrames * 0.3);
  const n = spec.number;
  const numIn = spring({ frame: frame - breakAt, fps, config: springs.pop });
  const v = n ? interpolate(frame, [breakAt, breakAt + beatFrames * 0.35], [n.from, n.to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }) : 0;
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(239,68,68,0.28) 0%, rgba(217,119,6,0.10) 35%, transparent 70%)" }} />
      <ThreeCanvas width={1080} height={760} camera={{ position: [0, 0, spec.object === "phone" ? 7.4 : 6.2], fov: 40 }} gl={{ antialias: true }}>
        <Env />
        <hemisphereLight args={["#fff7ed", "#1f1f2b", 1.2]} />
        <directionalLight position={[2, 5, 7]} intensity={2.6} />
        <pointLight position={[-3, -1.5, 2.5]} intensity={40} color={palette.crimson} />
        <pointLight position={[3, 2.5, -1.5]} intensity={35} color={palette.gold} />
        <spotLight position={[0, 6, 5]} angle={0.5} penumbra={0.8} intensity={50} />
        {spec.object === "vial" ? <Vial frame={frame} fps={fps} breakAt={breakAt} /> : <group scale={0.6} position={[0, -0.1, 0]}><Phone frame={frame} fps={fps} /></group>}
      </ThreeCanvas>
      {n && (
        <div className="absolute flex w-full flex-col items-center" style={{ bottom: 10, left: -40, opacity: numIn, transform: `scale(${0.85 + 0.15 * numIn})` }}>
          <span className="font-black leading-none" style={{ fontSize: 130, color: n.tone === "gold" ? palette.gold : palette.crimson, textShadow: "0 6px 30px rgba(0,0,0,0.8)" }}>
            {n.prefix}
            {v.toFixed(n.decimals ?? 0)}
            {n.suffix}
          </span>
          <span className="text-[32px] font-bold uppercase tracking-[0.2em]" style={{ color: palette.bone, textShadow: "0 2px 12px #000" }}>
            {n.label}
          </span>
        </div>
      )}
    </div>
  );
};
