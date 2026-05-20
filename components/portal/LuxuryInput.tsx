"use client";

import { useId, useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label: string;
  /** Optional uppercase right-side annotation, e.g. "Required". */
  hint?: string;
  /** Render-time validation message; shown in gold when truthy. */
  error?: string | null;
};

/**
 * Floating-label luxury input.
 *
 * The label rises and shrinks into the top border when the field is either
 * focused or has content — a common pattern, but ours uses a slow easing
 * and gold-tint transition so it reads as architectural, not corporate.
 *
 * Two interaction signals beyond the label:
 *   - A gold underline grows from the left on focus (200ms scaleX)
 *   - A subtle gold radial halo blooms behind the field on focus
 *
 * The error state replaces the underline with a muted warning hue and
 * surfaces the message below — no red shouting, just a quieter signal.
 */
export function LuxuryInput({
  label,
  hint,
  error,
  className,
  type = "text",
  value,
  onChange,
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const filled = typeof value === "string" && value.length > 0;
  const lift = focused || filled;

  return (
    <div className={cn("relative", className)}>
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-0 origin-left transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          lift
            ? "-translate-y-1 scale-[0.78] text-[var(--gold-soft)]"
            : "translate-y-5 text-[var(--mist)]"
        )}
      >
        <span className="text-xs uppercase tracking-[0.32em]">{label}</span>
      </label>

      {hint && (
        <span className="absolute right-0 top-0 text-[10px] uppercase tracking-[0.32em] text-[var(--whisper)]">
          {hint}
        </span>
      )}

      {/* Focus halo — soft gold puddle behind the field */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -inset-x-4 -inset-y-3 rounded-2xl transition-opacity duration-500",
          focused ? "opacity-100" : "opacity-0"
        )}
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(201,163,59,0.12), transparent 70%)",
        }}
      />

      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        data-cursor="link"
        {...rest}
        className={cn(
          "relative z-10 block w-full bg-transparent pb-2 pt-6 text-base text-[var(--bone)] outline-none placeholder:text-transparent",
          "font-[var(--font-fraunces)] text-lg lg:text-xl",
          // Always-rendered underline so layout doesn't shift
          "border-b border-[rgba(234,227,210,0.15)]"
        )}
      />

      {/* Animated underline — grows from the left on focus */}
      <span
        aria-hidden
        className={cn(
          "absolute bottom-0 left-0 h-px origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          focused ? "scale-x-100" : "scale-x-0",
          error
            ? "w-full bg-[#c97f3b]"
            : "w-full bg-gradient-to-r from-[var(--gold)] via-[var(--gold-soft)] to-transparent"
        )}
        style={{
          boxShadow: focused ? "0 0 14px rgba(201,163,59,0.4)" : "none",
        }}
      />

      {error && (
        <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-[#c97f3b]">
          {error}
        </p>
      )}
    </div>
  );
}
