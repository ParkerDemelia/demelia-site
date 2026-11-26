import { NextResponse } from "next/server"

// Adds an /audio subscriber to Resend Contacts (and RESEND_SEGMENT_ID's segment, if set).
// Send a Broadcast from Resend when a new episode is up.
export async function POST(request: Request) {
  const { email } = await request.json().catch(() => ({}))
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320)
    return NextResponse.json({ error: "Invalid email" }, { status: 400 })
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: "Not configured" }, { status: 500 })

  const segment = process.env.RESEND_SEGMENT_ID
  const res = await fetch("https://api.resend.com/contacts", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, unsubscribed: false, ...(segment && { segments: [{ id: segment }] }) }),
  })
  // "already exists" counts as success so repeat signups don't error
  if (!res.ok && res.status !== 409) return NextResponse.json({ error: "Could not subscribe" }, { status: 500 })
  return NextResponse.json({ ok: true })
}
