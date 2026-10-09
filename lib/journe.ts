import { readFileSync } from "fs"
import { join } from "path"
import matter from "gray-matter"
import { listVaultMedia, resolveMedia, rewriteEmbeds } from "./vault"

// The van page lives in content/journe.md — frontmatter holds van/odometer details,
// the body is an intro followed by dated journal entries. Obsidian image embeds are
// rewritten to /vault/... URLs (see lib/vault.ts).
const JOURNE_PATH = join(process.cwd(), "content", "journe.md")

export type Media = { src: string; caption?: string }

// One flag on the road. Starts at a line like "9/26 bought some van stuff" (optionally
// "## 9/26 ...", optionally ending in "@ Place, ST"), or at any undated ## heading.
// isoDate is inferred (year from `bought`, rolling over when the month goes backwards).
export type Entry = { date?: string; isoDate?: string; title: string; place?: string; content: string }

export type Journe = {
  van?: string
  bought?: string
  price?: number
  odometerStart: number
  odometerNow: number
  gallery: Media[]
  intro: string
  entries: Entry[]
}

function toDateString(value: unknown): string | undefined {
  if (!value) return undefined
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value)
}

function toNumber(value: unknown): number | undefined {
  const n = Number(value)
  return value == null || value === "" || Number.isNaN(n) ? undefined : n
}

const DATED = /^(?:#{1,6}\s+)?\**(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\**[\s:.\-–—]*(.*)$/
const HEADING = /^#{1,3}\s+(.+)$/

function header(line: string): Omit<Entry, "content"> | null {
  let date: string | undefined
  let rest: string
  const dated = line.match(DATED)
  if (dated) {
    date = dated[1]
    rest = dated[2]
  } else {
    const heading = line.match(HEADING)
    if (!heading) return null
    rest = heading[1]
  }
  const at = rest.match(/^(.*?)\s+@\s+(.+)$/)
  return { date, title: (at ? at[1] : rest).trim(), place: at?.[2].trim() }
}

// Obsidian comments: %%site ...%% is shown here but hidden in Obsidian; any other %% ... %% is private.
// Inside a site block, a bare "photo.jpg|stamp caption" line becomes an embed — no ![[ ]] needed,
// so Obsidian's Live Preview has nothing to render.
const BARE_MEDIA = /^\s*([^\s|!\[][^|\n]*\.(?:jpe?g|png|gif|webp|avif|svg|mp4|m4v|mov|webm))\s*(\|[^\n]*)?$/i

const bareToEmbed = (line: string) =>
  line.replace(BARE_MEDIA, (_m, file: string, alias = "") => `![[${file.trim()}${alias.trim()}]]`)

function obsidianComments(md: string): string {
  return md
    .replace(/%%\s*site\b:?[ \t]*([\s\S]*?)%%/gi, (_, inner: string) => inner.split("\n").map(bareToEmbed).join("\n"))
    .replace(/%%[\s\S]*?%%/g, "")
}

// %%camera roll ... %% (anywhere, usually at the bottom): one "photo.jpg|caption" per line.
const CAMERA_ROLL = /%%\s*camera[\s-]*roll\b:?([\s\S]*?)%%/gi

function cameraRoll(md: string, media: string[]): { body: string; gallery: Media[] } {
  const gallery: Media[] = []
  const body = md.replace(CAMERA_ROLL, (_, inner: string) => {
    for (const raw of inner.split("\n")) {
      const m = raw.trim().replace(/^!\[\[(.*)\]\]$/, "$1").match(/^([^|]+?)\s*(?:\|\s*(.*))?$/)
      if (!m) continue
      const src = resolveMedia(m[1], media)
      if (src) gallery.push({ src, caption: m[2] || undefined })
    }
    return ""
  })
  return { body, gallery }
}

// {$2000} → a sticker price tag (rendered by the #price link in journe-markdown.tsx)
function priceTags(md: string): string {
  return md.replace(/\{\s*\$\s*([\d,]+(?:\.\d{1,2})?)\s*\}/g, (all, num: string) => {
    const n = Number(num.replace(/,/g, ""))
    if (Number.isNaN(n)) return all
    const cents = num.includes(".")
    return `[$${n.toLocaleString("en-US", { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: 2 })}](#price)`
  })
}

function withIsoDates(entries: Entry[], baseYear: number): Entry[] {
  let year = baseYear
  let prevMonth = 0
  return entries.map((e) => {
    if (!e.date) return e
    const [m, d, y] = e.date.split("/").map(Number)
    if (y) year = y < 100 ? 2000 + y : y
    else if (m < prevMonth) year++
    prevMonth = m
    return { ...e, isoDate: `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}` }
  })
}

function splitEntries(body: string): { intro: string; entries: Entry[] } {
  const intro: string[] = []
  const entries: (Entry & { lines: string[] })[] = []
  let inFence = false
  for (const line of body.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
    const h = inFence ? null : header(line)
    if (h) entries.push({ ...h, content: "", lines: [] })
    else if (entries.length) entries[entries.length - 1].lines.push(line)
    else intro.push(line)
  }
  return {
    intro: intro.join("\n").trim(),
    entries: entries.map(({ lines, ...e }) => ({ ...e, content: lines.join("\n").trim() })),
  }
}

export function getJourne(): Journe {
  const { data, content } = matter(readFileSync(JOURNE_PATH, "utf-8"))
  const odometerStart = toNumber(data.odometer_start) ?? 0

  const media = listVaultMedia()
  const { body, gallery } = cameraRoll(content, media)

  const bought = toDateString(data.bought)
  const { intro, entries } = splitEntries(priceTags(rewriteEmbeds(obsidianComments(body))))
  const baseYear = bought ? Number(bought.slice(0, 4)) : new Date().getFullYear()

  return {
    van: data.van,
    bought,
    price: toNumber(data.price),
    odometerStart,
    odometerNow: toNumber(data.odometer_now) ?? odometerStart,
    gallery,
    intro,
    entries: withIsoDates(entries, baseYear),
  }
}
