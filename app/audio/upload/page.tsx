"use client"

import { useState } from "react"
import { upload } from "@vercel/blob/client"
import { Button, Card, Input } from "@/components/audio/ui"

const b64url = (s: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")

// Not linked from anywhere — bookmark it. The password is checked server-side against UPLOAD_PASSWORD.
export default function AudioUploadPage() {
  const [progress, setProgress] = useState<number | null>(null)
  const [msg, setMsg] = useState("")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formEl = e.currentTarget
    const form = new FormData(formEl)
    const file = form.get("file") as File
    const title = ((form.get("title") as string) || "").trim() || file.name.replace(/\.[^.]+$/, "")
    const ext = file.name.split(".").pop()?.toLowerCase() || "wav"
    setMsg("")
    setProgress(0)
    try {
      await upload(`episodes/${Date.now()}__${b64url(title)}.${ext}`, file, {
        access: "public",
        handleUploadUrl: "/api/audio/upload",
        clientPayload: form.get("password") as string,
        multipart: true,
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      })
      setMsg("Uploaded. It'll show on /audio within a minute.")
      formEl.reset()
    } catch (err) {
      setMsg((err as Error).message)
    } finally {
      setProgress(null)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
      <Card className="p-6">
        <h1 className="text-lg font-semibold">Upload episode</h1>
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3">
          <Input name="title" placeholder="Episode title (defaults to filename)" />
          <Input name="file" type="file" accept="audio/*" required />
          <Input name="password" type="password" placeholder="Password" required />
          <Button type="submit" disabled={progress !== null}>
            {progress !== null ? `Uploading ${progress}%` : "Upload"}
          </Button>
          {msg && <p className="text-sm text-neutral-600">{msg}</p>}
        </form>
      </Card>
    </main>
  )
}
