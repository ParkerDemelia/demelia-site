"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Mail, Instagram, Github, Youtube, Rss, ExternalLink, Play, BookOpen, Briefcase, MapPin, ShoppingBag } from "lucide-react"
import { TripExpensesOverview } from "@/components/trip-expenses-widget"

interface Video {
  id: string
  title: string
  url: string
  thumbnail: string
  published: string
}

interface BlogPost {
  title: string
  excerpt: string
  date: string
  url: string
}


const SOCIAL_LINKS = [
  { name: "YouTube", url: "https://youtube.com/@parker.demelia", icon: Youtube },
  { name: "Instagram", url: "https://instagram.com/parker.demelia", icon: Instagram },
  { name: "Blog", url: "https://demelia.substack.com", icon: Rss },
  { name: "GitHub", url: "https://github.com/parkerdemelia", icon: Github },
  { name: "Email", url: "mailto:parker.demelia@gmail.com", icon: Mail },
]

const GEAR = [
  { name: "Cotopaxi Allpa 28L", url: "https://amzn.to/49UnBvc" },
  { name: "Altra Lone Peak 9+", url: "https://amzn.to/3ZrA2te" },
  { name: "Eddie Bauer Cloud Cap", url: "https://amzn.to/4r1xvBV" },
  { name: "DJI Osmo Pocket 3", url: "https://amzn.to/45fO98E" },
]



function timeAgo(dateStr: string) {
  if (!dateStr) return ""
  const now = new Date()
  const date = new Date(dateStr)
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return "today"
  if (days === 1) return "yesterday"
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

function CardShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border border-border rounded-lg bg-card p-4 ${className}`}>
      {children}
    </div>
  )
}

function CardHeader({ icon: Icon, title, href }: { icon: React.ElementType; title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{title}</span>
      </div>
      {href && (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  )
}

function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`h-3 bg-muted rounded animate-pulse ${className}`} />
}

function YouTubeWidget() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/youtube")
      .then(res => res.json())
      .then(data => setVideos(data.videos || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <CardShell className="col-span-full lg:col-span-2">
      <CardHeader icon={Play} title="recent videos" href="https://youtube.com/@parker.demelia" />
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <div className="aspect-video bg-muted rounded animate-pulse" />
              <SkeletonLine className="w-3/4" />
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <p className="text-sm text-muted-foreground">No videos found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {videos.slice(0, 3).map(video => (
            <a
              key={video.id}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group space-y-1.5"
            >
              <div className="relative aspect-video rounded overflow-hidden bg-muted">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
              <div>
                <p className="text-sm text-foreground font-medium line-clamp-2 group-hover:text-primary transition-colors">
                  {video.title}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{timeAgo(video.published)}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </CardShell>
  )
}

function BlogWidget() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/rss/substack")
      .then(res => res.json())
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <CardShell>
      <CardHeader icon={BookOpen} title="blog" href="https://demelia.substack.com" />
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-1.5">
              <SkeletonLine className="w-2/3" />
              <SkeletonLine className="w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.slice(0, 4).map(post => (
            <a
              key={post.url}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <p className="text-sm text-foreground font-medium group-hover:text-primary transition-colors line-clamp-1">
                {post.title}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {post.date ? timeAgo(post.date) : ""}
              </p>
            </a>
          ))}
        </div>
      )}
    </CardShell>
  )
}

function ExpensesWidget() {
  return (
    <CardShell>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>travel expenses</span>
        </div>
        <a href="/trip-expenses" className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      <TripExpensesOverview compact />
    </CardShell>
  )
}

const WORK_HIGHLIGHTS = [
  { name: "Hotel Terra Maya", category: "Web Design" },
  { name: "3 Hermanos", category: "Web Design" },
  { name: "Maine Purity Test", category: "App" },
  { name: "Thomas College", category: "Social Media" },
]

function ProjectsWidget() {
  return (
    <CardShell>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Briefcase className="h-4 w-4" />
          <span>work</span>
        </div>
        <Link href="/work" className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="space-y-2">
        {WORK_HIGHLIGHTS.map(h => (
          <div key={h.name} className="flex items-center justify-between">
            <span className="text-sm text-foreground">{h.name}</span>
            <span className="text-[10px] text-muted-foreground">{h.category}</span>
          </div>
        ))}
      </div>
      <Link href="/work" className="block mt-3 text-xs text-primary hover:underline">
        view all work →
      </Link>
    </CardShell>
  )
}

function GearWidget() {
  return (
    <CardShell>
      <CardHeader icon={ShoppingBag} title="gear" />
      <div className="space-y-1.5">
        {GEAR.map(item => (
          <a
            key={item.name}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between group text-sm"
          >
            <span className="text-foreground group-hover:text-primary transition-colors">{item.name}</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
          </a>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground/50 mt-3">affiliate links</p>
    </CardShell>
  )
}

export function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">parker demelia</h1>
            <p className="text-sm text-muted-foreground mt-0.5">building things, going places</p>
            <p className="text-[11px] text-muted-foreground/50 mt-1">
              <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">resume</a>
              <span className="mx-1">|</span>
              <a href="/cover.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">cover</a>
            </p>
          </div>
          <div className="flex items-center gap-1">
            {SOCIAL_LINKS.map(({ name, url, icon: Icon }) => (
              <a
                key={name}
                href={url}
                target={url.startsWith("mailto") ? undefined : "_blank"}
                rel={url.startsWith("mailto") ? undefined : "noopener noreferrer"}
                aria-label={name}
                className="p-2 text-muted-foreground/60 hover:text-foreground transition-colors"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
            {/* X (Twitter) */}
            <a
              href="https://x.com/parkerdemelia"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="p-2 text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@parker.demelia"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="p-2 text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.19 8.19 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.16z" />
              </svg>
            </a>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* YouTube — spans full width */}
          <YouTubeWidget />

          {/* Blog */}
          <BlogWidget />

          {/* Expenses */}
          <ExpensesWidget />

          {/* Projects */}
          <ProjectsWidget />

          {/* Gear / Affiliates */}
          <GearWidget />
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-[11px] text-muted-foreground/40">
          <a href="https://instagram.com/parker.demelia" target="_blank" rel="noopener noreferrer" className="hover:text-muted-foreground transition-colors">@parker.demelia</a>
        </footer>
      </div>
    </div>
  )
}
