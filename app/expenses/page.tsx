import { getTravel } from "@/lib/travel"
import { getTravelMap } from "@/lib/travel-map"
import { ExpensesView } from "@/components/expenses/expenses-view"

// Nights abroad per country this year, from the content/travel.md log — the per-day column divides by these.
// US states are left out: every day of the year not spent abroad counts as a USA day.
export default function ExpensesPage() {
  const travel = getTravel()
  const { regions } = getTravelMap({ ...travel, log: travel.log.filter((s) => s.start >= "2026"), extraPlaces: [], trips: [] })
  const nights = Object.fromEntries(regions.filter((r) => r.kind === "country" && r.nights > 0).map((r) => [r.name, Math.round(r.nights)]))
  return <ExpensesView nights={nights} />
}
