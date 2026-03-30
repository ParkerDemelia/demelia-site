import { readFileSync } from "fs"
import { join } from "path"
import { Mail, Instagram, Github, Youtube, Rss, Linkedin } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"

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

const SOCIALS = [
  { name: "Instagram", url: "https://instagram.com/parker.demelia", icon: Instagram },
  { name: "YouTube", url: "https://youtube.com/@parker.demelia", icon: Youtube },
  { name: "Substack", url: "https://demelia.substack.com", icon: Rss },
  { name: "GitHub", url: "https://github.com/parkerdemelia", icon: Github },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@parker.demelia",
    svg: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.27 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.68a8.21 8.21 0 0 0 4.76 1.51v-3.5c0 0-1 0-1-0z" />
      </svg>
    ),
  },
  {
    name: "X",
    url: "https://x.com/parkerdemelia",
    svg: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  { name: "LinkedIn", url: "https://www.linkedin.com/in/parkerdemelia", icon: Linkedin },
  { name: "Email", url: "mailto:parker.demelia@gmail.com", icon: Mail },
]

function SocialIcons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {SOCIALS.map((s) => (
        <a
          key={s.name}
          href={s.url}
          target={s.url.startsWith("mailto") ? undefined : "_blank"}
          rel={s.url.startsWith("mailto") ? undefined : "noopener noreferrer"}
          aria-label={s.name}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {s.icon ? <s.icon className="h-5 w-5" /> : s.svg}
        </a>
      ))}
    </div>
  )
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
              <Link href="/work" className="hover:text-foreground transition-colors">work</Link>
              {" · "}
              <Link href="/resume" className="hover:text-foreground transition-colors">resume</Link>
              {" · "}
              <Link href="/antigua" className="hover:text-foreground transition-colors">visit antigua</Link>
              {" · "}
              {/* <Link href="/trip-expenses" className="hover:text-foreground transition-colors">db marca</Link> */}
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
