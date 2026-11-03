import { geoCentroid, geoGraticule10, geoMercator, geoPath } from "d3-geo"
import type { Feature, FeatureCollection, Geometry } from "geojson"
import { feature } from "topojson-client"
import { planarTriangleArea, presimplify, simplify } from "topojson-simplify"
import type { GeometryCollection, Topology } from "topojson-specification"
import world from "world-atlas/countries-50m.json"
import states from "us-atlas/states-10m.json"
import type { Stay, Travel } from "./travel"
import { PLACES } from "./travel-places"

// Pre-projects the map on the server so the page ships SVG paths, not geo data, and works out
// the numbers for each place from the ## log. Countries come from Natural Earth (world-atlas),
// US states from the Census (us-atlas); the US itself is drawn as its states.
const W = 1200
const H = 800
const PAD = 90
const BLEED = 0.4 // how far past the frame land is drawn, as a share of the frame
const USA = "840"

export type Shape = { key: string; name: string; kind: Kind; d: string; visited: boolean; home: boolean }
export type City = { name: string; region: string; x: number; y: number }
export type Region = {
  key: string
  name: string
  kind: Kind
  home: boolean
  anchor: [number, number] // where its panel points
  nights: number
  visits: number
  cities: string[]
  first?: string // ISO
  last?: string
  note?: string // a line from the journal
}
export type TravelMap = {
  width: number
  height: number
  bleed: number
  shapes: Shape[]
  graticule: string
  route: string
  cities: City[]
  regions: Region[]
  totals: { countries: number; states: number; nights: number; cities: number }
}
type Kind = "country" | "state"
type Props = { name: string }

// drop coastline wiggles smaller than this many square degrees — invisible until zoomed well in
const DETAIL = 0.005
const collection = (topo: unknown, key: string) => {
  const t = simplify(presimplify(topo as Parameters<typeof presimplify>[0], planarTriangleArea), DETAIL) as Topology<Record<string, GeometryCollection<Props>>>
  return feature(t, t.objects[key]) as FeatureCollection<Geometry, Props>
}

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
// what people write → Natural Earth's short names
const ALIASES: Record<string, string> = {
  "dominican republic": "dominican rep",
  "czech republic": "czechia",
  uk: "united kingdom",
  england: "united kingdom",
  scotland: "united kingdom",
  "bosnia and herzegovina": "bosnia and herz",
  "ivory coast": "cote divoire",
}
const nightsBetween = (a: string, b: string) => Math.max(0, Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000))

