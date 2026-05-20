"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useSceneStore } from "@/lib/stores/sceneStore";
import { getLenis } from "@/hooks/useLenis";

/* ============================================================================
 * Nebula fragment shader — volumetric warm cloud at the far depth.
 *
 * Two-octave FBM noise with domain warping gives a soft cloud-like texture
 * that's continuously animated (uTime drives drift + warp evolution). The
 * radial center-bias concentrates intensity toward the middle and a soft
 * edge-fade makes sure the plane edges never read as a rectangle.
 *
 * Mouse position offsets the warp coordinates very slightly, so the user
 * feels the galaxy reacts when they move the cursor — without making the
 * motion obvious enough to read as a UI.
 * ========================================================================== */

const NEBULA_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const NEBULA_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec2  uMouse;
  uniform vec3  uColor;
  uniform float uIntensity;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.55;
    for (int i = 0; i < 5; i++) {
      v += amp * noise(p);
      p *= 2.13;
      amp *= 0.48;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv - 0.5;
    uv.x *= 1.7;
    vec2 p = uv * 2.4 + vec2(uTime * 0.022, uTime * 0.015);
    vec2 q = vec2(
      fbm(p + uMouse * 0.06),
      fbm(p + vec2(2.4, 5.1))
    );
    float n = fbm(p + q * 1.6 + uTime * 0.006);
    float radial = 1.0 - smoothstep(0.0, 0.85, length(uv));
    n *= radial;
    float edge = smoothstep(0.0, 0.28, vUv.x) * smoothstep(1.0, 0.72, vUv.x)
               * smoothstep(0.0, 0.22, vUv.y) * smoothstep(1.0, 0.78, vUv.y);
    float intensity = pow(n, 1.35) * edge * uIntensity;
    vec3 base  = vec3(0.018, 0.014, 0.010);
    vec3 color = mix(base, uColor, intensity);
    gl_FragColor = vec4(color, 1.0);
  }
`;

/* ============================================================================
 * Soft-glow points shader — replaces THREE.PointsMaterial's flat square
 * sprites with a radial alpha falloff per particle, so every dot reads as
 * a tiny glowing point rather than a solid pixel. Per-vertex attributes
 * for size and opacity let particles vary within a single draw call.
 * ========================================================================== */

const POINTS_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aOpacity;
  varying float vOpacity;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // 360 / -z gives a roughly perspective-correct point size in pixels
    gl_PointSize = aSize * (360.0 / max(-mvPosition.z, 0.1));
    gl_Position = projectionMatrix * mvPosition;
    vOpacity = aOpacity;
  }
`;

const POINTS_FRAG = /* glsl */ `
  uniform vec3 uColor;
  varying float vOpacity;
  void main() {
    // Radial distance from center of the point quad — gl_PointCoord is 0..1
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    // Soft falloff: pow2 of (1 - d) gives a glow-like edge
    float a = pow(1.0 - d, 2.0);
    gl_FragColor = vec4(uColor, a * vOpacity);
  }
`;

/* ============================================================================
 * Particle layer data structure.
 *
 * Each particle gets its own position, velocity, base size, base opacity,
 * a pulse phase (so opacity slowly fades in/out per particle), and a curve
 * seed (so the lateral sine wave on x is unique).
 *
 * Motion archetypes are sampled at init time so the same field has a mix
 * of upward / downward / diagonal / floating particles — the "some drift
 * up, some down, some diagonally" requirement from the brief.
 * ========================================================================== */

type LayerSpec = {
  count: number;
  spread: [number, number, number];
  zOffset: number;
  /** Pixel-space size at z = -1 (will scale per perspective). */
  baseSize: number;
  /** Per-particle opacity multiplier. */
  baseOpacity: number;
  /** Per-particle velocity multiplier. Larger = faster drift. */
  speed: number;
  /** Color (hex string). */
  color: string;
};

