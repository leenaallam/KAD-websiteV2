import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · KAD Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({
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