export function getTravelMap(travel: Travel): TravelMap {
  const countries = collection(world, "countries").features.filter((f) => String(f.id) !== USA)
  // 50 states + DC only; territories like Puerto Rico (FIPS 60+) are countries in world-atlas
  const usStates = collection(states, "states").features.filter((f) => Number(f.id) <= 56)

  const regionsByName = new Map<string, { f: Feature<Geometry, Props>; kind: Kind; key: string }>()
  for (const f of countries) regionsByName.set(norm(f.properties.name), { f, kind: "country", key: `country-${f.id}` })
  for (const f of usStates) regionsByName.set(norm(f.properties.name), { f, kind: "state", key: `state-${f.id}` })
  const byKey = new Map([...regionsByName.values()].map((r) => [r.key, r]))
  const region = (name: string) => regionsByName.get(ALIASES[norm(name)] ?? norm(name))

  const towns = new Map<string, { name: string; region: string; at?: [number, number] }>()
  for (const [name, p] of Object.entries(PLACES)) for (const n of [name, ...(p.aka ?? [])]) towns.set(norm(n), { name, ...p })

  // a name from the log → a town (with its region) or a region on its own
  const unknown = new Set<string>()
  const resolve = (name: string) => {
    const town = towns.get(norm(name))
    const r = region(town?.region ?? name)
    if (!r) unknown.add(name)
    return r && { region: r, town: town && { name: town.name, at: town.at } }
  }

  // ── stats from the log, oldest first ──
  type Acc = { nights: number; visits: number; cities: Set<string>; first?: string; last?: string }
  const acc = new Map<string, Acc>()
  const stats = (key: string) => acc.get(key) ?? acc.set(key, { nights: 0, visits: 0, cities: new Set() }).get(key)!
  const log = [...travel.log].sort((a, b) => a.start.localeCompare(b.start))
  const cityAt = new Map<string, { region: string; at: [number, number] }>()
  const anchors: [number, number][] = [] // lon/lat of each stay, for the route
  const lastEnd = new Map<string, string>() // a region's latest departure, to tell a return from a continuing stay

  const stayPlaces = (s: Stay) => [...s.names.map((n) => [n, true] as const), ...s.stops.flat().map((n) => [n, false] as const)]
  for (const s of log) {
    const here = new Set<string>()
    let anchor: [number, number] | undefined
    for (const [name, top] of stayPlaces(s)) {
      const hit = resolve(name)
      if (!hit) continue
      if (top) here.add(hit.region.key)
      const st = stats(hit.region.key)
      if (hit.town) {
        st.cities.add(hit.town.name)
        if (hit.town.at) {
          cityAt.set(hit.town.name, { region: hit.region.key, at: hit.town.at })
          if (top && !anchor) anchor = [hit.town.at[1], hit.town.at[0]]
        }
      }
      if (top && !anchor && !hit.town) anchor = geoCentroid(hit.region.f) as [number, number]
    }
    // a stay in two places ("Middletown NJ & NYC") splits its nights between them
    const nights = nightsBetween(s.start, s.end) / Math.max(1, here.size)
    for (const key of here) {
      const st = stats(key)
      st.nights += nights
      // a new visit unless this picks up within a day of the last stay there
      const prev = lastEnd.get(key)
      if (!prev || nightsBetween(prev, s.start) > 1) st.visits++
      lastEnd.set(key, s.end > (prev ?? "") ? s.end : prev!)
      st.first = st.first && st.first < s.start ? st.first : s.start
      st.last = st.last && st.last > s.end ? st.last : s.end
    }
    if (anchor) anchors.push(anchor)
  }
  if (unknown.size) console.warn(`[travel] no map entry for: ${[...unknown].join(", ")} — add them to lib/travel-places.ts`)

  // places named only in frontmatter or journal headings still light up
  for (const name of [...travel.extraPlaces, ...travel.trips.flatMap((t) => t.places)]) {
    const r = region(name)
    if (r) stats(r.key)
  }
  const homeKey = travel.home ? region(travel.home)?.key : undefined

  // ── projection: frame everything visited ──
  const visited = [...acc.keys()].map((k) => byKey.get(k)!.f)
  const projection = geoMercator()
  projection.fitExtent(
    [
      [PAD, PAD],
      [W - PAD, H - PAD],
    ],
    { type: "FeatureCollection", features: visited.length ? visited : usStates } as FeatureCollection
  )
  // draw well past the frame so a full-screen map has land in every direction
  projection.clipExtent([
    [-W * BLEED, -H * BLEED],
    [W * (1 + BLEED), H * (1 + BLEED)],
  ])
  const path = geoPath(projection).digits(1)
  const xy = (lonlat: [number, number]) => projection(lonlat)!.map((v) => Math.round(v * 10) / 10) as [number, number]

  const shapes: Shape[] = []
  for (const [list, kind] of [
    [countries, "country"],
    [usStates, "state"],
  ] as const) {
    for (const f of list) {
      const d = path(f)
      const key = `${kind}-${f.id}`
      if (d) shapes.push({ key, name: f.properties.name, kind, d, visited: acc.has(key), home: key === homeKey })
    }
  }

  const cities: City[] = [...cityAt].map(([name, c]) => {
    const [x, y] = xy([c.at[1], c.at[0]])
    return { name, region: c.region, x, y }
  })

  // most recent journal line that mentions a region
  const noteFor = (name: string) => {
    const t = travel.trips.find((t) => t.places.some((p) => region(p)?.f.properties.name === name))
    return t?.postcard ?? t?.content.split(/(?<=[.!?])\s/)[0]
  }

  const regions: Region[] = [...acc].map(([key, st]) => {
    const r = byKey.get(key)!
    const own = cities.filter((c) => c.region === key)
    const anchor: [number, number] = own.length
      ? [own.reduce((n, c) => n + c.x, 0) / own.length, own.reduce((n, c) => n + c.y, 0) / own.length]
      : (path.centroid(r.f) as [number, number])
    return {
      key,
      name: r.f.properties.name,
      kind: r.kind,
      home: key === homeKey,
      anchor: [Math.round(anchor[0]), Math.round(anchor[1])],
      nights: Math.round(st.nights),
      visits: st.visits,
      cities: [...st.cities],
      first: st.first,
      last: st.last,
      note: noteFor(r.f.properties.name),
    }
  })

  const legs = anchors.slice(1).flatMap((b, i) => (anchors[i][0] === b[0] && anchors[i][1] === b[1] ? [] : [[anchors[i], b]]))

  return {
    width: W,
    height: H,
    bleed: BLEED,
    shapes,
    graticule: path(geoGraticule10()) ?? "",
    route: path({ type: "MultiLineString", coordinates: legs }) ?? "",
    cities,
    regions,
    totals: {
      countries: regions.filter((r) => r.kind === "country").length,
      states: regions.filter((r) => r.kind === "state").length,
      nights: regions.reduce((n, r) => n + r.nights, 0),
      cities: cities.length,
    },
  }
}
