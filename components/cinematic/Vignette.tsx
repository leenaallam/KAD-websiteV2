/**
 * Cinematic vignette — pure CSS overlay, no JS. Sits above the canvas but
 * below content / cursor / grain.
 */
export function Vignette() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background:
          "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.78) 100%)",
      }}
    />
  );
}
