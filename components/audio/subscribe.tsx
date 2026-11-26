"use client"

import { useState } from "react"
import { Button, Input } from "@/components/audio/ui"

// Posts to /api/audio/subscribe, which adds the email to Resend Contacts.
export function Subscribe() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("loading")
    const email = new FormData(e.currentTarget).get("email")
    const res = await fetch("/api/audio/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    setStatus(res.ok ? "done" : "error")
  }

  if (status === "done") return <p className="text-sm text-neutral-600">You&apos;re in. New episodes will hit your inbox.</p>
  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col items-center gap-2">
      <div className="flex w-full gap-2">
        <Input name="email" type="email" required placeholder="you@email.com" aria-label="Email" />
        <Button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "..." : "Subscribe"}
        </Button>
      </div>
      {status === "error" && <p className="text-xs text-neutral-500">Something went wrong. Try again?</p>}
    </form>
  )
}
