"use client"

import type { Media } from "@/lib/journe"
import { Polaroid } from "./journe-context"
import { SectionLabel } from "./section-label"

export function PolaroidGallery({ items }: { items: Media[] }) {
  return (
    <section className="mb-20">
      <SectionLabel>the camera roll</SectionLabel>
      {items.length === 0 ? (
        <div className="journe-polaroid mx-auto block w-56 bg-[oklch(0.97_0.01_90)] p-2 pb-1 shadow-lg shadow-black/40" style={{ "--tilt": "-3deg" } as React.CSSProperties}>
          <div className="aspect-[4/3] bg-neutral-800" />
          <p className="px-1 pt-1.5 pb-1 text-center text-[13px] text-neutral-700 journe-hand">photos developing…</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
          {items.map((m) => (
            <Polaroid key={m.src} src={m.src} caption={m.caption} className="w-full" />
          ))}
        </div>
      )}
    </section>
  )
}
