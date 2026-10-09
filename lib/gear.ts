import { readFileSync } from "fs"
import { join } from "path"
import { rewriteEmbeds } from "./vault"

// The gear page lives in content/gear.md — "## Section" headings, then one item per line:
//
//   - [Cotopaxi Allpa 28L](https://amzn.to/...) {FAVORITE} {$180} - Backpack that... ![[allpa.jpg]]
//
// {WORD} → a sticker (HOT, FAVORITE, NEW, ... any word works), {$180} → a price tag,
// ![[photo.jpg]] (or ![](https://...)) → the product photo. All optional, any order.
const GEAR_PATH = join(process.cwd(), "content", "gear.md")

export type GearItem = {
  name: string
  href: string
  description: string
  tags: string[]
  price?: string
  image?: string
}

export type GearSection = { title: string; slug: string; items: GearItem[] }

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/
const IMAGE = /!\[[^\]]*\]\(<?([^)>]+?)>?\)/
const BRACES = /\{\s*([^}]+?)\s*\}/g

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

function parseItem(line: string): GearItem | null {
  let rest = line.replace(/^\s*[-*]\s+/, "")
  const image = rest.match(IMAGE)?.[1]
  rest = rest.replace(IMAGE, "")

  const link = rest.match(LINK)
  if (!link) return null
  rest = rest.replace(LINK, "")

  const tags: string[] = []
  let price: string | undefined
  rest = rest.replace(BRACES, (_, inner: string) => {
    const money = inner.match(/^\$\s*([\d,]+(?:\.\d{1,2})?)$/)
    if (money) price = `$${money[1]}`
    else tags.push(inner.toUpperCase())
    return ""
  })

  return {
    name: link[1].trim(),
    href: link[2],
    description: rest.replace(/^[\s\-–—:]+/, "").replace(/\s+/g, " ").trim(),
    tags,
    price,
    image,
  }
}

export function getGear(): GearSection[] {
  const md = rewriteEmbeds(readFileSync(GEAR_PATH, "utf-8").replace(/%%[\s\S]*?%%/g, ""))
  const sections: GearSection[] = []
  for (const line of md.split("\n")) {
    const heading = line.match(/^#{1,3}\s+(.+)$/)
    if (heading) {
      sections.push({ title: heading[1].trim(), slug: slugify(heading[1]), items: [] })
      continue
    }
    if (!/^\s*[-*]\s+/.test(line)) continue
    const item = parseItem(line)
    if (!item) continue
    if (!sections.length) sections.push({ title: "Gear", slug: "gear", items: [] })
    sections[sections.length - 1].items.push(item)
  }
  return sections.filter((s) => s.items.length)
}
