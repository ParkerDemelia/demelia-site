import { Mail, Instagram, Github, Youtube, Rss, Linkedin } from "lucide-react"

export const SOCIALS = [
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

export function SocialIcons({
  className = "",
  itemClassName = "text-muted-foreground hover:text-foreground",
}: {
  className?: string
  itemClassName?: string
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {SOCIALS.map((s) => (
        <a
          key={s.name}
          href={s.url}
          target={s.url.startsWith("mailto") ? undefined : "_blank"}
          rel={s.url.startsWith("mailto") ? undefined : "noopener noreferrer"}
          aria-label={s.name}
          className={`${itemClassName} transition-colors`}
        >
          {s.icon ? <s.icon className="h-5 w-5" /> : s.svg}
        </a>
      ))}
    </div>
  )
}
