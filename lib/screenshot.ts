import { existsSync } from "fs"
import { join } from "path"

// Hover previews for the work list: public/work/<slug>.webp, where "Mission Monte Líbano" → mission-monte-libano
export function screenshot(name: string) {
  const slug = name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  return existsSync(join(process.cwd(), "public", "work", `${slug}.webp`)) ? `/work/${slug}.webp` : undefined
}
