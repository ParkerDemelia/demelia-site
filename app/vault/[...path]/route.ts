import { readFileSync } from "fs"
import { listVaultMedia, mediaType, vaultFile } from "@/lib/vault"

// Serves images/videos that live in the Obsidian vault (content/). Prerendered at build
// for every media file present; in dev, new files show up immediately.
export function generateStaticParams() {
  return listVaultMedia().map((rel) => ({ path: rel.split("/") }))
}

export async function GET(_req: Request, { params }: { params: { path: string[] } }) {
  const rel = params.path.map((p) => {
    try {
      return decodeURIComponent(p)
    } catch {
      return p
    }
  }).join("/")
  const file = vaultFile(rel)
  if (!file) return new Response("Not found", { status: 404 })
  return new Response(readFileSync(file), {
    headers: {
      "Content-Type": mediaType(file)!,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  })
}
