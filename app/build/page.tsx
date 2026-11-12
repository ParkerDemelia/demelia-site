import type { Metadata } from "next"
import { Caveat } from "next/font/google"
import { getBuild } from "@/lib/build"
import { getJourne } from "@/lib/journe"
import { BuildStats, CameWith, PowerMap, Systems, type Ledger } from "@/components/build/build-view"
import { getNotionExpenses } from "@/lib/notion-expenses"
import { isRunningCost, isVanExpense, net } from "@/lib/van-expenses"
import { FeaturedCard, LinkCard } from "@/components/gear/gear-links"
import { SectionLabel } from "@/components/journe/section-label"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const hand = Caveat({ subsets: ["latin"], variable: "--font-hand" })

export const metadata: Metadata = {
  title: "build — Parker Demelia",
  description: "What's in the van, system by system: power, kitchen, water, sleep, internet.",
}

// Edit content/build.md — see lib/build.ts for the checklist / {$cost} / power map syntax.
// The van's name and price come from content/journe.md's frontmatter.
// The money comes from Notion: every expense tagged "van", the same rows as the receipt on /journe.
export const revalidate = 60

async function getLedger(): Promise<Ledger | undefined> {
  try {
    const van = (await getNotionExpenses()).filter(isVanExpense)
    const sum = (xs: typeof van) => Math.round(xs.reduce((s, e) => s + net(e), 0) * 100) / 100
    return { build: sum(van.filter((e) => !isRunningCost(e))), running: sum(van.filter(isRunningCost)), lines: van.length }
  } catch {
    return undefined
  }
}

export default async function BuildPage() {
  const build = getBuild()
  const journe = getJourne()
  const ledger = await getLedger()

  return (
    <div className={`${hand.variable} min-h-screen bg-background`}>
      <main className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <SiteHeader active="explore" back="/journe" />

        <header className="mb-8">
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">build</h1>
          <p className="mt-2 text-sm text-muted-foreground">{journe.van ? `the ${journe.van}, system by system` : "the van, system by system"}</p>
          {build.intro && <p className="mt-5 leading-relaxed text-foreground/85">{build.intro}</p>}
        </header>

        <div className="mb-16">
          <BuildStats build={build} van={journe.van} price={journe.price} ledger={ledger} />
        </div>

        {build.power && <PowerMap power={build.power} />}
        <CameWith parts={build.inherited} />
        <Systems systems={build.systems} someday={build.someday} />

        {build.shop.length > 0 && (
          <section>
            <SectionLabel>shop the build</SectionLabel>
            <div className="space-y-3">
              {build.shop.flatMap((s) =>
                s.items.map((item) =>
                  item.image && item.tags.length ? (
                    <FeaturedCard key={item.href + item.name} item={item} />
                  ) : (
                    <LinkCard key={item.href + item.name} item={item} section={s.title} />
                  ),
                ),
              )}
            </div>
            <p className="mt-8 text-xs text-muted-foreground">
              As an Amazon Associate I earn from qualifying purchases. Links here may be affiliate links — it costs you nothing extra and helps
              support the site.
            </p>
          </section>
        )}

        <SiteFooter />
      </main>
    </div>
  )
}
