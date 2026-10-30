"use client"

import { useEffect, useRef, useState } from "react"

// rootMargin grows the trigger area, e.g. "0px 0px 25% 0px" fires a quarter screen before the element scrolls in
export function useInView<T extends Element>(threshold = 0.3, rootMargin = "0px") {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true)
        io.disconnect()
      }
    }, { threshold, rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold, rootMargin])
  return { ref, inView }
}
