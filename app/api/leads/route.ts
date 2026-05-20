import { NextResponse } from "next/server";
import { validateLead } from "@/lib/validation/leadSchema";

/**
 * POST /api/leads — onboarding submission endpoint.
 *
 * Current behavior (stub):
 *   - Validates the payload server-side via leadSchema
 *   - Logs to stdout so submissions are visible in the dev terminal
 *   - Returns 200 with the generated lead id
 *
 * Phase 3 wires this up to:
 *   - Supabase `leads` table insert + `lead_styles` / `lead_materials` joins
 *   - Resend transactional email to the studio + confirmation to the client
 *   - WhatsApp deeplink string returned to the client for one-tap follow-up
 *
 * The client contract is intentionally finished — once the stub is replaced,
 * the portal UI requires zero changes.
 */
export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Body must be valid JSON" },
      { status: 400 }
    );
  }

  const result = validateLead(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const receivedAt = new Date().toISOString();

  const web3Res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_key: "a15f8cb2-bd48-4219-a1fc-4609b7295a76",
      subject: `New KAD Portal Lead — ${result.data.category} / ${result.data.projectType}`,
      name: result.data.contact.fullName,
      email: result.data.contact.email,
      phone: result.data.contact.phone,
      whatsapp: result.data.contact.whatsapp,
      category: result.data.category,
      project_type: result.data.projectType,
      size: result.data.size,
      budget: result.data.budget,
      files_count: String(result.data.files.length),
      message: [
        `Category: ${result.data.category}`,
        `Project Type: ${result.data.projectType}`,
        `Size: ${result.data.size}`,
        `Budget: ${result.data.budget}`,
        `Files: ${result.data.files.length}`,
        `Phone: ${result.data.contact.phone}`,
        `WhatsApp: ${result.data.contact.whatsapp}`,
      ].join("\n"),
    }),
  });

  const web3Result = await web3Res.json();
  if (!web3Result.success) {
    return NextResponse.json(
      { error: web3Result.message || "Failed to send lead" },
      { status: 500 }
    );
  }

  // Keep response shape stable — Phase 3 backend returns the same fields.
  return NextResponse.json({
    ok: true,
    id,
    receivedAt,
    // Client uses this to build the "Continue on WhatsApp" deeplink shown
    // on the success screen once we surface it (Phase 4 admin tooling).
    whatsappDeeplink: buildWhatsappDeeplink(result.data),
  });
}

function buildWhatsappDeeplink(lead: ReturnType<typeof validateLead> extends
  | { ok: true; data: infer T }
  | { ok: false; error: string }
  ? T
  : never): string {
  const text = [
    `Hello KAD, I just submitted a brief through the portal.`,
    `Name: ${lead.contact.fullName}`,
    `Type: ${lead.category} / ${lead.projectType}`,
    `Budget: ${lead.budget}`,
  ].join("\n");
  // Studio WhatsApp number — kept inline since it's the same studio constant
  // referenced elsewhere on the site.
  return `https://wa.me/201112448272?text=${encodeURIComponent(text)}`;
}
