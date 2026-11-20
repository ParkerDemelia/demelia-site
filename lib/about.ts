import { readFileSync } from "fs"
import { join } from "path"
import matter from "gray-matter"

// The home page reads content/about.md:
//   text before the first "## " heading → the bio
//   ## Links                           → the row of pills under the bio, in order:
//                                          "- [label](/path)"  a link
//                                          "- {newestblog}"    your newest blog post (delete the line to hide it)
//   ## Selected Work                   → which client sites show on home, by name as written in content/work.md
//                                          (the full list lives on /work)
const ABOUT_PATH = join(process.cwd(), "content", "about.md")

export type FeaturedLink = { kind: "link"; label: string; href: string } | { kind: "newestblog" }
export type About = { bio: string; links: FeaturedLink[]; selected: string[] }

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/

function splitSections(markdown: string): { intro: string; sections: Record<string, string> } {
  const [intro, ...rest] = markdown.split(/^## /m)
  const sections: Record<string, string> = {}
  for (const chunk of rest) {
    const nl = chunk.indexOf("\n")
    const title = (nl === -1 ? chunk : chunk.slice(0, nl)).trim().toLowerCase()
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

export function getAbout(): About {
  const { content } = matter(readFileSync(ABOUT_PATH, "utf-8"))
  const { intro, sections } = splitSections(content)
  return {
    bio: intro,
    links: listItems(sections["links"]).flatMap((l): FeaturedLink[] => {
      if (/^\{newest-?blog\}$/i.test(l)) return [{ kind: "newestblog" }]
      const m = l.match(LINK)
      return m ? [{ kind: "link", label: m[1], href: m[2] }] : []
    }),
    selected: listItems(sections["selected work"]).map((l) => l.match(LINK)?.[1] ?? l),
  }
}
