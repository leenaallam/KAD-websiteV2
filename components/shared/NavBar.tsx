"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Logo } from "./Logo";
import { LinkButton } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "backdrop-blur-md bg-[rgba(5,5,5,0.55)] border-b border-[rgba(234,227,210,0.06)]"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-6 lg:px-12">
        <Link
          href="/"
          aria-label="KAD — home"
          data-cursor="link"
          className="flex items-center gap-3"
        >
          <Logo variant="mark" className="h-8 w-auto" />
          <span className="text-[var(--bone)] text-sm font-medium tracking-[0.4em]">
            KAD
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-cursor="link"
              className="text-[11px] uppercase tracking-[0.32em] text-[var(--mist)] transition-colors hover:text-[var(--gold-soft)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <LinkButton href="/portal" size="md">
            Start Project
          </LinkButton>
        </div>

        <button
          type="button"
          aria-label="Open menu"
          data-cursor="link"
          className="md:hidden flex h-10 w-10 items-center justify-center text-[var(--bone)]"
        >
          <span className="sr-only">Menu</span>
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
            <path d="M0 1h18M0 11h18" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      </div>
    </motion.header>
  );
}
