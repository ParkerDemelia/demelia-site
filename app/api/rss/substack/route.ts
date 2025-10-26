import { NextResponse } from "next/server"

export async function GET() {
  try {
    // You'll need to replace this with your actual Substack username
    const substackUsername = process.env.SUBSTACK_USERNAME || "demelia"
    const rssUrl = `https://${substackUsername}.substack.com/feed`

    console.log("[v0] Attempting to fetch Substack RSS from:", rssUrl)

    const response = await fetch(rssUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RSS Reader)",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      console.log("[v0] Substack RSS fetch failed with status:", response.status)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const rssText = await response.text()
    console.log("[v0] Successfully fetched RSS, parsing...")

    // Parse RSS XML to extract posts
    const posts = parseRSSFeed(rssText)
    console.log("[v0] Parsed", posts.length, "posts from RSS")

    return NextResponse.json(posts)
  } catch (error) {
    console.error("[v0] Error fetching Substack RSS:", error)

    // Return fallback mock data when RSS fails
    const fallbackPosts = [
      {
        title: "Welcome to My Blog",
        excerpt:
          "This is a placeholder post. Configure your Substack username in environment variables to see real posts.",
        date: new Date().toISOString().split("T")[0],
        url: "https://parkerdemelia.substack.com",
      },
      {
        title: "Building in Public: My Latest Project",
        excerpt:
          "Sharing the journey of creating something new, the challenges faced, and lessons learned along the way.",
        date: "2024-01-15",
        url: "https://parkerdemelia.substack.com/p/building-in-public",
      },
      {
        title: "Remote Work from Bali: A Digital Nomad's Guide",
        excerpt:
          "Everything you need to know about working remotely from one of the world's most beautiful destinations.",
        date: "2024-01-10",
        url: "https://parkerdemelia.substack.com/p/remote-work-bali",
      },
    ]

    return NextResponse.json(fallbackPosts)
  }
}

function parseRSSFeed(rssText: string) {
  const posts: Array<{
    title: string
    excerpt: string
    date: string
    url: string
  }> = []

  try {
    // Extract items using regex (basic implementation)
    const itemRegex = /<item>(.*?)<\/item>/gs
    const items = rssText.match(itemRegex) || []

    items.slice(0, 8).forEach((item) => {
      const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/)
      const linkMatch = item.match(/<link>(.*?)<\/link>/)
      const descMatch =
        item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) ||
        item.match(/<description>(.*?)<\/description>/)
      const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/)

      if (titleMatch && linkMatch) {
        posts.push({
          title: titleMatch[1].trim(),
          excerpt: descMatch ? descMatch[1].replace(/<[^>]*>/g, "").substring(0, 150) + "..." : "",
          date: dateMatch ? new Date(dateMatch[1]).toISOString().split("T")[0] : "",
          url: linkMatch[1].trim(),
        })
      }
    })
  } catch (error) {
    console.error("[v0] Error parsing RSS:", error)
  }

  return posts
}
