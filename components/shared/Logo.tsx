import { cn } from "@/lib/utils/cn";

/**
 * KAD wordmark — SVG recreation of the gold logo so we don't ship the
 * heavy PNG on every page. Anchor proportions match the source asset:
 * a thin double-A roof above the letterforms K · A · D.
 */
export function Logo({
  className,
  variant = "full",
}: {
  className?: string;
  variant?: "full" | "mark";
}) {
  return (
    <svg
      viewBox="0 0 200 240"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="KAD"
      className={cn("text-[var(--gold)]", className)}
    >
      {/* Mark — three thin gold strokes forming the abstract K/A roof */}
      <g stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" fill="none">
        <line x1="70" y1="38" x2="70" y2="158" />
        <line x1="70" y1="158" x2="100" y2="38" />
        <line x1="100" y1="38" x2="130" y2="158" />
      </g>
      {variant === "full" && (
        <text
          x="100"
          y="200"
          textAnchor="middle"
          fontFamily="var(--font-fraunces, Georgia, serif)"
          fontSize="36"
          letterSpacing="14"
          fill="currentColor"
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          KAD
        </text>
      )}
    </svg>
  );
}
