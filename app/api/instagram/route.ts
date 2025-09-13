import { NextResponse } from "next/server"

export async function GET() {
  try {
    const datasetId = process.env.APIFY_DATASET_ID
    const token = process.env.APIFY_API_TOKEN

    if (!datasetId || !token) {
      console.error("Missing Apify credentials - datasetId:", !!datasetId, "token:", !!token)
      return NextResponse.json({ error: "Missing API credentials" }, { status: 500 })
    }

    if (!datasetId.match(/^[a-zA-Z0-9_-]+$/)) {
      console.error("Invalid dataset ID format:", datasetId)
      return NextResponse.json({ error: "Invalid dataset ID format" }, { status: 400 })
    }

    const url = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}&limit=6&desc=true`
    console.log("Fetching from Apify URL:", url.replace(token, "***TOKEN***"))

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Apify API error: ${response.status} - ${errorText}`)
      throw new Error(`Apify API error: ${response.status}`)
    }

    const posts = await response.json()
    console.log("Received posts from Apify:", posts.length)

    const sortedPosts = posts.sort((a: any, b: any) => {
      const dateA = new Date(a.timestamp || 0).getTime()
      const dateB = new Date(b.timestamp || 0).getTime()
      return dateB - dateA // Descending order (newest first)
    })

    const transformedPosts = sortedPosts.slice(0, 6).map((post: any) => {
      const imageUrl = post.displayUrl || post.images?.[0] || "/placeholder.svg"

      console.log(`Post ${post.id}: displayUrl = ${post.displayUrl}`)
      console.log(`Post ${post.id}: images[0] = ${post.images?.[0]}`)
      console.log(`Post ${post.id}: final imageUrl = ${imageUrl}`)

      return {
        id: post.id || post.shortCode || Math.random().toString(),
        media_url: imageUrl,
        caption: post.caption || "",
        timestamp: post.timestamp || new Date().toISOString(),
        permalink: post.url || `https://instagram.com/p/${post.shortCode}`,
        likesCount: post.likesCount || 0,
        locationName: post.locationName || null,
        commentsCount: post.commentsCount || 0,
      }
    })

    return NextResponse.json(transformedPosts)
  } catch (error) {
    console.error("Error fetching Instagram posts:", error)

    // Fallback to mock data if Apify fails
    const mockPosts = [
      {
        id: "1",
        media_url: "/sunset-coding-session-bali.jpg",
        caption: "Sunset coding session in Bali 🌅 #digitalnomad #coding",
        timestamp: "2024-01-14T18:30:00Z",
        permalink: "https://instagram.com/p/example1",
        likesCount: 142,
        locationName: "Bali, Indonesia",
        commentsCount: 8,
      },
      {
        id: "2",
        media_url: "/coffee-shop-workspace-laptop.jpg",
        caption: "Found the perfect coffee shop for deep work ☕️ #remotework",
        timestamp: "2024-01-12T10:15:00Z",
        permalink: "https://instagram.com/p/example2",
        likesCount: 89,
        locationName: "Austin, Texas",
        commentsCount: 5,
      },
      {
        id: "3",
        media_url: "/tech-conference-networking.jpg",
        caption: "Great conversations at TechConf 2024 🚀 #networking",
        timestamp: "2024-01-10T16:45:00Z",
        permalink: "https://instagram.com/p/example3",
        likesCount: 203,
        locationName: "San Francisco, CA",
        commentsCount: 12,
      },
    ]

    return NextResponse.json(mockPosts)
  }
}
