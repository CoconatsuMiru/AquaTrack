import { useEffect, useRef, useState } from 'react'

const DURATION_MS = 700

type AnimatedNumberProps = {
  value: number
  // Show a "+" in front of positive numbers
  signed?: boolean
}

export function AnimatedNumber({ value, signed = false }: AnimatedNumberProps) {
  const [displayed, setDisplayed] = useState(0)
  // Remembers the number currently on screen, so a new animation starts from there
  const displayedRef = useRef(0)

  useEffect(() => {
    const from = displayedRef.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duration = reduceMotion ? 0 : DURATION_MS
    const startTime = performance.now()
    let frame = 0

    function step(now: number) {
      const progress = duration === 0 ? 1 : Math.min((now - startTime) / duration, 1)
      // Starts fast and slows down near the end
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = Math.round(from + (value - from) * eased)

      displayedRef.current = next
      setDisplayed(next)

      if (progress < 1) {
        frame = requestAnimationFrame(step)
      }
    }

    frame = requestAnimationFrame(step)

    return () => cancelAnimationFrame(frame)
  }, [value])

  return <>{signed && displayed > 0 ? `+${displayed}` : displayed}</>
}