import type React from "react"

// /audio is its own little site — it deliberately does NOT use the main site's theme, header or footer.
// The root layout forces the dark theme + Geist on <html>/<body>, so this resets the page to the
// audio look (white, near-black text, system font). Its components live in components/audio/ and only
// use plain Tailwind neutrals, never the site's theme tokens.
export default function AudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`html,body{background:#fff;color:#0a0a0a;color-scheme:light}`}</style>
      <div
        className="min-h-screen bg-white text-neutral-950 antialiased"
        style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif' }}
      >
        {children}
      </div>
    </>
  )
}
