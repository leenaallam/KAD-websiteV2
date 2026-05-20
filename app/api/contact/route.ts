import { NextResponse } from "next/server";

/**
 * Contact form intake — Phase 2 stub. Validates shape and logs the
 * submission server-side. Phase 3 wires this into a Supabase row + a
 * Resend transactional email to the studio inbox.
 */

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  subject?: unknown;
  message?: unknown;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function looksLikeEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function POST(req: Request) {
  let body: ContactPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isNonEmptyString(body.name)) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400 }
    );
  }
  if (!isNonEmptyString(body.email) || !looksLikeEmail(body.email)) {
    return NextResponse.json(
      { error: "A valid email is required" },
      { status: 400 }
    );
  }
  if (!isNonEmptyString(body.message)) {
    return NextResponse.json(
      { error: "Message is required" },
      { status: 400 }
    );
  }

  const submission = {
    receivedAt: new Date().toISOString(),
    name: body.name,
    email: body.email,
    phone: isNonEmptyString(body.phone) ? body.phone : null,
    subject: isNonEmptyString(body.subject) ? body.subject : null,
    message: body.message,
  };

  // Phase 3 — replace with Supabase insert + Resend send
  console.log("[contact] new submission:", submission);

  return NextResponse.json({ ok: true });
}
