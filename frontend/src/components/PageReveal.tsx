import React, { useEffect, useState } from 'react'

export const PageReveal: React.FC = () => {
  const [done, setDone] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 900) // duration of reveal
    return () => clearTimeout(t)
  }, [])
  return (
    <div
      aria-hidden
      className={`page-reveal fixed inset-0 z-[70] pointer-events-none transition-opacity duration-600 ${
        done ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 reveal-pulse" />
    </div>
  )
}