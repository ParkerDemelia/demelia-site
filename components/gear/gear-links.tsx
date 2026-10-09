"use client"

import { useState } from "react"
import { ArrowUpRight, Backpack, Caravan, Flame, Laptop, NotebookPen, Package, Sparkles, Star } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { GearItem, GearSection } from "@/lib/gear"
import { SectionLabel } from "@/components/journe/section-label"

const PICKS = "__picks"

// Fallback thumbnail when an item has no photo yet, picked from the section name.
const SECTION_ICONS: [RegExp, LucideIcon][] = [
  [/carry|foot|bag|pack|cloth/i, Backpack],
  [/tech|camera|electr/i, Laptop],
  [/desk|everyday|home/i, NotebookPen],
  [/van|build|camp/i, Caravan],
]
const iconFor = (section: string) => SECTION_ICONS.find(([re]) => re.test(section))?.[1] ?? Package

// {HOT} / {FAVORITE} / {NEW} get their own colours + icon; any other word gets the default tag.
const TAG_STYLES: { match: RegExp; className: string; Icon?: LucideIcon }[] = [
  { match: /^(HOT|FIRE|BESTSELLER|BEST SELLER)$/, className: "gear-tag-hot", Icon: Flame },
  { match: /^(FAV|FAVE|FAVORITE|FAVOURITE|TOP PICK|MUST HAVE)$/, className: "gear-tag-fav", Icon: Star },
  { match: /^(NEW|JUST ADDED)$/, className: "gear-tag-new", Icon: Sparkles },
]

// Deterministic so server and client agree.
function tilt(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return (Math.abs(h) % 7) - 5
}

function Sticker({ tag, seed }: { tag: string; seed: string }) {
  const style = TAG_STYLES.find((s) => s.match.test(tag))
  const Icon = style?.Icon
  return (
    <span
      style={{ "--tilt": `${tilt(seed + tag)}deg` } as React.CSSProperties}
      className={`gear-tag ${style?.className ?? ""} inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase leading-none tracking-wider`}
    >
      {Icon && <Icon className="h-3 w-3" strokeWidth={2.5} />}
      {tag}
    </span>
  )
}

function Stickers({ item, className = "" }: { item: GearItem; className?: string }) {
  if (!item.tags.length) return null
  return (
    <span className={`pointer-events-none absolute z-10 flex gap-1.5 ${className}`}>
      {item.tags.map((t) => (
        <Sticker key={t} tag={t} seed={item.name} />
      ))}
    </span>
  )
}

function Price({ price }: { price: string }) {
  return (
    <span className="journe-price shrink-0 font-mono text-[11px] font-bold leading-none text-neutral-900">{price}</span>
  )
}

function Thumb({ item, section }: { item: GearItem; section: string }) {
  const Icon = iconFor(section)
  return (
    <span
      className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl ring-1 ring-border ${
        item.image ? "bg-white" : "bg-primary/10"
      }`}
    >
      {item.image ? (
        <img src={item.image} alt="" loading="lazy" className="h-full w-full object-contain p-1.5" />
      ) : (
        <Icon className="h-6 w-6 text-primary/70" strokeWidth={1.75} />
      )}
    </span>
  )
}

const cardClass =
  "gear-card group relative block rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

const linkProps = (item: GearItem) => ({
  href: item.href,
  target: "_blank",
  rel: "noopener noreferrer sponsored",
})

// A tagged item with a photo gets the big Linktree "featured" layout.
function FeaturedCard({ item }: { item: GearItem }) {
  return (
    <a {...linkProps(item)} className={`${cardClass} mt-3`}>
      <Stickers item={item} className="-top-3 left-4" />
      <span className="block overflow-hidden rounded-t-2xl bg-white">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="mx-auto aspect-[16/10] w-full object-contain p-6 transition-transform duration-300 group-hover:scale-105"
        />
      </span>
      <span className="flex items-center gap-3 border-t border-border p-4">
        <span className="min-w-0 flex-1">
          <span className="block font-semibold leading-tight text-foreground">{item.name}</span>
          {item.description && (
            <span className="mt-1 block text-[13px] leading-snug text-muted-foreground">{item.description}</span>
          )}
        </span>
        {item.price && <Price price={item.price} />}
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:rotate-45">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </span>
    </a>
  )
}

function LinkCard({ item, section }: { item: GearItem; section: string }) {
  return (
    <a {...linkProps(item)} className={`${cardClass} ${item.tags.length ? "mt-3" : ""}`}>
      <Stickers item={item} className="-top-3 right-4" />
      <span className="flex items-center gap-3 p-2 pr-4">
        <Thumb item={item} section={section} />
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold leading-tight text-foreground">{item.name}</span>
          {item.description && (
            <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-muted-foreground">{item.description}</span>
          )}
        </span>
        {item.price && <Price price={item.price} />}
        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
      </span>
    </a>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}

export function GearLinks({ sections }: { sections: GearSection[] }) {
  const [filter, setFilter] = useState<string | null>(null)
  const hasPicks = sections.some((s) => s.items.some((i) => i.tags.length))

  const visible = sections
    .filter((s) => !filter || filter === PICKS || s.slug === filter)
    .map((s) => ({ ...s, items: filter === PICKS ? s.items.filter((i) => i.tags.length) : s.items }))
    .filter((s) => s.items.length)

  return (
    <>
      <nav
        aria-label="Gear categories"
        className="sticky top-0 z-20 -mx-4 mb-8 flex gap-2 overflow-x-auto bg-background/85 px-4 py-3 backdrop-blur [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <Chip active={!filter} onClick={() => setFilter(null)}>all</Chip>
        {hasPicks && (
          <Chip active={filter === PICKS} onClick={() => setFilter(PICKS)}>
            <Star className="h-3 w-3" /> picks
          </Chip>
        )}
        {sections.map((s) => (
          <Chip key={s.slug} active={filter === s.slug} onClick={() => setFilter(s.slug)}>
            {s.title.toLowerCase()}
          </Chip>
        ))}
      </nav>

      <div className="space-y-10">
        {visible.map((section) => (
          <section key={section.slug} id={section.slug} className="scroll-mt-20">
            <SectionLabel>{section.title}</SectionLabel>
            <div className="space-y-3">
              {section.items.map((item) =>
                item.image && item.tags.length ? (
                  <FeaturedCard key={item.href + item.name} item={item} />
                ) : (
                  <LinkCard key={item.href + item.name} item={item} section={section.title} />
                )
              )}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}
