"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { select } from "d3-selection"
import "d3-transition"
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from "d3-zoom"
import { Home, Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react"
import type { City, Region, Shape } from "@/lib/travel-map"

const OCEAN = "oklch(0.17 0.015 245)"
const PANEL_W = 264
const MAX_ZOOM = 14

const month = (iso?: string) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="font-mono text-xl font-bold tabular-nums text-foreground">{value}</div>
      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
    </div>
  )
}

// The little card that opens beside a place.
function PlacePanel({ region, onClose }: { region: Region; onClose: () => void }) {
  const range =
    region.first && region.last
      ? month(region.first) === month(region.last)
        ? month(region.first)
        : `${month(region.first)} → ${month(region.last)}`
      : undefined
  return (
    <div className="journe-pop-in rounded-xl bg-background/90 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] ring-1 ring-border backdrop-blur">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary">{region.home ? "home" : region.kind}</p>
          <h2 className="mt-0.5 flex items-center gap-1.5 text-xl font-bold leading-tight tracking-tight text-foreground">
            {region.home && <Home className="h-4 w-4 shrink-0 text-primary" />}
            {region.name}
          </h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="-mr-1 -mt-1 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {region.nights > 0 ? (
        <>
          <div className="mt-3 grid grid-cols-3 gap-2 border-y border-border py-3">
            <Stat label="nights" value={region.nights} />
            <Stat label={region.visits === 1 ? "visit" : "visits"} value={region.visits} />
            <Stat label={region.cities.length === 1 ? "town" : "towns"} value={region.cities.length} />
          </div>
          {range && <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{range}</p>}
          {region.cities.length > 0 && <p className="mt-1.5 text-sm leading-snug text-foreground/85">{region.cities.join(" · ")}</p>}
        </>
      ) : (
        <p className="journe-hand mt-2 text-lg leading-tight text-muted-foreground">
          {region.home ? "where every trip starts and ends." : "been here — no log yet."}
        </p>
      )}
      {region.note && <p className="journe-hand mt-3 text-lg leading-snug text-primary">“{region.note}”</p>}
    </div>
  )
}

