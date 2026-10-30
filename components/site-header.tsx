import Link from "next/link"

const NAV = [
  { label: "blog", href: "/blog" },
  { label: "explore", href: "/explore" },
]

// Wordmark on the left is the logo; the two sections sit top right.
export function SiteHeader({ active }: { active?: "blog" | "explore" }) {
  return (
    <header className="mb-16 flex items-baseline justify-between gap-4">
      <Link href="/" className="text-lg font-semibold tracking-tight text-foreground hover:text-primary transition-colors">
        Parker Demelia
      </Link>
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
