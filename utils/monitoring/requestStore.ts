import { cache } from 'react'

const getStore = cache((): { requestId: string | undefined } => ({
  requestId: undefined,
}))

export function initRequestId(id: string): void {
  try {
    getStore().requestId = id
  } catch {
    // outside RSC context — no per-request store available
  }
}

export function getPerRequestId(): string | undefined {
  try {
    return getStore().requestId
  } catch {
    return undefined
  }
}
