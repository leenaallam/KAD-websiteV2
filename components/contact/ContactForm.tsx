"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel";
  required?: boolean;
  cols?: "full" | "half";
};

const FIELDS: Field[] = [
  { name: "name", label: "Full name", required: true, cols: "half" },
  { name: "email", label: "Email", type: "email", required: true, cols: "half" },
  { name: "phone", label: "Phone or WhatsApp", type: "tel", cols: "full" },
  { name: "subject", label: "Subject", cols: "full" },
];

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Phase 2 implementation — POSTs to a stub `/api/contact` route that
 * validates the shape and returns success. Phase 3 wires this into Resend
 * + a Supabase row. Inputs use floating labels and gold focus glows.
 */
export function ContactForm() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const set = (k: string, v: string) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Request failed (${res.status})`);
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
    }
  };

  if (status === "success") {
    return (
      <SuccessState
        onReset={() => {
          setValues({});
          setStatus("idle");
        }}
      />
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      data-lenis-prevent
      className="glass relative rounded-2xl p-8 lg:p-12"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {FIELDS.map((f) => (
          <div
            key={f.name}
            className={f.cols === "full" ? "md:col-span-2" : ""}
          >
            <FloatingInput
              name={f.name}
              label={f.label}
              type={f.type}
              required={f.required}
              value={values[f.name] ?? ""}
              onChange={(v) => set(f.name, v)}
            />
          </div>
        ))}

        <div className="md:col-span-2">
          <FloatingTextarea
            name="message"
            label="Tell us about the room — its rough size, your timeline, anything you've already imagined."
            required
            value={values.message ?? ""}
            onChange={(v) => set("message", v)}
          />
        </div>
      </div>

      <div className="mt-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--whisper)]">
          We respond within two business days.
        </p>
        <button
          type="submit"
          data-cursor="link"
          disabled={status === "submitting"}
          className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--gold)] bg-[rgba(201,163,59,0.06)] px-9 text-sm uppercase tracking-[0.22em] text-[var(--bone)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[rgba(201,163,59,0.18)] hover:text-[var(--gold-soft)] hover:shadow-[0_0_60px_-10px_rgba(201,163,59,0.55)] disabled:opacity-60"
        >
          {status === "submitting" ? "Sending…" : "Send · Begin a conversation"}
        </button>
      </div>

      {status === "error" && errorMsg && (
        <p className="mt-6 text-sm text-[var(--gold-soft)]">{errorMsg}</p>
      )}
    </form>
  );
}

function FloatingInput({
  name,
  label,
  type = "text",
  required,
  value,
  onChange,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;
  return (
    <div className="relative">
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        className="peer h-14 w-full border-b border-[rgba(234,227,210,0.18)] bg-transparent pt-5 text-base text-[var(--bone)] outline-none transition-colors focus:border-[var(--gold)]"
      />
      <label
        htmlFor={name}
        className={`pointer-events-none absolute left-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          lifted
            ? "top-0 text-[10px] uppercase tracking-[0.28em] text-[var(--gold-soft)]"
            : "top-[22px] text-base text-[var(--mist)]"
        }`}
      >
        {label}
        {required && <span className="ml-1 text-[var(--gold)]">·</span>}
      </label>
    </div>
  );
}

function FloatingTextarea({
  name,
  label,
  required,
  value,
  onChange,
}: {
  name: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;
  return (
    <div className="relative">
      <textarea
        id={name}
        name={name}
        required={required}
        rows={4}
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        className="peer w-full resize-none border-b border-[rgba(234,227,210,0.18)] bg-transparent pt-7 text-base text-[var(--bone)] outline-none transition-colors focus:border-[var(--gold)]"
      />
      <label
        htmlFor={name}
        className={`pointer-events-none absolute left-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          lifted
            ? "top-0 text-[10px] uppercase tracking-[0.28em] text-[var(--gold-soft)]"
            : "top-[28px] text-base text-[var(--mist)]"
        }`}
      >
        {label}
      </label>
    </div>
  );
}

function SuccessState({ onReset }: { onReset: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="glass relative overflow-hidden rounded-2xl p-12 text-center lg:p-20"
      >
        {/* gold radial wash */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(201,163,59,0.18), transparent 60%)",
          }}
        />
        <div className="relative">
          <p className="eyebrow">Received</p>
          <h3 className="mt-6 font-[var(--font-fraunces)] text-[clamp(2rem,5vw,3.6rem)] leading-[1.05]">
            Your message is{" "}
            <span className="italic text-[var(--gold-soft)]">with us</span>.
          </h3>
          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-[var(--mist)]">
            We respond within two business days with a considered reading of
            your brief. For anything time-sensitive, message the studio
            directly on WhatsApp.
          </p>
          <button
            type="button"
            data-cursor="link"
            onClick={onReset}
            className="mt-10 text-xs uppercase tracking-[0.32em] text-[var(--bone)] hover:text-[var(--gold-soft)]"
          >
            Send another →
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
