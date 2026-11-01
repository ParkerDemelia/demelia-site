import { readFileSync } from "fs"
import { join } from "path"
import matter from "gray-matter"
import { rewriteEmbeds } from "./vault"

// /travel reads content/travel.md. Frontmatter (all optional):
//   home: Maine                         → shown with a house pin
//   states: Maine, New Hampshire, ...   → places been to that don't need a story
// A "## log" section lists every stay (see the comment inside it) — that's what the map counts.
// Then any other ## section is a journal note for a trip, newest first:
//   ## Jun 2026 - Puerto Rico, Costa Rica    → each place lights up on the map (countries or US states)
//   ## May 2026 - Stopover back home         → not a place (any part not in Title Case), so it's skipped on the map
//   ## Feb - Apr 2026 - Colombia, Guatemala  → a range of months
//   ###### a line                            → that trip's motto, written on a postcard
//   ![[photo.jpg|caption]]                   → a photo with the trip
const TRAVEL_PATH = join(process.cwd(), "content", "travel.md")

export type TravelPhoto = { src: string; caption?: string }
export type Trip = {
  when: string // "Feb - Apr 2026"
  title: string // what came after the date
  places: string[] // empty for a stop at home
  content: string
  postcard?: string
  photos: TravelPhoto[]
}
// One line of the log: a stay from start to end (ISO dates) at some places, with stops inside it.
export type Stay = { start: string; end: string; names: string[]; stops: string[][] }
export type Travel = { home?: string; extraPlaces: string[]; trips: Trip[]; log: Stay[] }

const MONTH = String.raw`[A-Za-z]{3,9}\.?`
// "Feb - Apr 2026 - Colombia, ..." → when "Feb - Apr 2026", rest "Colombia, ..."
const HEAD = new RegExp(String.raw`^((?:${MONTH}\s*(?:\d{4})?\s*[-–]\s*)?${MONTH}\s+\d{4})\s*[-–—:]\s*(.+)$`)

const list = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(String).map((s) => s.trim()).filter(Boolean) : typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean) : []

// "Puerto Rico, Costa Rica & Guatemala" → three places; "Stopover back home" → none
function placesIn(rest: string): string[] {
  const parts = rest.split(/\s*(?:,|&|\band\b)\s*/).filter(Boolean)
  const titleCase = (p: string) => p.split(/\s+/).every((w) => /^(?:[A-ZÁÉÍÓÚÑ]|de$|del$|la$|y$|of$)/.test(w))
  return parts.length && parts.every(titleCase) ? parts : []
}

const splitNames = (s: string) => s.split(/\s*(?:,|&|\band\b)\s*/).map((n) => n.trim()).filter(Boolean)
const iso = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`

// "2026" starts a year; "6/10-7/1 Antigua, Guatemala" is a stay; an indented line is a stop inside the stay above.
function parseLog(text: string): Stay[] {
  const stays: Stay[] = []
  let year = new Date().getFullYear()
  for (const raw of text.replace(/<!--[\s\S]*?-->/g, "").split("\n")) {
    if (!raw.trim()) continue
    if (/^\s*\d{4}\s*$/.test(raw)) {
      year = Number(raw.trim())
      continue
    }
    if (/^\s/.test(raw)) {
      // "6-7 San Jose", "8 - La Fortuna", "9, 10 - Turrialba", "6/21-6/23 El Paredon", "Pinones"
      const name = raw.trim().replace(/^[\d/]+(?:\s*[-,]\s*[\d/]+)*\s*-?\s*/, "")
      if (name && stays.length) stays[stays.length - 1].stops.push(splitNames(name))
      continue
    }
    const m = raw.trim().match(/^(\d{1,2})\/(\d{1,2})(?:\s*[-–]\s*(\d{1,2})\/(\d{1,2}))?\s+(.+)$/)
    if (!m) continue
    const [sm, sd, em, ed] = [m[1], m[2], m[3] ?? m[1], m[4] ?? m[2]].map(Number)
    stays.push({ start: iso(year, sm, sd), end: iso(em < sm ? year + 1 : year, em, ed), names: splitNames(m[5]), stops: [] })
  }
  return stays
}

const IMAGE = /!\[([^\]]*)\]\(<?([^)>]+?)>?\)/g

function trip(head: string, body: string): Trip {
  const m = head.match(HEAD)
  const postcards: string[] = []
  const photos: TravelPhoto[] = []
  const content = rewriteEmbeds(body)
    .replace(/^#{4,6}\s+(.+)$/gm, (_, line: string) => (postcards.push(line.trim()), ""))
    .replace(IMAGE, (_, alt: string, src: string) => (photos.push({ src, caption: alt || undefined }), ""))
    .replace(/\n{3,}/g, "\n\n")
    .trim()
  const title = (m?.[2] ?? head).trim()
  return { when: m?.[1].trim() ?? "", title, places: placesIn(title), content, postcard: postcards.join(" ") || undefined, photos }
}

export function getTravel(): Travel {
  const { data, content } = matter(readFileSync(TRAVEL_PATH, "utf-8"))
  const sections = content
    .split(/^## /m)
    .slice(1)
    .map((chunk) => {
      const nl = chunk.indexOf("\n")
      return nl === -1 ? [chunk.trim(), ""] : [chunk.slice(0, nl).trim(), chunk.slice(nl + 1)]
    })
  const log = sections.filter(([head]) => /^log$/i.test(head)).flatMap(([, body]) => parseLog(body))
  const trips = sections.filter(([head]) => !/^log$/i.test(head)).map(([head, body]) => trip(head, body))
  const home = typeof data.home === "string" ? data.home.trim() : undefined
  return { home, extraPlaces: [...list(data.states), ...list(data.countries), ...(home ? [home] : [])], trips, log }
}
