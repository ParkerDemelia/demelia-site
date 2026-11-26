import type { Metadata } from "next"
import { getEpisodes } from "@/lib/audio"
import { AudioPlayer } from "@/components/audio/player"
import { Subscribe } from "@/components/audio/subscribe"

export const metadata: Metadata = {
  title: "audio · Parker Demelia",
  description: "Recordings from Parker Demelia.",
  alternates: { types: { "application/rss+xml": "/audio/feed.xml" } },
}

// Standalone page with its own look (see app/audio/layout.tsx). Episodes come from Vercel Blob (lib/audio.ts);
// post new ones at /audio/upload.
export const revalidate = 60

export default async function AudioPage() {
  const episodes = await getEpisodes()
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center gap-12 px-5 py-16">
      <header className="text-center">
        <h1 className="text-sm font-semibold uppercase tracking-[0.3em]">audio</h1>
        <p className="mt-1 text-sm text-neutral-500">by Parker Demelia</p>
      </header>
      <AudioPlayer episodes={episodes} />
      <footer className="flex w-full flex-col items-center gap-3 border-t border-neutral-200 pt-10">
        <p className="text-sm text-neutral-500">Get new episodes by email</p>
        <Subscribe />
        <a href="/audio/feed.xml" className="text-xs text-neutral-400 underline-offset-4 hover:underline">
          RSS
        </a>
      </footer>
    </main>
  )
}
