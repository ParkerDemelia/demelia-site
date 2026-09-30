import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"
import type { Metadata } from "next"
import { getCaseStudy, getCaseStudySlugs } from "@/lib/work"

const linkClass = "text-primary underline hover:brightness-125"

const markdownComponents: Components = {
  h2: ({ children }) => (
    <h2 className="text-lg font-semibold text-foreground mt-10 first:mt-0 mb-3">{children}</h2>
  ),
  h3: ({ children }) => <h3 className="text-base font-semibold text-foreground mt-6 mb-2">{children}</h3>,
  p: ({ children }) => <p className="text-[15px] leading-relaxed text-foreground/90 mb-4">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 space-y-2 mb-6">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 space-y-2 mb-6">{children}</ol>,
  li: ({ children }) => <li className="text-[15px] text-foreground/90">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-border pl-4 text-muted-foreground italic mb-4">{children}</blockquote>
  ),
  code: ({ children }) => (
    <code className="font-mono text-[13px] bg-muted rounded px-1 py-0.5">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="bg-muted rounded-md p-4 overflow-x-auto mb-6 [&_code]:bg-transparent [&_code]:p-0">{children}</pre>
  ),
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} className="rounded-md border border-border my-6 w-full" />
  ),
  hr: () => <hr className="border-border my-10" />,
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

export function generateStaticParams() {
  return getCaseStudySlugs().map((slug) => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const study = getCaseStudy(params.slug)
  if (!study) return {}
  return { title: `${study.title} — Parker Demelia`, description: study.summary }
}

export default function CaseStudyPage({ params }: { params: { slug: string } }) {
  const study = getCaseStudy(params.slug)
  if (!study) notFound()

  const links = [
    study.link && { label: "live", href: study.link },
    study.repo && { label: "code", href: study.repo },
  ].filter(Boolean) as { label: string; href: string }[]

  return (
    <div className="min-h-screen bg-background">
      <article className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          href="/work"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          work
        </Link>

        <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">{study.title}</h1>
        {study.summary && <p className="text-sm text-muted-foreground mb-4">{study.summary}</p>}

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-10">
          {study.date && <span>{study.date}</span>}
          {study.role && <span>{study.role}</span>}
          {study.stack && <span>{study.stack.join(" · ")}</span>}
          {links.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {l.label}
            </a>
          ))}
        </div>

        {study.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={study.cover} alt="" className="rounded-md border border-border mb-10 w-full" />
        )}

        <ReactMarkdown components={markdownComponents}>{study.content}</ReactMarkdown>
      </article>
    </div>
  )
}
