"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useSceneStore } from "@/lib/stores/sceneStore";

type Props = {
  count?: number;
  color?: string;
  size?: number;
  /** Spread on each axis. */
  spread?: [number, number, number];
};

/**
 * Ambient luxury particles — slow vertical drift with subtle mouse parallax.
 * Cheap: a single `Points` mesh with additive blending.
 */
export function ParticleField({
  count = 220,
  color = "#c9a33b",
  size = 0.018,
  spread = [8, 5, 3],
}: Props) {
  const points = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * spread[0];
      arr[i * 3 + 1] = (Math.random() - 0.5) * spread[1];
      arr[i * 3 + 2] = (Math.random() - 0.5) * spread[2];
    }
    return arr;
  }, [count, spread]);

  const seeds = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) arr[i] = Math.random();
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    if (!points.current) return;
    const geom = points.current.geometry as THREE.BufferGeometry;
    const pos = geom.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const t = state.clock.elapsedTime;
    const { pointer } = useSceneStore.getState();

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // gentle vertical drift, varying per particle
      arr[i3 + 1] += (0.04 + seeds[i] * 0.06) * delta;
      // subtle horizontal sway
      arr[i3 + 0] += Math.sin(t * 0.2 + seeds[i] * 6.28) * 0.0008;
      // wrap
      if (arr[i3 + 1] > spread[1] / 2) arr[i3 + 1] = -spread[1] / 2;
    }
    pos.needsUpdate = true;

    // Mouse parallax on the whole field
    points.current.position.x +=
      (pointer.x * 0.4 - points.current.position.x) * 0.04;
    points.current.position.y +=
      (-pointer.y * 0.25 - points.current.position.y) * 0.04;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}
