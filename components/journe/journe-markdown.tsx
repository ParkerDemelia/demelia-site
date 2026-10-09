"use client"

import { Children, isValidElement } from "react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"
import { Polaroid } from "./journe-context"
import { Stamp, stampCaption } from "./stamp"

const linkClass = "text-primary underline hover:brightness-125"

function isStampImage(node: unknown): boolean {
  if (!isValidElement(node)) return false
  const props = node.props as { src?: unknown; alt?: string }
  return typeof props.src === "string" && stampCaption(props.alt) !== null
}

// {$2000} in the md → a little hang-tag sticker
function PriceTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="journe-price mx-0.5 inline-flex items-center align-middle font-mono text-[12px] font-bold leading-none text-neutral-900">
      {children}
    </span>
  )
}

const markdownComponents: Components = {
  // Stamps sharing a paragraph float together as one row, in the order they were written
  // (separate right-floats would line up backwards).
  p: ({ children }) => {
    const pClass = "text-[15px] leading-relaxed text-foreground/90 mb-4"
    const kids = Children.toArray(children)
    const stamps = kids.filter(isStampImage)
    if (stamps.length < 2) return <p className={pClass}>{children}</p>
    return (
      <p className={pClass}>
        <span className="float-right ml-4 mb-3 mt-1 flex max-w-[75%] flex-wrap justify-end gap-x-4 gap-y-3">
          {stamps.map((el: any) => (
            <Stamp key={el.key} src={el.props.src} caption={stampCaption(el.props.alt) || undefined} grouped />
          ))}
        </span>
        {kids.filter((k) => !isStampImage(k))}
      </p>
    )
  },
  ul: ({ children }) => <ul className="journe-list mb-5 space-y-1.5 pl-1">{children}</ul>,
  li: ({ children }) => <li className="text-[15px] text-foreground/90 [&>ul]:mt-1.5 [&>ul]:mb-0 [&>ul]:pl-5">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  h3: ({ children }) => <h3 className="mt-6 mb-2 font-semibold text-foreground">{children}</h3>,
  h4: ({ children }) => <h4 className="mt-6 mb-2 font-semibold text-foreground">{children}</h4>,
  img: ({ src, alt }) => {
    if (typeof src !== "string") return null
    const stamp = stampCaption(alt)
    if (stamp !== null) return <Stamp src={src} caption={stamp || undefined} />
    return <Polaroid src={src} caption={alt} className="my-4 block w-full max-w-sm mx-auto" />
  },
  a: ({ href, children }) => {
    if (href === "#price") return <PriceTag>{children}</PriceTag>
    if (!href) return <>{children}</>
    const external = href.startsWith("http") || href.startsWith("mailto:")
    return external ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {children}
      </a>
    ) : (
      <Link href={href} className={linkClass}>
        {children}
      </Link>
    )
  },
}

export function JourneMarkdown({ children }: { children: string }) {
  return <ReactMarkdown components={markdownComponents}>{children}</ReactMarkdown>
}
