import type { Metadata } from "next"
import { Caveat } from "next/font/google"
import { getJourne } from "@/lib/journe"
import { JourneProvider } from "@/components/journe/journe-context"
import { JourneTitle, VanBreak } from "@/components/journe/van-hero"
import { JournalRoad } from "@/components/journe/journal-road"
import { VanReceipt } from "@/components/journe/van-receipt"
import { PolaroidGallery } from "@/components/journe/polaroid-gallery"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const hand = Caveat({ subsets: ["latin"], variable: "--font-hand" })

export const metadata: Metadata = {
  title: "journe — Parker Demelia",
  description: "Buying, tearing apart, and living in a 1997 Ford E350.",
}

// Edit content/journe.md — frontmatter drives gallery/odometer, the body is the journal.
export default function JournePage() {
  const journe = getJourne()

  return (
    <div className={`${hand.variable} min-h-screen bg-background overflow-x-hidden`}>
      <JourneProvider
        purchase={journe.bought && journe.price ? { date: journe.bought, amount: journe.price } : undefined}
        totals={{ miles: journe.totalMiles, odometerStart: journe.odometerStart, bought: journe.bought }}
      >
        <main className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
          <SiteHeader active="explore" />

          <JourneTitle van={journe.van} />
          <JournalRoad intro={journe.intro} entries={journe.entries} odometerStart={journe.odometerStart} />
          <VanBreak odometer={journe.odometerNow} />
          <VanReceipt miles={journe.totalMiles} />
          <PolaroidGallery items={journe.gallery} />
          <SiteFooter />
        </main>
      </JourneProvider>
    </div>
  )
}
