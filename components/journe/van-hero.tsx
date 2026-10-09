"use client"

import { useRef, useState } from "react"
import { useInView } from "./stat-strip"
import { VanSide } from "./van-art"

// Two short square-wave beeps. Only ever runs from a click, so autoplay rules are fine.
function honk() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    const ctx = new Ctx()
    ;[0, 0.18].forEach((start) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "square"
      osc.frequency.value = 415
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + start)
      gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + start + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + 0.13)
      osc.connect(gain).connect(ctx.destination)
      osc.start(ctx.currentTime + start)
      osc.stop(ctx.currentTime + start + 0.14)
    })
    setTimeout(() => ctx.close(), 600)
  } catch {
    // no audio, no problem
  }
}

const HONKS = ["beep beep!", "honk!", "meep meep", "vroom", "beep!", "outta my way"]

function Odometer({ value }: { value: number }) {
  const digits = Math.max(0, Math.round(value)).toString().padStart(6, "0").slice(-6).split("").map(Number)
  const { ref, inView: rolled } = useInView<HTMLDivElement>(0.6)

  return (
    <div ref={ref} className="inline-flex items-center gap-2" aria-label={`${value.toLocaleString()} miles on the odometer`}>
      <div className="flex rounded-md border border-border bg-black p-1 gap-[2px] shadow-inner" aria-hidden="true">
        {[...digits, 0].map((d, i) => {
          const tenths = i === 6
          return (
            <div
              key={i}
              className={`h-8 w-6 overflow-hidden rounded-[3px] font-mono text-xl leading-8 text-center tabular-nums ${
                tenths ? "bg-[oklch(0.95_0_0)] text-black" : "bg-[oklch(0.22_0_0)] text-white"
              }`}
            >
              <div
                className="journe-odo-roll"
                style={{
                  transform: `translateY(${rolled ? -(10 + d) * 2 : 0}rem)`,
                  transitionDuration: `${1.4 + (6 - i) * 0.25}s`,
                }}
              >
                {Array.from({ length: 20 }, (_, n) => (
                  <div key={n}>{n % 10}</div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <span className="text-xs uppercase tracking-widest text-muted-foreground">mi</span>
    </div>
  )
}

export function JourneTitle({ van }: { van?: string }) {
  return (
    <header className="mb-10">
      <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground">
        {"journe".split("").map((c, i) => (
          <span key={i} className="journe-letter inline-block" style={{ animationDelay: `${i * 60}ms` }}>
            {c}
          </span>
        ))}
      </h1>
      {van && <p className="mt-2 text-sm text-muted-foreground">life in a {van.toLowerCase()}</p>}
    </header>
  )
}

// A little honkable van on a road, with the odometer — sits mid-page as a breather.
export function VanBreak({ odometer }: { odometer: number }) {
  const [hops, setHops] = useState(0)
  const [bubble, setBubble] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  function onClick() {
    honk()
    setHops((h) => h + 1)
    setBubble(HONKS[hops % HONKS.length])
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setBubble(null), 1100)
  }

  return (
    <section className="mb-20 select-none">
      <div className="relative">
        <button
          type="button"
          onClick={onClick}
          aria-label="Honk the van"
          className="relative block mx-auto w-[min(70%,15rem)] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-8 rounded-lg"
        >
          {bubble && (
            <span
              key={`bubble-${hops}`}
              className="journe-bubble absolute -top-7 -right-6 rounded-full bg-secondary px-2.5 py-0.5 font-semibold text-secondary-foreground shadow-md journe-hand text-base whitespace-nowrap"
            >
              {bubble}
            </span>
          )}
          {/* exhaust */}
          <span className="absolute left-0 bottom-[16%]" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="journe-puff absolute h-2 w-2 rounded-full bg-muted-foreground/40"
                style={{ animationDelay: `${i * 0.5}s` }}
              />
            ))}
          </span>
          <span key={`van-${hops}`} className={`block ${hops ? "journe-hop" : ""}`}>
            <span className="block journe-bob">
              <VanSide />
            </span>
          </span>
        </button>

        {/* the road moving underneath */}
        <svg viewBox="0 0 400 10" preserveAspectRatio="none" className="mt-0.5 h-2.5 w-full" aria-hidden="true">
          <rect x="0" y="0" width="400" height="10" fill="oklch(0.24 0 0)" />
          <line x1="0" y1="5" x2="400" y2="5" stroke="var(--secondary)" strokeWidth="1.2" strokeDasharray="14 10" className="journe-road-dash" />
        </svg>
      </div>
      <div className="mt-5 flex flex-col items-center gap-1.5">
        <Odometer value={odometer} />
        <p className="text-[11px] text-muted-foreground/70">(go ahead, honk)</p>
      </div>
    </section>
  )
}
