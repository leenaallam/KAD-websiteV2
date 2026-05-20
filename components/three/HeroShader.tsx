"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { heroFragmentShader, heroVertexShader } from "@/shaders/hero";
import { useSceneStore } from "@/lib/stores/sceneStore";

/**
 * Fullscreen quad that renders the cinematic hero background using the
 * hero shader. Pulls mouse parallax + intensity from the scene store so
 * external surfaces (scroll choreography, hover handlers) can influence it.
 */
export function HeroShader() {
  const ref = useRef<THREE.ShaderMaterial>(null);
  const { size, viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uIntensity: { value: 1 },
    }),
    // Recreate uniforms only on mount; size/intensity get updated via useFrame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((state, delta) => {
    if (!ref.current) return;
    const { pointer, heroIntensity } = useSceneStore.getState();
    const u = ref.current.uniforms;

    u.uTime.value += delta;
    u.uResolution.value.set(state.size.width, state.size.height);

    // Smooth-follow the cursor for parallax stability
    u.uMouse.value.x += (pointer.x - u.uMouse.value.x) * 0.06;
    u.uMouse.value.y += (pointer.y - u.uMouse.value.y) * 0.06;

    u.uIntensity.value += (heroIntensity - u.uIntensity.value) * 0.08;
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={ref}
        uniforms={uniforms}
        vertexShader={heroVertexShader}
        fragmentShader={heroFragmentShader}
      />
    </mesh>
  );
}
