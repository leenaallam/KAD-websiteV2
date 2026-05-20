"use client";

import { useEffect, useState } from "react";

/**
 * Static noise tile + CSS-driven position shift = animated grain that costs
 * almost nothing. We generate the noise PNG once on mount, then let the
 * compositor handle the shimmer.
 */
export function GrainOverlay({ opacity = 0.05 }: { opacity?: number }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const W = 220;
    const H = 220;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(W, H);
    const buf = img.data;
    for (let i = 0; i < buf.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      buf[i] = v;
      buf[i + 1] = v;
      buf[i + 2] = v;
      buf[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    setSrc(canvas.toDataURL("image/png"));
  }, []);

  return (
    <>
      <style>{`
        @keyframes kadGrainShift {
          0%   { background-position:  0px   0px; }
          25%  { background-position: -42px  17px; }
          50%  { background-position:  19px -38px; }
          75%  { background-position: -23px -11px; }
          100% { background-position:  0px   0px; }
        }
        .kad-grain {
          background-repeat: repeat;
          animation: kadGrainShift 1.4s steps(4) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .kad-grain { animation: none; }
        }
      `}</style>
      <div
        aria-hidden
        className="kad-grain pointer-events-none fixed inset-0 z-40"
        style={{
          opacity,
          mixBlendMode: "overlay",
          backgroundImage: src ? `url(${src})` : undefined,
        }}
      />
    </>
  );
}
