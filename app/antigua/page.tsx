import { readFileSync } from "fs"
import { join } from "path"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"

const linkClass = "text-primary underline hover:brightness-125"

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">{children}</h2>
  ),
  p: ({ children }) => <p className="text-[15px] leading-relaxed text-foreground/90 mb-4">{children}</p>,
  ul: ({ children }) => <ul className="space-y-2 mb-6">{children}</ul>,
  li: ({ children }) => (
    <li className="text-sm text-foreground/90">{children}</li>
  ),
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
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

export default function AntiguaPage() {
  const markdown = readFileSync(join(process.cwd(), "content", "antigua.md"), "utf-8")

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

        <ReactMarkdown components={markdownComponents}>{markdown}</ReactMarkdown>
      </div>
    </div>
  )
}
