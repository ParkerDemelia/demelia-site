"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import type { Entry } from "@/lib/journe"
import { JourneMarkdown } from "./journe-markdown"
import { EntryDateContext } from "./stamp"
import { useInView } from "./stat-strip"
import { VanFront } from "./van-art"

const RAIL = 64 // width of the road column on the left
const ROAD_L = 22 // road wiggles between these two x's
const ROAD_R = 34
const FLAG_X = 54 // flag poles stand on the right shoulder
const STEP = 120 // vertical px per wiggle
const HEADER_MID = 14 // flag lines up with the middle of an entry's title row

type Flag = { y: number }

function FlagMark({ y, reached }: { y: number; reached: boolean }) {
  return (
    <g transform={`translate(${FLAG_X} ${y})`}>
      <line x1="0" y1="-14" x2="0" y2="6" stroke="oklch(0.6 0 0)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="0" cy="6" r="1.8" fill="oklch(0.6 0 0)" />
      <path
        d="M0 -14 Q6 -16 11 -13 Q8 -10 11 -6 Q6 -8 0 -6 Z"
        fill={reached ? "var(--secondary)" : "oklch(0.4 0 0)"}
        className={`journe-flag ${reached ? "is-up" : ""}`}
      />
    </g>
  )
}

function roadPath(height: number) {
  const segments = Math.max(1, Math.round(height / STEP))
  const step = height / segments
  let d = `M ${ROAD_L} 0`
  for (let i = 1; i <= segments; i++) {
    const x = i % 2 ? ROAD_R : ROAD_L
    const prevX = i % 2 ? ROAD_L : ROAD_R
    const y = i * step
    const mid = y - step / 2
    d += ` C ${prevX} ${mid} ${x} ${mid} ${x} ${y}`
  }
  return d
}

function EntryBlock({ entry, reached, current }: { entry: Entry; reached: boolean; current: boolean }) {
  const { ref, inView } = useInView<HTMLElement>(0.1)
  return (
    <article ref={ref} data-entry className={`journe-reveal ${inView ? "is-in" : ""} flow-root pb-12`}>
      <header className="mb-2 flex min-h-7 flex-wrap items-center gap-x-2 gap-y-1">
        {entry.date && (
          <span
            className={`rounded px-1.5 py-0.5 font-mono text-xs tabular-nums transition-colors duration-300 ${
              reached ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
            } ${current ? "ring-2 ring-secondary/40 ring-offset-2 ring-offset-background" : ""}`}
          >
            {entry.date}
          </span>
        )}
        {entry.title && <h3 className="text-lg font-semibold leading-7 tracking-tight text-foreground">{entry.title}</h3>}
        {entry.place && <span className="text-xs text-muted-foreground">📍 {entry.place}</span>}
      </header>
      {entry.content && (
        <EntryDateContext.Provider value={entry.date}>
          <JourneMarkdown>{entry.content}</JourneMarkdown>
        </EntryDateContext.Provider>
      )}
    </article>
  )
}

export function JournalRoad({ intro, entries, odometerStart }: { intro: string; entries: Entry[]; odometerStart: number }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const [height, setHeight] = useState(0)
  const [flags, setFlags] = useState<Flag[]>([])
  const [van, setVan] = useState({ x: ROAD_L, y: 0, angle: 90, length: 0 })
  const [len, setLen] = useState(0)

  // measure where each entry sits so flags line up with them; re-run when images etc. reflow
  useLayoutEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const measure = () => {
      setHeight(wrap.offsetHeight)
      setFlags([...wrap.querySelectorAll<HTMLElement>("[data-entry]")].map((el) => ({ y: el.offsetTop + HEADER_MID })))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [entries])

  const d = height ? roadPath(height) : ""

  useLayoutEffect(() => {
    if (pathRef.current && d) setLen(pathRef.current.getTotalLength())
  }, [d])

  // the van follows your reading position down the road
  useEffect(() => {
    if (!d) return
    let raf = 0
    const update = () => {
      raf = 0
      const wrap = wrapRef.current
      const path = pathRef.current
      if (!wrap || !path) return
      const total = path.getTotalLength()
      const target = Math.min(height, Math.max(0, window.innerHeight * 0.45 - wrap.getBoundingClientRect().top))
      // road only ever heads down, so binary-search the length whose y matches the target
      let lo = 0
      let hi = total
      for (let i = 0; i < 20; i++) {
        const mid = (lo + hi) / 2
        if (path.getPointAtLength(mid).y < target) lo = mid
        else hi = mid
      }
      const at = path.getPointAtLength(lo)
      const ahead = path.getPointAtLength(Math.min(total, lo + 1))
      const behind = path.getPointAtLength(Math.max(0, lo - 1))
      const angle = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI
      setVan({ x: at.x, y: at.y, angle, length: lo })
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [d, height])

  const reachedCount = flags.filter((f) => van.y >= f.y - 2).length

  return (
    <section className="mb-20">
      {intro && (
        <div className="mb-10 [&_p]:text-lg [&_p]:leading-relaxed">
          <JourneMarkdown>{intro}</JourneMarkdown>
        </div>
      )}

      <div ref={wrapRef} className="relative" style={{ paddingLeft: RAIL + 12 }}>
        {d && (
          <svg
            width={RAIL}
            height={height}
            viewBox={`0 0 ${RAIL} ${height}`}
            className="pointer-events-none absolute left-0 top-0 overflow-visible"
            aria-hidden="true"
          >
            <path d={d} fill="none" stroke="oklch(0.24 0 0)" strokeWidth="18" strokeLinecap="round" />
            <path
              d={d}
              fill="none"
              stroke="oklch(0.33 0 0)"
              strokeWidth="18"
              strokeLinecap="round"
              strokeDasharray={len || undefined}
              strokeDashoffset={len ? len - van.length : undefined}
            />
            <path ref={pathRef} d={d} fill="none" stroke="var(--secondary)" strokeWidth="1.2" strokeDasharray="6 7" opacity="0.7" />
            {/* checkered start line */}
            {[0, 1, 2, 3].map((i) => (
              <g key={i}>
                <rect x={ROAD_L - 7 + i * 3.5} y="0" width="3.5" height="3.5" fill={i % 2 ? "black" : "white"} />
                <rect x={ROAD_L - 7 + i * 3.5} y="3.5" width="3.5" height="3.5" fill={i % 2 ? "white" : "black"} />
              </g>
            ))}
            {flags.map((f, i) => (
              <FlagMark key={i} y={f.y} reached={van.y >= f.y - 2} />
            ))}
            {/* the van faces you as it drives down the page, leaning into the curves */}
            <g transform={`translate(${van.x} ${van.y}) rotate(${(van.angle - 90) * 0.6}) scale(1.15)`}>
              <g className="journe-bob">
                <VanFront />
              </g>
            </g>
          </svg>
        )}

        <p className="mb-8 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          start · {odometerStart.toLocaleString()} mi on the dash
        </p>

        {entries.map((e, i) => (
          <EntryBlock key={i} entry={e} reached={i < reachedCount} current={i === reachedCount - 1} />
        ))}

        <p className="pb-2 text-lg text-muted-foreground journe-hand">to be continued… 🚐💨</p>
      </div>
    </section>
  )
}
