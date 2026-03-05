'use client'

import { useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'

import { PAGE_ACTIONS_ROOT_ID } from 'components/globals'
import { ElementsOnly } from 'types/components'

type PageActionsPortalProps = {
  children: ElementsOnly
}

export default function PageActionsPortal({
  children,
}: PageActionsPortalProps) {
  const isBrowser = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const pageActionsContainer = <>{children}</>

  if (isBrowser) {
    const pageActionsRoot = document.getElementById(PAGE_ACTIONS_ROOT_ID)
    return pageActionsRoot
      ? createPortal(pageActionsContainer, pageActionsRoot)
      : null
  } else {
    return null
  }
}
