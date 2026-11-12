import { readFileSync } from "fs"
import { join } from "path"
import matter from "gray-matter"
import { parseGear, type GearSection } from "./gear"

// /build reads content/build.md.
//
// Frontmatter `power:` draws the power map — where electricity comes in, what it runs through,
// where it's stored, and what it runs:
//   power:
//     in: [Alternator, Solar, Shore power]
//     via: Renogy DC-DC 30A
//     store: 130Ah LiFePO4
//     out: [Fridge, Starlink Mini]
//
// Text before the first ## is the intro. Each "## System" is a card with two kinds of lines:
//   - [x] Build the rear bed - a note        → a job: done or not, it's what the progress bar counts
//   - [ ] Caulk the front window             → an open job: shows under "next up"
//   - Bed lumber, 30A adapter {$53}          → a part (no checkbox): something bought, a line on the card's receipt
// {$53} → what it cost (match the Notion line), {free} / {gift} → a sticker (any word works).
// "## Came with it" is the work the van came with. "## Someday" is the idea pile — listed, not counted. "## Shop the build" holds gear-style product
// lines (same syntax as content/gear.md) and renders as product cards.
const BUILD_PATH = join(process.cwd(), "content", "build.md")

export type Part = { name: string; kind: "job" | "part"; done: boolean; cost?: number; tags: string[]; note?: string }
export type System = { title: string; jobs: Part[]; parts: Part[] }
export type Power = { in: string[]; via?: string; store?: string; out: string[] }
export type Build = {
  intro: string
  power?: Power
  inherited: Part[]
  systems: System[]
  someday: string[]
  shop: GearSection[]
}

const BRACES = /\{\s*([^}]+?)\s*\}/g
const list = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(String).filter(Boolean) : typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean) : []

function part(line: string): Part | null {
  const m = line.match(/^\s*[-*]\s+(?:\[([ xX])\]\s+)?(.+)$/)
  if (!m) return null
  let cost: number | undefined
  const tags: string[] = []
  const text = m[2].replace(BRACES, (_, inner: string) => {
    const money = inner.match(/^\$\s*([\d,]+(?:\.\d{1,2})?)$/)
    if (money) cost = Number(money[1].replace(/,/g, ""))
    else tags.push(inner.toLowerCase())
    return ""
  })
  // "Name - note" (a spaced dash splits them; "Fresh/gray" or "12V" stay whole)
  const [name, ...note] = text.split(/\s+[-–—]\s+/)
  return {
    name: name.replace(/\s+/g, " ").trim(),
    kind: m[1] === undefined ? "part" : "job",
    done: m[1] === undefined || m[1].toLowerCase() === "x",
    cost,
    tags,
    note: note.join(" — ").trim() || undefined,
  }
}

export function getBuild(): Build {
  const { data, content } = matter(readFileSync(BUILD_PATH, "utf-8"))
  const chunks = content.replace(/<!--[\s\S]*?-->/g, "").split(/^## /m)
  const intro = chunks[0].trim()

  const systems: System[] = []
  let inherited: Part[] = []
  let someday: string[] = []
  let shop: GearSection[] = []
  for (const chunk of chunks.slice(1)) {
    const nl = chunk.indexOf("\n")
    const title = (nl === -1 ? chunk : chunk.slice(0, nl)).trim()
    const body = nl === -1 ? "" : chunk.slice(nl + 1)
    if (/shop|gear/i.test(title)) {
      shop = parseGear(`## ${title}\n${body}`)
      continue
    }
    const parts = body.split("\n").map(part).filter((p): p is Part => !!p)
    if (/came with|inherit/i.test(title)) inherited = parts
    else if (/someday|ideas?|wish/i.test(title)) someday = parts.map((x) => x.name)
    else if (parts.length) systems.push({ title, jobs: parts.filter((x) => x.kind === "job"), parts: parts.filter((x) => x.kind === "part") })
  }

  const p = data.power as Record<string, unknown> | undefined
  const power = p ? { in: list(p.in), via: p.via ? String(p.via) : undefined, store: p.store ? String(p.store) : undefined, out: list(p.out) } : undefined
  return { intro, power, inherited, systems, someday, shop }
}
