'use client'

import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

export default function A11yPageTitle() {
  const pathname = usePathname()
  const refContainer = useRef<HTMLDivElement>(null)

  const [pageTitle, setPageTitle] = useState<string>()

  useEffect(() => {
    // setTimeout car document.title n'est accessible qu'après le rendu complet
    const id = setTimeout(() => setPageTitle(document.title), 0)
    refContainer.current?.focus()
    return () => clearTimeout(id)
  }, [pathname])

  return (
    <div ref={refContainer} tabIndex={-1} className='sr-only'>
      {pageTitle}
    </div>
  )
}
