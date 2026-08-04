// react-router v8 est ESM-only et utilise `import.meta`, que Jest ne sait pas
// transformer vers CJS. On ne dépend de react-router-dom que pour la peer dep de
// @elastic/apm-rum-react, dont seul `withTransaction` est utilisé — jamais
// `ApmRoutes`, le seul consommateur de ces symboles. Ce stub couvre donc la
// totalité de la surface réellement chargée en test.
module.exports = {
  Routes: () => null,
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  useNavigationType: () => 'POP',
  matchRoutes: () => null,
  createRoutesFromChildren: () => [],
}
