'use client'
import { useSyncExternalStore } from 'react'

export default function ClientOnlyContainer({
  children,
}: {
  children: React.ReactNode
}) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  if (!mounted) return null

  return <>{children}</>
}
