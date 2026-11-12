"use client"

import { useRef, useState } from "react"
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react"
import { Ref } from "@/components/ref"

export type Slide = {
  title: string
  href: string
  src?: string // a photo; without one the slide shows `art` on a plain panel
  art?: React.ReactNode
  note?: string // the one question this page answers, shown under the title
}

// Card size + spacing. Three cards sit fully in view; the two beyond tuck in behind them, faded.
const CARD_W = "w-[30%] sm:w-[28%]"
const STEP = 106 // % of a card's width between neighbours
const FAR = 1.8 // the faded outer cards sit this many steps out, partly behind their neighbours

// A loop of photo cards like a contact sheet: the middle three link to their pages, the outer two
// peek in faded at the edges. Arrows, swipes, or a click on a faded card turn the loop.
export function PageCarousel({ slides, start = 0 }: { slides: Slide[]; start?: number }) {
  const [index, setIndex] = useState(start)
  const touchX = useRef<number | null>(null)
  const n = slides.length
  const go = (d: number) => setIndex((i) => (i + d + n) % n)

  return (
    <section aria-roledescription="carousel" aria-label="Pages" className="mb-16">
      <div
        className="relative"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return
          const dx = e.changedTouches[0].clientX - touchX.current
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
          touchX.current = null
        }}
      >
        {/* invisible stand-in card that gives the row its height */}
        <div aria-hidden className={`invisible mx-auto ${CARD_W}`}>
          <div className="aspect-[3/4]" />
          <div className="h-12" />
        </div>

        {/* the track fades out at both edges; the arrows sit above it, unfaded */}
        <div className="absolute inset-0 overflow-x-clip [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
          {slides.flatMap((s, i) => {
            // signed distance from the middle, wrapped so the loop has no ends
            let off = (i - index + n) % n
            if (off > n / 2) off -= n
            // with an even count, the card straight across the loop shows faded on both edges
            return n % 2 === 0 && off === n / 2 ? [{ s, off }, { s, off: -off }] : [{ s, off }]
          }).map(({ s, off }) => {
            const near = Math.abs(off) <= 1
            const shift = Math.abs(off) <= 1 ? off : Math.sign(off) * FAR
            const card = (
              <>
                <span className="explore-page relative block aspect-[3/4]">
                  <span className="block h-full overflow-hidden rounded-xl bg-muted ring-1 ring-border">
                    {s.src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.src}
                        alt={s.title}
                        draggable={false}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center px-3">
                        <span className="block w-full">{s.art}</span>
                      </span>
                    )}
                  </span>
                </span>
                <span className="mt-2 flex items-center gap-1 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                  {s.title}
                  {s.href.startsWith("http") && <ArrowUpRight className="h-3.5 w-3.5" />}
                </span>
                {s.note && <span className="block text-xs text-muted-foreground/70">{s.note}</span>}
              </>
            )
            return (
              <div
                key={`${s.href}${off}`}
                aria-hidden={!near}
                className={`absolute left-1/2 top-0 ${CARD_W} transition-[transform,opacity,filter] duration-500 ease-out motion-reduce:transition-none`}
                style={{
                  transform: `translateX(calc(-50% + ${shift * STEP}%)) scale(${near ? 1 : 0.88})`,
                  opacity: near ? 1 : 0.35,
                  filter: near ? "none" : "grayscale(0.7)",
                  zIndex: near ? 2 : 1,
                }}
              >
                {near ? (
                  <Ref href={s.href} className="group block">
                    {card}
                  </Ref>
                ) : (
                  <button type="button" tabIndex={-1} onClick={() => go(off)} className="group block w-full cursor-pointer text-left">
                    {card}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {(
          [
            [-1, "left-0", ChevronLeft, "Previous"],
            [1, "right-0", ChevronRight, "Next"],
          ] as const
        ).map(([d, side, Icon, label]) => (
          <button
            key={d}
            type="button"
            onClick={() => go(d)}
            aria-label={label}
            className={`absolute ${side} top-[calc(50%-1rem)] z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-foreground hover:text-background`}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      <div className="mt-3 flex justify-center gap-1.5">
        {slides.map((s, i) => (
          <button
            key={s.href}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show ${s.title}`}
            aria-current={i === index}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-foreground" : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground"}`}
          />
        ))}
      </div>
    </section>
  )
}
