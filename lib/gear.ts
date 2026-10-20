import { readFileSync } from "fs"
import { join } from "path"
import { rewriteEmbeds } from "./vault"

// The gear page lives in content/gear.md — "## Section" headings, then one item per line:
//
//   - [Cotopaxi Allpa 28L](https://amzn.to/...) {FAVORITE} {$180} - Backpack that... ![[allpa.jpg]]
//
// {WORD} → a sticker (HOT, FAVORITE, NEW, ... any word works), {$180} → a price tag,
// {code: PARKER15} → a copyable discount code, ![[photo.jpg]] (or ![](https://...)) → the photo.
// All optional, any order.
//
// Sections render in the order written. A heading can pick its style with a {kind}:
//   ## Find me {socials}      → big round buttons with the platform's icon (blog, YouTube, ...)
//   ## Partners {sponsored}   → coupon cards for brands that pay me / give me a code
// Without one, headings named like "socials"/"follow" or "sponsors"/"partners"/"codes" are
// picked up automatically; everything else is a product list.
const GEAR_PATH = join(process.cwd(), "content", "gear.md")

export type SectionKind = "products" | "socials" | "sponsored"

export type GearItem = {
  name: string
  href: string
  description: string
  tags: string[]
  price?: string
  code?: string
  image?: string
}

export type GearSection = { title: string; slug: string; kind: SectionKind; items: GearItem[] }

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/
const IMAGE = /!\[[^\]]*\]\(<?([^)>]+?)>?\)/
const BRACES = /\{\s*([^}]+?)\s*\}/g

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

function parseHeading(raw: string): Omit<GearSection, "items"> {
  let kind: SectionKind | undefined
  const title = raw
    .replace(BRACES, (all, inner: string) => {
      const k = inner.toLowerCase()
      if (/^(socials?|links?)$/.test(k)) kind = "socials"
      else if (/^(sponsor(ed|s)?|partners?|codes?)$/.test(k)) kind = "sponsored"
      else return all
      return ""
    })
    .trim()
  kind ??= /social|follow|find me|elsewhere/i.test(title)
    ? "socials"
    : /sponsor|partner|discount|code|deal/i.test(title)
      ? "sponsored"
      : "products"
  return { title, slug: slugify(title), kind }
}

function parseItem(line: string): GearItem | null {
  let rest = line.replace(/^\s*[-*]\s+/, "")
  const image = rest.match(IMAGE)?.[1]
  rest = rest.replace(IMAGE, "")

  const link = rest.match(LINK)
  if (!link) return null
  rest = rest.replace(LINK, "")

  const tags: string[] = []
  let price: string | undefined
  let code: string | undefined
  rest = rest.replace(BRACES, (_, inner: string) => {
    const money = inner.match(/^\$\s*([\d,]+(?:\.\d{1,2})?)$/)
    const promo = inner.match(/^code\s*[:=]?\s*(\S+)$/i)
    if (money) price = `$${money[1]}`
    else if (promo) code = promo[1]
    else tags.push(inner.toUpperCase())
    return ""
  })

  return {
    name: link[1].trim(),
    href: link[2],
    description: rest.replace(/^[\s\-–—:]+/, "").replace(/\s+/g, " ").trim(),
    tags,
    price,
    code,
    image,
  }
}

export function getGear(): GearSection[] {
  const md = rewriteEmbeds(readFileSync(GEAR_PATH, "utf-8").replace(/%%[\s\S]*?%%/g, ""))
  const sections: GearSection[] = []
  for (const line of md.split("\n")) {
    const heading = line.match(/^#{1,3}\s+(.+)$/)
    if (heading) {
      sections.push({ ...parseHeading(heading[1]), items: [] })
      continue
    }
    if (!/^\s*[-*]\s+/.test(line)) continue
    const item = parseItem(line)
    if (!item) continue
    if (!sections.length) sections.push({ title: "Gear", slug: "gear", kind: "products", items: [] })
    sections[sections.length - 1].items.push(item)
  }
  return sections.filter((s) => s.items.length)
}
