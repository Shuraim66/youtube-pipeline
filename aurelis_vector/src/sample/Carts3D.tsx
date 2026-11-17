import React, {useMemo} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {OrthographicCamera, Outlines, RoundedBox} from '@react-three/drei';

// Toon-shaded 3D game cartridges (Alux uses faceted 3D objects inside flat scenes).
// The canvas uses an orthographic camera mapped 1:1 to the 1080x1920 frame, so
// positions are given in the same pixel coordinates as the SVG layers (y down).
export type CartSpec = {x: number; y: number; z?: number; rx: number; ry: number; rz: number; s: number; label: string; kind?: 'cart' | 'coin'};

const LABELS = ['#e3b23c', '#c0453f', '#6fb3a8', '#f4efe6', '#d9864a'];

const useToonRamp = () => useMemo(() => {
  const tex = new THREE.DataTexture(new Uint8Array([70, 150, 255]), 3, 1, THREE.RedFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}, []);

const Cartridge: React.FC<{c: CartSpec; ramp: THREE.Texture}> = ({c, ramp}) => (
  <group position={[c.x, -c.y, c.z ?? 0]} rotation={[c.rx, c.ry, c.rz]} scale={c.s}>
    <RoundedBox args={[68, 80, 16]} radius={5} smoothness={3}>
      <meshToonMaterial color="#27313d" gradientMap={ramp} />
      <Outlines thickness={2.2} color="#0b0e13" />
    </RoundedBox>
    {/* label */}
    <mesh position={[0, 9, 8.3]}>
      <planeGeometry args={[52, 40]} />
      <meshToonMaterial color={c.label} gradientMap={ramp} />
    </mesh>
    <mesh position={[0, 25, 8.4]}>
      <planeGeometry args={[52, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
    </mesh>
    {/* grip ridges */}
    {[-16, -24, -32].map((yy) => (
      <mesh key={yy} position={[0, yy, 8.4]}>
        <boxGeometry args={[50, 2.5, 1]} />
        <meshToonMaterial color="#394553" gradientMap={ramp} />
      </mesh>
    ))}
  </group>
);

// Gold token/coin: faces the camera at rotation 0 (cylinder axis turned onto z).
const Coin: React.FC<{c: CartSpec; ramp: THREE.Texture}> = ({c, ramp}) => (
  <group position={[c.x, -c.y, c.z ?? 0]} rotation={[c.rx, c.ry, c.rz]} scale={c.s}>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[40, 40, 9, 40]} />
      <meshToonMaterial color="#d9a531" gradientMap={ramp} />
      <Outlines thickness={2} color="#0b0e13" />
    </mesh>
    <mesh position={[0, 0, 4.8]}>
      <torusGeometry args={[30, 2.6, 8, 40]} />
      <meshToonMaterial color="#f5d27a" gradientMap={ramp} />
    </mesh>
    <mesh position={[0, 0, 4.7]}>
      <circleGeometry args={[26, 32]} />
      <meshToonMaterial color={c.label} gradientMap={ramp} />
    </mesh>
    <mesh position={[0, 0, -4.8]} rotation={[0, Math.PI, 0]}>
      <circleGeometry args={[30, 32]} />
      <meshToonMaterial color="#b98a25" gradientMap={ramp} />
    </mesh>
  </group>
);

export const Carts3D: React.FC<{carts: CartSpec[]; width?: number; height?: number; style?: React.CSSProperties}> =
  ({carts, width = 1080, height = 1920, style}) => {
    return (
      <div style={{position: 'absolute', inset: 0, ...style}}>
        <ThreeCanvas width={width} height={height} gl={{antialias: true, alpha: true}} style={{background: 'transparent'}}>
          {/* manual frustum = exact pixel mapping: x 0..1080, y 0..-1920 */}
          <OrthographicCamera makeDefault manual left={0} right={width} top={0} bottom={-height} near={-4000} far={4000} position={[0, 0, 1000]} />
          <Scene carts={carts} />
        </ThreeCanvas>
      </div>
    );
  };

const Scene: React.FC<{carts: CartSpec[]}> = ({carts}) => {
  const ramp = useToonRamp();
  return (
    <>
      <ambientLight intensity={1.4} color="#7d8db0" />
      {/* warm gold key from upper right (brand rim/key light) */}
      <directionalLight position={[600, 500, 700]} intensity={4.2} color="#ffd98a" />
      {/* cool fill from the left */}
      <directionalLight position={[-700, 100, 300]} intensity={1.2} color="#6f8fc0" />
      {carts.map((c, i) => (c.kind === 'coin' ? <Coin key={i} c={c} ramp={ramp} /> : <Cartridge key={i} c={c} ramp={ramp} />))}
    </>
  );
};

export const cartLabel = (i: number) => LABELS[i % LABELS.length];
