import { readFileSync } from "fs"
import { join } from "path"
import matter from "gray-matter"
import { listVaultMedia, mediaType } from "@/lib/vault"

// The home page reads content/about.md:
//   text before the first "## " heading  → the bio
//   ## What's New                        → "- Label: text" rows (see parseNews)
//   ## Story                             → one "- " line per slide in the avatar story (see parseStory)
const ABOUT_PATH = join(process.cwd(), "content", "about.md")

export type NewsItem = { label: string; title: string; href?: string; detail?: string }
export type StorySlide = { kind: "image" | "video" | "text"; src?: string; text?: string; caption?: string; link?: string }
export type About = { bio: string; news: NewsItem[]; story: StorySlide[] }

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/

function splitSections(markdown: string): { intro: string; sections: Record<string, string> } {
  const [intro, ...rest] = markdown.split(/^## /m)
  const sections: Record<string, string> = {}
  for (const chunk of rest) {
    const nl = chunk.indexOf("\n")
    // "What’s New!" / "what's new" → "what's new"
    const title = (nl === -1 ? chunk : chunk.slice(0, nl)).trim().toLowerCase().replace(/’/g, "'").replace(/!+$/, "")
    sections[title] = nl === -1 ? "" : chunk.slice(nl + 1)
  }
  return { intro: intro.trim(), sections }
}

const listItems = (body = "") =>
  body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2).trim())

// "- Building: [i bought a van](/journe) (Oct 10)" → label, linked title, right-hand detail
// "- Writing: {substack}"                         → your latest Substack post, fetched hourly
async function parseNews(body?: string): Promise<NewsItem[]> {
  const rows = await Promise.all(
    listItems(body).map(async (line): Promise<NewsItem | null> => {
      const colon = line.indexOf(":")
      if (colon === -1) return null
      const label = line.slice(0, colon).trim()
      let rest = line.slice(colon + 1).trim()
      if (rest === "{substack}") {
        const post = await latestSubstackPost()
        return post && { label, ...post }
      }
      let detail: string | undefined
      const trailing = rest.match(/\s+\(([^()]+)\)$/)
      if (trailing) {
        detail = trailing[1]
        rest = rest.slice(0, trailing.index).trim()
      }
      const link = rest.match(LINK)
      return link ? { label, title: link[1], href: link[2], detail } : { label, title: rest, detail }
    }),
  )
  return rows.filter((r): r is NewsItem => r !== null)
}

// "- ![[van.jpg]] [the van](/journe)" → photo/video slide, caption "the van", see-more link
// "- hey, you found the secret 👀"     → text slide
function parseStory(body?: string): StorySlide[] {
  const vault = listVaultMedia()
  const resolve = (file: string) => {
    if (file.startsWith("/") || file.startsWith("http")) return file
    const rel = vault.find((v) => v === file || v.endsWith(`/${file}`))
    return rel && `/vault/${rel.split("/").map(encodeURIComponent).join("/")}`
  }

  return listItems(body).flatMap((line): StorySlide[] => {
    const embed = line.match(/!\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/) ?? line.match(/!\[[^\]]*\]\(([^)\s]+)\)/)
    const rest = embed ? line.replace(embed[0], "").trim() : line
    const link = rest.match(LINK)
    const words = (link ? rest.replace(link[0], link[1]) : rest).trim() || undefined
    if (!embed) return words ? [{ kind: "text", text: words, link: link?.[2] }] : []
    const src = resolve(embed[1].trim())
    if (!src) return []
    return [{ kind: mediaType(embed[1])?.startsWith("video") ? "video" : "image", src, caption: words, link: link?.[2] }]
  })
}

// Straight from the feed (not /api/rss/substack, which falls back to placeholder posts).
async function latestSubstackPost(): Promise<Omit<NewsItem, "label"> | null> {
  try {
    const res = await fetch("https://demelia.substack.com/feed", { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const item = (await res.text()).match(/<item>([\s\S]*?)<\/item>/)?.[1]
    if (!item) return null
    const title = item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]?.trim()
    const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim()
    const date = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]
    if (!title || !link) return null
    const detail = date ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }) : undefined
    return { title, href: link, detail }
  } catch {
    return null
  }
}

export async function getAbout(): Promise<About> {
  const { content } = matter(readFileSync(ABOUT_PATH, "utf-8"))
  const { intro, sections } = splitSections(content)
  return {
    bio: intro,
    news: await parseNews(sections["what's new"]),
    story: parseStory(sections["story"]),
  }
}
