"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, Star, Heart, MessageCircle, MapPin } from "lucide-react"
import { useEffect, useState } from "react"

interface InstagramPost {
  id: string
  media_url: string
  caption: string
  timestamp: string
  permalink: string
  likesCount?: number
  locationName?: string
  commentsCount?: number
}

interface GitHubProject {
  id: number
  name: string
  description: string
  url: string
  language: string
  stars: number
  updated: string
}

export function SocialSection() {
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([])
  const [githubProjects, setGithubProjects] = useState<GitHubProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/instagram").then(async (res) => {
        console.log("[v0] Instagram API response status:", res.status)
        const data = await res.json()
        console.log("[v0] Instagram API response data:", data)
        return data
      }),
      fetch("/api/github").then((res) => res.json()),
    ])
      .then(([instagramData, githubData]) => {
        console.log("[v0] Processing Instagram data:", instagramData)
        if (Array.isArray(instagramData)) {
          setInstagramPosts(instagramData)
        }
        if (githubData.projects && Array.isArray(githubData.projects)) {
          setGithubProjects(githubData.projects)
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching social data:", error)
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-12">
      {/* Instagram Section */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground">Instagram</h2>
          <p className="text-muted-foreground">Life updates and behind-the-scenes</p>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">Loading Instagram posts...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {instagramPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={`/api/image-proxy?url=${encodeURIComponent(post.media_url)}`}
                    alt={post.caption || "Instagram Post"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = `/placeholder.svg?height=400&width=400&query=Instagram post ${post.caption?.slice(0, 30) || "social media"}`
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                    <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.073-1.689-.073-4.948 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm text-foreground line-clamp-3">{post.caption}</p>
                  {post.locationName && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {post.locationName}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      {post.likesCount !== undefined && post.likesCount >= 0 && (
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {post.likesCount}
                        </div>
                      )}
                      {post.commentsCount !== undefined && post.commentsCount >= 0 && (
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {post.commentsCount}
                        </div>
                      )}
                    </div>
                    <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={post.permalink} target="_blank" rel="noopener noreferrer">
                      View Post <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center">
          <Button variant="outline" asChild>
            <a href="https://instagram.com/parker.demelia" target="_blank" rel="noopener noreferrer">
              View on Instagram <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* Software Projects Section */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground">Software Projects</h2>
          <p className="text-muted-foreground">Latest repositories from GitHub</p>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">Loading GitHub projects...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {githubProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Github className="h-5 w-5" />
                    {project.name}
                  </CardTitle>
                  <CardDescription className="text-sm">{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{project.language || "Unknown"}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {project.stars}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Updated {new Date(project.updated).toLocaleDateString()}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={project.url} target="_blank" rel="noopener noreferrer">
                      View on GitHub <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center">
          <Button variant="outline" asChild>
            <a href="https://github.com/parkerdemelia" target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-4 w-4" />
              View All Projects
            </a>
          </Button>
        </div>
      </section>
    </div>
  )
}
