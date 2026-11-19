import { existsSync } from "fs"
import { join } from "path"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import ReactMarkdown from "react-markdown"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"
import { getCaseStudy, getCaseStudySlugs } from "@/lib/work"
import { resolveMedia, rewriteEmbeds } from "@/lib/vault"
import { Ref, host, inlineLink } from "@/components/ref"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

// One page per content/work/<slug>.md, written in Obsidian:
//   frontmatter  title · description (or summary) · link (shown under the title) · repo · logo (a file in content/attachments)
//   body         markdown; images are ![[file.webp|caption]] from content/attachments
export function generateStaticParams() {
  return getCaseStudySlugs().map((slug) => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const study = getCaseStudy(decodeURIComponent(params.slug))
  if (!study) return {}
  return { title: `${study.title} — Parker Demelia`, description: study.summary }
}

// A cover only shows if the file is really in public/ (the template's placeholder path isn't)
const publicFile = (src?: string) => (src && existsSync(join(process.cwd(), "public", src)) ? src : undefined)

export default function CaseStudyPage({ params }: { params: { slug: string } }) {
  const study = getCaseStudy(decodeURIComponent(params.slug))
  if (!study) notFound()

  const body = rewriteEmbeds(study.content.trim())
  const logo = study.logo ? resolveMedia(study.logo) : null
  const cover = publicFile(study.cover)

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <SiteHeader back="/work" />

        <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">{study.title}</h1>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-sm text-muted-foreground">
          {host(study.link) && (
            <Ref href={study.link} className="hover:text-primary transition-colors">
              {host(study.link)} ↗
            </Ref>
          )}
          {study.repo && (
            <Ref href={study.repo} className="hover:text-primary transition-colors">
              code ↗
            </Ref>
          )}
        </div>

        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="mt-8 block w-full rounded-xl ring-1 ring-border" />
        )}

        {body && (
          <article className="mt-8 text-[17px] leading-relaxed text-foreground/90">
            {/* Render like Obsidian: single line breaks stay breaks (remark-breaks), bare URLs become links (remark-gfm) */}
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={{
                h2: ({ children }) => <h2 className="mb-3 mt-10 text-2xl font-semibold text-foreground">{children}</h2>,
                h3: ({ children }) => <h3 className="mb-2 mt-8 text-lg font-semibold text-foreground">{children}</h3>,
                p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="mb-4 list-disc space-y-1 pl-5">{children}</ul>,
                ol: ({ children }) => <ol className="mb-4 list-decimal space-y-1 pl-5">{children}</ol>,
                blockquote: ({ children }) => <blockquote className="mb-4 border-l-2 border-border pl-4 italic text-muted-foreground">{children}</blockquote>,
                code: ({ children }) => <code className="rounded bg-muted px-1 py-0.5 font-mono text-[14px]">{children}</code>,
                pre: ({ children }) => <pre className="mb-6 overflow-x-auto rounded-xl bg-muted p-4 [&_code]:bg-transparent [&_code]:p-0">{children}</pre>,
                // the alias after | becomes a small caption under the screenshot
                img: ({ src, alt }) => (
                  <span className="my-8 block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} loading="lazy" className="block w-full rounded-xl ring-1 ring-border" />
                    {alt && <span className="mt-2 block text-center font-mono text-[11px] text-muted-foreground">{alt}</span>}
                  </span>
                ),
                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                a: ({ href, children }) => (
                  <Ref href={href} className={`inline ${inlineLink}`}>
                    {children}
                  </Ref>
                ),
              }}
            >
              {body}
            </ReactMarkdown>
          </article>
        )}

        {/* the logo signs off the post, bottom right */}
        {logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" width={72} height={72} className="-mt-16 ml-auto block h-[72px] w-[72px] rotate-6 drop-shadow-lg" />
        )}

        <SiteFooter />
      </main>
    </div>
  )
}
