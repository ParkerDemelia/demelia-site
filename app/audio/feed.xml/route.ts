import { getEpisodes } from "@/lib/audio"

export const revalidate = 60

const esc = (s: string) =>
  s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!)
const type = (url: string) => (/\.mp3$/i.test(url) ? "audio/mpeg" : /\.m4a$/i.test(url) ? "audio/mp4" : "audio/wav")

export async function GET(request: Request) {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin
  const items = (await getEpisodes())
    .map(
      (e) => `
    <item>
      <title>${esc(e.title)}</title>
      <guid isPermaLink="false">${esc(e.id)}</guid>
      <pubDate>${new Date(e.date).toUTCString()}</pubDate>
      <enclosure url="${esc(e.url)}" length="${e.size}" type="${type(e.url)}"/>
    </item>`,
    )
    .join("")
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>audio · Parker Demelia</title>
    <link>${esc(site)}/audio</link>
    <description>Recordings from Parker Demelia.</description>
    <language>en-us</language>
    <itunes:author>Parker Demelia</itunes:author>${items}
  </channel>
</rss>`
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } })
}
