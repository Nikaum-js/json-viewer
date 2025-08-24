import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    setMatches(media.matches)
    
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }
    
    if (media.addEventListener) {
      media.addEventListener('change', listener)
      return () => media.removeEventListener('change', listener)
    } else {
      media.addListener(listener)
      return () => media.removeListener(listener)
    }
  }, [query])

  return matches
}