type LayerBuffers = {
  positions: Float32Array;
  velocities: Float32Array;
  sizes: Float32Array;
  opacities: Float32Array;
  baseOpacities: Float32Array;
  seeds: Float32Array;
  pulsePhases: Float32Array;
  pulseFreqs: Float32Array;
  count: number;
  spread: [number, number, number];
  zOffset: number;
};

function makeLayer(spec: LayerSpec): LayerBuffers {
  const { count, spread, zOffset, baseSize, baseOpacity, speed } = spec;
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const opacities = new Float32Array(count);
  const baseOpacities = new Float32Array(count);
  const seeds = new Float32Array(count);
  const pulsePhases = new Float32Array(count);
  const pulseFreqs = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // Random position within the spread box
    positions[i3 + 0] = (Math.random() - 0.5) * spread[0];
    positions[i3 + 1] = (Math.random() - 0.5) * spread[1];
    positions[i3 + 2] = (Math.random() - 0.5) * spread[2] + zOffset;

    // Motion archetype — chosen by probability so the field has variety
    const r = Math.random();
    if (r < 0.35) {
      // Upward drift (35%) — most common, matches "cosmic rising dust"
      velocities[i3 + 0] = (Math.random() - 0.5) * 0.04 * speed;
      velocities[i3 + 1] = (0.04 + Math.random() * 0.05) * speed;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.012 * speed;
    } else if (r < 0.6) {
      // Downward drift (25%)
      velocities[i3 + 0] = (Math.random() - 0.5) * 0.04 * speed;
      velocities[i3 + 1] = -(0.03 + Math.random() * 0.04) * speed;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.012 * speed;
    } else if (r < 0.78) {
      // Diagonal right-up (18%)
      velocities[i3 + 0] = (0.02 + Math.random() * 0.04) * speed;
      velocities[i3 + 1] = (0.02 + Math.random() * 0.03) * speed;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.01 * speed;
    } else if (r < 0.92) {
      // Diagonal left-down (14%)
      velocities[i3 + 0] = -(0.02 + Math.random() * 0.04) * speed;
      velocities[i3 + 1] = -(0.02 + Math.random() * 0.03) * speed;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.01 * speed;
    } else {
      // Slow float (8%) — barely moves, anchors the field
      velocities[i3 + 0] = (Math.random() - 0.5) * 0.015 * speed;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.015 * speed;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.006 * speed;
    }

    // Per-particle size variance — bright particles read as "closer"
    sizes[i] = baseSize * (0.6 + Math.random() * 0.8);
    baseOpacities[i] = baseOpacity * (0.55 + Math.random() * 0.45);
    opacities[i] = baseOpacities[i];
    seeds[i] = Math.random();
    pulsePhases[i] = Math.random() * Math.PI * 2;
    // Most particles pulse slowly (4–12 s cycles); a few faster for sparkle
    pulseFreqs[i] =
      Math.random() < 0.08
        ? 0.6 + Math.random() * 0.8 // fast-pulse sparkle accent
        : 0.08 + Math.random() * 0.15; // slow ambient breathing
  }

  return {
    positions,
    velocities,
    sizes,
    opacities,
    baseOpacities,
    seeds,
    pulsePhases,
    pulseFreqs,
    count,
    spread,
    zOffset,
  };
}

/* ============================================================================
 * ProjectsScene
 * ========================================================================== */

/**
 * Cinematic gold galaxy. Three particle layers + per-particle motion +
 * volumetric nebula + scroll-driven camera. The user "flies" through this
 * field as they scroll the portfolio.
 *
 * Layers:
 *   - Far  (800)  — tiny pinpoints, slow, almost still
 *   - Mid  (520)  — medium motes, mixed motion archetypes
 *   - Near (300)  — larger amber particles, strong parallax + fast pulses
 *
 * Every particle has:
 *   - Its own velocity vector (one of 5 motion archetypes)
 *   - A seeded sine wave on x for organic curve
 *   - A per-particle opacity pulse (8% are fast-flickering "sparkle")
 *   - Size + base opacity variance for visual depth
 *
 * Mouse parallax is intentionally subtle — the brief said "VERY SUBTLE
 * interaction." The whole rig rotates ~3.5° max on either axis.
 *
 * Performance: ~1620 particles × CPU position update per frame is ~5kHz
 * worth of math, comfortably sub-millisecond on a modern desktop. All
 * particle layers share the same custom shader so they batch into three
 * draw calls (one per buffer; can't merge because of the spread bounds).
 */
