import type { Metadata } from "next"
import Link from "next/link"
import { Caveat } from "next/font/google"
import { ArrowLeft } from "lucide-react"
import { getGear } from "@/lib/gear"
import { GearLinks } from "@/components/gear/gear-links"

const hand = Caveat({ subsets: ["latin"], variable: "--font-hand" })

export const metadata: Metadata = {
  title: "gear — Parker Demelia",
  description: "The travel, tech, and van gear I actually use and recommend.",
}

// Edit content/gear.md — see lib/gear.ts for the {HOT} / {$price} / ![[photo]] syntax.
export default function GearPage() {
  const sections = getGear()
  const count = sections.reduce((n, s) => n + s.items.length, 0)

  return (
    <div className={`${hand.variable} min-h-screen bg-background`}>
      <div className="container mx-auto max-w-md px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          back
        </Link>

        <header className="mt-4 flex flex-col items-center text-center">
          <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-background bg-muted shadow-md ring-2 ring-primary/60">
            <img src="/park.png" alt="Parker Demelia" className="h-full w-full object-cover" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">parker&apos;s gear</h1>
          <p className="mt-1 text-sm text-muted-foreground">the travel gear I actually use and recommend</p>
          <p className="journe-hand mt-3 -rotate-2 text-lg leading-none text-primary">
            {count} things I&apos;d buy again ↓
          </p>
        </header>

        <div className="mt-6">
          <GearLinks sections={sections} />
        </div>

        <p className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          As an Amazon Associate I earn from qualifying purchases. Links on this page may be
          affiliate links — it costs you nothing extra and helps support the site.
        </p>
      </div>
    </div>
  )
}
