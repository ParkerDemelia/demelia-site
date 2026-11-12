import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const NAV = [
  { label: "blog", href: "/blog" },
  { label: "explore", href: "/explore" },
]

// Wordmark on the left is the logo; the two sections sit top right.
// A page inside a section passes `back` (e.g. "/explore") and gets a back arrow there instead of the wordmark.
export function SiteHeader({ active, back }: { active?: "blog" | "explore"; back?: string }) {
  return (
    <header className="mb-16 flex items-baseline justify-between gap-4">
      {back ? (
        <Link href={back} className="group flex items-center gap-1.5 text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-primary">
          <ArrowLeft className="h-4 w-4 self-center transition-transform group-hover:-translate-x-0.5" />
          {back.replace(/^\//, "") || "home"}
        </Link>
      ) : (
        <Link href="/" className="text-lg font-semibold tracking-tight text-foreground hover:text-primary transition-colors">
          Parker Demelia
        </Link>
      )}
      <nav className="flex gap-1 text-sm">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`rounded-full px-3 py-1 transition-colors ${
              active === n.label ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
