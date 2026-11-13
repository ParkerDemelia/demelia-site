import { existsSync, readFileSync } from "fs"
import { join } from "path"

// content/hits.md — a "## Heading" (the section title on /explore), then one video per line:
//
//   - [Gone Campin' to Errol](https://www.youtube.com/watch?v=hrxTjCJAuM0&t=30s) {2024} - Camping up in Errol.
//
// {2024} is optional; a t= on the link starts the video there. %% comments %% are ignored.
const HITS_PATH = join(process.cwd(), "content", "hits.md")

export type Hit = { id: string; title: string; href: string; note?: string; year?: string; start?: number }

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/

// Video id from watch?v=, youtu.be/, /shorts/ or /embed/ links.
function videoId(url: string) {
  return url.match(/(?:v=|youtu\.be\/|\/shorts\/|\/embed\/)([\w-]{11})/)?.[1]
}

// t=219s, t=219, t=3m39s → seconds
function startTime(url: string) {
  const t = url.match(/[?&](?:t|start)=([\dhms]+)/)?.[1]
  if (!t) return undefined
  if (/^\d+$/.test(t)) return Number(t) || undefined
  const [, h = "0", m = "0", s = "0"] = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/) ?? []
  return Number(h) * 3600 + Number(m) * 60 + Number(s) || undefined
}

export function getHits(): { title: string; hits: Hit[] } {
  if (!existsSync(HITS_PATH)) return { title: "", hits: [] }
  const md = readFileSync(HITS_PATH, "utf8").replace(/%%[\s\S]*?%%/g, "")
  const title = md.match(/^##\s+(.+)$/m)?.[1].trim() ?? "Parker's hits"

  const hits = md.split("\n").flatMap((line): Hit[] => {
    if (!/^\s*[-*]\s+/.test(line)) return []
    const link = line.match(LINK)
    const id = link && videoId(link[2])
    if (!link || !id) return []
    let rest = line.replace(/^\s*[-*]\s+/, "").replace(LINK, "")
    const year = rest.match(/\{\s*(\d{4})\s*\}/)?.[1]
    rest = rest.replace(/\{[^}]*\}/g, "")
    const note = rest.replace(/^\s*[-—–:]\s*/, "").trim() || undefined
    return [{ id, title: link[1].trim(), href: link[2], note, year, start: startTime(link[2]) }]
  })

  return { title, hits }
}
