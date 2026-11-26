import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

// Hands the browser a short-lived token so /audio/upload can send the file straight to Vercel Blob
// (episodes are too big to pass through a serverless function). Gated by UPLOAD_PASSWORD.
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!process.env.UPLOAD_PASSWORD || clientPayload !== process.env.UPLOAD_PASSWORD) throw new Error("Wrong password")
        if (!pathname.startsWith("episodes/")) throw new Error("Bad path")
        return { allowedContentTypes: ["audio/*"], maximumSizeInBytes: 2 * 1024 ** 3, addRandomSuffix: false }
      },
      onUploadCompleted: async () => {
        revalidatePath("/audio")
        revalidatePath("/audio/feed.xml")
      },
    })
    return NextResponse.json(json)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
