import Link from "next/link";

/**
 * Admin shell — Phase 1 placeholder. The auth-gated leads dashboard is
 * built in Phase 4 (Supabase Auth, RLS-protected queries, file downloads,
 * status management, CSV export, WhatsApp/Email actions).
 */
export default function AdminIndex() {
  return (
    <section className="flex min-h-[100dvh] items-center px-6 lg:px-12">
      <div className="mx-auto w-full max-w-3xl">
        <p className="eyebrow">Admin · Restricted</p>
        <h1 className="mt-8 text-[clamp(2rem,5vw,4rem)] leading-[1] tracking-[-0.02em]">
          Lead dashboard arrives in Phase 4.
        </h1>
        <p className="mt-8 max-w-md text-base leading-relaxed text-[var(--mist)]">
          Auth-gated leads view, file downloads, status management, and direct
          contact actions. Provisioned once Supabase Auth is set up.
        </p>
        <div className="mt-12">
          <Link href="/" data-cursor="link" className="text-[var(--gold-soft)]">
            ← Return to site
          </Link>
        </div>
      </div>
    </section>
  );
}
