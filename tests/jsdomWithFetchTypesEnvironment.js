const { TestEnvironment } = require('jest-environment-jsdom')

// jsdom n'expose pas Response & co, dont dépend firebase/auth dès son chargement. fetch reste mocké par setupTests.
class JsdomWithFetchTypesEnvironment extends TestEnvironment {
  constructor(config, context) {
    super(config, context)
    Object.assign(this.global, { Request, Response, Headers })
  }
}

module.exports = JsdomWithFetchTypesEnvironment
