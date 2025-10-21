let apm
if (!globalThis.window) {
  apm = require('elastic-apm-node')
}

const pino = require('pino')

const logger = (defaultConfig) =>
  pino({
    ...defaultConfig,
    messageKey: 'message',
    formatters: {
      level(label) {
        return { level: label }
      },
    },
    mixin: () => {
      if (!apm) return {}
      const currentTraceIds = apm.currentTraceIds
      return Object.keys(currentTraceIds).length ? { currentTraceIds } : {}
    },
  })

module.exports = {
  logger,
}
