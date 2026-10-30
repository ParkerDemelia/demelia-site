import { inlineLink } from "@/components/ref"
import { SocialIcons } from "@/components/social-icons"

export function SiteFooter() {
  return (
    <footer className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground">
      <span>
        <a href="mailto:parker.demelia@gmail.com" className={inlineLink}>
          parker.demelia@gmail.com
        </a>
        {" · "}
        <a href="/resume.pdf" className={inlineLink}>
          resume
        </a>
      </span>
      <SocialIcons />
    </footer>
  )
}
