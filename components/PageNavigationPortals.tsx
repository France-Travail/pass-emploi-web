'use client'

import { usePathname } from 'next/navigation'
import React from 'react'
import { createPortal } from 'react-dom'

import FilAriane from 'components/FilAriane'
import LienRetour from 'components/LienRetour'
import { useHeaderPortals } from 'utils/headerPortalsContext'

export function PageRetourPortal({ lien }: { lien: string }) {
  const { navigationRoot } = useHeaderPortals()

  if (!navigationRoot) return null
  return createPortal(<LienRetour returnUrlOrPath={lien} />, navigationRoot)
}

export function PageFilArianePortal() {
  const pathname = usePathname()
  const { navigationRoot } = useHeaderPortals()

  if (!navigationRoot) return null
  return createPortal(<FilAriane path={pathname} />, navigationRoot)
}

export function PageHeaderPortal({ header }: { header: string }) {
  const { navigationRoot } = useHeaderPortals()

  if (!navigationRoot) return null
  return createPortal(
    <h1 className='text-l-bold text-primary'>{header}</h1>,
    navigationRoot
  )
}
