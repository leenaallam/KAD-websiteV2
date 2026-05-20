import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { CanvasRoot } from "@/components/three/CanvasRoot";
import { Cursor } from "@/components/cinematic/Cursor";
import { GrainOverlay } from "@/components/cinematic/GrainOverlay";
import { Vignette } from "@/components/cinematic/Vignette";
import { NavBar } from "@/components/shared/NavBar";
import { Footer } from "@/components/shared/Footer";

/**
 * Marketing chrome — wraps every public-facing page with the cinematic
 * stack: Lenis smooth scroll, the global WebGL canvas, the custom cursor,
 * grain + vignette overlays, and the nav/footer.
 *
 * /portal and /admin deliberately get their own lighter layouts.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScrollProvider>
      {/* z-index stack from back to front:
          -10  CanvasRoot          (WebGL background)
            0  Vignette           (cinematic darkening)
           10  page content
           40  GrainOverlay       (film grain)
           50  NavBar             (sticky)
           99  cursor ring
          100  cursor dot
      */}
      <CanvasRoot />
      <Vignette />
      <NavBar />
      <main className="relative z-10">{children}</main>
      <Footer />
      <GrainOverlay opacity={0.045} />
      <Cursor />
    </SmoothScrollProvider>
  );
}
