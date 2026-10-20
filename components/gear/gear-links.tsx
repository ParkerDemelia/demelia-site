"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  Backpack,
  Caravan,
  Check,
  Copy,
  Facebook,
  Flame,
  Github,
  Globe,
  Instagram,
  Laptop,
  Linkedin,
  Mail,
  NotebookPen,
  Package,
  Rss,
  Sparkles,
  Star,
  Ticket,
  Twitch,
  Youtube,
} from "lucide-react"
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

// ── socials ────────────────────────────────────────────
type IconLike = React.ElementType<{ className?: string }>

const TikTok: IconLike = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.27 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.68a8.21 8.21 0 0 0 4.76 1.51v-3.5c0 0-1 0-1-0z" />
  </svg>
)
const XLogo: IconLike = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

// Platform from the URL → icon + brand colour for the little circle.
const PLATFORMS: { match: RegExp; Icon: IconLike; color: string }[] = [
  { match: /youtube\.com|youtu\.be/, Icon: Youtube, color: "#ff0033" },
  { match: /instagram\.com/, Icon: Instagram, color: "#e1306c" },
  { match: /tiktok\.com/, Icon: TikTok, color: "#111111" },
  { match: /(^|\/\/|\.)(x|twitter)\.com/, Icon: XLogo, color: "#111111" },
  { match: /github\.com/, Icon: Github, color: "#24292f" },
  { match: /linkedin\.com/, Icon: Linkedin, color: "#0a66c2" },
  { match: /facebook\.com/, Icon: Facebook, color: "#1877f2" },
  { match: /twitch\.tv/, Icon: Twitch, color: "#9146ff" },
  { match: /^mailto:/, Icon: Mail, color: "var(--primary)" },
  { match: /substack|medium\.com|blog|\/rss|feed|^\/[^/]/, Icon: Rss, color: "#ff6719" },
]
const platformFor = (href: string) =>
  PLATFORMS.find((p) => p.match.test(href)) ?? { Icon: Globe as IconLike, color: "var(--primary)" }

const isInternal = (href: string) => href.startsWith("/") && !href.startsWith("//")

// Classic Linktree pill: solid, full-width, label centred.
function SocialButton({ item }: { item: GearItem }) {
  const { Icon, color } = platformFor(item.href)
  const className =
    "gear-social group relative flex min-h-14 items-center gap-3 rounded-full bg-foreground py-2 pl-2 pr-5 text-background shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
  const body = (
    <>
      <Stickers item={item} className="-top-3 right-6" />
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-white transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110"
        style={{ background: color }}
      >
        {item.image ? (
          <img src={item.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <Icon className="h-5 w-5" />
        )}
      </span>
      <span className="min-w-0 flex-1 text-center">
        <span className="block text-[15px] font-semibold leading-tight">{item.name}</span>
        {item.description && <span className="block truncate text-xs leading-snug opacity-60">{item.description}</span>}
      </span>
      {/* balances the icon so the label sits dead centre */}
      <span className="flex w-10 shrink-0 justify-end">
        <ArrowUpRight className="h-4 w-4 opacity-0 transition-all duration-200 group-hover:opacity-70" />
      </span>
    </>
  )
  return isInternal(item.href) ? (
    <Link href={item.href} className={`${className} ${item.tags.length ? "mt-3" : ""}`}>
      {body}
    </Link>
  ) : (
    <a href={item.href} target="_blank" rel="noopener noreferrer me" className={`${className} ${item.tags.length ? "mt-3" : ""}`}>
      {body}
    </a>
  )
}

// ── sponsored ──────────────────────────────────────────
function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(t)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      return setCopied(true)
    } catch {}
    // Older / embedded browsers without the async clipboard API.
    const el = document.createElement("textarea")
    el.value = code
    el.setAttribute("readonly", "")
    el.style.cssText = "position:fixed;opacity:0"
    document.body.appendChild(el)
    el.select()
    try {
      setCopied(document.execCommand("copy"))
    } catch {}
    el.remove()
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy discount code ${code}`}
      className="relative z-10 inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-primary/60 bg-primary/10 px-3 py-1.5 font-mono text-sm font-bold tracking-[0.15em] text-foreground transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {code}
      {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5 opacity-60" />}
      <span aria-live="polite" className="sr-only">{copied ? "copied" : ""}</span>
      {copied && (
        <span className="journe-hand absolute -top-6 right-0 rotate-[-4deg] text-base font-normal tracking-normal text-primary">
          copied!
        </span>
      )}
    </button>
  )
}

// A ticket: brand up top, a perforated tear line, then the code stub.
function CouponCard({ item }: { item: GearItem }) {
  return (
    <div className={`gear-coupon group relative rounded-2xl border-2 border-dashed bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${item.tags.length ? "mt-3" : ""}`}>
      <Stickers item={item} className="-top-3 right-4" />
      <div className="flex items-center gap-3 p-3 pr-4">
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl ring-1 ring-border ${
            item.image ? "bg-white" : "bg-primary/10"
          }`}
        >
          {item.image ? (
            <img src={item.image} alt="" loading="lazy" className="h-full w-full object-contain p-1.5" />
          ) : (
            <Ticket className="h-6 w-6 text-primary/70" strokeWidth={1.75} />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="mb-0.5 inline-block rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
            sponsored
          </span>
          <a
            {...linkProps(item)}
            className="block text-[15px] font-semibold leading-tight text-foreground after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none"
          >
            {item.name}
          </a>
          {item.description && (
            <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-muted-foreground">{item.description}</span>
          )}
        </span>
        {item.price && <Price price={item.price} />}
        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
      {item.code && (
        <div className="gear-coupon-stub relative flex items-center justify-between gap-3 border-t-2 border-dashed px-4 py-3">
          <span className="journe-hand text-lg leading-none text-muted-foreground">use my code →</span>
          <CopyCode code={item.code} />
        </div>
      )}
    </div>
  )
}

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
  const filterable = sections.filter((s) => s.kind !== "socials")
  const hasPicks = filterable.some((s) => s.items.some((i) => i.tags.length))

  // Socials only show on "all" — they're not something you filter for.
  const visible = sections
    .filter((s) => !filter || (s.kind !== "socials" && (filter === PICKS || s.slug === filter)))
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
        {filterable.map((s) => (
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
                section.kind === "socials" ? (
                  <SocialButton key={item.href + item.name} item={item} />
                ) : section.kind === "sponsored" ? (
                  <CouponCard key={item.href + item.name} item={item} />
                ) : item.image && item.tags.length ? (
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
