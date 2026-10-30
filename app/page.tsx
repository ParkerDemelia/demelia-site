import ReactMarkdown from "react-markdown"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { getWorkList } from "@/lib/resume"
import { getAbout } from "@/lib/about"
import { getPosts } from "@/lib/posts"
import { Ref, SectionLabel, host, inlineLink } from "@/components/ref"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

// The latest-post line can be a Substack post — refresh hourly.
export const revalidate = 3600

// Home is the professional side: who I am + client sites. Writing lives on /blog, everything else on /explore.
// Bio: content/about.md (text before the first ##) · Work: the "Client Work" section of content/work.md
export default async function HomePage() {
  const { bio } = await getAbout()
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

        {latest && (
          <Ref href={latest.href} className="group mb-20 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em]">Latest</span>
            <span className="text-foreground group-hover:text-primary transition-colors">{latest.title}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Ref>
        )}

        {client && (
          <section>
            <SectionLabel>Selected work</SectionLabel>
            <ul className="grid gap-3 sm:grid-cols-2">
              {client.items.map((t, i) => (
                // an odd last card spans both columns instead of sitting alone
                <li key={t.name} className={i === client.items.length - 1 && i % 2 === 0 ? "sm:col-span-2" : undefined}>
                  <Ref
                    href={t.link}
                    className="group flex h-full flex-col justify-between gap-6 rounded-xl border border-border p-5 transition-colors hover:border-foreground/30 hover:bg-muted/40"
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="text-lg font-semibold leading-tight text-foreground">{t.name}</span>
                      {t.link && <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />}
                    </span>
                    <span>
                      {t.desc && <span className="block text-sm text-muted-foreground">{t.desc}</span>}
                      {host(t.link) && <span className="mt-2 block font-mono text-[11px] text-muted-foreground/70">{host(t.link)}</span>}
                    </span>
                  </Ref>
                </li>
              ))}
            </ul>
          </section>
        )}

        <SiteFooter />
      </main>
    </div>
  )
}
