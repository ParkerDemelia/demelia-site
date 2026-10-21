import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Caveat, Instrument_Serif } from "next/font/google"
import { ArrowLeft, ArrowUpRight, FileText, Mail } from "lucide-react"
import { getResume, type WorkSection } from "@/lib/resume"
import { SocialIcons } from "@/components/social-icons"

const hand = Caveat({ subsets: ["latin"], variable: "--font-hand" })
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif" })

export const metadata: Metadata = {
  title: "bio — Parker Demelia",
  description: "A techie, a creative, a traveler. The resume cover version.",
  robots: { index: false, follow: false },
}

const EMAIL = "parker.demelia@gmail.com"
const SECTIONS = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "fun", label: "Fun" },
]
const STICKER_FILLS = ["var(--bio-sticker-1)", "var(--bio-sticker-2)", "var(--bio-sticker-3)", "var(--bio-sticker-4)", "var(--bio-sticker-5)"]
const tilt = (i: number) => [-3, 2, -1.5, 3, -2.5, 1][i % 6]
const pad = (n: number) => String(n).padStart(2, "0")

function Ref({ href, className = "", children }: { href?: string; className?: string; children: React.ReactNode }) {
  if (!href) return <span className={className}>{children}</span>
  const external = href.startsWith("http") || href.startsWith("mailto:")
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

function SectionHead({ n, id, title, aside }: { n: number; id: string; title: string; aside: string }) {
  return (
    <header id={id} className="scroll-mt-8 mb-8 flex items-end gap-4 border-b-2 border-[var(--bio-ink)] pb-2">
      <span className="font-mono text-sm font-semibold text-[var(--bio-stamp)]">{pad(n)}</span>
      <h2 className="bio-serif text-5xl leading-[0.85] sm:text-6xl">{title}</h2>
      <span className="bio-hand ml-auto hidden text-xl text-[var(--bio-pen)] sm:block">{aside}</span>
    </header>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--bio-ink-soft)]">{children}</h3>
}

function AvailableStamp() {
  return (
    <svg viewBox="0 0 120 120" className="bio-stamp w-24 sm:w-28" aria-label="Available for work">
      <defs>
        <path id="bio-stamp-ring" d="M60 60 m-41 0 a41 41 0 1 1 82 0 a41 41 0 1 1 -82 0" />
      </defs>
      <circle cx="60" cy="60" r="55" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="60" cy="60" r="30" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text fontSize="12" fontFamily="monospace" fontWeight="700" fill="currentColor">
        <textPath href="#bio-stamp-ring" textLength="252" lengthAdjust="spacing">
          AVAILABLE ✦ FOR WORK ✦
        </textPath>
      </text>
      <text x="60" y="66" textAnchor="middle" fontSize="17" fontFamily="monospace" fontWeight="700" fill="currentColor">
        {new Date().getFullYear()}
      </text>
    </svg>
  )
}

// Clients render as little business cards; anything titled "...projects" renders as a numbered index.
function WorkList({ section }: { section: WorkSection }) {
  if (/project/i.test(section.title)) {
    return (
      <ol className="divide-y divide-dashed divide-[var(--bio-rule)] border-y border-dashed border-[var(--bio-rule)]">
        {section.items.map((item, i) => (
          <li key={item.name}>
            <Ref href={item.link} className="group grid grid-cols-[2rem_1fr_auto] items-baseline gap-x-3 py-2.5">
              <span className="font-mono text-xs text-[var(--bio-ink-soft)]">{pad(i + 1)}</span>
              <span className="min-w-0">
                <span className="font-semibold group-hover:text-[var(--bio-stamp)] transition-colors">{item.name}</span>
                {item.desc && <span className="block text-sm text-[var(--bio-ink-soft)] sm:inline sm:before:content-['_—_']">{item.desc}</span>}
              </span>
              {item.link ? (
                <ArrowUpRight className="h-4 w-4 text-[var(--bio-ink-soft)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--bio-stamp)]" />
              ) : (
                <span className="font-mono text-[10px] uppercase text-[var(--bio-ink-soft)]">offline</span>
              )}
            </Ref>
          </li>
        ))}
      </ol>
    )
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {section.items.map((item) => (
        <li key={item.name}>
          <Ref
            href={item.link}
            className="bio-card group flex h-full flex-col justify-between gap-3 rounded-sm border border-[var(--bio-rule)] bg-[var(--bio-card)] p-4"
          >
            <span>
              <span className="flex items-start justify-between gap-2">
                <span className="bio-serif text-2xl leading-tight">{item.name}</span>
                {item.link && <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-[var(--bio-ink-soft)] group-hover:text-[var(--bio-stamp)]" />}
              </span>
              {item.desc && <span className="mt-1 block text-sm text-[var(--bio-ink-soft)]">{item.desc}</span>}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--bio-stamp)]">{section.title}</span>
          </Ref>
        </li>
      ))}
    </ul>
  )
}

