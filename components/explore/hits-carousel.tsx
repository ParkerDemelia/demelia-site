"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import type { Hit } from "@/lib/hits"

// A swipeable row of video cards. Each shows its YouTube thumbnail until clicked, then swaps in
// the player right there (so the page doesn't load four YouTube iframes up front).
export function HitsCarousel({ hits }: { hits: Hit[] }) {
  const track = useRef<HTMLUListElement>(null)
  const [playing, setPlaying] = useState<string | null>(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  const update = () => {
    const el = track.current
    if (!el) return
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 })
  }
  useEffect(update, [])

  const go = (d: number) => {
    const el = track.current
    const card = el?.querySelector("li")
    if (el && card) el.scrollBy({ left: d * (card.clientWidth + 16), behavior: "smooth" })
  }

  return (
    <div className="relative">
      <ul
        ref={track}
        onScroll={update}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {hits.map((h) => {
          const src = `https://www.youtube-nocookie.com/embed/${h.id}?autoplay=1&rel=0${h.start ? `&start=${h.start}` : ""}`
          return (
            <li key={h.id} className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-0.5rem)]">
              <div className="relative aspect-video overflow-hidden rounded-xl bg-muted ring-1 ring-border">
                {playing === h.id ? (
                  <iframe
                    src={src}
                    title={h.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                ) : (
                  <button type="button" onClick={() => setPlaying(h.id)} aria-label={`Play ${h.title}`} className="group absolute inset-0 block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://i.ytimg.com/vi/${h.id}/hqdefault.jpg`}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/25">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-transform group-hover:scale-110">
                        <Play className="ml-0.5 h-5 w-5 fill-current" />
                      </span>
                    </span>
                  </button>
                )}
              </div>
              <a href={h.href} target="_blank" rel="noreferrer" className="mt-2 block font-medium text-foreground transition-colors hover:text-primary">
                {h.title}
              </a>
              {(h.note || h.year) && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {h.year && <span className="font-mono text-xs">{h.year} · </span>}
                  {h.note}
                </p>
              )}
            </li>
          )
        })}
      </ul>

      {(
        [
          [-1, "-left-3", ChevronLeft, "Previous", edges.start],
          [1, "-right-3", ChevronRight, "Next", edges.end],
        ] as const
      ).map(([d, side, Icon, label, hidden]) => (
        <button
          key={d}
          type="button"
          onClick={() => go(d)}
          aria-label={label}
          className={`absolute ${side} top-[calc((100%-3.5rem)/2)] z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur transition-all hover:bg-foreground hover:text-background sm:flex ${hidden ? "pointer-events-none opacity-0" : "opacity-100"}`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  )
}
