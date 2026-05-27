import { AsyncLocalStorage } from 'async_hooks'

export type RequestStore = Map<string, unknown>

export const requestContext = new AsyncLocalStorage<RequestStore>()
