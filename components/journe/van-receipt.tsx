"use client"

import { useState } from "react"
import { formatAmount } from "@/components/trip-expenses-widget"
import { useJourne } from "./journe-context"
import { SectionLabel } from "./section-label"
import { useInView } from "./use-in-view"

const PREVIEW_LINES = 8
const PAPER = "oklch(0.96 0.012 90)"

function shortDate(date: string) {
  if (!date) return "--/--"
  const [, m, d] = date.split("-")
  return `${m}/${d}`
}

// Deterministic fake barcode.
function Barcode({ seed }: { seed: number }) {
  let x = 0
  const bars: { x: number; w: number }[] = []
  for (let i = 0; x < 180; i++) {
    const w = ((seed * (i + 7) * 13) % 3) + 1
    bars.push({ x, w })
    x += w + (((seed + i) * 7) % 3) + 1
  }
  return (
    <svg viewBox="0 0 180 32" className="mx-auto h-8 w-44" aria-hidden="true">
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y="0" width={b.w} height="32" fill="oklch(0.2 0 0)" />
      ))}
    </svg>
  )
}

function Dashes() {
  return <div className="my-2 border-t border-dashed border-neutral-400" />
}

export function VanReceipt({ miles }: { miles: number }) {
  const { vanExpenses, vanSpend, loading, error } = useJourne()
  const [expanded, setExpanded] = useState(false)
  const { ref, inView } = useInView<HTMLDivElement>(0.2)

  const lines = expanded ? vanExpenses : vanExpenses.slice(0, PREVIEW_LINES)
  const hidden = vanExpenses.length - lines.length
  const first = vanExpenses[0]?.date
  const last = vanExpenses[vanExpenses.length - 1]?.date

  return (
    <section className="mb-20">
      <SectionLabel>the receipt</SectionLabel>
      <div ref={ref} className="mx-auto max-w-sm">
        {/* printer slot */}
        <div className="relative z-10 mx-auto h-3 w-[110%] -translate-x-[4.5%] rounded-full bg-neutral-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" />
        <div className="-mt-1.5 overflow-hidden px-1 pb-4">
          <div
            className={`journe-receipt relative font-mono text-[12px] leading-relaxed text-neutral-800 ${inView ? "is-in" : ""}`}
            style={{ background: PAPER }}
          >
            <div className="px-5 pt-6 pb-4">
              <div className="text-center">
                <div className="text-base font-bold tracking-widest">VAN BUILD SUPPLY CO.</div>
                <div className="text-[11px] text-neutral-500">store #1997 · E-350 · est. dave</div>
                {first && (
                  <div className="text-[11px] text-neutral-500">
                    {shortDate(first)} — {shortDate(last)}
                  </div>
                )}
              </div>
              <Dashes />

              {loading && <p className="py-6 text-center text-neutral-500 animate-pulse">warming up the printer…</p>}
              {!loading && (error || vanExpenses.length === 0) && (
                <p className="py-6 text-center text-neutral-500">
                  {error ? "printer jammed. try again later." : "no receipts yet — tag expenses \"van\" in notion."}
                </p>
              )}

              {!loading && vanExpenses.length > 0 && (
                <>
                  <ul>
                    {lines.map((e) => {
                      const amt = (e.amount || 0) - (e.earned || 0)
                      return (
                        <li key={e.id} className="journe-receipt-line flex gap-2" title={e.notes || undefined}>
                          <span className="shrink-0 text-neutral-500">{shortDate(e.date)}</span>
                          <span className="min-w-0 flex-1 truncate uppercase">{e.expense || "misc"}</span>
                          <span className="shrink-0 tabular-nums">
                            {amt < 0 ? `-${formatAmount(-amt)}` : formatAmount(amt)}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                  {hidden > 0 && (
                    <button
                      type="button"
                      onClick={() => setExpanded(true)}
                      className="mt-2 w-full rounded border border-dashed border-neutral-400 py-1 text-[11px] uppercase tracking-wider text-neutral-600 hover:bg-neutral-200"
                    >
                      ▼ print {hidden} more
                    </button>
                  )}
                  <Dashes />
                  <div className="flex justify-between text-neutral-600">
                    <span>ITEMS</span>
                    <span>{vanExpenses.length}</span>
                  </div>
                  {miles > 0 && (
                    <>
                      <div className="flex justify-between text-neutral-600">
                        <span>MILES DRIVEN</span>
                        <span className="tabular-nums">{miles.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-neutral-600">
                        <span>COST / MILE</span>
                        <span className="tabular-nums">{formatAmount(vanSpend / miles)}</span>
                      </div>
                    </>
                  )}
                  <div className="mt-1 flex justify-between text-base font-bold">
                    <span>TOTAL</span>
                    <span className="tabular-nums">{formatAmount(vanSpend)}</span>
                  </div>
                </>
              )}

              <Dashes />
              <p className="text-center text-[11px] text-neutral-500">*** thanks dave ***</p>
              <p className="text-center text-[11px] text-neutral-500">no refunds. no regrets.</p>
              <div className="mt-3">
                <Barcode seed={vanExpenses.length + 1997} />
              </div>
            </div>
            {/* torn bottom edge */}
            <div
              className="absolute -bottom-2 left-0 h-2 w-full"
              style={{
                background: `linear-gradient(135deg, ${PAPER} 50%, transparent 50%) 0 0 / 12px 8px repeat-x, linear-gradient(-135deg, ${PAPER} 50%, transparent 50%) 0 0 / 12px 8px repeat-x`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
