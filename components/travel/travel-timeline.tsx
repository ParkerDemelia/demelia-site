import type { Stay, Travel, Trip } from "@/lib/travel"

// Below the map: every year, newest first. A journal section from travel.md ("## Feb - Apr 2026 - ...")
// is a chapter with its words and postcard line, holding the log's stays that start inside its months.
// Stays no chapter covers are listed loose under their year.

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
const monthIndex = (m: string) => MONTHS.indexOf(m.slice(0, 3).toLowerCase())
const pad = (n: number) => String(n).padStart(2, "0")

// "Feb - Apr 2026" → ["2026-02-01", "2026-04-31"] (string compare, so day 31 covers any month end)
function monthsOf(when: string): [string, string] | undefined {
  const m = when.match(/^([A-Za-z]+)\.?\s*(\d{4})?\s*(?:[-–]\s*([A-Za-z]+)\.?\s*)?(\d{4})$/)
  if (!m) return
  const [, a, aYear, b, year] = m
  const from = monthIndex(a)
  const to = monthIndex(b ?? a)
  if (from < 0 || to < 0) return
  return [`${aYear ?? year}-${pad(from + 1)}-01`, `${year}-${pad(to + 1)}-31`]
}

const nightsIn = (s: Stay) => Math.max(0, Math.round((Date.parse(s.end) - Date.parse(s.start)) / 86_400_000))
const day = (iso: string) => new Date(`${iso}T12:00:00`)
const short = (iso: string, withMonth = true) =>
  day(iso).toLocaleDateString("en-US", withMonth ? { month: "short", day: "numeric" } : { day: "numeric" })

// "Jun 2 – 6", "Mar 18 – Apr 19", "Jan 11"
function range(s: Stay) {
  if (s.start === s.end) return short(s.start)
  const sameMonth = s.start.slice(0, 7) === s.end.slice(0, 7)
  return `${short(s.start)} – ${short(s.end, !sameMonth)}`
}

// "Antigua, Guatemala" was split into names on the comma — put the place back together for display
const place = (s: Stay) => s.names.join(", ")

function StayRow({ stay }: { stay: Stay }) {
  const n = nightsIn(stay)
  const stops = stay.stops.map((names) => names.join(" & "))
  return (
    <li className="grid grid-cols-[6.5rem_1fr_auto] items-baseline gap-x-3 py-2 sm:grid-cols-[7.5rem_1fr_auto]">
      <span className="whitespace-nowrap font-mono text-[11px] tabular-nums text-muted-foreground">{range(stay)}</span>
      <span className="min-w-0">
        <span className="text-sm text-foreground">{place(stay)}</span>
        {stops.length > 0 && <span className="block text-xs leading-snug text-muted-foreground">{stops.join(" · ")}</span>}
      </span>
      <span className="font-mono text-[11px] tabular-nums text-muted-foreground/70">{n > 0 ? `${n}n` : "day"}</span>
    </li>
  )
}

function Chapter({ trip, stays }: { trip: Trip; stays: Stay[] }) {
  const paragraphs = trip.content
    .split(/\n{2,}/)
    .map((p) => p.replace(/^-{3,}$/gm, "").trim())
    .filter(Boolean)
  const nights = stays.reduce((s, x) => s + nightsIn(x), 0)
  return (
    <article className="rounded-xl border border-border bg-muted/5 p-4 sm:p-5">
      <header className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">{trip.when}</p>
        {nights > 0 && <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{nights} nights</p>}
      </header>
      <h3 className="mt-1 text-lg font-semibold leading-snug tracking-tight text-foreground">{trip.title}</h3>
      {paragraphs.map((p, i) => (
        <p key={i} className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {p}
        </p>
      ))}
      {trip.postcard && <p className="journe-hand mt-3 -rotate-1 text-xl leading-snug text-primary">“{trip.postcard}”</p>}
      {trip.photos.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {trip.photos.slice(0, 6).map((ph) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={ph.src} src={ph.src} alt={ph.caption ?? ""} loading="lazy" className="aspect-square w-full rounded-md object-cover ring-1 ring-border" />
          ))}
        </div>
      )}
      {stays.length > 0 && <ul className="mt-4 divide-y divide-border/50 border-t border-dashed border-border">{stays.map((s) => <StayRow key={s.start + place(s)} stay={s} />)}</ul>}
    </article>
  )
}

export function TravelTimeline({ travel }: { travel: Travel }) {
  const stays = [...travel.log].sort((a, b) => b.start.localeCompare(a.start))
  const chapters = travel.trips
    .map((trip) => ({ trip, win: monthsOf(trip.when) }))
    .filter((c): c is { trip: Trip; win: [string, string] } => !!c.win)
  const inChapter = (s: Stay) => chapters.find((c) => s.start >= c.win[0] && s.start <= c.win[1])

  const years = [...new Set([...stays.map((s) => s.start.slice(0, 4)), ...chapters.map((c) => c.win[1].slice(0, 4))])].sort().reverse()

  return (
    <div className="space-y-14">
      {years.map((year) => {
        const yearStays = stays.filter((s) => s.start.startsWith(year))
        const yearChapters = chapters.filter((c) => c.win[1].startsWith(year)).sort((a, b) => b.win[0].localeCompare(a.win[0]))
        const loose = yearStays.filter((s) => !inChapter(s))
        const nights = yearStays.reduce((s, x) => s + nightsIn(x), 0)
        return (
          <section key={year}>
            <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-border pb-2">
              <h2 className="font-mono text-2xl font-bold tabular-nums tracking-tight text-foreground">{year}</h2>
              <p className="font-mono text-[11px] text-muted-foreground">
                {nights} {nights === 1 ? "night" : "nights"} away ·{yearStays.length} {yearStays.length === 1 ? "stay" : "stays"}
              </p>
            </div>
            <div className="space-y-4">
              {yearChapters.map((c) => (
                <Chapter key={c.trip.when + c.trip.title} trip={c.trip} stays={yearStays.filter((s) => inChapter(s) === c)} />
              ))}
              {loose.length > 0 && (
                <div className="px-1">
                  {yearChapters.length > 0 && <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">also</p>}
                  <ul className="divide-y divide-border/50">
                    {loose.map((s) => (
                      <StayRow key={s.start + place(s)} stay={s} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
