import { Armchair, BatteryCharging, BedDouble, Cable, Car, CarFront, Check, Droplets, Flame, Hammer, KeyRound, Plug, Refrigerator, Sparkles, Sun, Tv, Wifi, Wrench, Zap } from "lucide-react"
import type { Build, Part, Power, System } from "@/lib/build"
import { SectionLabel } from "@/components/journe/section-label"

const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`

// a system's icon, guessed from its name
const ICONS: [RegExp, typeof Zap][] = [
  [/power|electric|solar|battery/i, Zap],
  [/kitchen|fridge|cook/i, Refrigerator],
  [/water|plumb/i, Droplets],
  [/sleep|bed/i, BedDouble],
  [/internet|wifi|starlink/i, Wifi],
  [/heat|climate/i, Flame],
  [/entertain|media|sound|projector|accessor|tech/i, Tv],
  [/mechanic|engine/i, CarFront],
  [/function|storage|gear/i, Armchair],
  [/body|interior/i, Hammer],
]
const iconFor = (title: string) => ICONS.find(([re]) => re.test(title))?.[1] ?? Wrench

// a power source's icon
const sourceIcon = (name: string) => (/alternator|engine|driv/i.test(name) ? Car : /solar|sun/i.test(name) ? Sun : /shore|plug|ac/i.test(name) ? Plug : Zap)

// ── the numbers across the top ──
// `ledger` is the van-tagged rows from Notion — the same ones the journe receipt prints — so the totals match it.
// Without it (Notion down, no key locally) the {$cost}s in build.md are added up instead.
export type Ledger = { build: number; running: number; lines: number }

export function BuildStats({ build, van, price, ledger }: { build: Build; van?: string; price?: number; ledger?: Ledger }) {
  const parts = build.systems.flatMap((s) => s.parts)
  const spent = ledger ? ledger.build : parts.reduce((s, p) => s + (p.cost ?? 0), 0)
  const trips = ledger?.running ?? 0
  // an equation: van + build + trips = priceless. The operator sits on the line between two cells.
  const terms: { label: string; value: string; op?: string; green?: boolean }[] = [
    { label: "the van", value: price ? money(price) : "—" },
    { label: "the build", value: money(spent), op: "+" },
    { label: "the trips", value: money(trips), op: "+" },
    { label: "the memories", value: "priceless", op: "=", green: true },
  ]
  return (
    <div>
      <dl className="flex flex-col rounded-xl border border-border sm:flex-row">
        {terms.map((t, i) => (
          <div key={t.label} className={`relative flex-1 p-4 ${i ? "border-t border-border sm:border-l sm:border-t-0" : ""}`}>
            {t.op && (
              <span
                aria-hidden
                // the background cuts a gap in the divider, so the symbol reads as part of the line
                className={`absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 bg-background px-1.5 py-0.5 font-mono text-base font-bold leading-none sm:left-0 sm:top-1/2 sm:px-0.5 sm:py-1.5 ${t.green ? "text-emerald-500" : "text-muted-foreground"}`}
              >
                {t.op}
              </span>
            )}
            <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{t.label}</dt>
            <dd className={`mt-1 font-mono text-xl font-bold tabular-nums ${t.green ? "text-emerald-500" : "text-foreground"}`}>{t.value}</dd>
          </div>
        ))}
      </dl>
      {price && ledger ? (
        <p className="mt-2 text-right font-mono text-[11px] text-muted-foreground/60">
          on paper: <span className="text-muted-foreground">{money(price + spent + trips)}</span> ·{" "}
          <a href="/journe#receipt" className="underline-offset-2 hover:text-foreground hover:underline">
            {ledger.lines} receipts →
          </a>
        </p>
      ) : null}
    </div>
  )
}

// ── how power moves through the van: sources → charger → battery → what it runs ──
function Flow() {
  // a dashed line with current running along it; vertical on phones, horizontal from sm up
  return (
    <div aria-hidden className="build-flow mx-auto h-6 w-0.5 shrink-0 sm:h-0.5 sm:w-auto sm:min-w-3 sm:flex-1" />
  )
}

function Node({ label, children, accent = false }: { label: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5 text-center">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <div className={`rounded-lg px-2.5 py-2 text-[13px] font-medium leading-snug ring-1 ${accent ? "bg-primary/10 text-primary ring-primary/40" : "bg-muted/30 text-foreground ring-border"}`}>{children}</div>
    </div>
  )
}

export function PowerMap({ power }: { power: Power }) {
  return (
    <section className="mb-16">
      <SectionLabel>power map</SectionLabel>
      <div className="flex flex-col items-stretch gap-1 rounded-xl border border-border bg-muted/5 p-4 sm:flex-row sm:items-center sm:gap-2 sm:p-5">
        <Node label="in">
          <span className="flex flex-wrap justify-center gap-x-3 gap-y-1 sm:flex-col sm:items-start">
            {power.in.map((s) => {
              const Icon = sourceIcon(s)
              return (
                <span key={s} className="flex items-center gap-1.5 whitespace-nowrap">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {s}
                </span>
              )
            })}
          </span>
        </Node>
        {(power.via || power.store) && (
          <>
            <Flow />
            {/* charger over battery: one column in the middle, so the row fits without squeezing */}
            <div className="flex flex-col items-center gap-1">
              {power.via && (
                <Node label="through">
                  <span className="flex items-center gap-1.5 whitespace-nowrap">
                    <Cable className="h-3.5 w-3.5 text-primary" />
                    {power.via}
                  </span>
                </Node>
              )}
              {power.via && power.store && <div aria-hidden className="build-flow build-flow-v h-6 w-0.5" />}
              {power.store && (
                <Node label="stored" accent>
                  <span className="flex items-center gap-1.5 whitespace-nowrap">
                    <BatteryCharging className="h-4 w-4" />
                    {power.store}
                  </span>
                </Node>
              )}
            </div>
          </>
        )}
        {power.out.length > 0 && (
          <>
            <Flow />
            <Node label="runs">
              <span className="flex flex-wrap justify-center gap-x-3 gap-y-1 sm:flex-col sm:items-start">
                {power.out.map((o) => (
                  <span key={o} className="whitespace-nowrap">{o}</span>
                ))}
              </span>
            </Node>
          </>
        )}
      </div>
    </section>
  )
}

// ── what the van came with ──
export function CameWith({ parts }: { parts: Part[] }) {
  if (!parts.length) return null
  return (
    <section className="mb-16">
      <SectionLabel>came with it</SectionLabel>
      <div className="relative rounded-xl border border-dashed border-border p-5">
        <span className="absolute -top-3 right-4 rotate-3 rounded border-2 border-primary/70 bg-background px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          previous owner
        </span>
        <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {parts.map((p) => (
            <li key={p.name} className="flex items-start gap-2 text-sm text-foreground/85">
              <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              {p.name}
            </li>
          ))}
        </ul>
        <p className="journe-hand mt-4 -rotate-1 text-xl leading-none text-primary">thanks, Dave.</p>
      </div>
    </section>
  )
}

// ── one card per system: the jobs (checkboxes, they make the progress) over the parts (what was bought) ──
function Stickers({ tags }: { tags: string[] }) {
  return (
    <>
      {tags.map((t) => (
        <span key={t} className="rounded-full bg-emerald-500/15 px-1.5 py-px font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-500">
          {t}
        </span>
      ))}
    </>
  )
}

function SystemCard({ system }: { system: System }) {
  const Icon = iconFor(system.title)
  const { jobs, parts } = system
  const done = jobs.filter((p) => p.done).length
  const spent = parts.reduce((s, p) => s + (p.cost ?? 0), 0)
  return (
    <article className="flex flex-col rounded-xl border border-border bg-muted/5 p-4">
      <header className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="flex-1 font-semibold text-foreground">{system.title}</h3>
        {jobs.length > 0 && (
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
            {done}/{jobs.length}
          </span>
        )}
      </header>
      {jobs.length > 0 && (
        <>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted" title={`${done} of ${jobs.length} done`}>
            <div className="h-full rounded-full bg-primary" style={{ width: `${(done / jobs.length) * 100}%` }} />
          </div>
          <ul className="mt-3 space-y-2.5">
            {jobs.map((p) => (
              <li key={p.name} className="flex gap-2.5">
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${p.done ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/50"}`}
                >
                  {p.done && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className={`text-sm ${p.done ? "text-foreground" : "text-muted-foreground"}`}>{p.name}</span>
                    <Stickers tags={p.tags} />
                  </span>
                  {p.note && <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{p.note}</span>}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
      {parts.length > 0 && (
        // the card's own little receipt
        <div className={jobs.length ? "mt-4 border-t border-dashed border-border pt-3" : "mt-3"}>
          <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">parts</p>
          <ul className="space-y-1.5 font-mono text-[11px] text-muted-foreground">
            {parts.map((p) => (
              <li key={p.name}>
                <span className="flex items-baseline gap-2">
                  <span className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 text-foreground/80">
                    {p.name}
                    <Stickers tags={p.tags} />
                  </span>
                  <span aria-hidden className="min-w-4 flex-1 translate-y-[-3px] border-b border-dotted border-muted-foreground/40" />
                  <span className="shrink-0 tabular-nums">{p.cost != null ? money(p.cost) : ""}</span>
                </span>
                {p.note && <span className="mt-0.5 block font-sans text-xs leading-snug">{p.note}</span>}
              </li>
            ))}
          </ul>
          {spent > 0 && parts.length > 1 && (
            <p className="mt-2 flex justify-between border-t border-border/60 pt-1.5 font-mono text-[11px] font-bold tabular-nums text-foreground">
              <span>TOTAL</span>
              <span>{money(spent)}</span>
            </p>
          )}
        </div>
      )}
    </article>
  )
}

