import { existsSync, readFileSync } from "fs"
import { join } from "path"
import matter from "gray-matter"

// /bio reads content/resume.md (or content/archive/resume.md) plus the lists in content/work.md.
const CONTENT_DIR = join(process.cwd(), "content")

type Linkable = { link?: string }

export type Resume = {
  tagline: string
  roles: string[]
  facts: ({ label: string; value: string } & Linkable)[]
  skills: string[]
  eras: ({ when: string; what: string } & Linkable)[]
  experience: { org: string; role: string; note?: string }[]
  hobbies: ({ name: string; note?: string } & Linkable)[]
  channels: ({ name: string; where: string } & Linkable)[]
  quote?: string
  work: WorkSection[]
}

export type WorkItem = { name: string; link?: string; desc?: string }
export type WorkSection = { title: string; items: WorkItem[] }

// "- [Name](url) — desc", "- [Name](url) - desc", or "- Name — desc"
const ITEM = /^-\s+(?:\[([^\]]+)\]\(([^)]+)\)|([^—–]+?))(?:\s+[—–-]\s+(.*))?$/

function parseWorkList(markdown: string): WorkSection[] {
  const sections: WorkSection[] = []
  // %% Obsidian comments %% are hidden — use them to park items without deleting them
  const visible = markdown.replace(/%%[\s\S]*?%%/g, "")
  for (const line of visible.split("\n").map((l) => l.trim())) {
    if (line.startsWith("## ")) {
      sections.push({ title: line.slice(3).trim(), items: [] })
      continue
    }
    const m = line.match(ITEM)
    if (!m || sections.length === 0) continue
    const [, linkedName, link, plainName, desc] = m
    sections[sections.length - 1].items.push({
      name: (linkedName ?? plainName).trim(),
      link,
      desc: desc?.trim().replace(/\.$/, ""),
    })
  }
  return sections
}

// Sections of content/work.md ("## Web Design", "## Apps & Fun Projects", ...)
export function getWorkList(): WorkSection[] {
  return parseWorkList(readFileSync(join(CONTENT_DIR, "work.md"), "utf-8"))
}

export function getResume(): Resume {
  const path = [join(CONTENT_DIR, "resume.md"), join(CONTENT_DIR, "archive", "resume.md")].find((p) => existsSync(p))
  const { data } = path ? matter(readFileSync(path, "utf-8")) : { data: {} as Record<string, any> }
  const work = getWorkList()
  return {
    tagline: data.tagline ?? "",
    roles: data.roles ?? [],
    facts: data.facts ?? [],
    skills: data.skills ?? [],
    eras: data.eras ?? [],
    experience: data.experience ?? [],
    hobbies: data.hobbies ?? [],
    channels: data.channels ?? [],
    quote: data.quote,
    work,
  }
}
