const { TestEnvironment } = require('jest-environment-jsdom')

// jsdom n'implémente pas l'API fetch : on expose celle de Node, dont dépend firebase/auth dès son chargement.
class JsdomWithFetchEnvironment extends TestEnvironment {
  constructor(config, context) {
    super(config, context)
    Object.assign(this.global, { fetch, Request, Response, Headers })
  }
}

module.exports = JsdomWithFetchEnvironment
