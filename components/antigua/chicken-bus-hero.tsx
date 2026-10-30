"use client"

import { useRef, useState } from "react"
import { honk } from "@/components/journe/van-hero"

const SHOUTS = ["¡vámonos!", "¡Antigua, Antigua!", "beep beep!", "¡súbase!", "bawk!"]

const RED = "oklch(0.58 0.2 25)"
const YELLOW = "oklch(0.85 0.16 90)"
const BLUE = "oklch(0.5 0.15 255)"
const GREEN = "oklch(0.6 0.15 155)"
const BLACK = "oklch(0.17 0 0)"
const GLASS = "oklch(0.3 0.03 240)"
const CHROME = "oklch(0.86 0 0)"

function Wheel({ x }: { x: number }) {
  return (
    <g>
      <circle cx={x} cy="88" r="11" fill={BLACK} />
      <g className="journe-wheel">
        <circle cx={x} cy="88" r="5.5" fill={CHROME} />
        <line x1={x - 5} y1="88" x2={x + 5} y2="88" stroke="oklch(0.5 0 0)" strokeWidth="1.2" />
        <line x1={x} y1="83" x2={x} y2="93" stroke="oklch(0.5 0 0)" strokeWidth="1.2" />
      </g>
    </g>
  )
}

// A Guatemalan "camioneta" — a retired school bus painted loud, luggage (and a chicken) on the roof.
export function ChickenBus() {
  return (
    <svg viewBox="0 0 250 101" className="block w-full" aria-hidden="true">
      <ellipse cx="125" cy="99" rx="110" ry="3" fill="black" opacity="0.4" />
      {/* roof rack + luggage + chicken */}
      <rect x="30" y="12" width="150" height="3" rx="1" fill={BLACK} />
      <rect x="42" y="2" width="22" height="10" rx="1.5" fill={GREEN} />
      <rect x="70" y="5" width="16" height="7" rx="1.5" fill={RED} />
      <rect x="92" y="0" width="26" height="12" rx="2" fill="oklch(0.55 0.08 60)" />
      <path d="M96 4 h18 M96 8 h18" stroke="oklch(0.45 0.06 60)" strokeWidth="0.8" />
      <g transform="translate(140 3)">
        <ellipse cx="6" cy="5" rx="6" ry="4.5" fill="white" />
        <circle cx="11" cy="1" r="2.6" fill="white" />
        <path d="M10 -1.6 l1 -1.4 l1 1.4 Z" fill={RED} />
        <path d="M13.4 1 l2 0.6 l-2 0.6 Z" fill={YELLOW} />
        <path d="M0 3 l-3 -3 l1 4 Z" fill="white" />
      </g>
      {/* body */}
      <path d="M20 22 Q20 15 28 15 H190 Q198 15 198 22 V88 H20 Z" fill={YELLOW} />
      {/* hood */}
      <path d="M198 46 H224 Q232 46 232 54 V88 H198 Z" fill={YELLOW} />
      <rect x="230" y="70" width="6" height="12" rx="1.5" fill={CHROME} />
      <rect x="228" y="54" width="5" height="5" rx="1" fill="oklch(0.95 0.08 90)" />
      {/* paint: red roof band, blue swoosh, green pinstripe */}
      <path d="M20 22 Q20 15 28 15 H190 Q198 15 198 22 V26 H20 Z" fill={RED} />
      <path d="M20 60 C70 50 120 74 198 56 V68 C120 86 70 62 20 72 Z" fill={BLUE} />
      <path d="M198 60 C210 57 222 58 232 60 V66 C222 64 210 64 198 67 Z" fill={BLUE} />
      <path d="M20 78 H232" stroke={GREEN} strokeWidth="2" />
      {/* windows */}
      {[28, 54, 80, 106, 132, 158].map((x) => (
        <rect key={x} x={x} y="30" width="21" height="18" rx="2" fill={GLASS} />
      ))}
      <rect x="184" y="30" width="11" height="40" rx="2" fill={GLASS} />
      {/* destination sign */}
      <rect x="62" y="17.5" width="70" height="7" rx="1" fill={BLACK} />
      <text x="97" y="23" textAnchor="middle" fontSize="5.2" fontFamily="monospace" fontWeight="bold" fill={YELLOW}>
        ANTIGUA
      </text>
      <Wheel x={56} />
      <Wheel x={200} />
    </svg>
  )
}

// The /antigua version of honking the van: click the bus, it honks, hops, and the ayudante shouts.
export function ChickenBusHero() {
  const [hops, setHops] = useState(0)
  const [bubble, setBubble] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  function onClick() {
    honk()
    setHops((h) => h + 1)
    setBubble(SHOUTS[hops % SHOUTS.length])
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setBubble(null), 1100)
  }

  return (
    <section className="mb-14 select-none">
      <div className="relative">
        <button
          type="button"
          onClick={onClick}
          aria-label="Honk the chicken bus"
          className="relative mx-auto block w-[min(85%,22rem)] cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-offset-8"
        >
          {bubble && (
            <span
              key={`bubble-${hops}`}
              className="journe-bubble journe-hand absolute -right-4 -top-8 whitespace-nowrap rounded-full bg-secondary px-2.5 py-0.5 text-base font-semibold text-secondary-foreground shadow-md"
            >
              {bubble}
            </span>
          )}
          {/* exhaust out the back */}
          <span className="absolute bottom-[14%] left-[6%]" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span key={i} className="journe-puff absolute h-2.5 w-2.5 rounded-full bg-muted-foreground/40" style={{ animationDelay: `${i * 0.5}s` }} />
            ))}
          </span>
          <span key={`bus-${hops}`} className={`block ${hops ? "journe-hop" : ""}`}>
            <span className="block journe-bob">
              <ChickenBus />
            </span>
          </span>
        </button>

        {/* cobblestone street */}
        <svg viewBox="0 0 400 12" preserveAspectRatio="none" className="mt-0.5 h-3 w-full" aria-hidden="true">
          <rect x="0" y="0" width="400" height="12" fill="oklch(0.24 0 0)" />
          <line x1="0" y1="6" x2="400" y2="6" stroke="oklch(0.45 0.02 60)" strokeWidth="5" strokeDasharray="9 4" strokeLinecap="round" className="journe-road-dash" />
        </svg>
      </div>
      <p className="mt-3 text-center text-[11px] text-muted-foreground/70">(go ahead, honk)</p>
    </section>
  )
}
