import { Fragment } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { getPosts, monthLabel } from "@/lib/posts"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { SubscribeForm } from "@/components/subscribe-form"

// Posts come from the Substack feed — refresh hourly.
export const revalidate = 3600

export const metadata = { title: "Blog — Parker Demelia" }

const PER_PAGE = 6
// The subscribe card sits after this many posts on each page.
const SUBSCRIBE_AFTER = 3

const pageHref = (n: number) => (n <= 1 ? "/blog" : `/blog?page=${n}`)

function SubscribeCard() {
  return (
    <li className="my-6">
      <SubscribeForm />
    </li>
  )
}

// One post per row: date, title, subtitle, and the post's cover photo when it has one. /blog?page=2 for older posts.
export default async function BlogPage({ searchParams }: { searchParams: { page?: string } }) {
  const all = await getPosts()
  const pages = Math.max(1, Math.ceil(all.length / PER_PAGE))
  const page = Math.min(pages, Math.max(1, Number(searchParams.page) || 1))
  const posts = all.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <SiteHeader active="blog" />

        <ul className="space-y-2">
          {posts.length === 0 && <SubscribeCard />}
          {posts.map((p, i) => (
            <Fragment key={p.href}>
              <li>
                <Link href={p.href} className="group -mx-4 flex gap-5 rounded-xl p-4 transition-colors hover:bg-muted/40">
                  <span className="min-w-0 flex-1">
                    <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{monthLabel(p.date)}</span>
                    <span className="mt-1.5 block text-xl font-semibold leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {p.title}
                    </span>
                    {p.teaser && <span className="mt-1.5 line-clamp-2 block text-[15px] text-muted-foreground">{p.teaser}</span>}
                  </span>
                  {p.cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.cover} alt="" className="h-24 w-24 shrink-0 rounded-lg object-cover sm:h-28 sm:w-36" loading="lazy" />
                  )}
                </Link>
              </li>
              {i === Math.min(SUBSCRIBE_AFTER, posts.length) - 1 && <SubscribeCard />}
            </Fragment>
          ))}
        </ul>

        {pages > 1 && (
          <nav className="mt-10 grid grid-cols-3 items-center text-sm text-muted-foreground" aria-label="Blog pages">
            <span>
              {page > 1 && (
                <Link href={pageHref(page - 1)} className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  newer
                </Link>
              )}
            </span>
            <span className="text-center font-mono text-xs">
              {page} / {pages}
            </span>
            <span className="text-right">
              {page < pages && (
                <Link href={pageHref(page + 1)} className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
                  older
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </span>
          </nav>
        )}

        <SiteFooter />
      </main>
    </div>
  )
}
