import { readFileSync } from "fs"
import { join } from "path"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"

const linkClass = "text-primary underline hover:brightness-125"

const markdownComponents: Components = {
  h2: ({ children }) => (
    <h2 className="text-lg font-semibold text-foreground mt-8 first:mt-0 mb-3">{children}</h2>
  ),
  ul: ({ children }) => <ul className="space-y-2 mb-6">{children}</ul>,
  li: ({ children }) => (
    <li className="text-sm text-foreground/90">{children}</li>
  ),
  a: ({ href, children }) => {
    if (!href) return <>{children}</>
    const external = href.startsWith("http") || href.startsWith("mailto:")
    return external ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {children}
      </a>
    ) : (
      <Link href={href} className={linkClass}>
        {children}
      </Link>
    )
  },
}

export default function WorkPage() {
  const workMarkdown = readFileSync(join(process.cwd(), "content", "work.md"), "utf-8")

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
        <p className="text-sm text-muted-foreground mb-8">web design, apps, and social media</p>

        <ReactMarkdown components={markdownComponents}>{workMarkdown}</ReactMarkdown>
      </div>
    </div>
  )
}
