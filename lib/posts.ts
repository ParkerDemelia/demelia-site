import sanitizeHtml from "sanitize-html"

// The blog is the Substack feed — write on Substack and /blog (plus "Latest" on home) picks it up within the hour.
// Each post is shown in full at /blog/<slug>. The feed only carries the latest 20 posts.
export const SUBSTACK = "https://demelia.substack.com"
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export type Post = {
  slug: string
  title: string
  href: string // /blog/<slug>
  substackUrl: string
  date: string // yyyy-mm-dd
  teaser?: string
  cover?: string
  html: string
}

// "2026-10-10" → "Oct 2026"
export function monthLabel(date: string) {
  if (!date) return ""
  const [y, m] = date.split("-").map(Number)
  return `${MONTHS[m - 1]} ${y}`
}

// "&#8216;mil&#8217;" → "‘mil’"
const decode = (s: string) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")

const tag = (xml: string, name: string) => {
  const raw = xml.match(new RegExp(`<${name}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${name}>`))?.[1]?.trim()
  return raw && decode(raw)
}

// Substack serves full-size originals (8000px+) — ask its image CDN for a thumbnail instead.
function thumb(url: string) {
  const original = url.startsWith("https://substackcdn.com/image/fetch/") ? decodeURIComponent(url.split("/").slice(6).join("/")) : url
  return `https://substackcdn.com/image/fetch/w_320,h_320,c_fill,f_auto,q_auto:good/${encodeURIComponent(original)}`
}

// Keep the writing (text, quotes, lists, photos, links) and drop Substack's own widgets —
// subscribe boxes, buttons, image-expand icons — since the site has its own subscribe form.
function cleanPost(html: string) {
  const stripped = html
    .replace(/<div class="subscription-widget-wrap[\s\S]*?<\/form><\/div><\/div>/g, "")
    .replace(/<p class="button-wrapper"[\s\S]*?<\/p>/g, "")
  return sanitizeHtml(stripped, {
    allowedTags: ["p", "br", "hr", "h2", "h3", "h4", "blockquote", "ul", "ol", "li", "a", "em", "strong", "b", "i", "s", "code", "pre", "figure", "figcaption", "img"],
    allowedAttributes: { a: ["href"], img: ["src", "srcset", "sizes", "alt", "width", "height"] },
    allowedSchemes: ["https", "mailto"],
    nonTextTags: ["script", "style", "textarea", "option", "noscript", "form", "button", "svg"],
    transformTags: {
      h1: "h2",
      a: (tagName, attribs) => ({ tagName, attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer" } }),
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
    },
    // Substack uses empty <p></p> as spacers, and the removed widgets leave empty quotes behind
    exclusiveFilter: (frame) => ["p", "blockquote"].includes(frame.tag) && !frame.text.trim() && !frame.mediaChildren.length,
  })
}

export async function getPost(slug: string) {
  return (await getPosts()).find((p) => p.slug === slug)
}

export async function getPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${SUBSTACK}/feed`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const xml = await res.text()
    // Posts without their own image fall back to the publication logo — skip those covers.
    const logo = xml.match(/<image>\s*<url>([^<]+)<\/url>/)?.[1]
    return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].flatMap(([, item]): Post[] => {
      const title = tag(item, "title")
      const link = tag(item, "link")
      const slug = link?.match(/\/p\/([^/?#]+)/)?.[1]
      if (!title || !link || !slug) return []
      const pubDate = tag(item, "pubDate")
      const enclosure = item.match(/<enclosure url="([^"]+)"/)?.[1]
      return [
        {
          slug,
          title,
          href: `/blog/${slug}`,
          substackUrl: link,
          date: pubDate ? new Date(pubDate).toISOString().slice(0, 10) : "",
          teaser: tag(item, "description"),
          cover: enclosure && enclosure !== logo ? thumb(enclosure) : undefined,
          html: cleanPost(item.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/)?.[1] ?? ""),
        },
      ]
    })
  } catch {
    return []
  }
}