export function ProjectsScene() {
  const rig = useRef<THREE.Group>(null);
  const farRef = useRef<THREE.Points>(null);
  const midRef = useRef<THREE.Points>(null);
  const nearRef = useRef<THREE.Points>(null);

  /* ---------- nebula material ---------- */
  const nebulaMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uColor: { value: new THREE.Color("#c9a33b") },
        uIntensity: { value: 0.55 },
      },
      vertexShader: NEBULA_VERT,
      fragmentShader: NEBULA_FRAG,
      transparent: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  /* ---------- three particle layers ---------- */
  const layers = useMemo(
    () => ({
      far: makeLayer({
        count: 800,
        spread: [70, 36, 14],
        zOffset: -18,
        baseSize: 0.7,
        baseOpacity: 0.55,
        speed: 0.4,
        color: "#d8b868",
      }),
      mid: makeLayer({
        count: 520,
        spread: [34, 20, 9],
        zOffset: -6,
        baseSize: 1.0,
        baseOpacity: 0.65,
        speed: 0.7,
        color: "#c9a33b",
      }),
      near: makeLayer({
        count: 300,
        spread: [18, 11, 4],
        zOffset: -1,
        baseSize: 1.6,
        baseOpacity: 0.85,
        speed: 1.0,
        color: "#e8c984",
      }),
    }),
    []
  );

  /* ---------- one shader material per layer (different colors) ---------- */
  const farMaterial = useMemo(
    () => makePointsMaterial("#d8b868"),
    []
  );
  const midMaterial = useMemo(
    () => makePointsMaterial("#c9a33b"),
    []
  );
  const nearMaterial = useMemo(
    () => makePointsMaterial("#e8c984"),
    []
  );

  /* ---------- per-frame ---------- */
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const { pointer } = useSceneStore.getState();
    const lenis = getLenis();
    const scrollY = lenis?.scroll ?? 0;

    /* camera: scroll Z + slow Lissajous breath + mild pointer offset */
    const cam = state.camera;
    cam.position.z = 5 - scrollY * 0.0012;
    cam.position.x = Math.sin(t * 0.08) * 0.4 + pointer.x * 0.6;
    cam.position.y = Math.cos(t * 0.06) * 0.25 - pointer.y * 0.4;
    cam.lookAt(0, 0, -8);

    /* whole-rig parallax — very gentle */
    if (rig.current) {
      rig.current.rotation.y = pointer.x * 0.05 + Math.sin(t * 0.05) * 0.015;
      rig.current.rotation.x = -pointer.y * 0.035 + Math.cos(t * 0.04) * 0.012;
    }

    /* update each layer's per-particle motion + pulse */
    if (farRef.current) updateLayer(farRef.current, layers.far, t, delta);
    if (midRef.current) updateLayer(midRef.current, layers.mid, t, delta);
    if (nearRef.current) updateLayer(nearRef.current, layers.near, t, delta);

    /* nebula uniforms */
    const u = nebulaMaterial.uniforms;
    u.uTime.value = t;
    const m = u.uMouse.value as THREE.Vector2;
    m.x += (pointer.x - m.x) * 0.03;
    m.y += (pointer.y - m.y) * 0.03;
  });

  return (
    <group ref={rig}>
      {/* Far stars — sparse, slow */}
      <points ref={farRef} material={farMaterial}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[layers.far.positions, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[layers.far.sizes, 1]} />
          <bufferAttribute attach="attributes-aOpacity" args={[layers.far.opacities, 1]} />
        </bufferGeometry>
      </points>

      {/* Mid dust — denser, mixed motion */}
      <points ref={midRef} material={midMaterial}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[layers.mid.positions, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[layers.mid.sizes, 1]} />
          <bufferAttribute attach="attributes-aOpacity" args={[layers.mid.opacities, 1]} />
        </bufferGeometry>
      </points>

      {/* Near dust — biggest, heaviest parallax, fastest pulses */}
      <points ref={nearRef} material={nearMaterial}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[layers.near.positions, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[layers.near.sizes, 1]} />
          <bufferAttribute attach="attributes-aOpacity" args={[layers.near.opacities, 1]} />
        </bufferGeometry>
      </points>

      {/* Volumetric nebula at the far depth */}
      <mesh
        position={[0, 0, -24]}
        renderOrder={-1}
        material={nebulaMaterial}
      >
        <planeGeometry args={[90, 50, 1, 1]} />
      </mesh>
    </group>
  );
}

