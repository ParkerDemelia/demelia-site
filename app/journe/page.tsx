import type { Metadata } from "next"
import Link from "next/link"
import { Caveat } from "next/font/google"
import { ArrowLeft } from "lucide-react"
import { getJourne } from "@/lib/journe"
import { JourneProvider } from "@/components/journe/journe-context"
import { JourneTitle, VanBreak } from "@/components/journe/van-hero"
import { JournalRoad } from "@/components/journe/journal-road"
import { VanReceipt } from "@/components/journe/van-receipt"
import { PolaroidGallery } from "@/components/journe/polaroid-gallery"

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
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            back
          </Link>

          <JourneTitle van={journe.van} />
          <JournalRoad intro={journe.intro} entries={journe.entries} odometerStart={journe.odometerStart} />
          <VanBreak odometer={journe.odometerNow} />
          <VanReceipt miles={journe.totalMiles} />
          <PolaroidGallery items={journe.gallery} />
        </div>
      </JourneProvider>
    </div>
  )
}
