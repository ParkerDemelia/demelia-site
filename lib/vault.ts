import { existsSync, readdirSync, statSync } from "fs"
import { join, relative, resolve, sep } from "path"

// content/ is an Obsidian vault. Images/videos dropped into it are served at /vault/<path>
// (see app/vault/[...path]/route.ts) so Obsidian embeds just work on the site.
export const VAULT_DIR = join(process.cwd(), "content")

export const MEDIA_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  m4v: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
}

export function mediaType(file: string) {
  return MEDIA_TYPES[file.split(".").pop()?.toLowerCase() ?? ""]
}

// Relative (posix) paths of every media file in the vault, skipping .obsidian etc.
export function listVaultMedia(dir = VAULT_DIR): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap((name) => {
    if (name.startsWith(".")) return []
    const full = join(dir, name)
    if (statSync(full).isDirectory()) return listVaultMedia(full)
    return mediaType(name) ? [relative(VAULT_DIR, full).split(sep).join("/")] : []
  })
}

// Absolute path for a vault-relative path, or null if it escapes the vault / isn't media.
export function vaultFile(rel: string): string | null {
  const full = resolve(VAULT_DIR, rel)
  if (!full.startsWith(VAULT_DIR + sep) || !mediaType(full) || !existsSync(full)) return null
  return full
}

const toUrl = (rel: string) => "/vault/" + rel.split("/").map(encodeURIComponent).join("/")

// Like Obsidian: try the path as written, then fall back to matching just the filename.
// Returns null for a vault reference that doesn't exist.
export function resolveMedia(ref: string, index: string[] = listVaultMedia()): string | null {
  if (/^(https?:)?\/\//.test(ref) || ref.startsWith("/")) return ref
  let clean = ref.replace(/^\.\//, "")
  try {
    clean = decodeURIComponent(clean)
  } catch {}
  if (index.includes(clean)) return toUrl(clean)
  const name = clean.split("/").pop()!.toLowerCase()
  const hit = index.find((p) => p.split("/").pop()!.toLowerCase() === name)
  return hit ? toUrl(hit) : null
}

// ![[photo.jpg]] / ![[photo.jpg|stamp wiring day]] / ![alt](Pasted%20image.png) → ![alt](/vault/...)
// A numeric alias (Obsidian's ![[x.png|300]] sizing) is dropped.
export function rewriteEmbeds(md: string): string {
  const index = listVaultMedia()
  const img = (alt: string, ref: string) => {
    const url = resolveMedia(ref, index)
    return url ? `![${alt}](<${url}>)` : ""
  }
  return md
    .replace(/!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (_, ref: string, alias = "") =>
      img(/^\d+(x\d+)?$/.test(alias.trim()) ? "" : alias.trim(), ref.trim())
    )
    .replace(/!\[([^\]]*)\]\(<?([^)>]+?)>?\)/g, (all, alt: string, ref: string) =>
      /^(https?:)?\/\//.test(ref) || ref.startsWith("/") ? all : img(alt, ref.trim())
    )
}
