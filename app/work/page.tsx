"use client"

import { useState } from "react"
import Link from "next/link"
import { ExternalLink, ArrowLeft } from "lucide-react"

type WorkCategory = "web-design" | "apps" | "social-media"

interface WorkProject {
  title: string
  description: string
  category: WorkCategory
  url?: string
  tags: string[]
}

const CATEGORY_META: Record<WorkCategory, { label: string; color: string }> = {
  "web-design": {
    label: "Web Design",
    color: "oklch(0.7 0.15 200)",
  },
  apps: {
    label: "Apps & Experiments",
    color: "oklch(0.8 0.15 120)",
  },
  "social-media": {
    label: "Social Media",
    color: "oklch(0.75 0.15 320)",
  },
}

const PROJECTS: WorkProject[] = [
  // Web Design
  {
    title: "Hotel Terra Maya",
    description: "Full website design and development for a boutique hotel in Guatemala.",
    category: "web-design",
    url: "https://www.hotelterramaya.com/",
    tags: ["Client", "Hospitality"],
  },
  {
    title: "3 Hermanos",
    description: "Website for a restaurant in Antigua, Guatemala.",
    category: "web-design",
    url: "http://3hermanosantigua.com/",
    tags: ["Client", "Restaurant"],
  },
  {
    title: "DB Audio",
    description: "Brand website for a professional audio company.",
    category: "web-design",
    tags: ["Client", "Audio"],
  },
  {
    title: "DB Woodworking",
    description: "Website for a custom woodworking business.",
    category: "web-design",
    tags: ["Client", "Craftsmanship"],
  },
  // Apps & Experiments
  {
    title: "Maine Purity Test",
    description: "How Maine are you? A viral purity test for Mainers.",
    category: "apps",
    url: "https://mainepuritytest.vercel.app/",
    tags: ["Next.js", "Viral"],
  },
  {
    title: "LogoX",
    description: "Browser-based logo editor with real-time preview and export.",
    category: "apps",
    url: "https://logox-phi.vercel.app/editor?logo=tech-cube",
    tags: ["React", "Canvas", "Design Tool"],
  },
  {
    title: "RateMyProfessor",
    description: "AI-powered professor rating aggregator and analysis tool.",
    category: "apps",
    url: "https://x.com/parkerdemelia/status/1886609851624907170",
    tags: ["AI", "Python"],
  },
  {
    title: "Genetic Algorithm",
    description: "Visual genetic algorithm simulation and optimizer.",
    category: "apps",
    url: "https://x.com/parkerdemelia/status/1892753273716875562",
    tags: ["Algorithm", "Visualization"],
  },
  {
    title: "Gimmethevibe",
    description: "Mood-based music and vibe discovery app.",
    category: "apps",
    url: "https://gimmethevibe.vercel.app/",
    tags: ["Next.js", "API"],
  },
  {
    title: "Pathfinder",
    description: "Interactive pathfinding algorithm visualizer.",
    category: "apps",
    url: "https://pathfinder-beta-three.vercel.app/",
    tags: ["Algorithm", "Visualization"],
  },
  {
    title: "Elite",
    description: "Fitness tracking and workout planning app.",
    category: "apps",
    url: "https://elite-two-blond.vercel.app/",
    tags: ["Next.js", "Fitness"],
  },
  {
    title: "Hangman",
    description: "Classic hangman game with a modern twist.",
    category: "apps",
    url: "https://hangman-nine-zeta-31.vercel.app/",
    tags: ["Game", "React"],
  },
  {
    title: "Fortune Cookie",
    description: "Digital fortune cookie generator.",
    category: "apps",
    url: "https://myfortune-steel.vercel.app/",
    tags: ["Fun", "React"],
  },
  {
    title: "The Coffee House",
    description: "Coffee shop landing page and menu.",
    category: "apps",
    url: "https://thecoffeehouse-kappa.vercel.app/",
    tags: ["Landing Page", "Design"],
  },
  {
    title: "Plantify",
    description: "Plant care and identification app. School project.",
    category: "apps",
    tags: ["School", "React"],
  },
  // Social Media
  {
    title: "Thomas College",
    description: "Social media content strategy and management for Thomas College.",
    category: "social-media",
    tags: ["Higher Ed", "Content Strategy"],
  },
  {
    title: "Healthy Habitat",
    description: "Social media management and content creation for a wellness brand.",
    category: "social-media",
    tags: ["Wellness", "Content Creation"],
  },
  {
    title: "Minot Country Store",
    description: "Social media presence and engagement for a local country store.",
    category: "social-media",
    tags: ["Local Business", "Community"],
  },
]

export default function WorkPage() {
  const [activeCategory, setActiveCategory] = useState<WorkCategory | null>(null)

  const filtered = activeCategory
    ? PROJECTS.filter(p => p.category === activeCategory)
    : PROJECTS

  const categories = Object.entries(CATEGORY_META) as [WorkCategory, typeof CATEGORY_META[WorkCategory]][]

  // Group filtered projects by category for display
  const grouped = categories
    .filter(([key]) => !activeCategory || activeCategory === key)
    .map(([key, meta]) => ({
      key,
      ...meta,
      projects: filtered.filter(p => p.category === key),
    }))
    .filter(g => g.projects.length > 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          back
        </Link>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">work</h1>
          <p className="text-sm text-muted-foreground mt-2">web design, apps, and social media</p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 justify-center flex-wrap mb-10">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeCategory === null
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            All
          </button>
          {categories.map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeCategory === key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {meta.label}
            </button>
          ))}
        </div>

        {/* Category sections */}
        <div className="space-y-10">
          {grouped.map(group => (
            <section key={group.key}>
              {/* Category header */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: group.color }}
                />
                <span className="text-sm font-semibold text-foreground">{group.label}</span>
                <div className="flex-1 h-px bg-border" />
                <span className="text-[11px] text-muted-foreground">{group.projects.length} projects</span>
              </div>

              {/* Project cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.projects.map(project => (
                  <div
                    key={project.title}
                    className="group border border-border rounded-lg bg-card p-4 hover:border-muted-foreground/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.tags.map(tag => (
                            <span
                              key={tag}
                              className="inline-block px-1.5 py-0.5 rounded text-[10px] text-muted-foreground border border-border"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 p-1.5 text-muted-foreground/40 hover:text-foreground transition-colors"
                          aria-label={`Visit ${project.title}`}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-[11px] text-muted-foreground/40">
          <Link href="/" className="hover:text-muted-foreground transition-colors">
            @parker.demelia
          </Link>
        </footer>
      </div>
    </div>
  )
}
