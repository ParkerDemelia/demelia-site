import type { Metadata } from "next"
import { Caveat } from "next/font/google"
import { getTravel } from "@/lib/travel"
import { getTravelMap } from "@/lib/travel-map"
import { SiteHeader } from "@/components/site-header"
import { TravelTimeline } from "@/components/travel/travel-timeline"
import { SiteFooter } from "@/components/site-footer"

const hand = Caveat({ subsets: ["latin"], variable: "--font-hand" })

export const metadata: Metadata = {
  title: "travel — Parker Demelia",
  description: "Everywhere I've been, year by year.",
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

// Every year of travel, from content/travel.md. Edit content/travel.md: the ## log is the
// stays (towns need a spot in lib/travel-places.ts), every other ## section is a chapter of the timeline.
export default function TravelPage() {
  const travel = getTravel()
  const map = getTravelMap(travel)
  const { countries, states, nights, cities } = map.totals

  return (
    <div className={`${hand.variable} min-h-screen bg-background`}>
      <main className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <SiteHeader active="explore" back="/explore" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">travel</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {plural(countries, "country", "countries")} · {plural(states, "state", "states")} · {plural(nights, "night", "nights")} away ·{" "}
          {plural(cities, "town", "towns")}
        </p>

        {/* the map (components/travel/travel-map.tsx) is parked for now — drop <TravelMap {...map} /> in a
            framed div here to bring it back */}
        <div className="mb-14" />

        <TravelTimeline travel={travel} />

        <SiteFooter />
      </main>
    </div>
  )
}
