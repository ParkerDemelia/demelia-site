"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, ExternalLink } from "lucide-react"
import { useEffect, useState } from "react"

interface PodcastEpisode {
  title: string
  description: string
  date: string
  url: string
  duration?: string
}

export function PodcastSection() {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/rss/podcast")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEpisodes(data)
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching podcast episodes:", error)
        setEpisodes([
          {
            title: "Episode 42: Building Remote Teams",
            description: "A deep dive into the challenges and opportunities of building distributed teams in 2024.",
            date: "2024-01-12",
            url: "https://open.spotify.com/episode/your-episode-id",
            duration: "45:32",
          },
        ])
        setLoading(false)
      })
  }, [])

  const latestEpisode = episodes[0]

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground">Podcast</h2>
          <p className="text-muted-foreground">Loading latest episodes...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Podcast</h2>
        <p className="text-muted-foreground">Conversations about tech, entrepreneurship, and remote work</p>
      </div>

      {latestEpisode && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Latest Episode</CardTitle>
            <CardDescription>{latestEpisode.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted rounded-lg p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <Play className="h-8 w-8 text-primary-foreground ml-1" />
              </div>
              <div>
                <h3 className="font-semibold">{latestEpisode.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {latestEpisode.duration && `${latestEpisode.duration} • `}
                  {new Date(latestEpisode.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">{latestEpisode.description}</p>
            </div>

            <div className="flex justify-center gap-4">
              <Button asChild>
                <a href={latestEpisode.url} target="_blank" rel="noopener noreferrer">
                  Listen on Spotify <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/api/rss/podcast" target="_blank" rel="noopener noreferrer">
                  RSS Feed
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
