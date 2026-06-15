"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  type Expense,
  CATEGORY_COLORS,
  useExpenses,
  formatDate,
  formatDateFull,
  formatAmount,
} from "@/components/trip-expenses-widget"

type SortKey = "expense" | "date" | "category" | "price" | "location"
type SortDirection = "ascending" | "descending"

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "expense", label: "Expense" },
  { key: "date", label: "Date" },
  { key: "category", label: "Category" },
  { key: "price", label: "Price" },
  { key: "location", label: "Location" },
]

const TRIPS: { id: string; label: string; start: string; end: string }[] = [
  { id: "trip1", label: "Trip 1", start: "2026-01-19", end: "2026-04-19" },
  { id: "trip2", label: "Trip 2", start: "2026-06-01", end: "2026-07-01" },
]

function signedPrice(e: Expense): number {
  return (e.earned || 0) - (e.amount || 0)
}

function compareValues(a: Expense, b: Expense, key: SortKey, dir: SortDirection): number {
  let cmp = 0
  if (key === "price") {
    cmp = signedPrice(a) - signedPrice(b)
  } else if (key === "date") {
    cmp = (a.date || "").localeCompare(b.date || "")
  } else {
    cmp = (a[key] as string || "").localeCompare((b[key] as string) || "")
  }
  return dir === "ascending" ? cmp : -cmp
}

function DonutChart({ data, total, colors, onClickSegment, activeSegment }: {
  data: [string, number][]
  total: number
  colors: string[]
  onClickSegment: (name: string) => void
  activeSegment: string | null
}) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {data.map(([name, amount], i) => {
        const pct = total > 0 ? amount / total : 0
        const dash = pct * circumference
        const gap = circumference - dash
        const currentOffset = offset
        offset += dash
        const dimmed = activeSegment !== null && activeSegment !== name
        return (
          <circle
            key={name}
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={colors[i % colors.length]}
            strokeWidth="14"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-currentOffset}
            className="cursor-pointer transition-opacity"
            opacity={dimmed ? 0.25 : 1}
            onClick={() => onClickSegment(name)}
          />
        )
      })}
    </svg>
  )
}

function ExpenseDateCell({ date, dateEnd }: { date: string; dateEnd: string }) {
  if (!date) return <span>—</span>
  if (dateEnd) {
    return <span>{formatDate(date)} – {formatDate(dateEnd)}</span>
  }
  return <span>{formatDate(date)}</span>
}

function PriceCell({ exp }: { exp: Expense }) {
  if (exp.earned > 0) {
    return <span className="text-emerald-500">+{formatAmount(exp.earned)}</span>
  }
  if (exp.amount > 0) {
    return <span className="text-foreground">{formatAmount(exp.amount)}</span>
  }
  return <span className="text-muted-foreground/40">—</span>
}

