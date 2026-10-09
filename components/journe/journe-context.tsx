"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useExpenses, type Expense } from "@/components/trip-expenses-widget"
import type { Media } from "@/lib/journe"

export function isVideo(src: string) {
  return /\.(mp4|mov|webm|m4v)$/i.test(src)
}

// Notion multi-select comes through as "a, b" — match "van" anywhere in it.
function isVanExpense(e: Expense) {
  return e.category
    .toLowerCase()
    .split(",")
    .some((c) => c.trim() === "van")
}

type JourneContextValue = {
  vanExpenses: Expense[]
  vanSpend: number
  loading: boolean
  error: string | null
  // Pass the clicked element to get arrows through everything in its data-lightbox group.
  openMedia: (media: Media, from?: HTMLElement | null) => void
}

const JourneContext = createContext<JourneContextValue | null>(null)

export function useJourne() {
  const ctx = useContext(JourneContext)
  if (!ctx) throw new Error("useJourne must be used inside <JourneProvider>")
  return ctx
}

export const PURCHASE_ID = "van-purchase"

// `purchase` is the van itself (from journe.md) — it isn't in Notion, so it's added here.
export function JourneProvider({
  children,
  purchase,
}: {
  children: React.ReactNode
  purchase?: { date: string; amount: number }
}) {
  const { allExpenses, loading, error } = useExpenses()
  const [viewer, setViewer] = useState<{ items: Media[]; index: number } | null>(null)
  const open = viewer ? viewer.items[viewer.index] : null
  const close = () => setViewer(null)
  const step = (d: number) =>
    setViewer((v) => (v ? { ...v, index: (v.index + d + v.items.length) % v.items.length } : v))

  function openMedia(media: Media, from?: HTMLElement | null) {
    const group = from?.dataset.lightbox
    if (!from || !group) return setViewer({ items: [media], index: 0 })
    const els = [...document.querySelectorAll<HTMLElement>(`[data-lightbox="${group}"]`)]
    const items = els.map((el) => ({ src: el.dataset.src!, caption: el.dataset.caption || undefined }))
    setViewer({ items, index: Math.max(0, els.indexOf(from)) })
  }

  const vanExpenses = useMemo(() => {
    const list = allExpenses.filter(isVanExpense)
    if (purchase) {
      list.push({
        id: PURCHASE_ID,
        expense: "the van itself",
        date: purchase.date,
        dateEnd: "",
        category: "Van",
        amount: purchase.amount,
        earned: 0,
        notes: "thanks dave",
        location: "",
      })
    }
    return list.sort((a, b) => a.date.localeCompare(b.date))
  }, [allExpenses, purchase?.date, purchase?.amount])
  const vanSpend = useMemo(
    () => vanExpenses.reduce((s, e) => s + (e.amount || 0) - (e.earned || 0), 0),
    [vanExpenses]
  )

  useEffect(() => {
    if (!viewer) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
      if (e.key === "ArrowRight") step(1)
      if (e.key === "ArrowLeft") step(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [viewer])

  const touchX = useRef<number | null>(null)
  const many = (viewer?.items.length ?? 0) > 1
  const arrow = "absolute top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/25"

  return (
    <JourneContext.Provider value={{ vanExpenses, vanSpend, loading, error, openMedia }}>
      {children}
      {open && viewer && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={open.caption || "photo"}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm journe-fade-in"
          onClick={close}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current == null || !many) return
            const dx = e.changedTouches[0].clientX - touchX.current
            if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1)
            touchX.current = null
          }}
        >
          <button aria-label="Close" className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={close}>
            <X className="h-5 w-5" />
          </button>
          {many && (
            <>
              <button
                aria-label="Previous photo"
                className={`${arrow} left-2 sm:left-4`}
                onClick={(e) => {
                  e.stopPropagation()
                  step(-1)
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                aria-label="Next photo"
                className={`${arrow} right-2 sm:right-4`}
                onClick={(e) => {
                  e.stopPropagation()
                  step(1)
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <figure key={viewer.index} className="max-w-3xl w-full px-8 sm:px-12 journe-pop-in" onClick={(e) => e.stopPropagation()}>
            {isVideo(open.src) ? (
              <video src={open.src} controls autoPlay playsInline className="w-full max-h-[78vh] rounded-md bg-black" />
            ) : (
              <img src={open.src} alt={open.caption || ""} className="w-full max-h-[78vh] object-contain rounded-md" />
            )}
            <figcaption className="mt-3 flex items-baseline justify-center gap-3 text-white/80">
              {open.caption && <span className="text-lg journe-hand">{open.caption}</span>}
              {many && (
                <span className="font-mono text-xs tabular-nums text-white/50">
                  {viewer.index + 1} / {viewer.items.length}
                </span>
              )}
            </figcaption>
          </figure>
        </div>
      )}
    </JourneContext.Provider>
  )
}

// Deterministic tilt so server and client render the same thing.
export function tiltFor(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return ((Math.abs(h) % 9) - 4) * 0.9
}

// Spans + button only so this is valid inside a markdown <p>.
export function Polaroid({ src, caption, className = "" }: Media & { className?: string }) {
  const { openMedia } = useJourne()
  const tilt = tiltFor(src)
  return (
    <button
      type="button"
      onClick={(e) => openMedia({ src, caption }, e.currentTarget)}
      data-lightbox="photos"
      data-src={src}
      data-caption={caption}
      style={{ "--tilt": `${tilt}deg` } as React.CSSProperties}
      className={`journe-polaroid group inline-block bg-[oklch(0.97_0.01_90)] p-2 pb-1 shadow-lg shadow-black/40 text-left ${className}`}
    >
      <span className="block aspect-[4/3] overflow-hidden bg-neutral-800">
        {isVideo(src) ? (
          <video src={src} autoPlay muted loop playsInline className="h-full w-full object-cover" />
        ) : (
          <img src={src} alt={caption || ""} loading="lazy" className="h-full w-full object-cover" />
        )}
      </span>
      <span className="block min-h-7 px-1 pt-1.5 pb-1 text-center text-[13px] leading-tight text-neutral-700 journe-hand">
        {caption}
      </span>
    </button>
  )
}
