import type { Metadata } from "next";

/**
 * Portal — deliberately omits Lenis + R3F so forms feel snappy and reliable.
 * Inherits typography + tokens from the root layout.
 */
export const metadata: Metadata = {
  title: { default: "Portal", template: "%s · KAD Portal" },
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-[var(--ink)] text-[var(--bone)]">
      {children}
    </div>
  );
}
