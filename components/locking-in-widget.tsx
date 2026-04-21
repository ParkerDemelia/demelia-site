"use client"

import { useEffect, useState, useMemo } from "react"

export interface LockingInExpense {
  id: string
  expense: string
  date: string
  dateEnd: string
  category: string
  amount: number
  earned: number
  notes: string
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

export function useLockingInExpenses() {
  const [allExpenses, setAllExpenses] = useState<LockingInExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/notion/locking-in")
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
    const totalSpent = allExpenses.reduce((s, e) => s + (e.amount || 0), 0)
    const totalEarned = allExpenses.reduce((s, e) => s + (e.earned || 0), 0)
    const byCategory: Record<string, number> = {}
    allExpenses.forEach(e => {
      if (!e.amount) return
      const cat = e.category || "Other"
      byCategory[cat] = (byCategory[cat] || 0) + e.amount
    })
    return {
      total: totalSpent,
      totalEarned,
      net: totalEarned - totalSpent,
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
