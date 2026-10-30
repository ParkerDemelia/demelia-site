import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react"
import { getPost, getPosts, monthLabel } from "@/lib/posts"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { SubscribeForm } from "@/components/subscribe-form"

export const revalidate = 3600

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }))
}

// Canonical points at Substack so search engines don't count the post twice.
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return { title: "Parker Demelia" }
  return { title: `${post.title} — Parker Demelia`, description: post.teaser, alternates: { canonical: post.substackUrl } }
}

const letters = (s: string) => s.toLowerCase().replace(/&[^;\s]+;|[^a-z0-9]/g, "")

// A Substack post in full, in the site's own type. Styles for the post HTML: .post-body in app/globals.css
export default async function PostPage({ params }: { params: { slug: string } }) {
  const posts = await getPosts()
  const i = posts.findIndex((p) => p.slug === params.slug)
  if (i === -1) notFound()
  const post = posts[i]
  // "next" = the next one back in time, the way you'd keep reading down the blog
  const next = posts[i + 1]

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <SiteHeader active="blog" />
        <article>
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{monthLabel(post.date)}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{post.title}</h1>
          {/* Substack's default subtitle is the opening line — skip it when the post starts the same way */}
          {post.teaser && !letters(post.html.replace(/<[^>]+>/g, "")).startsWith(letters(post.teaser)) && (
            <p className="mt-3 text-lg text-muted-foreground">{post.teaser}</p>
          )}
          <div className="post-body mt-10" dangerouslySetInnerHTML={{ __html: post.html }} />
        </article>

        <div className="mt-14 grid grid-cols-2 items-center gap-4 text-sm text-muted-foreground sm:grid-cols-[1fr_auto_1fr]">
          <Link href="/blog" className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            all posts
          </Link>
          {next ? (
            <Link
              href={next.href}
              className="group col-span-2 row-start-1 mx-auto flex max-w-[16rem] flex-col items-center rounded-xl border border-border px-5 py-3 text-center transition-colors hover:border-foreground/30 sm:col-span-1 sm:col-start-2"
            >
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em]">
                next post <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
              <span className="mt-1 line-clamp-1 font-medium text-foreground group-hover:text-primary transition-colors">{next.title}</span>
            </Link>
          ) : (
            <span className="hidden sm:block" />
          )}
          <a href={post.substackUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-end gap-1.5 hover:text-foreground transition-colors">
            like or comment on Substack
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <SubscribeForm className="mt-6" />

        <SiteFooter />
      </main>
    </div>
  )
}
