/**
 * Backwards-compatible alias — the composition was extracted to
 * `components/shared/AmbientBackdrop.tsx` once a second surface (the
 * contact page) wanted the same atmospheric mood. Re-exported here so
 * the portal continues to import from its original location.
 */
export { AmbientBackdrop as PortalBackdrop } from "@/components/shared/AmbientBackdrop";
