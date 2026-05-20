"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { ParticleField } from "./ParticleField";
import { AboutScene } from "./AboutScene";
import { ProjectsScene } from "./ProjectsScene";
import { useSceneStore } from "@/lib/stores/sceneStore";
import { useMediaCapability } from "@/hooks/useMediaCapability";

/**
 * Single global R3F Canvas mounted by the marketing layout. Sections push
 * scene IDs into the scene store; this component switches what renders so
 * we never instantiate more than one WebGL context (mobile Safari caps at 8).
 *
 * Falls back to a static gold gradient if the device fails the capability
 * check (low memory, no WebGL, reduced motion).
 */
export function CanvasRoot() {
  const cap = useMediaCapability();
  const active = useSceneStore((s) => s.active);
  const setPointer = useSceneStore((s) => s.setPointer);

  // Translate global pointer position into normalized -1..1 once for all
  // shaders/particles instead of re-binding listeners per scene.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      setPointer(x, y);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [setPointer]);

  if (!cap.canRunHeavy) {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(201,163,59,0.18), transparent 60%), linear-gradient(180deg, #050505 0%, #0b0b0d 60%, #161618 100%)",
        }}
      />
    );
  }

  // When no scene is active, render nothing — pages like /contact that
  // mount an `<AmbientBackdrop />` need an unobstructed view at -z-10.
  // Skipping the Canvas entirely also stops the frame loop, so the page
  // pays no GPU/CPU cost while no scene wants to render.
  if (!active) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    >
      <Canvas
        gl={{
          antialias: true,
          // alpha:true keeps transparent areas of the framebuffer composited
          // with the HTML behind the canvas — so a partial-coverage scene
          // doesn't paint solid black over the rest of the page.
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
        }}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ width: "100%", height: "100%" }}
      >
        {active === "hero" && <ParticleField />}
        {active === "about" && <AboutScene />}
        {active === "projects" && <ProjectsScene />}
      </Canvas>
    </div>
  );
}
