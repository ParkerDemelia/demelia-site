"use client"

import { useEffect, useRef, useState } from "react"
import { Pause, Play, RotateCcw, RotateCw } from "lucide-react"
import { Button, Card, Slider } from "@/components/audio/ui"
import type { Episode } from "@/lib/audio"
import { cn } from "@/lib/utils"

const fmt = (s: number) => {
  if (!isFinite(s)) return "0:00"
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60).toString().padStart(2, "0")
  return h ? `${h}:${m.toString().padStart(2, "0")}:${sec}` : `${m}:${sec}`
}
const day = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

// Newest episode sits in the big player; tapping one in the list swaps it in and plays.
// When an episode ends, the next (older) one starts.
export function AudioPlayer({ episodes }: { episodes: Episode[] }) {
  const audio = useRef<HTMLAudioElement>(null)
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const ep = episodes[current]

  useEffect(() => {
    setTime(0)
    setDuration(0)
  }, [current])

  if (!ep) return <p className="text-center text-sm text-neutral-500">No episodes yet.</p>

  const toggle = () => {
    const a = audio.current
    if (!a) return
    if (a.paused) a.play()
    else a.pause()
  }
  const skip = (d: number) => {
    const a = audio.current
    if (a) a.currentTime = Math.max(0, Math.min(a.duration || 0, a.currentTime + d))
  }
  const pick = (i: number) => {
    if (i === current) return toggle()
    setCurrent(i)
    requestAnimationFrame(() => audio.current?.play())
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="flex w-full flex-col items-center gap-10">
      <Card className="w-full p-6 sm:p-8">
        <audio
          ref={audio}
          src={ep.url}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => current + 1 < episodes.length && pick(current + 1)}
        />
        <p className="text-center text-xs uppercase tracking-widest text-neutral-500">
          {current === 0 ? "Latest" : "Episode"} · {day(ep.date)}
        </p>
        <h2 className="mt-2 text-center text-2xl font-semibold tracking-tight">{ep.title}</h2>

        <div className="mt-8 flex items-center justify-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => skip(-15)} aria-label="Back 15 seconds">
            <RotateCcw />
          </Button>
          <Button size="xl" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
            {playing ? <Pause /> : <Play className="translate-x-px" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => skip(30)} aria-label="Forward 30 seconds">
            <RotateCw />
          </Button>
        </div>

        <div className="mt-8 flex items-center gap-3 text-xs tabular-nums text-neutral-500">
          <span className="w-12 text-right">{fmt(time)}</span>
          <Slider
            value={[time]}
            max={duration || 1}
            step={1}
            aria-label="Seek"
            onValueChange={([v]) => {
              if (audio.current) audio.current.currentTime = v
              setTime(v)
            }}
          />
          <span className="w-12">{fmt(duration)}</span>
        </div>
      </Card>

      {episodes.length > 1 && (
        <ul className="flex w-full flex-col items-center gap-1">
          {episodes.map((e, i) => (
            <li key={e.id} className="w-full">
              <button
                type="button"
                onClick={() => pick(i)}
                className={cn(
                  "flex w-full flex-col items-center rounded-lg px-4 py-3 text-center transition-colors hover:bg-neutral-100",
                  i === current && "bg-neutral-100",
                )}
              >
                <span className="font-medium">{e.title}</span>
                <span className="text-xs text-neutral-500">{day(e.date)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
