import Link from "next/link"
import ReactMarkdown from "react-markdown"
import { ArrowUpRight } from "lucide-react"
import { getWorkList } from "@/lib/resume"
import { getAbout } from "@/lib/about"
import { StoryAvatar } from "@/components/about/story-avatar"
import { SocialIcons } from "@/components/social-icons"

// "{substack}" in What's New pulls the latest post — refresh hourly.
export const revalidate = 3600

// Same links as the old home page header
const SITE_LINKS = [
  { label: "resume", href: "/resume.pdf" },
  { label: "gear", href: "/gear" },
  { label: "expenses", href: "/expenses" },
  { label: "journe", href: "/journe" },
]

// One color per "## " section of content/work.md, in order.
const GROUP_COLORS = ["var(--primary)", "oklch(0.82 0.14 75)", "oklch(0.76 0.15 350)", "var(--secondary)", "oklch(0.72 0.15 290)"]

const inlineLink = "text-foreground underline decoration-border underline-offset-4 hover:text-primary hover:decoration-primary transition-colors"

type Tile = { name: string; desc?: string; link?: string }

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

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-5 text-2xl font-bold tracking-tight text-foreground">{children}</h2>
}

// Letters hop one after another on hover, like the journe title.
function WaveLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="wave-link inline-block hover:text-foreground transition-colors" aria-label={label}>
      {label.split("").map((c, i) => (
        <span key={i} aria-hidden="true" className="wave-letter inline-block" style={{ "--i": i } as React.CSSProperties}>
          {c}
        </span>
      ))}
    </Link>
  )
}

// Split into rows of at most 3, as even as possible (5 → 3+2, 4 → 2+2).
function rows<T>(items: T[]): T[][] {
  const count = Math.ceil(items.length / 3)
  const out: T[][] = []
  let start = 0
  for (let r = 0; r < count; r++) {
    const size = Math.ceil((items.length - start) / (count - r))
    out.push(items.slice(start, start + size))
    start += size
  }
  return out
}

// Groups made only of 2-tile rows would be a flat grid, so make one tile in each row
// wide, alternating sides (wide·narrow / narrow·wide). Groups with a 3-tile row already vary.
function wideAt<T>(all: T[][], row: number): number | undefined {
  if (all.some((r) => r.length > 2) || all[row].length !== 2) return undefined
  return row % 2
}

// "https://www.hotelterramaya.com/" → "hotelterramaya.com"
function host(link?: string) {
  if (!link?.startsWith("http")) return undefined
  try {
    return new URL(link).hostname.replace(/^www\./, "")
  } catch {
    return undefined
  }
}

function BentoTile({ t, wide = false }: { t: Tile; wide?: boolean }) {
  const site = host(t.link)
  return (
    <li className="bento-tile" style={wide ? ({ "--w": 2 } as React.CSSProperties) : undefined}>
      <Ref href={t.link} className="group relative flex h-full flex-col justify-between gap-4 overflow-hidden rounded-lg p-4">
        <span className="flex items-center justify-between gap-2">
          {site && <span className="truncate font-mono text-[10px] tracking-wider text-[var(--c)]">{site}</span>}
          {t.link && <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-[var(--c)]" />}
        </span>
        <span className="min-w-0">
          <span className="block font-semibold leading-tight text-foreground">{t.name}</span>
          {t.desc && <span className="bento-desc mt-1 line-clamp-2 block text-sm text-muted-foreground">{t.desc}</span>}
        </span>
      </Ref>
    </li>
  )
}

// Bio, What's New and the photo story: content/about.md · Work tiles: content/work.md
export default async function HomePage() {
  const { bio, news, story } = await getAbout()
  const groups = getWorkList().filter((s) => s.items.length > 0)

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <section className="mb-14">
          <SectionHeader>About</SectionHeader>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <StoryAvatar src="/park.png" alt="Parker Demelia" slides={story} />
            <div className="text-[15px] leading-relaxed text-foreground/85">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
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
                    <WaveLink href={l.href} label={l.label} />
                  </span>
                ))}
              </p>
            </div>
          </div>
        </section>

        {news.length > 0 && (
          <section className="mb-14">
            <SectionHeader>What&apos;s New!</SectionHeader>
            <ul className="divide-y divide-border border-y border-border">
              {news.map((n) => (
                <li key={n.label + n.title}>
                  <Ref href={n.href} className="group grid grid-cols-[6.5rem_1fr_auto] items-center gap-4 py-3.5">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{n.label}</span>
                    <span className={`min-w-0 truncate text-foreground ${n.href ? "group-hover:text-primary transition-colors" : ""}`}>{n.title}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {n.detail ?? (n.href ? <ArrowUpRight className="h-4 w-4 group-hover:text-primary" /> : null)}
                    </span>
                  </Ref>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mb-14">
          <SectionHeader>Work</SectionHeader>
          <div className="space-y-8">
            {groups.map((g, gi) => (
              <div key={g.title} style={{ "--c": GROUP_COLORS[gi % GROUP_COLORS.length] } as React.CSSProperties}>
                <h3 className="mb-3 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--c)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--c)]" />
                  {g.title}
                  <span className="h-px flex-1 bg-[var(--c)] opacity-25" />
                </h3>
                <div className="space-y-3">
                  {rows(g.items).map((row, i, all) => (
                    <ul key={i} className="bento-row">
                      {row.map((t, j) => (
                        <BentoTile key={t.name} t={t} wide={wideAt(all, i) === j} />
                      ))}
                    </ul>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-border pt-6">
          <SocialIcons className="justify-center" />
        </footer>
      </main>
    </div>
  )
}
