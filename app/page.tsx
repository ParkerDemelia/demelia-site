import { existsSync } from "fs"
import { join } from "path"
import ReactMarkdown from "react-markdown"
import { ArrowRight } from "lucide-react"
import { getWorkList } from "@/lib/resume"
import { getAbout } from "@/lib/about"
import { getPosts } from "@/lib/posts"
import { Ref, SectionLabel, inlineLink } from "@/components/ref"
import { WorkList } from "@/components/work-list"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

// Hover previews: public/work/<slug>.webp, where "Mission Monte Líbano" → mission-monte-libano
function screenshot(name: string) {
  const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  return existsSync(join(process.cwd(), "public", "work", `${slug}.webp`)) ? `/work/${slug}.webp` : undefined
}

// The latest-post line can be a Substack post — refresh hourly.
export const revalidate = 3600

// Home is the professional side: who I am + client sites. Writing lives on /blog, everything else on /explore.
// Bio: content/about.md (text before the first ##) · Work: the "Client Work" section of content/work.md
export default async function HomePage() {
  const { bio, links } = await getAbout()
  const sections = getWorkList()
  const client = sections.find((s) => /client/i.test(s.title)) ?? sections[0]
  const [latest] = await getPosts()

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

        {/* Featured links: the latest post, then the "## Links" list in content/about.md */}
        <div className="mb-20 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {latest && (
            <Ref href={latest.href} className="group inline-flex items-center gap-2 hover:text-foreground transition-colors">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em]">Latest</span>
              <span className="text-foreground group-hover:text-primary transition-colors">{latest.title}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Ref>
          )}
          {links.map((l) => (
            <Ref key={l.href} href={l.href} className="group inline-flex items-center gap-1.5 text-foreground hover:text-primary transition-colors">
              {l.label}
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Ref>
          ))}
        </div>

        {client && (
          <section>
            <SectionLabel>Selected work</SectionLabel>
            <WorkList items={client.items.map((t) => ({ ...t, image: screenshot(t.name) }))} />
          </section>
        )}

        <SiteFooter />
      </main>
    </div>
  )
}
