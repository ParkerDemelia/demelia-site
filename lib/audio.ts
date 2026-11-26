import { list } from "@vercel/blob"

export type Episode = { id: string; title: string; url: string; date: string; size: number }

// Episodes live in Vercel Blob under episodes/. /audio/upload stores them as
// episodes/<timestamp>__<base64url title>.<ext>; anything else dropped into episodes/
// (e.g. straight from the Vercel dashboard) uses its filename as the title.
export function parseTitle(pathname: string) {
  const base = pathname.replace(/^episodes\//, "").replace(/\.[^.]+$/, "")
  const [, encoded] = base.split("__")
  if (encoded) {
    try {
      return Buffer.from(encoded, "base64url").toString("utf8")
    } catch {}
  }
  return base.replace(/[-_]+/g, " ")
}

export async function getEpisodes(): Promise<Episode[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return []
  const { blobs } = await list({ prefix: "episodes/", limit: 1000 })
  return blobs
    .filter((b) => b.size > 0)
    .map((b) => ({ id: b.pathname, title: parseTitle(b.pathname), url: b.url, date: b.uploadedAt.toISOString(), size: b.size }))
    .sort((a, b) => b.date.localeCompare(a.date))
}
