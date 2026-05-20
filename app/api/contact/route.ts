import { NextResponse } from "next/server";

const WEB3FORMS_KEY = "a15f8cb2-bd48-4219-a1fc-4609b7295a76";

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

  const res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      name: body.name,
      email: body.email,
      phone: isNonEmptyString(body.phone) ? body.phone : undefined,
      subject: isNonEmptyString(body.subject) ? body.subject : "New KAD Contact Form",
      message: body.message,
    }),
  });

  const result = await res.json();

  if (!result.success) {
    return NextResponse.json(
      { error: result.message || "Failed to send message" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
