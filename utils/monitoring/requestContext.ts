import { AsyncLocalStorage } from 'async_hooks'

export type RequestStore = Map<string, unknown>

export const requestContext: Pick<
  AsyncLocalStorage<RequestStore>,
  'getStore' | 'run'
> = typeof window === 'undefined'
  ? new AsyncLocalStorage<RequestStore>()
  : {
      getStore: () => undefined,
      run: (_: RequestStore, fn: () => unknown) => fn(),
    }
