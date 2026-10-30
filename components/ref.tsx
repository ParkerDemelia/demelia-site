import Link from "next/link"

export const inlineLink =
  "text-foreground underline decoration-border underline-offset-4 hover:text-primary hover:decoration-primary transition-colors"

// Internal links use next/link; external ones open in a new tab; no href renders a plain div.
export function Ref({ href, className = "", children }: { href?: string; className?: string; children: React.ReactNode }) {
  if (!href) return <div className={className}>{children}</div>
  return href.startsWith("http") || href.startsWith("mailto:") ? (
    <a href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

// "https://www.hotelterramaya.com/" → "hotelterramaya.com"
export function host(link?: string) {
  if (!link?.startsWith("http")) return undefined
  try {
    return new URL(link).hostname.replace(/^www\./, "")
  } catch {
    return undefined
  }
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{children}</h2>
}
