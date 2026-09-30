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
    summary: data.summary,
    date: toDateString(data.date),
    role: data.role,
    stack: Array.isArray(data.stack) ? data.stack : undefined,
    link: data.link,
    repo: data.repo,
    cover: data.cover,
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
