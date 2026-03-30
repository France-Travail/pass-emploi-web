'use client'

import { createPortal } from 'react-dom'

import { ElementsOnly } from 'types/components'
import { useHeaderPortals } from 'utils/headerPortalsContext'

type PageActionsPortalProps = {
  children: ElementsOnly
}

export default function PageActionsPortal({
  children,
}: PageActionsPortalProps) {
  const { actionsRoot } = useHeaderPortals()

  if (!actionsRoot) return null
  return createPortal(<>{children}</>, actionsRoot)
}
