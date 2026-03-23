import { NextResponse } from "next/server"

export async function GET() {
  try {
    // YouTube RSS feed — uses channel handle
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${process.env.YOUTUBE_CHANNEL_ID || "UC32nEra4j36FonCMA1Fhk4w"}`

    const response = await fetch(rssUrl, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const xml = await response.text()
    const videos = parseYouTubeFeed(xml)

    return NextResponse.json({ videos })
  } catch (error) {
    console.error("Error fetching YouTube feed:", error)
    return NextResponse.json({ videos: [] })
  }
}

function parseYouTubeFeed(xml: string) {
  const entries: Array<{
    id: string
    title: string
    url: string
    thumbnail: string
    published: string
  }> = []

  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
  const matches = xml.matchAll(entryRegex)

  for (const match of Array.from(matches).slice(0, 6)) {
    const entry = match[1]
    const videoIdMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)
    const titleMatch = entry.match(/<title>(.*?)<\/title>/)
    const publishedMatch = entry.match(/<published>(.*?)<\/published>/)

    if (videoIdMatch && titleMatch) {
      const videoId = videoIdMatch[1]
      entries.push({
        id: videoId,
        title: titleMatch[1],
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        published: publishedMatch?.[1] || "",
      })
    }
  }

  return entries
}
