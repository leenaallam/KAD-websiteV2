/**
 * Cinematic easings — keep the named constants in sync with --ease-* in globals.css
 * so motion behavior is consistent between Framer Motion and CSS-driven animation.
 */
export const ease = {
  luxe: [0.22, 1, 0.36, 1] as const,
  cinema: [0.65, 0.05, 0.36, 1] as const,
  outExpo: [0.16, 1, 0.3, 1] as const,
  outQuart: [0.25, 1, 0.5, 1] as const,
} as const;

export const durations = {
  micro: 0.18,
  short: 0.4,
  medium: 0.8,
  long: 1.2,
  cinematic: 1.8,
} as const;
