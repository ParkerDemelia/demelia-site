import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { getWorkList } from "@/lib/resume"
import { getCaseStudies, findCaseStudy } from "@/lib/work"
import { screenshot } from "@/lib/screenshot"
import { Ref, SectionLabel, host } from "@/components/ref"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata = { title: "Work — Parker Demelia" }

const button = "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors"

// Everything I've built — the business card points here. Home shows only the picks from content/about.md.
// Client sites + projects: content/work.md (every section except Social Media, which lives on home)
// Case studies: content/work/<slug>.md (see content/work/_template.md). A case study joins the entry with the
// same website (its `link:`) or the same name, and that entry gets a "View project" button. Case studies that
// match nothing show up under the side projects.
export default function WorkPage() {
  const [client, ...rest] = getWorkList().filter((s) => !/social/i.test(s.title) && s.items.length > 0)
  const studies = getCaseStudies()
  const used = new Set<string>()
  const studyFor = (item: { name: string; link?: string }) => {
    const s = findCaseStudy(item, studies)
    if (s) used.add(s.slug)
    return s
  }

  const clientItems = (client?.items ?? []).map((t) => ({ ...t, image: screenshot(t.name), study: studyFor(t) }))
  const restSections = rest.map((s) => ({ ...s, items: s.items.map((t) => ({ ...t, study: studyFor(t) })) }))
  const loose = studies.filter((s) => !used.has(s.slug))

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <SiteHeader active="work" />
        <p className="mb-14 text-xl leading-relaxed text-foreground">
          Websites and apps I&apos;ve built for clients, plus the side projects I make for fun.
        </p>

        <div className="space-y-20">
          {client && (
            <section>
              <SectionLabel>{client.title}</SectionLabel>
              <ul className="space-y-16">
                {clientItems.map((t) => (
                  <li key={t.name}>
                    {t.image && (
                      <Ref href={t.study ? `/work/${encodeURIComponent(t.study.slug)}` : t.link} className="mb-5 block overflow-hidden rounded-xl bg-muted ring-1 ring-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={t.image} alt={t.name} loading="lazy" className="aspect-[8/5] w-full object-cover object-top transition-transform duration-500 hover:scale-[1.02]" />
                      </Ref>
                    )}
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">{t.name}</h2>
                    {t.desc && <p className="mt-2 text-muted-foreground">{t.desc}</p>}
                    {host(t.link) && <p className="mt-1.5 font-mono text-[11px] text-muted-foreground/70">{host(t.link)}</p>}
                    <div className="mt-5 flex flex-wrap gap-2">
                      {t.study && (
                        <Link href={`/work/${encodeURIComponent(t.study.slug)}`} className={`group ${button} bg-foreground text-background hover:bg-foreground/85`}>
                          View project
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      )}
                      {t.link && (
                        <Ref href={t.link} className={`group ${button} border border-border text-foreground hover:border-foreground/30 hover:bg-muted`}>
                          Visit website
                          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </Ref>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {restSections.map((s, i) => {
            const cards = [
              ...s.items.map((c) => ({ title: c.name, note: c.desc, href: c.study ? `/work/${encodeURIComponent(c.study.slug)}` : c.link })),
              // case studies that don't belong to any entry join the first section after client work
              ...(i === 0 ? loose.map((c) => ({ title: c.title, note: c.summary, href: `/work/${encodeURIComponent(c.slug)}` })) : []),
            ]
            return (
              <section key={s.title}>
                <SectionLabel>{s.title}</SectionLabel>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {cards.map((c) => (
                    <li key={c.title}>
                      <Ref href={c.href} className="group flex h-full items-start justify-between gap-3 rounded-xl border border-border p-4 transition-colors hover:border-foreground/30">
                        <span>
                          <span className="block font-medium text-foreground group-hover:text-primary transition-colors">{c.title}</span>
                          {c.note && <span className="mt-1 block text-sm text-muted-foreground">{c.note}</span>}
                        </span>
                        {c.href?.startsWith("http") ? (
                          <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                        ) : (
                          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                        )}
                      </Ref>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>

        <SiteFooter />
      </main>
    </div>
  )
}
