'use client'

import { createContext, ReactNode, useContext } from 'react'

type HeaderPortalsContextType = {
  actionsRoot: HTMLDivElement | null
  navigationRoot: HTMLDivElement | null
}

const HeaderPortalsContext = createContext<HeaderPortalsContextType>({
  actionsRoot: null,
  navigationRoot: null,
})

export function HeaderPortalsProvider({
  value,
  children,
}: Readonly<{
  value: HeaderPortalsContextType
  children: ReactNode
}>) {
  return (
    <HeaderPortalsContext.Provider value={value}>
      {children}
    </HeaderPortalsContext.Provider>
  )
}

export function useHeaderPortals() {
  return useContext(HeaderPortalsContext)
}
