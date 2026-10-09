"use client"

import { useEffect, useRef, useState } from "react"
import { useJourne } from "./journe-context"

export function useInView<T extends Element>(threshold = 0.3) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true)
        io.disconnect()
      }
    }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return { ref, inView }
}

// Counts up in a handful of discrete steps so each flip card has time to flip.
function useSteppedCount(target: number, run: boolean, steps = 8, ms = 1800) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!run) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target)
      return
    }
    let i = 0
    const id = setInterval(() => {
      i++
      setValue(i >= steps ? target : target * (1 - Math.pow(1 - i / steps, 3)))
      if (i >= steps) clearInterval(id)
    }, ms / steps)
    return () => clearInterval(id)
  }, [target, run, steps, ms])
  return value
}

function daysSince(date?: string) {
  if (!date) return null
  const start = new Date(date + "T00:00:00").getTime()
  if (Number.isNaN(start)) return null
  return Math.max(0, Math.floor((Date.now() - start) / 86_400_000))
}

// One split-flap card. When the character changes, the old top half falls away
// and the new bottom half swings down into place.
function FlipChar({ char }: { char: string }) {
  const [shown, setShown] = useState(char)
  const [prev, setPrev] = useState(char)
  const [flips, setFlips] = useState(0)
  useEffect(() => {
    if (char === shown) return
    setPrev(shown)
    setShown(char)
    setFlips((f) => f + 1)
  }, [char, shown])

  const half = (c: string, which: "top" | "bottom", extra = "") => (
    <span className={`journe-flap journe-flap-${which} ${extra}`}>
      <span>{c}</span>
    </span>
  )

  return (
    <span className="journe-flip" aria-hidden="true">
      {half(shown, "top")}
      {half(prev, "bottom")}
      {flips > 0 && (
        <>
          <span key={`t${flips}`} className="contents">{half(prev, "top", "journe-flap-fall")}</span>
          <span key={`b${flips}`} className="contents">{half(shown, "bottom", "journe-flap-rise")}</span>
        </>
      )}
    </span>
  )
}

function FlipNumber({ text }: { text: string }) {
  const chars = text.split("")
  return (
    <span className="inline-flex items-end gap-[3px]" aria-label={text}>
      {chars.map((c, i) => {
        const key = chars.length - i // keyed from the right so digits stay put as the number grows
        return /[0-9\-–]/.test(c) ? (
          <FlipChar key={key} char={c} />
        ) : (
          <span key={key} className="pb-1 font-mono text-lg font-bold text-muted-foreground" aria-hidden="true">
            {c}
          </span>
        )
      })}
    </span>
  )
}

type Stat = { label: string; value: number | null; format: (n: number) => string; emoji: string }

function StatCard({ stat, run }: { stat: Stat; run: boolean }) {
  const n = useSteppedCount(stat.value ?? 0, run && stat.value != null)
  return (
    <div className="journe-stat flex h-full flex-col items-center justify-between gap-2 rounded-xl border border-border bg-card px-2 pt-2.5 pb-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        <span aria-hidden="true">{stat.emoji}</span> {stat.label}
      </div>
      <FlipNumber text={stat.value == null ? "––" : stat.format(n)} />
    </div>
  )
}

export function StatStrip({ miles, entries, startDate }: { miles: number; entries: number; startDate?: string }) {
  const { vanSpend, loading } = useJourne()
  const { ref, inView } = useInView<HTMLDivElement>()
  const [days, setDays] = useState<number | null>(null)
  // computed after mount so a statically-built page doesn't freeze the count
  useEffect(() => setDays(daysSince(startDate)), [startDate])

  const whole = (n: number) => Math.round(n).toLocaleString()
  const money = (n: number) => `$${Math.round(n).toLocaleString()}`
  const stats: Stat[] = [
    { emoji: "🛣️", label: "miles driven", value: miles, format: whole },
    { emoji: "🚩", label: "entries", value: entries, format: whole },
    { emoji: "📅", label: "days in", value: days, format: whole },
    {
      emoji: "⛽",
      label: "per mile",
      value: loading || miles <= 0 ? null : vanSpend / miles,
      format: (n) => `$${n.toFixed(2)}`,
    },
    { emoji: "🔩", label: "into the van", value: loading ? null : vanSpend, format: money },
  ]

  return (
    <div ref={ref} className="mb-16 grid grid-cols-2 sm:grid-cols-3 gap-2">
      {stats.map((s, i) => (
        <div key={s.label} className={i === stats.length - 1 ? "col-span-2" : ""}>
          <StatCard stat={s} run={inView} />
        </div>
      ))}
    </div>
  )
}
