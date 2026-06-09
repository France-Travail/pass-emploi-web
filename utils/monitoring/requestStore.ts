import { cache } from 'react'

const getStore = cache((): { requestId: string | undefined } => ({
  requestId: undefined,
}))

export function initRequestId(id: string): void {
  getStore().requestId = id
}

export function getPerRequestId(): string | undefined {
  try {
    return getStore().requestId
  } catch {
    return undefined
  }
}
