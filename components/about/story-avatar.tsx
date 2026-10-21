"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, X } from "lucide-react"
import type { StorySlide } from "@/lib/about"

const SLIDE_MS = 5000
const SEEN_KEY = "about-story-seen"
const TEXT_BACKGROUNDS = [
  "linear-gradient(135deg, oklch(0.55 0.15 200), oklch(0.45 0.12 260))",
  "linear-gradient(135deg, oklch(0.6 0.16 135), oklch(0.45 0.12 180))",
  "linear-gradient(135deg, oklch(0.65 0.15 60), oklch(0.5 0.17 20))",
  "linear-gradient(135deg, oklch(0.55 0.17 330), oklch(0.42 0.15 290))",
]

// Profile photo with a story ring (same look as the /gear avatar). Tap → Instagram-style story.
export function StoryAvatar({ src, alt, slides }: { src: string; alt: string; slides: StorySlide[] }) {
  const [open, setOpen] = useState(false)
  const [seen, setSeen] = useState(false)
  const hasStory = slides.length > 0

  useEffect(() => {
    try {
      setSeen(localStorage.getItem(SEEN_KEY) === String(slides.length))
    } catch {}
  }, [slides.length])

  const openStory = () => {
    setOpen(true)
    setSeen(true)
    try {
      localStorage.setItem(SEEN_KEY, String(slides.length))
    } catch {}
  }

  const ring = !hasStory || seen ? "ring-primary/50" : "ring-primary"
  const avatar = (
    <span className={`block h-24 w-24 overflow-hidden rounded-full border-4 border-background bg-muted shadow-md ring-2 ${ring} sm:h-28 sm:w-28`}>
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </span>
  )

  if (!hasStory) return <div className="shrink-0">{avatar}</div>

  return (
    <>
      <button
        type="button"
        onClick={openStory}
        aria-label="Open Parker's story"
        className="shrink-0 self-start rounded-full transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:self-center"
      >
        {avatar}
      </button>
      {open && <StoryViewer slides={slides} avatar={src} onClose={() => setOpen(false)} />}
    </>
  )
}

function StoryViewer({ slides, avatar, onClose }: { slides: StorySlide[]; avatar: string; onClose: () => void }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const press = useRef<{ t: number; x: number } | null>(null)
  const slide = slides[i]

  const next = useCallback(() => (i >= slides.length - 1 ? onClose() : setI(i + 1)), [i, slides.length, onClose])
  const prev = useCallback(() => setI(Math.max(0, i - 1)), [i])

  useEffect(() => setVideoProgress(0), [i])

  // Keyboard, scroll lock, focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      else if (e.key === "ArrowRight") next()
      else if (e.key === "ArrowLeft") prev()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [next, prev, onClose])

  useEffect(() => {
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = overflow
    }
  }, [])

  // Hold to pause
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (paused) v.pause()
    else v.play().catch(() => {})
  }, [paused, i])

  // Warm up the next image
  useEffect(() => {
    const upcoming = slides[i + 1]
    if (upcoming?.kind === "image" && upcoming.src) new Image().src = upcoming.src
  }, [i, slides])

  const onPointerDown = (e: React.PointerEvent) => {
    press.current = { t: Date.now(), x: e.clientX }
    setPaused(true)
  }
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setPaused(false)
    const p = press.current
    press.current = null
    if (!p || Date.now() - p.t > 250) return // a hold, not a tap
    const { left, width } = e.currentTarget.getBoundingClientRect()
    if (p.x - left < width / 3) prev()
    else next()
  }
  const stop = (e: React.SyntheticEvent) => e.stopPropagation()

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Parker's story"
      onClick={onClose}
      className="story-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
    >
      <div
        onClick={stop}
        className="story-pop-in relative h-[100svh] w-full select-none overflow-hidden bg-neutral-900 sm:aspect-[9/16] sm:h-[min(88svh,780px)] sm:w-auto sm:rounded-2xl"
      >
        {/* Slide */}
        <div
          className="absolute inset-0 touch-none"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerLeave={() => setPaused(false)}
          onPointerCancel={() => setPaused(false)}
          onContextMenu={(e) => e.preventDefault()}
        >
          {slide.kind === "image" && (
            <img key={slide.src} src={slide.src} alt={slide.caption ?? ""} draggable={false} className="h-full w-full object-cover" />
          )}
          {slide.kind === "video" && (
            <video
              key={slide.src}
              ref={videoRef}
              src={slide.src}
              autoPlay
              muted
              playsInline
              onTimeUpdate={(e) => {
                const v = e.currentTarget
                if (v.duration) setVideoProgress(v.currentTime / v.duration)
              }}
              onEnded={next}
              className="h-full w-full object-cover"
            />
          )}
          {slide.kind === "text" && (
            <div
              className="flex h-full w-full items-center justify-center p-10 text-center text-3xl font-bold leading-tight tracking-tight text-white"
              style={{ background: TEXT_BACKGROUNDS[i % TEXT_BACKGROUNDS.length] }}
            >
              {slide.text}
            </div>
          )}
        </div>

        {/* Top: progress + header */}
        <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent px-3 pb-10 pt-3">
          <div className="flex gap-1">
            {slides.map((s, n) => (
              <span key={n} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
                {n < i && <span className="block h-full w-full bg-white" />}
                {n === i && s.kind !== "video" && (
                  <span
                    key={i}
                    onAnimationEnd={next}
                    className="story-progress block h-full bg-white"
                    style={{ "--d": `${SLIDE_MS}ms`, animationPlayState: paused ? "paused" : "running" } as React.CSSProperties}
                  />
                )}
                {n === i && s.kind === "video" && <span className="block h-full bg-white" style={{ width: `${videoProgress * 100}%` }} />}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <img src={avatar} alt="" className="h-8 w-8 rounded-full border border-white/40 object-cover" />
            <span className="text-sm font-semibold text-white">parker.demelia</span>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              onPointerDown={stop}
              aria-label="Close story"
              className="pointer-events-auto ml-auto rounded-full p-1.5 text-white/90 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Bottom: caption + link */}
        {(slide.caption || slide.link) && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-gradient-to-t from-black/70 to-transparent px-5 pb-6 pt-16 text-center">
            {slide.caption && <p className="text-base font-medium text-white">{slide.caption}</p>}
            {slide.link && (
              <StoryLink href={slide.link} onPointerDown={stop} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StoryLink({ href, onPointerDown }: { href: string; onPointerDown: (e: React.SyntheticEvent) => void }) {
  const className =
    "pointer-events-auto inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-transform hover:scale-105"
  const body = (
    <>
      see more <ArrowUpRight className="h-4 w-4" />
    </>
  )
  return href.startsWith("http") ? (
    <a href={href} target="_blank" rel="noopener noreferrer" onPointerDown={onPointerDown} className={className}>
      {body}
    </a>
  ) : (
    <Link href={href} onPointerDown={onPointerDown} className={className}>
      {body}
    </Link>
  )
}
