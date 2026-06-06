import { useEffect, useRef } from "react"

export function useAutoResizeTextarea<T extends HTMLTextAreaElement>(value: string) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  return ref
}
