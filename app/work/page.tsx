import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getCaseStudies } from "@/lib/work"

// Add a case study by dropping a markdown file in content/work/ (see content/work/_template.md)
export default function WorkPage() {
  const studies = getCaseStudies()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          back
        </Link>

        <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">work</h1>
        <p className="text-sm text-muted-foreground mb-10">case studies of things I&apos;ve built</p>

        {studies.length === 0 ? (
          <p className="text-sm text-muted-foreground">coming soon.</p>
        ) : (
          <ul className="space-y-8">
            {studies.map((s) => (
              <li key={s.slug}>
                <Link href={`/work/${s.slug}`} className="group block">
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {s.title}
                    </h2>
                    {s.date && <span className="text-xs text-muted-foreground shrink-0">{s.date.slice(0, 4)}</span>}
                  </div>
                  {s.summary && <p className="text-sm text-foreground/80 mt-1">{s.summary}</p>}
                  {s.stack && (
                    <p className="text-xs text-muted-foreground mt-2">{s.stack.join(" · ")}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
