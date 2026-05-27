import { randomUUID } from 'crypto'
import { createServer } from 'http'
import { parse } from 'url'

import apm from 'elastic-apm-node/start'
import next from 'next'
import pinoHttp from 'pino-http'

import 'next-logger'

import { pinoSerializers } from 'utils/monitoring/ecsHelpers'
import { rootLogger } from 'utils/monitoring/logger'
import { requestContext } from 'utils/monitoring/requestContext'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000')

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

const pinoMiddleware = pinoHttp({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logger: rootLogger as any,
  genReqId: (req) =>
    (req.headers['x-request-id'] as string | undefined) ?? randomUUID(),
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error'
    return 'info'
  },
  customSuccessMessage: () => 'request_completed',
  customErrorMessage: () => 'request_failed',
  autoLogging: {
    ignore: (req) => req.url === '/api/health',
  },
  serializers: pinoSerializers,
  customProps: (_req, res) => ({
    event: {
      action: res.statusCode >= 400 ? 'request_failed' : 'request_completed',
      outcome: res.statusCode >= 400 ? 'failure' : 'success',
    },
  }),
})

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    apm.setTransactionName(`${req.method} ${parsedUrl.pathname}`)

    const store = new Map<string, unknown>()
    store.set(
      'HTTP_REQUEST_ID',
      (req.headers['x-request-id'] as string | undefined) ?? randomUUID()
    )
    const traceIds = apm.currentTraceIds
    if (traceIds['trace.id']) store.set('TRACE_ID', traceIds['trace.id'])

    requestContext.run(store, () => {
      pinoMiddleware(req, res, () => handle(req, res, parsedUrl))
    })
  }).listen(port)

  rootLogger.info({}, `> Ready on http://${hostname}:${port} as ${process.env.NODE_ENV}`)
})
