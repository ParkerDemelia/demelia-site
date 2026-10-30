import { readFileSync } from "fs"
import { join } from "path"
import { resolveMedia } from "@/lib/vault"

// /antigua reads content/antigua.md:
//   # Title                       → page title (the big letters are always "antigua")
//   text before the first ##      → intro
//   ## What we offer              → "- **Name** — description ![[photo.jpg]]" rows, each becomes a postage stamp (photo optional)
//   ## Who is this for?           → plain paragraphs
//   ## Get in touch               → paragraph(s) with the [email link](mailto:...) — the link becomes the ticket's button
const ANTIGUA_PATH = join(process.cwd(), "content", "antigua.md")

export type Offer = { name: string; desc?: string; image?: string }
export type Antigua = {
  title: string
  intro: string
  offers: Offer[]
  whoFor: string
  contact: { text: string; href?: string }
}

export function getAntigua(): Antigua {
  const md = readFileSync(ANTIGUA_PATH, "utf-8")
  const [head, ...rest] = md.split(/^## /m)
  const sections: Record<string, string> = {}
  for (const chunk of rest) {
    const nl = chunk.indexOf("\n")
    sections[chunk.slice(0, nl).trim().toLowerCase().replace(/[?!:]+$/, "")] = chunk.slice(nl + 1).trim()
  }

  const title = head.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? "Antigua"
  const offers = (sections["what we offer"] ?? "")
    .split("\n")
    .map((l) => l.trim().match(/^-\s+\*\*(.+?)\*\*\s*(?:[—–-]\s*(.*))?$/))
    .filter((m): m is RegExpMatchArray => !!m)
    .map((m) => {
      const rest = m[2] ?? ""
      const ref = rest.match(/!\[\[([^\]|]+)(?:\|[^\]]*)?\]\]|!\[[^\]]*\]\(([^)\s]+)\)/)
      const image = ref ? resolveMedia((ref[1] ?? ref[2]).trim()) ?? undefined : undefined
      const desc = rest.replace(/!\[\[[^\]]*\]\]|!\[[^\]]*\]\([^)]*\)/g, "").trim()
      return { name: m[1].trim(), desc: desc || undefined, image }
    })

  const touch = sections["get in touch"] ?? ""
  const href = touch.match(/\]\((mailto:[^)\s]+)\)/)?.[1]

  return {
    title,
    intro: head.replace(/^#\s+.+$/m, "").trim(),
    offers,
    whoFor: sections["who is this for"] ?? "",
    contact: { text: touch, href },
  }
}
