"use client"

import { useEffect } from "react"
import Script from "next/script"

// Supascribe's subscribe form (supascribe.com, formerly substackapi.com) — it relays signups to
// demelia.substack.com, which a plain form can't do because Substack bot-checks its API.
// The form renders inline (no iframe), so .subscribe-embed in app/globals.css restyles it to match
// the site — the colors in the Supascribe dashboard are overridden. The loader is deduped by next/script.
const EMBED_ID = "812866268181"
const LOADER = "https://js.supascribe.com/v1/loader/ckLdCXAEpeMlx3kwMBzZDCtTl292.js"

type SupascribeGlobal = { getWidget?: (id: string) => { refresh?: () => void } | undefined }

export function SubscribeForm({ className = "" }: { className?: string }) {
  // The loader only scans the page once, on first load. After an in-site link click the new
  // page's box is empty, so ask the already-loaded widget to draw itself again.
  useEffect(() => {
    const supascribe = (window as unknown as { Supascribe?: SupascribeGlobal }).Supascribe
    supascribe?.getWidget?.(EMBED_ID)?.refresh?.()
  }, [])

  return (
    <div className={`rounded-xl border border-border bg-muted/40 p-5 ${className}`}>
      <p className="font-semibold text-foreground">the coffee house</p>
      <p className="mt-0.5 text-sm text-muted-foreground">New posts straight to your inbox. Free, whenever I write.</p>
      <div className="subscribe-embed mt-4 min-h-[38px]">
        <div data-supascribe-embed-id={EMBED_ID} data-supascribe-subscribe />
      </div>
      <Script src={LOADER} strategy="afterInteractive" />
    </div>
  )
}
