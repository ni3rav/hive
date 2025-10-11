import { useState, useEffect } from 'react';

export function useMediaQuery(query: string, debounceMs = 150): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    let timeoutId: NodeJS.Timeout;

    const listener = (e: MediaQueryListEvent) => {
      // Debounce to prevent rapid changes during resize
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setMatches(e.matches);
      }, debounceMs);
    };

    // Use the modern addEventListener API
    media.addEventListener('change', listener);

    return () => {
      clearTimeout(timeoutId);
      media.removeEventListener('change', listener);
    };
  }, [query, debounceMs]);

  return matches;
}