export default function TripExpensesPage() {
  const { allExpenses, loading, error, overviewStats, categoryColorMap } = useExpenses()
  const [sortKey, setSortKey] = useState<SortKey>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("descending")
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set())
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [filterType, setFilterType] = useState<"all" | "spent" | "earned">("all")
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null)

  const locations = useMemo(() => {
    const set = new Set<string>()
    allExpenses.forEach(e => { if (e.location) set.add(e.location) })
    return Array.from(set).sort()
  }, [allExpenses])

  const categories = useMemo(() => {
    const set = new Set<string>()
    allExpenses.forEach(e => { if (e.category) set.add(e.category) })
    return Array.from(set).sort()
  }, [allExpenses])

  const filtered = useMemo(() => {
    let items = allExpenses
    if (filterType === "spent") {
      items = items.filter(e => (e.amount || 0) > 0)
    } else if (filterType === "earned") {
      items = items.filter(e => (e.earned || 0) > 0)
    }
    if (selectedTrip) {
      const trip = TRIPS.find(t => t.id === selectedTrip)
      if (trip) {
        items = items.filter(e => e.date && e.date >= trip.start && e.date <= trip.end)
      }
    }
    if (selectedLocations.size > 0) {
      items = items.filter(e => selectedLocations.has(e.location))
    }
    if (selectedCategories.size > 0) {
      items = items.filter(e => selectedCategories.has(e.category))
    }
    return [...items].sort((a, b) => compareValues(a, b, sortKey, sortDirection))
  }, [allExpenses, selectedLocations, selectedCategories, sortKey, sortDirection, filterType, selectedTrip])

  const filteredSpent = useMemo(() =>
    filtered.reduce((s, e) => s + (e.amount || 0), 0)
  , [filtered])

  const filteredEarned = useMemo(() =>
    filtered.reduce((s, e) => s + (e.earned || 0), 0)
  , [filtered])

  const filteredNet = filteredEarned - filteredSpent

  function toggleLocation(loc: string) {
    setSelectedLocations(prev => {
      const next = new Set(prev)
      if (next.has(loc)) next.delete(loc)
      else next.add(loc)
      return next
    })
  }

  function toggleTrip(id: string) {
    setSelectedTrip(prev => (prev === id ? null : id))
  }

  function toggleCategory(cat: string) {
    setSelectedCategories(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDirection(d => d === "ascending" ? "descending" : "ascending")
    } else {
      setSortKey(key)
      setSortDirection(key === "date" ? "descending" : "ascending")
    }
  }

  function sortIndicator(key: SortKey) {
    if (key !== sortKey) return null
    return sortDirection === "ascending" ? " ↑" : " ↓"
  }

  const showingFiltered = selectedLocations.size > 0 || selectedCategories.size > 0 || filterType !== "all" || selectedTrip !== null
  const activeCategory = selectedCategories.size === 1 ? Array.from(selectedCategories)[0] : null

  function CategoryTag({ category }: { category: string }) {
    const color = categoryColorMap[category] || "oklch(0.6 0.1 200)"
    return (
      <span
        className="inline-block px-2 py-0.5 rounded-full text-xs border"
        style={{
          color,
          backgroundColor: `color-mix(in oklch, ${color} 15%, transparent)`,
          borderColor: `color-mix(in oklch, ${color} 30%, transparent)`,
        }}
      >
        {category}
      </span>
    )
  }

  function SignedAmount({ value, zeroAsDash = false }: { value: number; zeroAsDash?: boolean }) {
    if (value === 0 && zeroAsDash) return <span className="text-muted-foreground/40">—</span>
    if (value > 0) return <span className="text-emerald-500">+{formatAmount(value)}</span>
    if (value < 0) return <span className="text-red-500">−{formatAmount(Math.abs(value))}</span>
    return <span className="text-foreground">{formatAmount(0)}</span>
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="pt-12 pb-6 text-center space-y-3">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← back
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            2026 expenses
          </h1>
          <p className="text-sm text-muted-foreground">
            total 2026 expenses and income — every penny tracked daily.
          </p>
        </div>

        {loading && (
          <div className="text-center py-16">
            <div className="inline-block h-6 w-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-sm text-muted-foreground">loading expenses...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Overview */}
            <div className="border border-border rounded-lg px-4 py-4 mb-4 bg-muted/5 flex flex-col md:flex-row gap-6">
              {/* Left Side: Stats and Locations */}
              <div className="flex-1 min-w-0 space-y-4">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 lg:gap-x-4">
                  <button 
                    onClick={() => setFilterType(prev => prev === "spent" ? "all" : "spent")}
                    className={`flex items-baseline gap-1.5 transition-opacity ${filterType === "earned" ? "opacity-40" : "hover:opacity-80"}`}
                  >
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Spent</span>
                    <span className="text-lg font-bold text-foreground font-mono tabular-nums leading-none">
                      −{formatAmount(overviewStats.total)}
                    </span>
                  </button>
                  <button 
                    onClick={() => setFilterType(prev => prev === "earned" ? "all" : "earned")}
                    className={`flex items-baseline gap-1.5 transition-opacity ${filterType === "spent" ? "opacity-40" : "hover:opacity-80"}`}
                  >
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Earned</span>
                    <span className="text-lg font-bold text-emerald-500 font-mono tabular-nums leading-none">
                      +{formatAmount(overviewStats.totalEarned)}
                    </span>
                  </button>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Net</span>
                    <span className={`text-lg font-bold font-mono tabular-nums leading-none ${overviewStats.net >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {overviewStats.net >= 0 ? "+" : "−"}{formatAmount(Math.abs(overviewStats.net))}
                    </span>
                  </div>
                </div>

                {overviewStats.byCountry.length > 0 && (
                  <div className="space-y-1">
                    {overviewStats.byCountry.map(([country, amount]) => {
                      const pct = overviewStats.total > 0 ? (amount / overviewStats.total) * 100 : 0
                      const active = selectedLocations.has(country)
                      return (
                        <button
                          key={country}
                          onClick={() => toggleLocation(country)}
                          className={`flex items-center gap-2 w-full text-left group transition-opacity ${
                            selectedLocations.size > 0 && !active ? "opacity-40" : ""
                          }`}
                        >
                          <span className="text-xs text-muted-foreground shrink-0 w-28 truncate group-hover:text-foreground transition-colors">
                            {country}
                          </span>
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary/60 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="font-mono tabular-nums text-xs text-foreground w-16 text-right shrink-0">{formatAmount(amount)}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Right Side: Pie Chart and Sorters */}
              <div className="flex items-center gap-6 shrink-0 md:justify-end">
                <div className="w-24 h-24 md:w-32 md:h-32 shrink-0">
                  <DonutChart
                    data={overviewStats.byCategory}
                    total={overviewStats.total}
                    colors={CATEGORY_COLORS}
                    onClickSegment={toggleCategory}
                    activeSegment={activeCategory}
                  />
                </div>
                <div className="flex flex-col gap-1.5 shrink-0 hidden sm:flex">
                  {overviewStats.byCategory.map(([cat, amount]) => {
                    const active = selectedCategories.has(cat)
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`flex items-center gap-2 text-left transition-opacity ${
                          selectedCategories.size > 0 && !active ? "opacity-40 hover:opacity-60" : "hover:opacity-80"
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: categoryColorMap[cat] }}
                        />
                        <span className="text-xs text-muted-foreground w-28 truncate hover:text-foreground transition-colors">{cat}</span>
                        <span className="font-mono tabular-nums text-xs text-foreground ml-auto shrink-0">{formatAmount(amount)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Filter pills */}
            <div className="mb-3 overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-1.5 min-w-max py-0.5">
                {TRIPS.map(trip => {
                  const active = selectedTrip === trip.id
                  return (
                    <button
                      key={trip.id}
                      onClick={() => toggleTrip(trip.id)}
                      title={`${formatDateFull(trip.start)} – ${formatDateFull(trip.end)}`}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-all whitespace-nowrap ${
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {trip.label}
                    </button>
                  )
                })}
                <span className="w-px h-4 bg-border mx-1 shrink-0" />
                {filterType !== "all" && (
                  <button
                    onClick={() => setFilterType("all")}
                    className="px-2.5 py-1 rounded text-xs font-medium bg-primary text-primary-foreground shadow-sm transition-all whitespace-nowrap"
                  >
                    Type: {filterType === "spent" ? "Spent" : "Earned"}
                  </button>
                )}
                {locations.map(loc => {
                  const active = selectedLocations.has(loc)
                  return (
                    <button
                      key={loc}
                      onClick={() => toggleLocation(loc)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-all whitespace-nowrap ${
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {loc}
                    </button>
                  )
                })}
                {locations.length > 0 && categories.length > 0 && (
                  <span className="w-px h-4 bg-border mx-1 shrink-0" />
                )}
                {categories.map(cat => {
                  const active = selectedCategories.has(cat)
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-all whitespace-nowrap ${
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {cat}
                    </button>
                  )
                })}
                {showingFiltered && (
                  <>
                    <span className="w-px h-4 bg-border mx-1 shrink-0" />
                    <button
                      onClick={() => { setSelectedLocations(new Set()); setSelectedCategories(new Set()); setFilterType("all"); setSelectedTrip(null); }}
                      className="px-2.5 py-1 rounded text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all whitespace-nowrap"
                    >
                      ✕ clear
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {COLUMNS.map(col => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className={`px-4 py-2.5 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none whitespace-nowrap text-xs ${
                          col.key === "price" ? "text-right" : "text-left"
                        }`}
                      >
                        {col.label}{sortIndicator(col.key)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((exp, i) => (
                    <tr
                      key={exp.id}
                      className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${
                        i % 2 === 0 ? "" : "bg-muted/10"
                      }`}
                    >
                      <td className="px-4 py-2 font-medium text-foreground text-sm">{exp.expense || "—"}</td>
                      <td className="px-4 py-2 text-muted-foreground whitespace-nowrap text-sm">
                        <ExpenseDateCell date={exp.date} dateEnd={exp.dateEnd} />
                      </td>
                      <td className="px-4 py-2">
                        {exp.category ? <CategoryTag category={exp.category} /> : "—"}
                      </td>
                      <td className="px-4 py-2 font-mono tabular-nums text-sm text-right whitespace-nowrap">
                        <PriceCell exp={exp} />
                      </td>
                      <td className="px-4 py-2 text-muted-foreground text-sm">{exp.location || "—"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/30">
                    <td className="px-4 py-2.5 font-bold text-foreground text-sm" colSpan={3}>
                      {showingFiltered ? `Filtered (${filtered.length})` : `Total (${filtered.length})`}
                    </td>
                    <td className="px-4 py-2.5 font-bold font-mono tabular-nums text-sm text-right whitespace-nowrap">
                      <SignedAmount value={filteredNet} />
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground pb-2">
                <span>sort by:</span>
                <select
                  value={sortKey}
                  onChange={(e) => {
                    setSortKey(e.target.value as SortKey)
                    setSortDirection(e.target.value === "date" ? "descending" : "ascending")
                  }}
                  className="bg-muted border border-border rounded px-2 py-1 text-foreground text-xs"
                >
                  {COLUMNS.map(col => (
                    <option key={col.key} value={col.key}>{col.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => setSortDirection(d => d === "ascending" ? "descending" : "ascending")}
                  className="px-2 py-1 border border-border rounded text-xs hover:bg-muted/50 transition-colors"
                >
                  {sortDirection === "ascending" ? "↑ Asc" : "↓ Desc"}
                </button>
              </div>

              {filtered.map((exp) => (
                <div key={exp.id} className="border border-border rounded-lg p-3 space-y-1.5 bg-muted/5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-foreground text-sm">{exp.expense || "—"}</span>
                    <div className="font-mono tabular-nums whitespace-nowrap text-sm text-right font-medium">
                      <PriceCell exp={exp} />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <ExpenseDateCell date={exp.date} dateEnd={exp.dateEnd} />
                    {exp.category && <CategoryTag category={exp.category} />}
                    {exp.location && <span>· {exp.location}</span>}
                  </div>
                  {exp.notes && (
                    <div className="text-xs text-muted-foreground/80">{exp.notes}</div>
                  )}
                </div>
              ))}

              <div className="border-t-2 border-border pt-3 flex justify-between items-center">
                <span className="font-bold text-foreground text-sm">
                  {showingFiltered ? `Filtered (${filtered.length})` : `Net (${filtered.length})`}
                </span>
                <span className="font-bold font-mono tabular-nums">
                  <SignedAmount value={filteredNet} />
                </span>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