// Edit content/resume.md — clients + projects come from content/work.md.
// Draft: only viewable with `npm run dev` — 404s on the live site.
export default function BioPage() {
  if (process.env.NODE_ENV === "production") notFound()
  const r = getResume()
  const clients = r.work.filter((s) => !/project/i.test(s.title))
  const projects = r.work.filter((s) => /project/i.test(s.title))

  return (
    <div className={`${hand.variable} ${serif.variable} min-h-screen bg-background overflow-x-hidden`}>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          back
        </Link>

        <article className="bio-sheet relative rounded-sm px-5 py-8 sm:px-12 sm:py-12">
          {/* ── Cover ─────────────────────────────── */}
          <div className="mb-10 flex items-center justify-between border-b border-[var(--bio-rule)] pb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--bio-ink-soft)]">
            <span>Résumé — Cover Sheet</span>
            <span>Vol. {new Date().getFullYear()}</span>
          </div>

          <div className="relative grid gap-8 sm:grid-cols-[1fr_auto]">
            <div>
              <h1 className="bio-serif text-[4.5rem] leading-[0.82] tracking-tight sm:text-[6.5rem]">
                Parker
                <br />
                <span className="italic">Demelia</span>
              </h1>
              <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs uppercase tracking-[0.2em]">
                {r.roles.map((role, i) => (
                  <span key={role} className="flex items-center gap-2">
                    {i > 0 && <span className="text-[var(--bio-stamp)]">✦</span>}
                    {role}
                  </span>
                ))}
              </p>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <a href={`mailto:${EMAIL}`} className="bio-link inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {EMAIL}
                </a>
                <a href="/resume.pdf" className="bio-link inline-flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  full resume (pdf)
                </a>
              </div>
            </div>

            {/* Clipped-on photo */}
            <div className="relative mx-auto w-40 sm:mx-0 sm:w-44">
              <div className="bio-polaroid relative bg-white p-2 pb-8">
                <span className="bio-clip" aria-hidden="true" />
                <img src="/park.png" alt="Parker Demelia" className="aspect-square w-full object-cover" />
                <span className="bio-hand absolute inset-x-0 bottom-1 text-center text-xl text-[var(--bio-pen)]">that&apos;s me!</span>
              </div>
            </div>
          </div>

          {/* Table of contents */}
          <nav className="relative mt-12" aria-label="Contents">
            <Label>Contents</Label>
            <ol className="space-y-1.5 pr-28 sm:pr-36">
              {SECTIONS.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="group flex items-baseline gap-3">
                    <span className="font-mono text-xs text-[var(--bio-stamp)]">{pad(i + 1)}</span>
                    <span className="bio-serif text-2xl group-hover:italic">{s.label}</span>
                    <span className="mb-1.5 flex-1 border-b-2 border-dotted border-[var(--bio-rule)]" />
                    <span className="font-mono text-xs text-[var(--bio-ink-soft)] group-hover:text-[var(--bio-stamp)]">↓</span>
                  </a>
                </li>
              ))}
            </ol>
            <div className="absolute right-0 top-1/2 -translate-y-1/3 sm:-right-2">
              <AvailableStamp />
            </div>
          </nav>

          {/* ── 01 About ─────────────────────────── */}
          <section className="mt-20">
            <SectionHead n={1} id="about" title="About" aside="the short version" />

            <p className="bio-serif text-3xl leading-tight sm:text-4xl">
              &ldquo;{r.tagline}&rdquo;
            </p>

            <div className="mt-10 grid gap-10 sm:grid-cols-5">
              <div className="sm:col-span-3">
                <Label>Spec sheet</Label>
                <dl className="text-sm">
                  {r.facts.map((f) => (
                    <div key={f.label} className="grid grid-cols-[6.5rem_1fr] gap-3 border-b border-dashed border-[var(--bio-rule)] py-2.5 first:border-t">
                      <dt className="font-mono text-[11px] uppercase tracking-wider text-[var(--bio-ink-soft)] pt-0.5">{f.label}</dt>
                      <dd>
                        <Ref href={f.link} className={f.link ? "bio-link" : ""}>
                          {f.value}
                        </Ref>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="sm:col-span-2">
                <Label>Toolkit</Label>
                <ul className="flex flex-wrap gap-2">
                  {r.skills.map((s, i) => (
                    <li
                      key={s}
                      style={{ rotate: `${tilt(i) / 2}deg` }}
                      className="rounded-sm border-[1.5px] border-[var(--bio-stamp)] px-2 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--bio-stamp)]"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-12">
              <Label>How I got here</Label>
              <ol className="bio-timeline relative grid gap-5 sm:auto-cols-fr sm:grid-flow-col sm:gap-3">
                {r.eras.map((e, i) => (
                  <li key={e.when} className="relative pl-7 sm:pl-0 sm:pt-7">
                    <span
                      className={`absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-[var(--bio-ink)] sm:top-0 ${
                        i === r.eras.length - 1 ? "bg-[var(--bio-stamp)]" : "bg-[var(--bio-paper)]"
                      }`}
                    />
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--bio-ink-soft)]">{e.when}</span>
                    <Ref href={e.link} className={`mt-1 block text-sm font-medium leading-snug ${e.link ? "bio-link" : ""}`}>
                      {e.what}
                    </Ref>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* ── 02 Work ──────────────────────────── */}
          <section className="mt-20">
            <SectionHead n={2} id="work" title="Work" aside="if you like it, reach out" />

            <Label>Experience</Label>
            <ul className="space-y-5">
              {r.experience.map((x) => (
                <li key={x.org} className="grid gap-1 sm:grid-cols-[11rem_1fr] sm:gap-6">
                  <div>
                    <p className="font-semibold">{x.org}</p>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--bio-stamp)]">{x.role}</p>
                  </div>
                  {x.note && <p className="text-sm text-[var(--bio-ink-soft)] sm:pt-0.5">{x.note}</p>}
                </li>
              ))}
            </ul>

            {clients.length > 0 && (
              <div className="mt-12">
                <Label>Clients</Label>
                <div className="space-y-3">
                  {clients.map((s) => (
                    <WorkList key={s.title} section={s} />
                  ))}
                </div>
              </div>
            )}

            {projects.map((s) => (
              <div key={s.title} className="mt-12">
                <Label>{s.title}</Label>
                <WorkList section={s} />
              </div>
            ))}
          </section>

          {/* ── 03 Fun ───────────────────────────── */}
          <section className="mt-20">
            <SectionHead n={3} id="fun" title="Fun" aside="off the clock" />

            <Label>Free time</Label>
            <ul className="flex flex-wrap items-start gap-x-4 gap-y-6 pb-4">
              {r.hobbies.map((h, i) => (
                <li key={h.name} className="relative">
                  <Ref href={h.link} className="bio-sticker block">
                    <span
                      style={{ background: STICKER_FILLS[i % STICKER_FILLS.length], rotate: `${tilt(i)}deg` }}
                      className="block rounded-full px-4 py-2 text-sm font-semibold"
                    >
                      {h.name}
                      {h.link && " ↗"}
                    </span>
                  </Ref>
                  {h.note && (
                    <span className="bio-hand absolute left-1/2 top-full mt-1 block w-max -translate-x-1/4 rotate-[-4deg] text-lg leading-none text-[var(--bio-pen)]">
                      ↖ {h.note}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-12">
              <Label>Things I make for fun</Label>
              <ul className="grid gap-3 sm:grid-cols-2">
                {r.channels.map((c, i) => (
                  <li key={c.name}>
                    <Ref href={c.link} className="bio-ticket group flex items-stretch overflow-hidden rounded-sm bg-[var(--bio-card)]">
                      <span className="flex w-14 shrink-0 items-center justify-center border-r-2 border-dashed border-[var(--bio-rule)] font-mono text-xs text-[var(--bio-stamp)] [writing-mode:vertical-rl]">
                        No.{pad(i + 1)}
                      </span>
                      <span className="flex flex-1 items-center justify-between gap-3 px-4 py-3">
                        <span>
                          <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--bio-ink-soft)]">{c.where}</span>
                          <span className="bio-serif text-2xl leading-tight">{c.name}</span>
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-[var(--bio-ink-soft)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--bio-stamp)]" />
                      </span>
                    </Ref>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-8 text-sm text-[var(--bio-ink-soft)]">
              More of me around here:{" "}
              <Link href="/journe" className="bio-link">journe</Link>
              {" · "}
              <Link href="/gear" className="bio-link">gear</Link>
              {" · "}
              <Link href="/expenses" className="bio-link">expenses</Link>
            </p>
          </section>

          {/* ── Sign-off ─────────────────────────── */}
          {r.quote && (
            <figure className="mt-20 border-t-2 border-[var(--bio-ink)] pt-10">
              <blockquote className="bio-hand text-[1.7rem] leading-snug text-[var(--bio-pen)] sm:text-3xl">
                &ldquo;{r.quote}&rdquo;
              </blockquote>
              <figcaption className="bio-hand mt-4 text-right text-4xl text-[var(--bio-ink)]">— Parker</figcaption>
            </figure>
          )}

          <footer className="mt-12 flex flex-col items-center gap-6 border-t border-[var(--bio-rule)] pt-8 sm:flex-row sm:justify-between">
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center gap-2 rounded-sm bg-[var(--bio-ink)] px-5 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-[var(--bio-paper)] transition-colors hover:bg-[var(--bio-stamp)]"
            >
              <Mail className="h-3.5 w-3.5" />
              Get in contact
            </a>
            <SocialIcons itemClassName="text-[var(--bio-ink-soft)] hover:text-[var(--bio-stamp)]" />
          </footer>
        </article>
      </div>
    </div>
  )
}
