import { cache } from 'react'

export type LogUser = {
  id: string
  type: 'CONSEILLER' | 'SUPERVISEUR'
  structure: string
}

type PerRequestStore = { requestId?: string; user?: LogUser }

// Contexte par requête pour le rendu RSC, où l'AsyncLocalStorage posé dans
// server.ts n'est plus visible. React.cache est scopé à la requête en cours.
const getStore = cache((): PerRequestStore => ({}))

function safeStore(): PerRequestStore | undefined {
  try {
    return getStore()
  } catch {
    return undefined
  }
}

export function initRequestId(id: string): void {
  const store = safeStore()
  if (store) store.requestId = id
}

export function getPerRequestId(): string | undefined {
  return safeStore()?.requestId
}

export function initRequestUser(user: LogUser): void {
  const store = safeStore()
  if (store) store.user = user
}

export function getPerRequestUser(): LogUser | undefined {
  return safeStore()?.user
}