// Everywhere I've been. In the page it's a framed card that leaves scrolling alone: tap a lit-up place for
// its numbers, or expand it to full screen to drag, scroll and pinch around.
export function TravelMap({
  width,
  height,
  bleed,
  shapes,
  graticule,
  route,
  cities,
  regions,
}: {
  width: number
  height: number
  bleed: number // land is drawn this far past the frame, so panning stops there
  shapes: Shape[]
  graticule: string
  route: string
  cities: City[]
  regions: Region[]
}) {
  const boxRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown>>()
  const panelRef = useRef<HTMLDivElement>(null)
  const [t, setT] = useState<ZoomTransform>(zoomIdentity)
  const [box, setBox] = useState({ w: 0, h: 0 })
  const [panelH, setPanelH] = useState(220)
  const [selected, setSelected] = useState<string | null>(null)
  const [hover, setHover] = useState<{ name: string; x: number; y: number } | null>(null)
  const [moved, setMoved] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const expandedRef = useRef(false)
  expandedRef.current = expanded

  const byKey = useMemo(() => new Map(regions.map((r) => [r.key, r])), [regions])
  const region = selected ? byKey.get(selected) : undefined

  // pan/zoom, kept inside the area the server drew land for
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const behavior = zoom<SVGSVGElement, unknown>()
      // framed in the page, wheel and touch belong to the page's scroll; only a mouse drag pans
      .filter((e: Event) => expandedRef.current || (e.type !== "wheel" && !e.type.startsWith("touch")))
      .scaleExtent([1, MAX_ZOOM])
      .translateExtent([
        [-width * bleed, -height * bleed],
        [width * (1 + bleed), height * (1 + bleed)],
      ])
      .on("zoom", (e) => {
        setT(e.transform)
        if (e.sourceEvent) setMoved(true)
      })
    zoomRef.current = behavior
    select(svg).call(behavior)
    return () => {
      select(svg).on(".zoom", null)
    }
  }, [width, height, bleed])

  useLayoutEffect(() => {
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useLayoutEffect(() => {
    if (panelRef.current) setPanelH(panelRef.current.offsetHeight)
  }, [selected])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      setSelected((k) => {
        if (k === null) setExpanded(false)
        return null
      })
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // map coords → pixels in the box (the SVG letterboxes the map with preserveAspectRatio "meet")
  const s = box.w && box.h ? Math.min(box.w / width, box.h / height) : 1
  const ox = (box.w - width * s) / 2
  const oy = (box.h - height * s) / 2
  const toScreen = ([x, y]: [number, number]) => [ox + s * (t.x + t.k * x), oy + s * (t.y + t.k * y)] as const

  const zoomBy = (k: number) => {
    if (zoomRef.current && svgRef.current) select(svgRef.current).transition().duration(250).call(zoomRef.current.scaleBy, k)
  }
  // On a screen taller than the map, the letterbox above and below would run past the land, so
  // start zoomed in (about the middle) until the map fills more of the height.
  const home = useMemo(() => {
    if (!box.w || !box.h) return zoomIdentity
    const k = Math.min(2, Math.max(1, ((box.h / box.w) * (width / height)) * 0.75))
    return zoomIdentity.translate((width / 2) * (1 - k), (height / 2) * (1 - k)).scale(k)
  }, [box.w, box.h, width, height])
  useEffect(() => {
    if (zoomRef.current && svgRef.current && !moved) select(svgRef.current).call(zoomRef.current.transform, home)
  }, [home, moved])

  // full screen: lock the page behind it
  useEffect(() => {
    if (!expanded) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [expanded])

  const reset = () => {
    if (zoomRef.current && svgRef.current) select(svgRef.current).transition().duration(400).call(zoomRef.current.transform, home)
  }
  const pick = (key: string) => setSelected((k) => (k === key ? null : key))

  // panel beside the place on wide screens (flipping sides near the edge), a bottom sheet on phones
  const sheet = box.w < 640
  const at = region ? toScreen(region.anchor) : undefined
  const right = at ? at[0] + 28 + PANEL_W < box.w - 12 : true
  const panelX = at ? (right ? at[0] + 28 : at[0] - 28 - PANEL_W) : 0
  const panelY = at ? Math.min(Math.max(at[1] - panelH / 2, 140), box.h - panelH - 16) : 0

  const visitedLast = useMemo(() => [...shapes].sort((a, b) => Number(a.visited) - Number(b.visited)), [shapes])
  const showLabels = t.k >= 3

  return (
    <div
      ref={boxRef}
      className={expanded ? "fixed inset-0 z-50 overflow-hidden" : "absolute inset-0 overflow-hidden"}
      style={{ background: OCEAN }}
      onMouseLeave={() => setHover(null)}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className={`block h-full w-full cursor-grab active:cursor-grabbing ${expanded ? "touch-none" : "touch-pan-y"}`}
        onClick={() => setSelected(null)}
      >
        <g transform={t.toString()}>
          <path d={graticule} fill="none" stroke="oklch(0.23 0.015 245)" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
          {visitedLast.map((sh) =>
            sh.visited ? (
              <path
                key={sh.key}
                d={sh.d}
                role="button"
                tabIndex={0}
                aria-label={sh.name}
                aria-pressed={sh.key === selected}
                fill="var(--primary)"
                fillOpacity={sh.key === selected ? 1 : sh.kind === "state" ? 0.72 : 0.85}
                stroke={sh.key === selected ? "white" : OCEAN}
                strokeWidth={sh.key === selected ? 2 : 0.7}
                vectorEffect="non-scaling-stroke"
                className="cursor-pointer outline-none transition-[fill-opacity] hover:fill-opacity-100 focus-visible:fill-opacity-100"
                onClick={(e) => (e.stopPropagation(), pick(sh.key))}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), pick(sh.key))}
                onMouseMove={(e) => {
                  const r = boxRef.current!.getBoundingClientRect()
                  setHover({ name: sh.name, x: e.clientX - r.left, y: e.clientY - r.top })
                }}
                onMouseLeave={() => setHover(null)}
              />
            ) : (
              <path
                key={sh.key}
                d={sh.d}
                fill={sh.kind === "state" ? "oklch(0.3 0 0)" : "oklch(0.27 0 0)"}
                stroke={OCEAN}
                strokeWidth={sh.kind === "state" ? 0.5 : 0.7}
                vectorEffect="non-scaling-stroke"
                aria-hidden
              />
            )
          )}
          <path
            d={route}
            fill="none"
            stroke="white"
            strokeOpacity="0.55"
            strokeWidth="1.3"
            strokeDasharray="2 5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="pointer-events-none"
          />
          {cities.map((c) => (
            <g key={c.name} transform={`translate(${c.x} ${c.y}) scale(${1 / t.k})`} className="cursor-pointer" onClick={(e) => (e.stopPropagation(), pick(c.region))}>
              <circle r="9" fill="transparent" />
              <circle r="3.2" fill="white" stroke={OCEAN} strokeWidth="1.5" />
              {showLabels && (
                <text x="6" y="3.5" fontSize="11" fill="white" stroke={OCEAN} strokeWidth="3" paintOrder="stroke" className="pointer-events-none select-none font-sans">
                  {c.name}
                </text>
              )}
            </g>
          ))}
        </g>
      </svg>

      {/* hover label follows the pointer */}
      {hover && !sheet && (
        <span
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-full bg-background/85 px-2.5 py-0.5 text-xs font-medium text-foreground backdrop-blur"
          style={{ left: hover.x, top: hover.y - 30 }}
        >
          {hover.name}
        </span>
      )}

      {/* the picked place: a ring on the map, a leader line, and its panel */}
      {region && at && (
        <>
          <span
            className="pointer-events-none absolute z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
            style={{ left: at[0], top: at[1] }}
          />
          {!sheet && (
            <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full" aria-hidden>
              <line
                x1={at[0]}
                y1={at[1]}
                x2={right ? panelX : panelX + PANEL_W}
                y2={Math.min(Math.max(at[1], panelY + 20), panelY + panelH - 20)}
                stroke="white"
                strokeOpacity="0.6"
                strokeWidth="1"
              />
            </svg>
          )}
          <div
            ref={panelRef}
            key={region.key}
            className={sheet ? "absolute inset-x-3 bottom-3 z-20" : "absolute z-20"}
            style={sheet ? undefined : { left: panelX, top: panelY, width: PANEL_W }}
          >
            <PlacePanel region={region} onClose={() => setSelected(null)} />
          </div>
        </>
      )}

      {/* zoom controls (hidden under the bottom sheet on phones) */}
      {!(sheet && region) && (
        <div className="absolute bottom-3 right-3 z-20 flex flex-col overflow-hidden rounded-xl bg-background/85 ring-1 ring-border backdrop-blur sm:bottom-6 sm:right-6">
          {(
            [
              [Plus, "Zoom in", () => zoomBy(1.6)],
              [Minus, "Zoom out", () => zoomBy(1 / 1.6)],
              [RotateCcw, "Reset view", reset],
            ] as const
          ).map(([Icon, label, onClick]) => (
            <button key={label} type="button" onClick={onClick} aria-label={label} className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-muted">
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      )}

      {/* expand to full screen / close it */}
      <button
        type="button"
        onClick={() => (setExpanded((x) => !x), setSelected(null))}
        aria-label={expanded ? "Close full screen map" : "Expand map"}
        className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-xl bg-background/85 text-foreground ring-1 ring-border backdrop-blur transition-colors hover:bg-muted sm:right-6 sm:top-6"
      >
        {expanded ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>

      {!moved && !region && (
        <p className="journe-hand pointer-events-none absolute bottom-3 left-3 z-10 -rotate-2 text-lg text-primary sm:bottom-5 sm:left-5 sm:text-xl">
          {expanded ? "drag around · tap a yellow place" : "tap a yellow place"}
        </p>
      )}
    </div>
  )
}
