import type { Metadata } from "next"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import { format } from "date-fns"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { getWorkList } from "@/lib/resume"
import { getAboutBio, getNow, getProjects, type Project } from "@/lib/about"
import { SocialIcons } from "@/components/social-icons"

export const metadata: Metadata = {
  title: "about — Parker Demelia",
  description: "What I do, who I've worked with, and what I'm up to.",
}

// "Currently Building" pulls the latest Substack post — refresh hourly.
export const revalidate = 3600

const EMAIL = "parker.demelia@gmail.com"

// Same links as the home page header
const SITE_LINKS = [
  { label: "resume", href: "/resume.pdf" },
  { label: "gear", href: "/gear" },
  { label: "expenses", href: "/expenses" },
  { label: "journe", href: "/journe" },
]

// Media-ish kinds get the lime accent in the projects mesh; everything else is cyan.
const MEDIA_KINDS = /podcast|series|vlog|video|reel/i

const inlineLink = "text-foreground underline decoration-border underline-offset-4 hover:text-primary hover:decoration-primary transition-colors"

function Ref({ href, className = "", children }: { href?: string; className?: string; children: React.ReactNode }) {
  if (!href) return <div className={className}>{children}</div>
  return href.startsWith("http") || href.startsWith("mailto:") ? (
    <a href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

function SectionHeader({ children, live = false }: { children: React.ReactNode; live?: boolean }) {
  return (
    <h2 className="mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground">
      {children}
      {live && <LiveDot />}
    </h2>
  )
}

function ProjectTile({ p }: { p: Project }) {
  const media = MEDIA_KINDS.test(p.kind ?? "")
  const span = p.size === "wide" ? "sm:col-span-2" : p.size === "tall" ? "sm:row-span-2" : ""
  return (
    <li className={span}>
      <Ref
        href={p.link}
        className={`group relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-lg border border-border bg-card p-4 transition-colors ${
          p.link ? (media ? "hover:border-secondary/60" : "hover:border-primary/60") : ""
        }`}
      >
        {p.image && (
          <>
            <img src={p.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30 transition-opacity group-hover:opacity-45" />
            <span className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent" />
          </>
        )}
        <span className="relative flex items-center justify-between gap-2">
          {p.kind && (
            <span className={`font-mono text-[10px] uppercase tracking-[0.18em] ${media ? "text-secondary" : "text-primary"}`}>{p.kind}</span>
          )}
          {p.link && <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />}
        </span>
        <span className="relative">
          <span className={`block font-semibold text-foreground ${p.size ? "text-xl" : ""}`}>{p.name}</span>
          {p.desc && <span className="mt-1 block text-sm text-muted-foreground">{p.desc}</span>}
        </span>
      </Ref>
    </li>
  )
}

function LiveDot() {
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0" aria-label="live">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-60" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-secondary" />
    </span>
  )
}

const shortDate = (iso?: string) => (iso ? format(new Date(`${iso}T00:00:00`), "MMM d") : undefined)

// Bio: content/about.md · Clients: content/work.md · Projects: content/projects.md
export default async function AboutPage() {
  const bio = getAboutBio()
  const projects = getProjects()
  const now = [
    ...(await getNow()),
    { label: "Booking", title: "Open to new client projects", detail: undefined, href: `mailto:${EMAIL}` },
  ]
  const clients = getWorkList()
    .filter((s) => !/project/i.test(s.title))
    .flatMap((s) => s.items.map((item) => ({ ...item, type: s.title })))

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          back
        </Link>

        <section className="mb-14">
          <SectionHeader>About</SectionHeader>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
              <img src="/park.png" alt="Parker Demelia" className="h-full w-full object-cover" />
            </div>
            <div className="text-[15px] leading-relaxed text-foreground/85">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p>{children}</p>,
                  a: ({ href, children }) => (
                    <Ref href={href} className={`inline ${inlineLink}`}>
                      {children}
                    </Ref>
                  ),
                }}
              >
                {bio}
              </ReactMarkdown>
              <p className="mt-3 text-sm text-muted-foreground">
                {SITE_LINKS.map((l, i) => (
                  <span key={l.href}>
                    {i > 0 && " · "}
                    <Link href={l.href} className="hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  </span>
                ))}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-14">
          <SectionHeader live>Currently Building</SectionHeader>
          <ul className="divide-y divide-border border-y border-border">
            {now.map((n) => (
              <li key={n.label}>
                <Ref href={n.href} className="group grid grid-cols-[6.5rem_1fr_auto] items-center gap-4 py-3.5">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{n.label}</span>
                  <span className="min-w-0 truncate text-foreground group-hover:text-primary transition-colors">{n.title}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {shortDate(n.detail) ?? <ArrowUpRight className="h-4 w-4 group-hover:text-primary" />}
                  </span>
                </Ref>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-14">
          <SectionHeader>Client work</SectionHeader>
          <ul className="divide-y divide-border border-y border-border">
            {clients.map((c) => (
              <li key={c.name}>
                <Ref
                  href={c.link}
                  className="group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-3.5 sm:grid-cols-[12rem_1fr_auto]"
                >
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">{c.name}</span>
                  <span className="col-span-2 row-start-2 text-sm text-muted-foreground sm:col-span-1 sm:row-start-auto">{c.desc}</span>
                  <span className="col-start-2 row-start-1 flex items-center gap-2 sm:col-start-auto sm:row-start-auto">
                    <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {c.type}
                    </span>
                    <ArrowUpRight
                      className={`h-4 w-4 transition-colors ${c.link ? "text-muted-foreground group-hover:text-primary" : "invisible"}`}
                    />
                  </span>
                </Ref>
              </li>
            ))}
          </ul>
        </section>

        {projects.length > 0 && (
          <section className="mb-14">
            <SectionHeader>Projects</SectionHeader>
            <ul className="grid grid-flow-dense auto-rows-[minmax(7rem,auto)] grid-cols-1 gap-3 sm:auto-rows-[minmax(8.5rem,auto)] sm:grid-cols-3">
              {projects.map((p) => (
                <ProjectTile key={p.name} p={p} />
              ))}
            </ul>
          </section>
        )}

        <footer className="border-t border-border pt-6">
          <SocialIcons className="justify-center" />
        </footer>
      </main>
    </div>
  )
}
