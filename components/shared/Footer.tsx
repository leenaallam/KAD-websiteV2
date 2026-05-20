import Link from "next/link";
import { Logo } from "./Logo";

const CONTACT = {
  whatsappRaw: "+201112448272",
  whatsappLabel: "+20 111 244 8272",
  email: "info@karimallam.com",
  instagram: "kad_ev",
  facebookUrl: "https://www.facebook.com/kadevelopments1/",
  facebookLabel: "kadevelopments1",
};

const COLUMNS = [
  {
    title: "Studio",
    items: [
      { label: "About", href: "/about" },
      { label: "Process", href: "/about#process" },
      { label: "Press", href: "/about#press" },
    ],
  },
  {
    title: "Work",
    items: [
      { label: "Projects", href: "/projects" },
      { label: "Services", href: "/services" },
    ],
  },
  {
    title: "Engage",
    items: [
      { label: "Start a Project", href: "/portal" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 border-t border-[rgba(234,227,210,0.08)] bg-[var(--obsidian)]/80 backdrop-blur-md">
      <div className="mx-auto max-w-[1600px] px-6 py-20 lg:px-12">
        <div className="grid gap-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo className="h-16 w-auto" />
            <p className="mt-8 max-w-xs text-sm leading-relaxed text-[var(--mist)]">
              KAD designs interiors that hold a feeling — composed in light,
              measured in silence, finished in detail.
            </p>
            <div className="mt-8 flex flex-col gap-3 text-sm text-[var(--bone)]">
              <a
                data-cursor="link"
                href={`https://wa.me/${CONTACT.whatsappRaw.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-3 transition-colors hover:text-[var(--gold-soft)]"
              >
                <FooterIcon name="whatsapp" />
                <span>WhatsApp · {CONTACT.whatsappLabel}</span>
              </a>
              <a
                data-cursor="link"
                href={`mailto:${CONTACT.email}`}
                className="group inline-flex items-center gap-3 transition-colors hover:text-[var(--gold-soft)]"
              >
                <FooterIcon name="email" />
                <span>{CONTACT.email}</span>
              </a>
              <a
                data-cursor="link"
                href={`https://instagram.com/${CONTACT.instagram}`}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-3 transition-colors hover:text-[var(--gold-soft)]"
              >
                <FooterIcon name="instagram" />
                <span>@{CONTACT.instagram}</span>
              </a>
              <a
                data-cursor="link"
                href={CONTACT.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-3 transition-colors hover:text-[var(--gold-soft)]"
              >
                <FooterIcon name="facebook" />
                <span>{CONTACT.facebookLabel}</span>
              </a>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="eyebrow">{col.title}</p>
              <ul className="mt-6 space-y-3">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      data-cursor="link"
                      className="text-sm text-[var(--bone)] transition-colors hover:text-[var(--gold-soft)]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="hairline mt-16" />

        <div className="mt-8 flex flex-col items-start justify-between gap-4 text-xs text-[var(--whisper)] md:flex-row md:items-center">
          <p>© {year} KAD. All rights reserved.</p>
          <p>Composed with intention. Cairo &amp; beyond.</p>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================================
 * Small line-icons (14px) — match the contact-page set but sized for inline
 * use beside text. Single 0.9 stroke weight, color via currentColor.
 * ========================================================================== */

function FooterIcon({
  name,
}: {
  name: "whatsapp" | "email" | "instagram" | "facebook";
}) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 20 20",
    fill: "none" as const,
    "aria-hidden": true,
    className:
      "shrink-0 text-[var(--gold-soft)] opacity-70 transition-opacity group-hover:opacity-100",
  };
  if (name === "whatsapp") {
    return (
      <svg {...common}>
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
  if (name === "email") {
    return (
      <svg {...common}>
        <rect x="2.5" y="5" width="15" height="10" stroke="currentColor" strokeWidth="0.9" />
        <path d="M2.5 5L10 11l7.5-6" stroke="currentColor" strokeWidth="0.9" />
      </svg>
    );
  }
  if (name === "instagram") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="14" height="14" rx="3.5" stroke="currentColor" strokeWidth="0.9" />
        <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="0.9" />
        <circle cx="14.3" cy="5.7" r="0.7" fill="currentColor" />
      </svg>
    );
  }
  // facebook
  return (
    <svg {...common}>
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
