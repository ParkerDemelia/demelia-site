import { readFileSync } from "fs"
import { join } from "path"
import matter from "gray-matter"
import { getJourne } from "@/lib/journe"

// /about reads content/about.md (bio) and content/projects.md (the projects mesh).
const CONTENT_DIR = join(process.cwd(), "content")

export type Project = {
  name: string
  kind?: string
  desc?: string
  link?: string
  image?: string
  size?: "wide" | "tall"
}

export function getAboutBio(): string {
  return readFileSync(join(CONTENT_DIR, "about.md"), "utf-8").trim()
}

export function getProjects(): Project[] {
  const { data } = matter(readFileSync(join(CONTENT_DIR, "projects.md"), "utf-8"))
  return Array.isArray(data.items) ? data.items : []
}

export type NowItem = { label: string; title: string; detail?: string; href: string }

function latestJourneEntry(): NowItem | null {
  const entries = getJourne().entries.filter((e) => e.isoDate)
  if (entries.length === 0) return null
  const latest = entries.reduce((a, b) => ((b.isoDate ?? "") > (a.isoDate ?? "") ? b : a))
  return { label: "Building", title: latest.title, detail: latest.isoDate, href: "/journe" }
}

// Straight from the feed (not /api/rss/substack, which falls back to placeholder posts).
async function latestSubstackPost(): Promise<NowItem | null> {
  try {
    const res = await fetch("https://demelia.substack.com/feed", { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const item = (await res.text()).match(/<item>([\s\S]*?)<\/item>/)?.[1]
    if (!item) return null
    const title = item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]?.trim()
    const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim()
    const date = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]
    if (!title || !link) return null
    return {
      label: "Writing",
      title,
      detail: date ? new Date(date).toISOString().slice(0, 10) : undefined,
      href: link,
    }
  } catch {
    return null
  }
}

export async function getNow(): Promise<NowItem[]> {
  let journe: NowItem | null = null
  try {
    journe = latestJourneEntry()
  } catch {
    // journe.md missing or malformed — just skip the row
  }
  const writing = await latestSubstackPost()
  return [journe, writing].filter((x): x is NowItem => x !== null)
}
