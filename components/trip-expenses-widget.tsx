"use client"

import { useEffect, useState, useMemo } from "react"

export interface Expense {
  id: string
  expense: string
  date: string
  dateEnd: string
  category: string
  amount: number
  location: string
}

export const CATEGORY_COLORS = [
  "oklch(0.75 0.18 195)",
  "oklch(0.70 0.15 250)",
  "oklch(0.72 0.16 150)",
  "oklch(0.68 0.14 310)",
  "oklch(0.74 0.12 80)",
  "oklch(0.65 0.13 30)",
  "oklch(0.60 0.10 200)",
  "oklch(0.55 0.08 270)",
]

const COUNTRY_DATES: Record<string, { start: string; end: string }> = {
  "Colombia":   { start: "Feb 2",  end: "Mar 2" },
  "Guatemala":  { start: "Mar 2",  end: "Present" },
}

const CURRENT_LOCATION = "Antigua, Guatemala"

function DonutChart({ data, total, colors, onClickSegment, activeSegment }: {
  data: [string, number][]
  total: number
  colors: string[]
  onClickSegment?: (name: string) => void
  activeSegment?: string | null
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
        const dimmed = activeSegment !== undefined && activeSegment !== null && activeSegment !== name
        return (
          <circle
            key={name}
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={colors[i % colors.length]}
            strokeWidth="14"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-currentOffset}
            className={onClickSegment ? "cursor-pointer transition-opacity" : "transition-opacity"}
            opacity={dimmed ? 0.25 : 1}
            onClick={() => onClickSegment?.(name)}
          />
        )
      })}
    </svg>
  )
}

export function formatDate(dateStr: string) {
  if (!dateStr) return "—"
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function formatDateFull(dateStr: string) {
  if (!dateStr) return "—"
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function formatAmount(amount: number) {
  if (amount == null) return "—"
  return `$${amount.toFixed(2)}`
}

export function useExpenses() {
  const [allExpenses, setAllExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/notion/expenses")
        if (!res.ok) throw new Error("Failed to fetch expenses")
        const data = await res.json()
        setAllExpenses(data.expenses)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const overviewStats = useMemo(() => {
    const dates = allExpenses.map(e => e.date).filter(Boolean).sort()
    const totalAll = allExpenses.reduce((s, e) => s + (e.amount || 0), 0)
    const byCountry: Record<string, number> = {}
    allExpenses.forEach(e => {
      const loc = e.location || "Unknown"
      byCountry[loc] = (byCountry[loc] || 0) + (e.amount || 0)
    })
    const byCategory: Record<string, number> = {}
    allExpenses.forEach(e => {
      const cat = e.category || "Other"
      byCategory[cat] = (byCategory[cat] || 0) + (e.amount || 0)
    })
    return {
      total: totalAll,
      startDate: dates[0] || "",
      endDate: dates[dates.length - 1] || "",
      byCountry: Object.entries(byCountry).sort((a, b) => b[1] - a[1]),
      byCategory: Object.entries(byCategory).sort((a, b) => b[1] - a[1]),
    }
  }, [allExpenses])

  const categoryColorMap = useMemo(() => {
    const map: Record<string, string> = {}
    overviewStats.byCategory.forEach(([cat], i) => {
      map[cat] = CATEGORY_COLORS[i % CATEGORY_COLORS.length]
    })
    return map
  }, [overviewStats.byCategory])

  return { allExpenses, loading, error, overviewStats, categoryColorMap }
}

export function TripExpensesOverview({ compact = false }: { compact?: boolean }) {
  const { loading, error, overviewStats, categoryColorMap } = useExpenses()

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="inline-block h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) return null

  return (
    <div className={`border border-border rounded-lg bg-muted/5 ${compact ? "px-3 py-2" : "px-4 py-3"}`}>
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 mb-0.5">
            <span className={`font-bold text-foreground font-mono tabular-nums ${compact ? "text-xl" : "text-2xl"}`}>
              {formatAmount(overviewStats.total)}
            </span>
            {overviewStats.startDate && (
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {formatDateFull(overviewStats.startDate)} — {formatDateFull(overviewStats.endDate)}
              </span>
            )}
          </div>
          <div className="space-y-0.5 mt-1.5">
            {overviewStats.byCountry.map(([country, amount]) => {
              const pct = overviewStats.total > 0 ? (amount / overviewStats.total) * 100 : 0
              return (
                <div key={country} className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {country}
                    {COUNTRY_DATES[country] && (
                      <span className="text-muted-foreground/50"> — {COUNTRY_DATES[country].start} – {COUNTRY_DATES[country].end}</span>
                    )}
                  </span>
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/60 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="font-mono tabular-nums text-[11px] text-foreground w-14 text-right">{formatAmount(amount)}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span
                className="absolute inline-flex h-full w-full rounded-full bg-red-500"
                style={{ animation: "pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
              />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-[11px] text-muted-foreground">
              currently in <span className="text-foreground font-medium">{CURRENT_LOCATION}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className={compact ? "w-16 h-16" : "w-20 h-20 md:w-24 md:h-24"}>
            <DonutChart
              data={overviewStats.byCategory}
              total={overviewStats.total}
              colors={CATEGORY_COLORS}
            />
          </div>
          {!compact && (
            <div className="space-y-0 hidden sm:block">
              {overviewStats.byCategory.map(([cat, amount]) => (
                <div key={cat} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: categoryColorMap[cat] }}
                  />
                  <span className="text-[11px] text-muted-foreground w-24 truncate">{cat}</span>
                  <span className="font-mono tabular-nums text-[11px] text-foreground w-14 text-right">{formatAmount(amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
