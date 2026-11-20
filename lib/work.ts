import { readdirSync, readFileSync, existsSync } from "fs"
import { join } from "path"
import matter from "gray-matter"

// Case studies live in content/work/<slug>.md — the filename is the URL slug.
// Files starting with "_" (e.g. _template.md) are ignored.
const WORK_DIR = join(process.cwd(), "content", "work")

export type CaseStudyMeta = {
  slug: string
  title: string
  summary?: string
  date?: string
  role?: string
  stack?: string[]
  link?: string
  repo?: string
  cover?: string
  logo?: string // a file in content/attachments, signs off the page bottom right
  draft?: boolean
}

export type CaseStudy = CaseStudyMeta & { content: string }

function toDateString(value: unknown): string | undefined {
  if (!value) return undefined
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value)
}

function parse(slug: string): CaseStudy {
  const raw = readFileSync(join(WORK_DIR, `${slug}.md`), "utf-8")
  const { data, content } = matter(raw)
  return {
    slug,
    title: data.title ?? slug,
    // juega-style pages call it description
    summary: data.summary ?? data.description ?? undefined,
    date: toDateString(data.date),
    role: data.role,
    stack: Array.isArray(data.stack) ? data.stack : undefined,
    link: typeof data.link === "string" ? data.link.trim() || undefined : undefined,
    repo: typeof data.repo === "string" ? data.repo.trim() || undefined : undefined,
    cover: data.cover,
    logo: typeof data.logo === "string" ? data.logo.trim() || undefined : undefined,
    draft: data.draft === true,
    content,
  }
}

export function getCaseStudySlugs(): string[] {
  if (!existsSync(WORK_DIR)) return []
  return readdirSync(WORK_DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((f) => f.replace(/\.md$/, ""))
}

export function getCaseStudies(): CaseStudyMeta[] {
  return getCaseStudySlugs()
    .map(parse)
    .filter((c) => !c.draft)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .map(({ content: _content, ...meta }) => meta)
}

export function getCaseStudy(slug: string): CaseStudy | null {
  if (!getCaseStudySlugs().includes(slug)) return null
  const study = parse(slug)
  return study.draft ? null : study
}

// Which case study belongs to a work.md entry: same website, else same name ("¡JuegaEspanol!" = "JuegaEspanol!").
const host = (url?: string) => {
  try {
    return url ? new URL(url).hostname.replace(/^www\./, "") : undefined
  } catch {
    return undefined
  }
}
const key = (s: string) => s.normalize("NFD").replace(/[^a-z0-9]/gi, "").toLowerCase()

export function findCaseStudy<T extends CaseStudyMeta>(item: { name: string; link?: string }, studies: T[]): T | undefined {
  const h = host(item.link)
  return studies.find((s) => h && host(s.link) === h) ?? studies.find((s) => key(s.title) === key(item.name))
}
