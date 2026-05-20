import Link from "next/link";

/**
 * Phase 1 placeholder for routes whose full experience lands in later phases.
 * Keeps the nav working without shipping ad-hoc empty pages.
 */
export function ComingSoon({
  eyebrow,
  title,
  body,
  phase,
}: {
  eyebrow: string;
  title: string;
  body: string;
  phase: string;
}) {
  return (
    <section className="relative isolate flex min-h-[100dvh] items-center px-6 lg:px-12">
      <div className="mx-auto w-full max-w-3xl">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-8 text-[clamp(2.4rem,6vw,5rem)] leading-[1] tracking-[-0.02em]">
          {title}
        </h1>
        <p className="mt-8 max-w-md text-base leading-relaxed text-[var(--mist)]">
          {body}
        </p>
        <div className="mt-12 flex items-center gap-4 text-xs uppercase tracking-[0.32em] text-[var(--whisper)]">
          <span className="inline-block h-px w-10 bg-[var(--gold)]" />
          <span>{phase}</span>
        </div>
        <div className="mt-12 flex items-center gap-6 text-sm">
          <Link
            href="/"
            data-cursor="link"
            className="text-[var(--bone)] underline-offset-8 hover:text-[var(--gold-soft)] hover:underline"
          >
            ← Return home
          </Link>
          <Link
            href="/portal"
            data-cursor="link"
            className="text-[var(--gold-soft)]"
          >
            Begin a project →
          </Link>
        </div>
      </div>
    </section>
  );
}
