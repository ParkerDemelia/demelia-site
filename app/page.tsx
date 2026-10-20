import { readFileSync } from "fs"
import { join } from "path"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"
import { SocialIcons } from "@/components/social-icons"

const linkClass = "text-primary underline hover:brightness-125"

const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
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

export default function HomePage() {
  const bioMarkdown = readFileSync(join(process.cwd(), "content", "bio.md"), "utf-8")

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 max-w-3xl">

        {/* Hero: photo + heading */}
        <section className="flex flex-col sm:flex-row items-center gap-6 mb-12">
          <div className="shrink-0 w-36 h-36 rounded-full bg-muted border border-border overflow-hidden">
            {/* Replace src with your photo */}
            <img
              src="/park.png"
              alt="Parker Demelia"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Hey, I&apos;m Parker Demelia.
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              <Link href="/resume.pdf" className="hover:text-foreground transition-colors">resume</Link>
              {" · "}
              <Link href="/gear" className="hover:text-foreground transition-colors">gear</Link>
              {" · "}
              <Link href="/expenses" className="hover:text-foreground transition-colors">expenses</Link>
              {" · "}
              <Link href="/journe" className="hover:text-foreground transition-colors">journe</Link>
              {/* {" · "}
              <Link href="/antigua" className="hover:text-foreground transition-colors">visit antigua</Link> */}
            </p>
          </div>
        </section>

        {/* Bio — edit content/bio.md */}
        <section className="text-[15px] leading-relaxed text-foreground/90 mb-16">
          <ReactMarkdown components={markdownComponents}>{bioMarkdown}</ReactMarkdown>
        </section>

        {/* Bottom social icons */}
        <footer className="border-t border-border pt-6">
          <SocialIcons className="justify-center" />
        </footer>

      </main>
    </div>
  )
}
