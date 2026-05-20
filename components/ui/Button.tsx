"use client";

import { forwardRef, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { useMagnetic } from "@/hooks/useMagnetic";

type Variant = "primary" | "ghost";
type Size = "md" | "lg";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
  /** Disable the magnetic hover physics. */
  noMagnet?: boolean;
};

const styles: Record<Variant, string> = {
  primary:
    "border border-[var(--gold)] bg-[rgba(201,163,59,0.06)] text-[var(--bone)] " +
    "hover:bg-[rgba(201,163,59,0.14)] hover:text-[var(--gold-soft)] " +
    "hover:shadow-[0_0_60px_-10px_rgba(201,163,59,0.55)]",
  ghost:
    "border border-[rgba(234,227,210,0.18)] text-[var(--bone)] " +
    "hover:border-[var(--gold)] hover:text-[var(--gold-soft)]",
};

const sizes: Record<Size, string> = {
  md: "h-12 px-7 text-sm tracking-[0.18em]",
  lg: "h-14 px-9 text-sm tracking-[0.22em]",
};

const baseClass =
  "inline-flex items-center justify-center gap-3 rounded-full uppercase " +
  "font-medium transition-[color,background-color,box-shadow,border-color] duration-500 " +
  "ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform";

type ButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", className, children, noMagnet, ...rest },
    forwardedRef
  ) {
    const innerRef = useRef<HTMLButtonElement>(null);
    useMagnetic(noMagnet ? { current: null } : innerRef, { strength: 14 });

    return (
      <button
        {...rest}
        ref={(el) => {
          innerRef.current = el;
          if (typeof forwardedRef === "function") forwardedRef(el);
          else if (forwardedRef)
            (forwardedRef as React.MutableRefObject<HTMLButtonElement | null>).current = el;
        }}
        data-cursor="link"
        className={cn(baseClass, styles[variant], sizes[size], className)}
      >
        {children}
      </button>
    );
  }
);

type LinkButtonProps = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
};

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  children,
  noMagnet,
  href,
  target,
  rel,
}: LinkButtonProps) {
  const innerRef = useRef<HTMLAnchorElement>(null);
  useMagnetic(noMagnet ? { current: null } : innerRef, { strength: 14 });

  return (
    <Link
      ref={innerRef}
      href={href}
      target={target}
      rel={rel}
      data-cursor="link"
      className={cn(baseClass, styles[variant], sizes[size], className)}
    >
      {children}
    </Link>
  );
}
