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
        return { 'log.level': label }
      },
    },
    // Copie obligatoire : elastic-apm renvoie un objet gelé (Object.freeze), et pino
    // fusionne l'objet de log dedans (Object.assign(mixin, mergeObject)) → TypeError.
    mixin: () => (apm ? { ...apm.currentTraceIds } : {}),
  })

module.exports = {
  logger,
}
