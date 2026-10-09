"use client"

import { createContext, useContext } from "react"
import type { Media } from "@/lib/journe"
import { isVideo, tiltFor, useJourne } from "./journe-context"

// The date of the journal entry a stamp sits in — used for its postmark.
export const EntryDateContext = createContext<string | undefined>(undefined)

// "stamp", "stamp: wiring day", "stamp wiring day" → caption (or null if not a stamp)
export function stampCaption(alt?: string): string | null {
  const m = alt?.match(/^stamp\b[:\s-]*(.*)$/i)
  return m ? m[1].trim() : null
}

function Postmark({ date }: { date?: string }) {
  return (
    <svg viewBox="0 0 80 44" className="pointer-events-none absolute -right-5 -top-3 w-20 opacity-70 mix-blend-multiply" aria-hidden="true">
      <circle cx="22" cy="22" r="17" fill="none" stroke="oklch(0.3 0.03 260)" strokeWidth="1.6" />
      <circle cx="22" cy="22" r="12.5" fill="none" stroke="oklch(0.3 0.03 260)" strokeWidth="0.8" />
      <text x="22" y="20" textAnchor="middle" fontSize="5" fontFamily="monospace" fill="oklch(0.3 0.03 260)">JOURNE</text>
      <text x="22" y="28" textAnchor="middle" fontSize="6.5" fontWeight="bold" fontFamily="monospace" fill="oklch(0.3 0.03 260)">
        {date ?? "E-350"}
      </text>
      {[14, 20, 26, 32].map((y) => (
        <path key={y} d={`M42 ${y} q5 -3 10 0 t10 0 t10 0 t8 0`} fill="none" stroke="oklch(0.3 0.03 260)" strokeWidth="1.3" />
      ))}
    </svg>
  )
}

// Just the perforated stamp itself. Spans only, so it's valid inside a markdown <p>.
function StampFace({ src, caption }: Media) {
  const date = useContext(EntryDateContext)
  return (
    <span className="relative block drop-shadow-[0_3px_4px_rgba(0,0,0,0.5)]">
      <span className="journe-stamp block bg-[oklch(0.96_0.015_85)]">
        <span className="block border border-[oklch(0.8_0.03_80)] p-1">
          <span className="block aspect-[4/5] overflow-hidden bg-neutral-800">
            {isVideo(src) ? (
              <video src={src} autoPlay muted loop playsInline className="h-full w-full object-cover" />
            ) : (
              <img src={src} alt={caption || "work in progress"} loading="lazy" draggable={false} className="h-full w-full object-cover saturate-[0.85]" />
            )}
          </span>
          <span className="mt-0.5 flex items-baseline justify-between px-0.5 font-mono text-[7px] uppercase tracking-wider text-neutral-600">
            <span>wip</span>
            <span className="font-bold text-[oklch(0.5_0.15_25)]">1997¢</span>
          </span>
        </span>
      </span>
      <Postmark date={date} />
    </span>
  )
}

const caption = (text?: string) =>
  text ? <span className="mt-1 block text-center text-sm leading-tight text-muted-foreground journe-hand">{text}</span> : null

// Floats right so text wraps around it. Clicking opens the viewer with arrows through every stamp.
export function Stamp({ src, caption: text, grouped = false }: Media & { grouped?: boolean }) {
  const { openMedia } = useJourne()
  return (
    <button
      type="button"
      onClick={(e) => openMedia({ src, caption: text }, e.currentTarget)}
      data-lightbox="stamps"
      data-src={src}
      data-caption={text}
      aria-label={text ? `Open photo: ${text}` : "Open photo"}
      style={{ "--tilt": `${tiltFor(src) * 1.4}deg` } as React.CSSProperties}
      className={`journe-stamp-wrap block w-24 sm:w-28 text-left ${grouped ? "" : "float-right ml-4 mb-3 mt-1"}`}
    >
      <StampFace src={src} caption={text} />
      {caption(text)}
    </button>
  )
}
