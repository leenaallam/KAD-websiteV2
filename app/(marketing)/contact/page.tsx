import type { Metadata } from "next";
import Link from "next/link";
import { AmbientBackdrop } from "@/components/shared/AmbientBackdrop";
import { ContactForm } from "@/components/contact/ContactForm";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Begin a quiet conversation with the KAD studio — by form, WhatsApp, email, or Instagram.",
};

type Channel = {
  label: string;
  value: string;
  href: string;
  eyebrow: string;
  Icon: () => React.ReactNode;
};

const CHANNELS: Channel[] = [
  {
    label: "WhatsApp",
    value: "+20 111 244 8272",
    href: "https://wa.me/201112448272",
    eyebrow: "Fastest reply",
    Icon: IconWhatsApp,
  },
  {
    label: "Email",
    value: "info@karimallam.com",
    href: "mailto:info@karimallam.com",
    eyebrow: "For documents",
    Icon: IconEmail,
  },
  {
    label: "Instagram",
    value: "@kad_ev",
    href: "https://instagram.com/kad_ev",
    eyebrow: "Studio diary",
    Icon: IconInstagram,
  },
  {
    label: "Facebook",
    value: "kadevelopments1",
    href: "https://www.facebook.com/kadevelopments1/",
    eyebrow: "Studio page",
    Icon: IconFacebook,
  },
];

/* ============================================================================
 * Editorial line icons — single-weight 0.9 stroke at 20×20, color via
 * currentColor so they tint with the surrounding text. Kept abstract enough
 * to read as editorial illustration rather than a stock icon set.
 * ========================================================================== */

function IconWhatsApp() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M2.6 17.4l1.2-3.6a7.5 7.5 0 1 1 3.1 3l-4.3.6Z"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 8c.2 1.6 1.4 3 3 3.4"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconEmail() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="2.5" y="5" width="15" height="10" stroke="currentColor" strokeWidth="0.9" />
      <path d="M2.5 5L10 11l7.5-6" stroke="currentColor" strokeWidth="0.9" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="3" y="3" width="14" height="14" rx="3.5" stroke="currentColor" strokeWidth="0.9" />
      <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="0.9" />
      <circle cx="14.3" cy="5.7" r="0.7" fill="currentColor" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="0.9" />
      <path
        d="M11.6 7.2h-1c-.55 0-1 .45-1 1v1.6H8v2h1.6V16"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8.4 11.5h3" stroke="currentColor" strokeWidth="0.9" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <div className="relative isolate pt-32 pb-32 lg:pt-44 lg:pb-44">
      {/* Ambient warm/cool drifting gradients + dust motes + hairline grid.
          `clearScene` silences any R3F scene the visitor carried over from
          another route (hero / about / projects) so this backdrop reads
          uninterrupted. Same composition as the portal flow. */}
      <AmbientBackdrop clearScene />

      <header className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <RevealOnScroll variant="fade-up">
          <p className="eyebrow">Conversations</p>
          <h1 className="mt-6 max-w-5xl text-[clamp(2.6rem,7vw,7rem)] leading-[0.96] tracking-[-0.02em] text-balance">
            Begin a quiet{" "}
            <span className="italic text-[var(--gold-soft)]">conversation</span>.
          </h1>
        </RevealOnScroll>
        <RevealOnScroll variant="fade-up" delay={0.15}>
          <p className="mt-10 max-w-md text-base leading-relaxed text-[var(--mist)]">
            Use the form for project briefs — for everything else,
            collaborations, press, materials, reach the studio directly on
            any channel below.
          </p>
        </RevealOnScroll>
      </header>

      <section className="mx-auto mt-20 grid max-w-[1600px] gap-12 px-6 lg:mt-32 lg:grid-cols-[7fr_5fr] lg:gap-20 lg:px-12">
        <RevealOnScroll variant="fade-up">
          <ContactForm />
        </RevealOnScroll>

        <RevealOnScroll variant="fade-up" delay={0.15}>
          <aside className="space-y-8">
            <div>
              <p className="eyebrow">Atelier</p>
              <p className="mt-4 font-[var(--font-fraunces)] text-3xl text-[var(--bone)]">
                Cairo, Egypt
              </p>
              <p className="mt-3 text-sm text-[var(--mist)]">
                Active commissions across MENA — Cairo, Riyadh, Dubai.
              </p>
            </div>

            <div className="hairline" />

            <ul className="space-y-6">
              {CHANNELS.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      c.href.startsWith("http") ? "noreferrer" : undefined
                    }
                    data-cursor="link"
                    className="group flex items-start gap-5"
                  >
                    {/* Icon — hairline gold circle that warms on hover */}
                    <span
                      aria-hidden
                      className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(201,163,59,0.32)] text-[var(--gold-soft)] transition-all duration-500 group-hover:border-[var(--gold)] group-hover:bg-[rgba(201,163,59,0.08)] group-hover:shadow-[0_0_30px_-6px_rgba(201,163,59,0.5)]"
                    >
                      <c.Icon />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--gold-soft)]">
                        {c.eyebrow}
                      </p>
                      <p className="mt-2 font-[var(--font-fraunces)] text-2xl text-[var(--bone)] transition-colors group-hover:text-[var(--gold-soft)]">
                        {c.value}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.28em] text-[var(--whisper)]">
                        {c.label}
                      </p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>

            <div className="hairline" />

            <Link
              href="/portal"
              data-cursor="link"
              className="group block"
            >
              <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--gold-soft)]">
                Studio portal
              </p>
              <p className="mt-2 font-[var(--font-fraunces)] text-2xl text-[var(--bone)] transition-colors group-hover:text-[var(--gold-soft)]">
                Begin a project →
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.28em] text-[var(--whisper)]">
                Eight-step intake — Phase 3
              </p>
            </Link>
          </aside>
        </RevealOnScroll>
      </section>
    </div>
  );
}
