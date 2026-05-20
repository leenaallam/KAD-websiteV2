"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useSceneStore } from "@/lib/stores/sceneStore";

/**
 * AboutScene — an atelier of geometry suspended in space.
 *
 * Three layered systems, all wireframe / hairline:
 *   1) Six floating square "blueprint sheets" at varying depths, rotating
 *      slowly on their own axes — the sense that something is being drawn
 *   2) A dense gold dust field that drifts vertically and wraps
 *   3) A single deep grid plane far behind everything, slowly tilting —
 *      the architectural floor reference
 *
 * Mouse parallax on the whole group: subtle camera-like rotation that
 * follows the cursor (-1..1 normalized from the global pointer store).
 *
 * Performance: all geometries are reused across instances where possible,
 * everything uses LineBasicMaterial with low opacity, and the frame loop
 * does ~negligible work per frame.
 */
export function AboutScene() {
  const root = useRef<THREE.Group>(null);
  const planes = useRef<THREE.Group>(null);
  const farGrid = useRef<THREE.GridHelper>(null);
  const particles = useRef<THREE.Points>(null);

  /* ---------- planes ---------- */
  // Six blueprint sheets at curated z-depths and starting rotations.
  const planeConfig = useMemo(
    () =>
      [
        { pos: [-2.6, 0.4, -0.8], rot: [0.1, 0.5, 0.05], size: 2.4, drift: 0.04 },
        { pos: [2.2, -0.6, -1.2], rot: [-0.05, -0.4, -0.1], size: 2.0, drift: 0.05 },
        { pos: [-0.4, 1.6, -2.4], rot: [0.2, 0.1, 0.02], size: 3.0, drift: 0.03 },
        { pos: [1.4, 1.0, -3.2], rot: [-0.15, 0.3, 0.08], size: 2.6, drift: 0.025 },
        { pos: [-1.8, -1.3, -2.0], rot: [0.08, -0.2, -0.04], size: 2.2, drift: 0.045 },
        { pos: [0.6, -1.6, -1.6], rot: [-0.2, 0.4, 0.06], size: 1.8, drift: 0.06 },
      ] as const,
    []
  );

  // A single reusable plane geometry made of line segments at the four edges
  // plus a hairline cross — feels like a blueprint sheet.
  const sheetGeometry = useMemo(() => {
    const pts: number[] = [];
    const s = 0.5;
    // outer border
    pts.push(-s, -s, 0, s, -s, 0);
    pts.push(s, -s, 0, s, s, 0);
    pts.push(s, s, 0, -s, s, 0);
    pts.push(-s, s, 0, -s, -s, 0);
    // cross hairlines
    pts.push(-s, 0, 0, s, 0, 0);
    pts.push(0, -s, 0, 0, s, 0);
    // inner subdivisions
    pts.push(-s, -s / 2, 0, s, -s / 2, 0);
    pts.push(-s, s / 2, 0, s, s / 2, 0);
    pts.push(-s / 2, -s, 0, -s / 2, s, 0);
    pts.push(s / 2, -s, 0, s / 2, s, 0);

    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(pts, 3)
    );
    return g;
  }, []);

  /* ---------- particles ---------- */
  const PARTICLE_COUNT = 320;
  const positions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 9;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1;
    }
    return arr;
  }, []);

  const seeds = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) arr[i] = Math.random();
    return arr;
  }, []);

  /* ---------- per-frame loop ---------- */
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const { pointer } = useSceneStore.getState();

    // Whole-scene parallax follows the pointer with strong easing so it
    // never feels twitchy.
    if (root.current) {
      const targetRotX = -pointer.y * 0.12;
      const targetRotY = pointer.x * 0.18;
      root.current.rotation.x +=
        (targetRotX - root.current.rotation.x) * 0.05;
      root.current.rotation.y +=
        (targetRotY - root.current.rotation.y) * 0.05;
    }

    // Each blueprint sheet rotates very slowly around z plus a quiet
    // bob — like paper drifting in a current.
    if (planes.current) {
      planes.current.children.forEach((child, i) => {
        const cfg = planeConfig[i];
        if (!cfg) return;
        child.rotation.z += cfg.drift * delta * 0.5;
        child.position.y =
          cfg.pos[1] + Math.sin(t * 0.4 + i * 1.7) * 0.08;
      });
    }

    // Far grid slowly tilts back and forth so the floor "breathes"
    if (farGrid.current) {
      farGrid.current.rotation.x =
        -Math.PI / 2.3 + Math.sin(t * 0.15) * 0.04;
    }

    // Particles drift upward; wrap when they exit the top
    if (particles.current) {
      const geom = particles.current.geometry as THREE.BufferGeometry;
      const pos = geom.attributes.position as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        arr[i3 + 1] += (0.05 + seeds[i] * 0.08) * delta;
        arr[i3 + 0] += Math.sin(t * 0.18 + seeds[i] * 6.28) * 0.0006;
        if (arr[i3 + 1] > 3) arr[i3 + 1] = -3;
      }
      pos.needsUpdate = true;

      // Light parallax on the whole field
      particles.current.position.x +=
        (pointer.x * 0.5 - particles.current.position.x) * 0.03;
      particles.current.position.y +=
        (-pointer.y * 0.3 - particles.current.position.y) * 0.03;
    }
  });

  return (
    <group ref={root}>
      {/* Far blueprint floor */}
      <gridHelper
        ref={farGrid}
        args={[40, 40, "#c9a33b", "#1a1a1c"]}
        position={[0, -2.4, -6]}
      />

      {/* Floating blueprint sheets */}
      <group ref={planes}>
        {planeConfig.map((cfg, i) => (
          <group
            key={i}
            position={cfg.pos as unknown as [number, number, number]}
            rotation={cfg.rot as unknown as [number, number, number]}
            scale={cfg.size}
          >
            <lineSegments geometry={sheetGeometry}>
              <lineBasicMaterial
                color="#c9a33b"
                transparent
                opacity={0.18 + (i % 3) * 0.06}
                depthWrite={false}
              />
            </lineSegments>
          </group>
        ))}
      </group>

      {/* Particle dust */}
      <points ref={particles}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.022}
          color="#d8b868"
          transparent
          opacity={0.75}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