export function Systems({ systems, someday = [] }: { systems: System[]; someday?: string[] }) {
  const jobs = systems.flatMap((s) => s.jobs)
  const done = jobs.filter((p) => p.done).length
  const planned = jobs.filter((p) => !p.done)
  return (
    <section className="mb-16">
      <SectionLabel>the build</SectionLabel>
      {jobs.length > 0 && (
        <div className="mb-5">
          <div className="flex items-baseline justify-between font-mono text-[11px] text-muted-foreground">
            <span>
              {done} of {jobs.length} jobs done
            </span>
            <span className="text-foreground">{Math.round((done / jobs.length) * 100)}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(done / jobs.length) * 100}%` }} />
          </div>
          {planned.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              {/* the first few open jobs; every card below lists the rest */}
              <span className="font-mono uppercase tracking-wider text-primary">next up:</span> {planned.slice(0, 4).map((p) => p.name).join(" · ")}
              {planned.length > 4 && <span className="text-muted-foreground/60"> · +{planned.length - 4} more</span>}
            </p>
          )}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {systems.map((s) => (
          <SystemCard key={s.title} system={s} />
        ))}
        {someday.length > 0 && <SomedayCard ideas={someday} />}
      </div>
    </section>
  )
}

// ── the idea pile: a card at the end of the build grid, not counted in the progress ──
function SomedayCard({ ideas }: { ideas: string[] }) {
  return (
    <article className="flex flex-col rounded-xl border border-dashed border-border p-4">
      <header className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-dashed border-primary/40 text-primary/70">
          <Sparkles className="h-4 w-4" />
        </span>
        <h3 className="flex-1 font-semibold text-foreground">Someday</h3>
        <span className="font-mono text-[11px] text-muted-foreground">ideas</span>
      </header>
      <ul className="mt-4 flex flex-wrap gap-2">
        {ideas.map((idea, i) => (
          <li
            key={idea}
            className="flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground"
            style={{ transform: `rotate(${((i * 7) % 5) - 2}deg)` }}
          >
            <Sparkles className="h-3 w-3 text-primary/70" />
            {idea}
          </li>
        ))}
      </ul>
    </article>
  )
}
