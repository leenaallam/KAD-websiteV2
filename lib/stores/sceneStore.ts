"use client";

import { create } from "zustand";

export type SceneId =
  | "hero"
  | "about"
  | "projects"
  | null;

type SceneState = {
  /** Currently mounted scene in the global R3F Canvas. */
  active: SceneId;
  /** Hero shader intensity (0..1). Pulled toward 1 by the hero, fades on scroll. */
  heroIntensity: number;
  /** Normalized cursor (-1..1) for parallax/mouse-reactive shaders. */
  pointer: { x: number; y: number };

  setActive: (id: SceneId) => void;
  setHeroIntensity: (v: number) => void;
  setPointer: (x: number, y: number) => void;
};

export const useSceneStore = create<SceneState>((set) => ({
  active: "hero",
  heroIntensity: 1,
  pointer: { x: 0, y: 0 },
  setActive: (id) => set({ active: id }),
  setHeroIntensity: (v) => set({ heroIntensity: Math.max(0, Math.min(1, v)) }),
  setPointer: (x, y) => set({ pointer: { x, y } }),
}));
