"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { useEffect, useState } from "react"

interface BlogPost {
  title: string
  excerpt: string
  date: string
  url: string
}

export function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/rss/substack")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPosts(data)
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching blog posts:", error)
        // Fallback to mock data if RSS fails
        setPosts([
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
        ])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground">Latest from the Blog</h2>
          <p className="text-muted-foreground">Loading latest posts...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Latest from the Blog</h2>
        <p className="text-muted-foreground">Thoughts on tech, travel, and life</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
              <Button variant="outline" size="sm" asChild>
                <a href={post.url} target="_blank" rel="noopener noreferrer">
                  Read More <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button asChild>
          <a href="https://parkerdemelia.substack.com" target="_blank" rel="noopener noreferrer">
            View All Posts <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </section>
  )
}
