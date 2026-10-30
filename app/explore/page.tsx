import { ArrowUpRight } from "lucide-react"
import { getWorkList } from "@/lib/resume"
import { resolveMedia } from "@/lib/vault"
import { Ref, SectionLabel } from "@/components/ref"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ChickenBus } from "@/components/antigua/chicken-bus-hero"
import { PageCarousel, type Slide } from "@/components/explore/page-carousel"

export const metadata = { title: "Explore — Parker Demelia" }

type Card = { title: string; href?: string; note?: string }

// Small bordered card used for every non-photo item on the page.
function CardGrid({ items }: { items: Card[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((c) => (
        <li key={c.title}>
          <Ref href={c.href} className="group flex h-full items-start justify-between gap-3 rounded-xl border border-border p-4 transition-colors hover:border-foreground/30">
            <span>
              <span className="block font-medium text-foreground group-hover:text-primary transition-colors">{c.title}</span>
              {c.note && <span className="mt-1 block text-sm text-muted-foreground">{c.note}</span>}
            </span>
            {c.href?.startsWith("http") && <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />}
          </Ref>
        </li>
      ))}
    </ul>
  )
}

// A vault photo by base name, whatever its extension (drop gear.jpg / antigua.jpg into content/attachments).
const photo = (name: string) =>
  ["jpg", "jpeg", "png", "webp"].map((ext) => resolveMedia(`${name}.${ext}`)).find(Boolean) ?? undefined

// The fun side: a carousel of the hand-built pages up top, then side projects and videos.
// Side projects + videos: the non-"Client Work" sections of content/work.md
export default function ExplorePage() {
  const sections = getWorkList().filter((s) => !/client/i.test(s.title) && s.items.length > 0)

  // Left to right as it lands: antigua (faded), travel, me (middle), journe, gear (faded).
  const slides: Slide[] = [
    { title: "antigua", href: "/antigua", src: photo("antigua"), art: <ChickenBus /> },
    { title: "travel", href: "/travel", src: photo("travel") },
    { title: "me", href: "https://www.instagram.com/parker.demelia/", src: photo("me") },
    { title: "journe", href: "/journe", src: photo("van") },
    { title: "gear", href: "/gear", src: photo("gear"), tags: true },
  ]

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <SiteHeader active="explore" />
        <p className="mb-10 text-muted-foreground">The creative side: where I travel, the van I&apos;m building, and the videos and side projects I make for fun.</p>

        <PageCarousel slides={slides} start={2} />

        <div className="space-y-14">
          {sections.map((s) => (
            <section key={s.title}>
              <SectionLabel>{s.title}</SectionLabel>
              <CardGrid items={s.items.map((i) => ({ title: i.name, href: i.link, note: i.desc }))} />
            </section>
          ))}
        </div>

        <SiteFooter />
      </main>
    </div>
  )
}
