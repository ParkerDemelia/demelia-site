import { readFileSync } from "fs"
import { join } from "path"
import type { Metadata } from "next"
import matter from "gray-matter"
import ReactMarkdown from "react-markdown"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"
import { Ref, host, inlineLink } from "@/components/ref"
import { resolveMedia, rewriteEmbeds } from "@/lib/vault"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

// Edit content/work/juegaespanol.md — frontmatter title/description/link (shown as the subtitle)/logo (a file in content/attachments), markdown body below.
// Images: ![[file.webp|caption]] from content/attachments, same as in Obsidian.
function getPage() {
  const { data, content } = matter(readFileSync(join(process.cwd(), "content", "work", "juegaespanol.md"), "utf-8"))
  return { title: (data.title as string) ?? "learn spanish", description: data.description as string | undefined, link: data.link as string | undefined, logo: data.logo ? resolveMedia(String(data.logo)) : null, body: rewriteEmbeds(content.trim()) }
}

export function generateMetadata(): Metadata {
  const { title, description } = getPage()
  return { title: `${title} — Parker Demelia`, description }
}

export default function JuegaEspanolPage() {
  const { title, link, logo, body } = getPage()

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <SiteHeader />

        <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">{title}</h1>
        {host(link) && (
          <Ref href={link} className="mt-3 inline-block font-mono text-sm text-muted-foreground hover:text-primary transition-colors">
            {host(link)} ↗
          </Ref>
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
