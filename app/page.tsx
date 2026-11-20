import Link from "next/link"
import ReactMarkdown from "react-markdown"
import { ArrowRight } from "lucide-react"
import { getWorkList } from "@/lib/resume"
import { getAbout } from "@/lib/about"
import { getPosts } from "@/lib/posts"
import { getHits } from "@/lib/hits"
import { screenshot } from "@/lib/screenshot"
import { Ref, SectionLabel, inlineLink } from "@/components/ref"
import { WorkList } from "@/components/work-list"
import { HitsCarousel } from "@/components/hits-carousel"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const pill = "inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 transition-colors hover:border-foreground/30 hover:bg-muted"

// The latest-post line can be a Substack post — refresh hourly.
export const revalidate = 3600

// Home is the whole picture: who I am, a row of pills (latest post, trip pages, juegaespanol), a few client sites, best-of videos, socials.
// The full list of work lives on /work (that's where the business card points). Writing lives on /blog.
// Bio + pills + which work is selected: content/about.md · Work + socials: content/work.md · Videos: content/hits.md
export default async function HomePage() {
  const { bio, links, selected } = getAbout()
  const sections = getWorkList()
  const client = sections.find((s) => /client/i.test(s.title)) ?? sections[0]
  const social = sections.find((s) => /social/i.test(s.title))
  const picks = selected.length
    ? selected.flatMap((name) => client?.items.find((t) => t.name.toLowerCase() === name.toLowerCase()) ?? [])
    : (client?.items.slice(0, 3) ?? [])
  const hits = getHits()
  // only hit the feed when "- {newestblog}" is in the Links list
  const [latest] = links.some((l) => l.kind === "newestblog") ? await getPosts() : []

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <SiteHeader />

        {/* public/portrait.png is a 480px copy of public/park.png, kept as PNG for its transparent background (images aren't optimized at build) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/portrait.png" alt="Parker Demelia" width={88} height={88} className="mb-6 h-[88px] w-[88px] rounded-full bg-muted object-cover ring-1 ring-border" />

        <section className="mb-8 text-xl leading-relaxed text-foreground/85 [&_p:first-child]:text-foreground">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
              a: ({ href, children }) => (
                <Ref href={href} className={`inline ${inlineLink}`}>
                  {children}
                </Ref>
              ),
            }}
          >
            {bio}
          </ReactMarkdown>
        </section>

        {/* One row of pills: the "## Links" list in content/about.md, in order ({newestblog} = latest post) */}
        <nav aria-label="Featured" className="mb-20 flex flex-wrap gap-2 text-sm">
          {links.map((l) =>
            l.kind === "newestblog" ? (
              latest && (
                <Ref key="newestblog" href={latest.href} className={`group ${pill}`}>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Latest</span>
                  <span className="text-foreground group-hover:text-primary transition-colors">{latest.title}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Ref>
              )
            ) : (
              <Ref key={l.href} href={l.href} className={`group ${pill}`}>
                <span className="text-foreground group-hover:text-primary transition-colors">{l.label}</span>
              </Ref>
            ),
          )}
        </nav>

        <div className="space-y-16">
          {picks.length > 0 && (
            <section>
              <SectionLabel>Selected work</SectionLabel>
              <WorkList items={picks.map((t) => ({ ...t, image: screenshot(t.name) }))} />
              <Link href="/work" className="group mt-5 inline-flex items-center gap-1.5 text-sm text-foreground hover:text-primary transition-colors">
                All work
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            </section>
          )}

          {hits.hits.length > 0 && (
            <section>
              <SectionLabel>{hits.title}</SectionLabel>
              <HitsCarousel hits={hits.hits} />
            </section>
          )}

          {social && social.items.length > 0 && (
            <section>
              <SectionLabel>{social.title}</SectionLabel>
              <ul className="grid gap-3 sm:grid-cols-2">
                {social.items.map((c) => (
                  <li key={c.name}>
                    <Ref href={c.link} className="group flex h-full items-start justify-between gap-3 rounded-xl border border-border p-4 transition-colors hover:border-foreground/30">
                      <span>
                        <span className="block font-medium text-foreground group-hover:text-primary transition-colors">{c.name}</span>
                        {c.desc && <span className="mt-1 block text-sm text-muted-foreground">{c.desc}</span>}
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                    </Ref>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <SiteFooter />
      </main>
    </div>
  )
}
