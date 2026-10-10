import { readFileSync } from "fs"
import { join } from "path"
import matter from "gray-matter"
import { listVaultMedia, resolveMedia, rewriteEmbeds } from "./vault"

// The van page lives in content/journe.md — frontmatter holds van/odometer details,
// the body is an intro followed by dated journal entries. Obsidian image embeds are
// rewritten to /vault/... URLs (see lib/vault.ts).
const JOURNE_PATH = join(process.cwd(), "content", "journe.md")

export type Media = { src: string; caption?: string }

// One flag on the road. Starts at a line like "9/26 bought some van stuff" or a range like
// "10/8-10/9 first camp" / "10/8-9 ..." (optionally "## ..." and/or ending in "@ Place, ST"),
// or at any undated ## heading. isoDate/isoEnd are inferred (year from `bought`, rolling
// over when the month goes backwards). miles/spent come from {miles: 47} / {spent: 267.68}.
export type Entry = {
  date?: string
  dateEnd?: string
  isoDate?: string
  isoEnd?: string
  title: string
  place?: string
  miles?: number
  spent?: number
  content: string
}

export type Journe = {
  van?: string
  bought?: string
  price?: number
  odometerStart: number
  odometerNow: number // odometer_start + every entry's {miles: N}
  totalMiles: number
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

const DATED =
  /^(?:#{1,6}\s+)?\**(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)(?:[-–—](\d{1,2}(?:\/\d{1,2}(?:\/\d{2,4})?)?))?\**[\s:.\-–—]*(.*)$/
const HEADING = /^#{1,3}\s+(.+)$/

function header(line: string): Omit<Entry, "content"> | null {
  let date: string | undefined
  let dateEnd: string | undefined
  let rest: string
  const dated = line.match(DATED)
  if (dated) {
    date = dated[1]
    // "10/8-9" → end "10/9"
    if (dated[2]) dateEnd = dated[2].includes("/") ? dated[2] : `${date.split("/")[0]}/${dated[2]}`
    rest = dated[3]
  } else {
    const heading = line.match(HEADING)
    if (!heading) return null
    rest = heading[1]
  }
  const at = rest.match(/^(.*?)\s+@\s+(.+)$/)
  return { date, dateEnd, title: (at ? at[1] : rest).trim(), place: at?.[2].trim() }
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

const iso = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`

function withIsoDates(entries: Entry[], baseYear: number): Entry[] {
  let year = baseYear
  let prevMonth = 0
  return entries.map((e) => {
    if (!e.date) return e
    const [m, d, y] = e.date.split("/").map(Number)
    if (y) year = y < 100 ? 2000 + y : y
    else if (m < prevMonth) year++
    prevMonth = m
    const out = { ...e, isoDate: iso(year, m, d) }
    if (e.dateEnd) {
      const [em, ed, ey] = e.dateEnd.split("/").map(Number)
      const endYear = ey ? (ey < 100 ? 2000 + ey : ey) : em < m ? year + 1 : year
      out.isoEnd = iso(endYear, em, ed)
      prevMonth = em
      year = endYear
    }
    return out
  })
}

// {miles: 47} / {spent: $267.68} anywhere in an entry → pulled out into entry.miles / entry.spent.
// A line left empty (or just a list bullet) by that is dropped.
const META = /\{\s*(miles|mi|spent|cost|expenses)\s*:\s*\$?\s*([\d,]+(?:\.\d+)?)\s*(?:mi|miles)?\s*\}/gi

function withMeta(e: Entry): Entry {
  let miles: number | undefined
  let spent: number | undefined
  const lines = e.content.split("\n").flatMap((line) => {
    if (!line.match(META)) return [line]
    const rest = line.replace(META, (_m, key: string, num: string) => {
      const n = Number(num.replace(/,/g, ""))
      if (key.toLowerCase().startsWith("m")) miles = (miles ?? 0) + n
      else spent = (spent ?? 0) + n
      return ""
    })
    return /^\s*[-*]?\s*$/.test(rest) ? [] : [rest]
  })
  return { ...e, miles, spent, content: lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() }
}

// Inline stats: {totalcost} {totalmiles} {odometer} {days} {permile} work anywhere (filled in
// on the client, see InlineStat); {tripmiles} {tripcost} use the entry they're written in.
const STAT = /\{\s*(totalcost|totalspent|totalmilesdriven|totalmiles|tripmiles|tripcost|tripspent|days|odometer|permile)\s*\}/gi
const STAT_ALIASES: Record<string, string> = { totalspent: "totalcost", totalmilesdriven: "totalmiles", tripspent: "tripcost" }

function statTokens(md: string, entry?: Entry): string {
  return md.replace(STAT, (_m, raw: string) => {
    const name = STAT_ALIASES[raw.toLowerCase()] ?? raw.toLowerCase()
    if (name === "tripmiles") return `[${entry?.miles != null ? `${entry.miles.toLocaleString()} mi` : "? mi"}](#stat-value)`
    if (name === "tripcost") return `[${entry?.spent != null ? `$${entry.spent.toFixed(2)}` : "$?"}](#stat-value)`
    return `[${name}](#stat:${name})`
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
  const split = splitEntries(priceTags(rewriteEmbeds(obsidianComments(body))))
  const baseYear = bought ? Number(bought.slice(0, 4)) : new Date().getFullYear()
  const entries = withIsoDates(split.entries, baseYear)
    .map(withMeta)
    .map((e) => ({ ...e, content: statTokens(e.content, e) }))
  const totalMiles = entries.reduce((sum, e) => sum + (e.miles ?? 0), 0)

  return {
    van: data.van,
    bought,
    price: toNumber(data.price),
    odometerStart,
    odometerNow: odometerStart + totalMiles,
    totalMiles,
    gallery,
    intro: statTokens(split.intro),
    entries,
  }
}
