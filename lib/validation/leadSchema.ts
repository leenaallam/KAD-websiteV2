/**
 * Lead-intake payload validation.
 *
 * Hand-rolled while the backend is stubbed — when we wire Supabase in
 * Phase 3 we'll swap this for Zod (cleaner errors, automatic types).
 * The shape mirrors the portal store so a 1:1 fetch payload passes,
 * but everything is independently validated server-side so we can
 * never trust the client.
 */

export type LeadPayload = {
  category: "residential" | "commercial";
  projectType: string;
  size: string;
  budget: string;
  files: Array<{ name: string; size: number; type: string }>;
  contact: {
    fullName: string;
    email: string;
    phone: string;
    whatsapp: string;
  };
};

export type ValidationResult =
  | { ok: true; data: LeadPayload }
  | { ok: false; error: string };

const CATEGORIES = ["residential", "commercial"] as const;
const PROJECT_TYPES = [
  "apartment",
  "villa",
  "duplex",
  "penthouse",
  "chalet",
  "office",
  "retail",
  "restaurant",
  "cafe",
  "clinic",
  "hotel",
  "showroom",
] as const;
const SIZES = ["lt-150", "150-200", "200-300", "gt-300"] as const;
const BUDGETS = ["standard", "premium", "luxury", "ultra-luxury"] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isString(v: unknown): v is string {
  return typeof v === "string";
}
function isArrayOfStrings(v: unknown): v is string[] {
  return Array.isArray(v) && v.every(isString);
}
function isIn<T extends readonly string[]>(v: unknown, list: T): v is T[number] {
  return isString(v) && (list as readonly string[]).includes(v);
}

/**
 * Validate a free-form payload from the portal. Returns a structured
 * result so the route handler can convert validation failure into a
 * 400 with a useful message — without throwing.
 */
export function validateLead(input: unknown): ValidationResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "Payload must be a JSON object" };
  }
  const o = input as Record<string, unknown>;

  if (!isIn(o.category, CATEGORIES))
    return { ok: false, error: "Invalid category" };
  if (!isIn(o.projectType, PROJECT_TYPES))
    return { ok: false, error: "Invalid projectType" };
  if (!isIn(o.size, SIZES)) return { ok: false, error: "Invalid size" };
  if (!isIn(o.budget, BUDGETS)) return { ok: false, error: "Invalid budget" };

  // files: optional array of {name, size, type}; cap at 24 entries to
  // refuse obviously hostile payloads
  if (!Array.isArray(o.files))
    return { ok: false, error: "files must be an array" };
  if (o.files.length > 24)
    return { ok: false, error: "Too many files (max 24)" };
  for (const f of o.files) {
    if (
      typeof f !== "object" ||
      f === null ||
      !isString((f as Record<string, unknown>).name) ||
      typeof (f as Record<string, unknown>).size !== "number" ||
      !isString((f as Record<string, unknown>).type)
    ) {
      return { ok: false, error: "Invalid file metadata" };
    }
  }

  // contact
  if (typeof o.contact !== "object" || o.contact === null)
    return { ok: false, error: "contact is required" };
  const c = o.contact as Record<string, unknown>;
  if (!isString(c.fullName) || c.fullName.trim().length < 2)
    return { ok: false, error: "Full name is too short" };
  if (!isString(c.email) || !EMAIL_RE.test(c.email))
    return { ok: false, error: "Email is invalid" };
  if (!isString(c.phone) || c.phone.trim().length < 5)
    return { ok: false, error: "Phone is too short" };
  if (!isString(c.whatsapp))
    return { ok: false, error: "WhatsApp field must be a string" };

  return {
    ok: true,
    data: {
      category: o.category as LeadPayload["category"],
      projectType: o.projectType as string,
      size: o.size as string,
      budget: o.budget as string,
      files: o.files as LeadPayload["files"],
      contact: {
        fullName: c.fullName.trim(),
        email: c.email.trim().toLowerCase(),
        phone: c.phone.trim(),
        whatsapp: c.whatsapp.trim(),
      },
    },
  };
}
