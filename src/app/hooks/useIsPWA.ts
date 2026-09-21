import { useState, useEffect } from 'react'

export function useIsPWA() {
  const [isPWA, setIsPWA] = useState(() => {
    if (typeof window === 'undefined') return false
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && (window.navigator as any).standalone)
    )
  })

  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)')
    const onChange = (e: MediaQueryListEvent) => setIsPWA(e.matches)

    // Add event listener (newer spec) or addListener (older spec fallback)
    if (mq.addEventListener) {
      mq.addEventListener('change', onChange)
    } else if (mq.addListener) {
      mq.addListener(onChange)
    }

    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', onChange)
      } else if (mq.removeListener) {
        mq.removeListener(onChange)
      }
    }
  }, [])

  return isPWA
}
