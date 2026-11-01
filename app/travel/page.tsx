import type { Metadata } from "next"
import { Caveat } from "next/font/google"
import { getTravel } from "@/lib/travel"
import { getTravelMap } from "@/lib/travel-map"
import { SiteHeader } from "@/components/site-header"
import { TravelMap } from "@/components/travel/travel-map"

const hand = Caveat({ subsets: ["latin"], variable: "--font-hand" })

export const metadata: Metadata = {
  title: "travel — Parker Demelia",
  description: "Everywhere I've been, on a map.",
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

// A full-screen map. Edit content/travel.md (## log) — towns need a spot in lib/travel-places.ts.
export default function TravelPage() {
  const map = getTravelMap(getTravel())
  const { countries, states, nights, cities } = map.totals

  return (
    <div className={`${hand.variable} fixed inset-0 overflow-hidden bg-background`}>
      <TravelMap {...map} />

      {/* the site header and title float over the map; only their links catch clicks */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-56 bg-gradient-to-b from-background via-background/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 mx-auto max-w-2xl px-4 pt-12 sm:pt-16 [&_a]:pointer-events-auto">
        <SiteHeader active="explore" />
        <h1 className="-mt-8 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">travel</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {plural(countries, "country", "countries")} · {plural(states, "state", "states")} · {plural(nights, "night", "nights")} away ·{" "}
          {plural(cities, "town", "towns")}
        </p>
      </div>
    </div>
  )
}
