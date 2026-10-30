import type { Metadata } from "next"
import Link from "next/link"
import { Caveat } from "next/font/google"
import ReactMarkdown from "react-markdown"
import { BedDouble, Bus, Mountain, Stamp, UtensilsCrossed } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { Components } from "react-markdown"
import { getAntigua } from "@/lib/antigua"
import { SectionLabel } from "@/components/journe/section-label"
import { ChickenBusHero } from "@/components/antigua/chicken-bus-hero"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const hand = Caveat({ subsets: ["latin"], variable: "--font-hand" })

export const metadata: Metadata = {
  title: "antigua — Parker Demelia",
  description: "Plan a group trip to Antigua, Guatemala — stays, transport, tours, and food.",
}

const PAPER = "oklch(0.96 0.012 90)"
// One color per stamp, cycling.
const STAMP_COLORS = ["oklch(0.55 0.15 25)", "oklch(0.5 0.12 160)", "oklch(0.5 0.14 250)", "oklch(0.62 0.15 70)"]
const TILTS = [-3, 2, -1.5, 3]
// Stamp art when an offer has no photo, picked from its name.
const OFFER_ICONS: [RegExp, LucideIcon][] = [
  [/stay|accommodation|hotel|lodg/i, BedDouble],
  [/transport|shuttle|pickup|bus/i, Bus],
  [/tour|hike|volcano|excursion/i, Mountain],
  [/food|cuisine|meal|eat/i, UtensilsCrossed],
]

const link = "text-primary underline underline-offset-4 hover:brightness-125"
const md: Components = {
  p: ({ children }) => <p className="mb-4 text-[17px] leading-relaxed text-foreground/90 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  a: ({ href, children }) =>
    href?.startsWith("/") ? (
      <Link href={href} className={link}>
        {children}
      </Link>
    ) : (
      <a href={href} target={href?.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer" className={link}>
        {children}
      </a>
    ),
}

// A postage stamp for each thing on offer: photo (or an icon on a coloured field), name, and a stamp number.
function OfferStamp({ name, desc, image, i }: { name: string; desc?: string; image?: string; i: number }) {
  const color = STAMP_COLORS[i % STAMP_COLORS.length]
  const Icon = OFFER_ICONS.find(([re]) => re.test(name))?.[1] ?? Stamp
  return (
    <li className="journe-stamp-wrap" style={{ "--tilt": `${TILTS[i % TILTS.length]}deg` } as React.CSSProperties}>
      <div className="drop-shadow-[0_3px_4px_rgba(0,0,0,0.5)]">
        <div className="journe-stamp" style={{ background: PAPER }}>
          <div className="flex h-full flex-col border border-[oklch(0.8_0.03_80)] p-2.5">
            <div className="relative flex aspect-[5/3] items-center justify-center overflow-hidden rounded-sm text-white" style={{ background: color }}>
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <>
                  {/* engraved-line texture so the colour field reads as printed, not empty */}
                  <span aria-hidden className="absolute inset-0 opacity-20 [background:repeating-linear-gradient(135deg,transparent_0_5px,rgb(255_255_255/0.5)_5px_6px)]" />
                  <Icon className="relative h-10 w-10" strokeWidth={1.5} />
                </>
              )}
            </div>
            <p className="mt-2 text-sm font-bold leading-tight text-neutral-900">{name}</p>
            {desc && <p className="mt-1 text-[12px] leading-snug text-neutral-600">{desc}</p>}
            <p className="mt-auto flex justify-between pt-2 font-mono text-[8px] uppercase tracking-wider text-neutral-500">
              <span>guatemala</span>
              <span className="font-bold" style={{ color }}>
                no. {String(i + 1).padStart(2, "0")}
              </span>
            </p>
          </div>
        </div>
      </div>
    </li>
  )
}

// Edit content/antigua.md — see lib/antigua.ts for which section feeds which part.
export default function AntiguaPage() {
  const a = getAntigua()

  return (
    <div className={`${hand.variable} min-h-screen overflow-x-hidden bg-background`}>
      <main className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <SiteHeader active="explore" />

        <header className="mb-10">
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            {"antigua".split("").map((c, i) => (
              <span key={i} className="journe-letter inline-block" style={{ animationDelay: `${i * 60}ms` }}>
                {c}
              </span>
            ))}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{a.title.toLowerCase()}</p>
          <p className="journe-hand mt-3 -rotate-2 text-xl leading-none text-primary">come stay a while ↓</p>
        </header>

        <ChickenBusHero />

        <section className="mb-16">
          <ReactMarkdown components={md}>{a.intro}</ReactMarkdown>
        </section>

        {a.offers.length > 0 && (
          <section className="mb-16">
            <SectionLabel>what we offer</SectionLabel>
            <ul className="grid grid-cols-2 gap-5 px-1 sm:gap-6">
              {a.offers.map((o, i) => (
                <OfferStamp key={o.name} {...o} i={i} />
              ))}
            </ul>
          </section>
        )}

        {a.whoFor && (
          <section className="mb-16">
            <SectionLabel>who is this for?</SectionLabel>
            <ReactMarkdown components={md}>{a.whoFor}</ReactMarkdown>
          </section>
        )}

        {/* boarding pass */}
        <section className="mb-8">
          <SectionLabel>get in touch</SectionLabel>
          <div className="mx-auto max-w-md -rotate-1 rounded-xl text-neutral-900 shadow-[0_8px_24px_rgba(0,0,0,0.5)]" style={{ background: PAPER }}>
            <div className="flex items-center justify-between rounded-t-xl bg-[oklch(0.5_0.14_250)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-white">
              <span>boarding pass</span>
              <span>✈</span>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 pt-5 text-center">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">from</p>
                <p className="text-3xl font-bold">YOU</p>
              </div>
              <span className="text-neutral-400">- - ✈ - -</span>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">to</p>
                <p className="text-3xl font-bold">GUA</p>
              </div>
            </div>
            <div className="px-5 pb-5 pt-4 text-[15px] leading-relaxed text-neutral-700 [&_a]:text-[oklch(0.45_0.14_250)] [&_a]:underline">
              <ReactMarkdown>{a.contact.text}</ReactMarkdown>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-dashed border-neutral-400 px-5 py-4">
              <span className="journe-hand text-xl leading-none text-neutral-600">dates, group size, questions</span>
              {a.contact.href && (
                <a
                  href={a.contact.href}
                  className="shrink-0 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-85"
                >
                  plan a trip
                </a>
              )}
            </div>
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  )
}
