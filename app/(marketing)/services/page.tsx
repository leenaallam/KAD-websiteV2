import type { Metadata } from "next";
import { ServiceCard } from "@/components/services/ServiceCard";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { LinkButton } from "@/components/ui/Button";
import { AmbientBackdrop } from "@/components/shared/AmbientBackdrop";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Four practices, one studio — Interior, Exterior, Landscape, and Contracting, each delivered as a single architectural conversation.",
};

const SERVICES = [
  {
    number: "01",
    title: "Interior Design",
    blurb:
      "From the first hand-drawn plan to the final material handover — receptions, kitchens, bedrooms, baths, and the small architectural details between them.",
    details: [
      "Spatial planning + lighting design",
      "Material + finish selection",
      "Bespoke joinery + millwork",
      "Furniture, fabric, and styling",
    ],
  },
  {
    number: "02",
    title: "Exterior Design",
    blurb:
      "Façades, terraces, entries, and the architectural skin — composed in stone, render, and shadow with the same precision as the interior.",
    details: [
      "Façade + entry composition",
      "Cladding + stonework",
      "External lighting design",
      "Pergolas, screens, shading",
    ],
  },
  {
    number: "03",
    title: "Landscape Design",
    blurb:
      "Gardens, courtyards, pool decks, and water — the room that holds the architecture, drawn with the same hand.",
    details: [
      "Site + planting strategy",
      "Hardscape + water features",
      "Pool + cabana planning",
      "Outdoor lighting + ambience",
    ],
  },
  {
    number: "04",
    title: "Contracting",
    blurb:
      "Build delivery held to the standard of the drawings — site supervision, trade coordination, and the long unglamorous work of turning a design into a finished room.",
    details: [
      "Site supervision + program management",
      "Trades + supplier coordination",
      "Quality control + finishes oversight",
      "Handover + post-completion care",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="relative isolate pt-32 pb-32 lg:pt-44 lg:pb-44">
      {/* Ambient warm/cool drift + dust motes + hairline grid — same
          atmospheric mood as the portal, contact, and about pages.
          `clearScene` silences any R3F scene a previous route left active
          so this backdrop reads uninterrupted. */}
      <AmbientBackdrop clearScene />

      <header className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <RevealOnScroll variant="fade-up">
          <p className="eyebrow">Disciplines</p>
          <h1 className="mt-6 max-w-5xl text-[clamp(2.6rem,7vw,7rem)] leading-[0.96] tracking-[-0.02em] text-balance">
            Four practices held{" "}
            <span className="italic text-[var(--gold-soft)]">
              in one hand
            </span>
            .
          </h1>
        </RevealOnScroll>
        <RevealOnScroll variant="fade-up" delay={0.15}>
          <p className="mt-10 max-w-md text-base leading-relaxed text-[var(--mist)]">
            Each discipline reads as a single architectural conversation —
            interior, exterior, landscape, and contracting held in one hand
            so nothing reads as an afterthought.
          </p>
        </RevealOnScroll>
      </header>

      <section className="mx-auto mt-20 grid max-w-[1600px] gap-6 px-6 md:grid-cols-2 lg:mt-32 lg:gap-10 lg:px-12">
        {SERVICES.map((s, i) => (
          <ServiceCard key={s.number} index={i} {...s} />
        ))}
      </section>

      <section className="mx-auto mt-32 max-w-[1600px] px-6 lg:mt-44 lg:px-12">
        <RevealOnScroll variant="fade-up">
          <div className="glass rounded-2xl p-12 text-center lg:p-20">
            <p className="eyebrow">Begin</p>
            <h2 className="mt-6 mx-auto max-w-3xl font-[var(--font-fraunces)] text-[clamp(2rem,4vw,3.6rem)] leading-[1.05]">
              Tell us about your space — we'll respond with a considered
              first reading.
            </h2>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <LinkButton href="/portal" size="lg">
                Begin a project
              </LinkButton>
              <LinkButton
                href="https://wa.me/201112448272"
                size="lg"
                variant="ghost"
              >
                WhatsApp the studio
              </LinkButton>
            </div>
          </div>
        </RevealOnScroll>
      </section>
    </div>
  );
}
