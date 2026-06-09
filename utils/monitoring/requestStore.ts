import { cache } from 'react'

const getStore = cache((): { requestId: string | undefined } => ({
  requestId: undefined,
}))

let fallbackRequestId: string | undefined

export function initRequestId(id: string): void {
  fallbackRequestId = id
  try {
    getStore().requestId = id
  } catch {
    // outside RSC context, fallback is used
  }
}

export function getPerRequestId(): string | undefined {
  try {
    return getStore().requestId ?? fallbackRequestId
  } catch {
    return fallbackRequestId
  }
}
