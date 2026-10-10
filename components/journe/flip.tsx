"use client"

import { useEffect, useState } from "react"

// Counts up in a handful of discrete steps so each flip card has time to flip.
export function useSteppedCount(target: number, run: boolean, steps = 8, ms = 1800) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!run) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target)
      return
    }
    let i = 0
    const id = setInterval(() => {
      i++
      setValue(i >= steps ? target : target * (1 - Math.pow(1 - i / steps, 3)))
      if (i >= steps) clearInterval(id)
    }, ms / steps)
    return () => clearInterval(id)
  }, [target, run, steps, ms])
  return value
}

// One split-flap card. When the character changes, the old top half falls away
// and the new bottom half swings down into place.
function FlipChar({ char, small = false }: { char: string; small?: boolean }) {
  const [shown, setShown] = useState(char)
  const [prev, setPrev] = useState(char)
  const [flips, setFlips] = useState(0)
  useEffect(() => {
    if (char === shown) return
    setPrev(shown)
    setShown(char)
    setFlips((f) => f + 1)
  }, [char, shown])

  const half = (c: string, which: "top" | "bottom", extra = "") => (
    <span className={`journe-flap journe-flap-${which} ${extra}`}>
      <span>{c}</span>
    </span>
  )

  return (
    <span className={`journe-flip ${small ? "journe-flip-sm" : ""}`} aria-hidden="true">
      {half(shown, "top")}
      {half(prev, "bottom")}
      {flips > 0 && (
        <>
          <span key={`t${flips}`} className="contents">{half(prev, "top", "journe-flap-fall")}</span>
          <span key={`b${flips}`} className="contents">{half(shown, "bottom", "journe-flap-rise")}</span>
        </>
      )}
    </span>
  )
}

export function FlipNumber({ text, size = "md" }: { text: string; size?: "md" | "sm" }) {
  const chars = text.split("")
  return (
    <span className={`inline-flex items-end ${size === "sm" ? "gap-px" : "gap-[3px]"}`} aria-label={text}>
      {chars.map((c, i) => {
        const key = chars.length - i // keyed from the right so digits stay put as the number grows
        return /[0-9\-–]/.test(c) ? (
          <FlipChar key={key} char={c} small={size === "sm"} />
        ) : (
          <span key={key} className={`font-mono font-bold text-muted-foreground ${size === "sm" ? "text-[0.8em]" : "pb-1 text-lg"}`} aria-hidden="true">
            {c}
          </span>
        )
      })}
    </span>
  )
}
