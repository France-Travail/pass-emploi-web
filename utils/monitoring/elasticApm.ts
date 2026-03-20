import apm from 'elastic-apm-node'

export function captureError(error: Error | string) {
  apm.captureError(error)
}
