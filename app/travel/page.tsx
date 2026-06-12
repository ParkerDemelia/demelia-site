import { readFileSync } from "fs"
import { join } from "path"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"

const linkClass = "text-primary underline hover:brightness-125"

const markdownComponents: Components = {
  h2: ({ children }) => (
    <h2 className="relative text-lg font-semibold text-foreground mt-10 first:mt-0 mb-2 before:content-[''] before:absolute before:-left-[1.6rem] before:top-1.5 before:h-2.5 before:w-2.5 before:rounded-full before:bg-foreground before:ring-4 before:ring-background">
      {children}
    </h2>
  ),
  p: ({ children }) => <p className="text-[15px] leading-relaxed text-foreground/90 mb-4">{children}</p>,
  ul: ({ children }) => <ul className="space-y-2 mb-6">{children}</ul>,
  li: ({ children }) => <li className="text-sm text-foreground/90">{children}</li>,
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

export default function TravelPage() {
  const travelMarkdown = readFileSync(join(process.cwd(), "content", "travel.md"), "utf-8")

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

        <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">travel</h1>
        <p className="text-sm text-muted-foreground mb-10">where I&apos;ve been and where I&apos;m headed</p>

        <div className="relative border-l border-border pl-7 ml-1">
          <ReactMarkdown components={markdownComponents}>{travelMarkdown}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
