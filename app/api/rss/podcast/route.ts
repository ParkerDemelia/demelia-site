import { NextResponse } from "next/server"

export async function GET() {
  try {
    // You'll need to replace this with your actual podcast RSS feed URL
    // Common sources: Anchor, Spotify for Podcasters, Apple Podcasts, etc.
    const podcastRssUrl = process.env.PODCAST_RSS_URL || "https://anchor.fm/s/your-podcast-id/podcast/rss"

    console.log("[v0] Attempting to fetch podcast RSS from:", podcastRssUrl)

    const response = await fetch(podcastRssUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RSS Reader)",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      console.log("[v0] Podcast RSS fetch failed with status:", response.status)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const rssText = await response.text()
    console.log("[v0] Successfully fetched podcast RSS, parsing...")

    const episodes = parsePodcastRSS(rssText)
    console.log("[v0] Parsed", episodes.length, "episodes from RSS")

    return NextResponse.json(episodes)
  } catch (error) {
    console.error("[v0] Error fetching podcast RSS:", error)

    // Return fallback mock data when RSS fails
    const fallbackEpisodes = [
      {
        title: "Welcome to My Podcast",
        description:
          "This is a placeholder episode. Configure your podcast RSS URL in environment variables to see real episodes.",
        date: new Date().toISOString().split("T")[0],
        url: "https://open.spotify.com/show/your-podcast-id",
        duration: "15:00",
      },
      {
        title: "Episode 42: Building Remote Teams",
        description: "A deep dive into the challenges and opportunities of building distributed teams in 2024.",
        date: "2024-01-12",
        url: "https://open.spotify.com/episode/your-episode-id",
        duration: "45:32",
      },
    ]

    return NextResponse.json(fallbackEpisodes)
  }
}

function parsePodcastRSS(rssText: string) {
  const episodes: Array<{
    title: string
    description: string
    date: string
    url: string
    duration?: string
  }> = []

  try {
    const itemRegex = /<item>(.*?)<\/item>/gs
    const items = rssText.match(itemRegex) || []

    items.slice(0, 4).forEach((item) => {
      const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/)
      const linkMatch = item.match(/<link>(.*?)<\/link>/)
      const descMatch =
        item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) ||
        item.match(/<description>(.*?)<\/description>/)
      const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/)
      const durationMatch = item.match(/<itunes:duration>(.*?)<\/itunes:duration>/)

      if (titleMatch && linkMatch) {
        episodes.push({
          title: titleMatch[1].trim(),
          description: descMatch ? descMatch[1].replace(/<[^>]*>/g, "").substring(0, 200) + "..." : "",
          date: dateMatch ? new Date(dateMatch[1]).toISOString().split("T")[0] : "",
          url: linkMatch[1].trim(),
          duration: durationMatch ? durationMatch[1] : undefined,
        })
      }
    })
  } catch (error) {
    console.error("[v0] Error parsing podcast RSS:", error)
  }

  return episodes
}
