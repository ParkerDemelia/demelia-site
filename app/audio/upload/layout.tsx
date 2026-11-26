import type { Metadata } from "next"

// The upload page is a client component, so its title lives here.
export const metadata: Metadata = { title: "upload · audio", robots: { index: false } }

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return children
}
