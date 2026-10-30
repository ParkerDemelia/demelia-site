import type { Metadata } from "next"
import { Caveat } from "next/font/google"
import { getGear } from "@/lib/gear"
import { GearLinks } from "@/components/gear/gear-links"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const hand = Caveat({ subsets: ["latin"], variable: "--font-hand" })

export const metadata: Metadata = {
  title: "gear — Parker Demelia",
  description: "The travel, tech, and van gear I actually use and recommend.",
}

// Edit content/gear.md — see lib/gear.ts for the {HOT} / {$price} / ![[photo]] syntax.
export default function GearPage() {
  const sections = getGear()
  const count = sections.reduce((n, s) => n + (s.kind === "socials" ? 0 : s.items.length), 0)

  return (
    <div className={`${hand.variable} min-h-screen bg-background`}>
      <main className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <SiteHeader active="explore" />

        <header>
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">gear</h1>
          <p className="mt-2 text-sm text-muted-foreground">the travel gear I actually use and recommend</p>
          <p className="journe-hand mt-3 -rotate-2 text-xl leading-none text-primary">
            {count} things I&apos;d buy again ↓
          </p>
        </header>

        <div className="mt-6">
          <GearLinks sections={sections} />
        </div>

        <p className="mt-12 text-xs text-muted-foreground">
          As an Amazon Associate I earn from qualifying purchases. Links on this page may be
          affiliate links — it costs you nothing extra and helps support the site. Anything marked
          &ldquo;sponsored&rdquo; is a brand that pays me or gives me a code to share.
        </p>

        <SiteFooter />
      </main>
    </div>
  )
}
