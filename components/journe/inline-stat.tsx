"use client"

import { useEffect, useState } from "react"
import { FlipNumber, useSteppedCount } from "./flip"
import { useJourne } from "./journe-context"
import { useInView } from "./use-in-view"

function daysSince(date?: string) {
  if (!date) return null
  const start = new Date(date + "T00:00:00").getTime()
  if (Number.isNaN(start)) return null
  return Math.max(0, Math.floor((Date.now() - start) / 86_400_000))
}

const money = (n: number) => `$${Math.round(n).toLocaleString()}`
const whole = (n: number) => Math.round(n).toLocaleString()

// {totalcost} {totalmiles} {odometer} {days} {permile} in the md → a tiny flip clock inline.
export function InlineStat({ name }: { name: string }) {
  const { totals, vanSpend, loading } = useJourne()
  const { ref, inView } = useInView<HTMLSpanElement>(0.8)
  const [days, setDays] = useState<number | null>(null)
  // after mount so a statically-built page doesn't freeze the count
  useEffect(() => setDays(daysSince(totals.bought)), [totals.bought])

  const stats: Record<string, { value: number | null; format: (n: number) => string; unit?: string }> = {
    totalcost: { value: loading ? null : vanSpend, format: money },
    totalmiles: { value: totals.miles, format: whole, unit: "mi" },
    odometer: { value: totals.odometerStart + totals.miles, format: whole, unit: "mi" },
    days: { value: days, format: whole, unit: days === 1 ? "day" : "days" },
    permile: {
      value: loading || totals.miles <= 0 ? null : vanSpend / totals.miles,
      format: (n) => `$${n.toFixed(2)}`,
      unit: "/mi",
    },
  }
  const stat = stats[name]
  const n = useSteppedCount(stat?.value ?? 0, inView && stat?.value != null)
  if (!stat) return null

  return (
    <span ref={ref} className="mx-0.5 inline-flex items-center gap-1 align-middle">
      <FlipNumber size="sm" text={stat.value == null ? "––" : stat.format(n)} />
      {stat.unit && <span className="font-mono text-[0.75em] text-muted-foreground">{stat.unit}</span>}
    </span>
  )
}

// {tripmiles} / {tripcost} — already filled in from the entry ("47 mi", "$267.68"), same look.
export function StatValue({ children }: { children: React.ReactNode }) {
  const text = [children].flat().join("")
  const [, num = text, unit = ""] = text.match(/^(\$?[\d,.?]+)\s*(.*)$/) ?? []
  return (
    <span className="mx-0.5 inline-flex items-center gap-1 align-middle">
      <FlipNumber size="sm" text={num} />
      {unit && <span className="font-mono text-[0.75em] text-muted-foreground">{unit}</span>}
    </span>
  )
}
