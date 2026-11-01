"use client"

import { useRef, useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { Ref, host } from "@/components/ref"

export type WorkEntry = { name: string; link?: string; desc?: string; image?: string }

// Editorial list: hovering a row floats a screenshot of the site beside the cursor.
// Touch screens have no hover, so they get a small inline thumbnail per row instead.
export function WorkList({ items }: { items: WorkEntry[] }) {
  const [active, setActive] = useState<number | null>(null)
  const preview = useRef<HTMLDivElement>(null)

  // Positioned straight on the DOM node so mousemove doesn't re-render the list
  const follow = (e: React.MouseEvent) => {
    preview.current?.style.setProperty("transform", `translate(${e.clientX + 24}px, ${e.clientY - 90}px)`)
  }

  return (
    <>
      <ul className="group/list border-t border-border" onMouseMove={follow} onMouseLeave={() => setActive(null)}>
        {items.map((t, i) => (
          <li key={t.name} onMouseEnter={() => setActive(i)} className="border-b border-border transition-opacity duration-300 group-hover/list:opacity-40 hover:!opacity-100">
            <Ref href={t.link} className="group flex items-center gap-4 py-5">
              <span className="w-6 shrink-0 self-start pt-1.5 font-mono text-[11px] text-muted-foreground/70">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-xl font-semibold leading-tight text-foreground sm:text-2xl">
                  {t.name}
                  {t.link && <ArrowUpRight className="h-4 w-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:text-primary group-hover:opacity-100" />}
                </span>
                {t.desc && <span className="mt-1 block text-sm text-muted-foreground">{t.desc}</span>}
                {host(t.link) && <span className="mt-1.5 block font-mono text-[11px] text-muted-foreground/70">{host(t.link)}</span>}
              </span>
              {t.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.image} alt="" loading="lazy" className="hidden aspect-[8/5] w-24 shrink-0 rounded-md object-cover object-top ring-1 ring-border [@media(hover:none)]:block" />
              )}
            </Ref>
          </li>
        ))}
      </ul>

      <div ref={preview} aria-hidden className="pointer-events-none fixed left-0 top-0 z-50 hidden [@media(hover:hover)]:block">
        <div
          className={`relative aspect-[8/5] w-72 overflow-hidden rounded-lg bg-muted shadow-2xl ring-1 ring-border transition-all duration-300 ease-out ${
            active !== null && items[active]?.image ? "scale-100 opacity-100" : "scale-90 opacity-0"
          }`}
        >
          {/* every screenshot stays mounted so switching rows crossfades instead of waiting on a load */}
          {items.map((t, i) =>
            t.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={t.name} src={t.image} alt="" className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-300 ${i === active ? "opacity-100" : "opacity-0"}`} />
            ) : null,
          )}
        </div>
      </div>
    </>
  )
}
