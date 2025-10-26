"use client"

import { useEffect, useState } from "react"

interface BlogPost {
  title: string
  url: string
  date?: string
}

export function LinkedBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/rss/substack")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Only take required fields
          setPosts(
            data.map((post: any) => ({
              title: post.title,
              url: post.url,
              date: post.date,
            }))
          )
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching linked blog posts:", error)
        // Fallback to example links
        setPosts([
          {
            title: "Building in Public: My Latest Project",
            url: "https://parkerdemelia.substack.com/p/building-in-public",
            date: "2024-01-15",
          },
          {
            title: "Remote Work from Bali: A Digital Nomad's Guide",
            url: "https://parkerdemelia.substack.com/p/remote-work-bali",
            date: "2024-01-10",
          },
        ])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>
  }

  // Group posts by 3 per line
  const rows = []
  for (let i = 0; i < posts.length; i += 6) {
    rows.push(posts.slice(i, i + 3))
  }

  return (
    <div className="space-y-1">
      {rows.map((row, idx) => (
        <div key={idx} className="flex flex-wrap gap-x-2 text-foreground justify-center">
          {row.map((post, j) => (
            <span key={post.url}>
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {post.title}
              </a>
              {j !== row.length - 1 && (
                <span className="mx-2 text-muted-foreground">//</span>
              )}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}