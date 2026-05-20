"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { LuxuryInput } from "../LuxuryInput";
import { StepNav } from "../StepNav";
import { usePortalStore } from "@/lib/stores/portalStore";
import { ease } from "@/lib/animations/easings";

/**
 * Contact — four luxury inputs with floating labels, focus halo, and
 * unobtrusive validation (only shown after the field is touched). The
 * fields are arranged as a 2×2 grid on desktop, a single column on mobile.
 *
 * Validation is intentionally permissive — we want to capture the lead
 * even if the WhatsApp number is roughly typed. The server-side handler
 * does the strict normalization once the data lands.
 */
export function Step9Contact() {
  const contact = usePortalStore((s) => s.contact);
  const setContact = usePortalStore((s) => s.setContact);

  // Errors are computed live but only shown after the user has interacted
  // with that field — the "you're already wrong" experience is unkind.
  const errors = useMemo(() => {
    return {
      fullName:
        contact.fullName.length > 0 && contact.fullName.trim().length < 2
          ? "A little more, please"
          : null,
      email:
        contact.email.length > 0 && !/^\S+@\S+\.\S+$/.test(contact.email)
          ? "That email looks incomplete"
          : null,
      phone:
        contact.phone.length > 0 && contact.phone.trim().length < 5
          ? "A few more digits"
          : null,
    };
  }, [contact.fullName, contact.email, contact.phone]);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: ease.luxe, delay: 0.1 }}
      >
        <p className="eyebrow gold-glow-text">Step 06 — Contact</p>
        <h1 className="mt-6 max-w-3xl font-[var(--font-fraunces)] text-[clamp(2.4rem,6vw,5.4rem)] leading-[1] tracking-[-0.02em] text-[var(--bone)]">
          So we know{" "}
          <span className="italic text-[var(--gold-soft)] gold-glow-text">
            who
          </span>{" "}
          to write back to.
        </h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--mist)]">
          Within one working day, a member of the studio will reply with a
          first reading of your brief and the next conversation.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: ease.luxe, delay: 0.25 }}
        className="mt-16 grid grid-cols-1 gap-x-12 gap-y-12 md:grid-cols-2"
      >
        <LuxuryInput
          label="Full name"
          hint="Required"
          autoComplete="name"
          value={contact.fullName}
          onChange={(e) => setContact("fullName", e.target.value)}
          error={errors.fullName}
        />
        <LuxuryInput
          label="Email address"
          hint="Required"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={contact.email}
          onChange={(e) => setContact("email", e.target.value)}
          error={errors.email}
        />
        <LuxuryInput
          label="Phone"
          hint="Required"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          value={contact.phone}
          onChange={(e) => setContact("phone", e.target.value)}
          error={errors.phone}
        />
        <LuxuryInput
          label="WhatsApp"
          hint="Optional"
          type="tel"
          inputMode="tel"
          value={contact.whatsapp}
          onChange={(e) => setContact("whatsapp", e.target.value)}
        />
      </motion.div>

      {/* Privacy whisper */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.7 }}
        className="mt-14 max-w-lg text-[10.5px] uppercase leading-relaxed tracking-[0.24em] text-[var(--whisper)]"
      >
        Your details remain within the studio. We will only use them to
        respond to this enquiry — never for marketing lists, never shared.
      </motion.p>

      <div className="mt-12">
        <StepNav />
      </div>
    </div>
  );
}