/* ============================================================================
 * Helpers
 * ========================================================================== */

function makePointsMaterial(color: string): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
    },
    vertexShader: POINTS_VERT,
    fragmentShader: POINTS_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

/**
 * Per-frame motion update for a single particle layer.
 *
 * For each particle:
 *   - Position += velocity × delta
 *   - Add small seeded sine to x for organic curve
 *   - Wrap when out of the layer's spread bounds
 *   - Recompute opacity from base × pulse(t)
 *
 * The needsUpdate flags trigger a GPU upload once per layer per frame —
 * ~3.6 KB per layer at this density, well within the bandwidth budget.
 */
function updateLayer(
  points: THREE.Points,
  buf: LayerBuffers,
  t: number,
  delta: number
) {
  const geom = points.geometry as THREE.BufferGeometry;
  const posAttr = geom.attributes.position as THREE.BufferAttribute;
  const opAttr = geom.attributes.aOpacity as THREE.BufferAttribute;
  const pos = posAttr.array as Float32Array;
  const op = opAttr.array as Float32Array;

  const { velocities, baseOpacities, seeds, pulsePhases, pulseFreqs, count, spread, zOffset } = buf;
  const sx = spread[0] / 2;
  const sy = spread[1] / 2;
  const sz = spread[2] / 2;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // Linear motion
    pos[i3 + 0] += velocities[i3 + 0] * delta * 60;
    pos[i3 + 1] += velocities[i3 + 1] * delta * 60;
    pos[i3 + 2] += velocities[i3 + 2] * delta * 60;

    // Seeded sine on X — adds a gentle organic curve. The seed makes the
    // phase unique per particle so the layer doesn't wobble in unison.
    const seed = seeds[i];
    pos[i3 + 0] += Math.sin(t * 0.25 + seed * 6.283) * 0.0018;

    // Wrap on each axis when the particle exits the spread box
    if (pos[i3 + 0] > sx) pos[i3 + 0] = -sx;
    else if (pos[i3 + 0] < -sx) pos[i3 + 0] = sx;
    if (pos[i3 + 1] > sy) pos[i3 + 1] = -sy;
    else if (pos[i3 + 1] < -sy) pos[i3 + 1] = sy;
    if (pos[i3 + 2] > zOffset + sz) pos[i3 + 2] = zOffset - sz;
    else if (pos[i3 + 2] < zOffset - sz) pos[i3 + 2] = zOffset + sz;

    // Opacity pulse — each particle breathes at its own frequency + phase.
    // 8% are fast-pulse sparkle (high freq), the rest slow ambient breathing.
    const pulse = 0.5 + 0.5 * Math.sin(t * pulseFreqs[i] + pulsePhases[i]);
    op[i] = baseOpacities[i] * (0.45 + 0.55 * pulse);
  }

  posAttr.needsUpdate = true;
  opAttr.needsUpdate = true;
}
