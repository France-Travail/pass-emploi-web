# Couverture logs ECS — pass-emploi-web

> Dernière mise à jour : 2026-05-27

## Taxonomie `event.action`

| `event.action` | `log.logger` | Émis par | `level` | `outcome` |
|---|---|---|---|---|
| `request_completed` | — | pino-http (server.ts) | `info` | `success` / `failure` |
| `request_failed` | — | pino-http (server.ts) | `error` | `failure` |
| `external_api_call` | `ApiClient` | utils/httpClient.ts | `info` (4xx) / `error` (5xx, réseau) | `success` / `failure` |
| `token_refreshed` | `Authenticator` | utils/auth/authenticator.ts | `info` | `success` |
| `token_refresh_failed` | `Authenticator` | utils/auth/authenticator.ts | `info` | `failure` |
| `auth_succeeded` | `Authenticator` | utils/auth/authenticator.ts | `info` | `success` |
| `data_mapping_warning` | — | interfaces/json/*.ts | `info` | `failure` |

## Use case de validation E2E

**Reconstituer l'échec de refresh de token d'un conseiller :**

```
user.id: "<id>" AND event.action: token_refresh_failed
```

→ Corrèle avec le `external_api_call` sur `url.domain: id.pass-emploi.beta.gouv.fr`
  via `trace.id` ou `http.request.id`.

**Reconstituer l'accès fiche bénéficiaire :**

```
user.id: "<id>" AND event.action: external_api_call AND url.domain: api.pass-emploi.beta.gouv.fr
```

## Hors scope ECS (couvert par APM RUM)

- Firebase Web SDK (browser) — `clients/firebase.client.ts`
- Composants client (`'use client'`) — erreurs browser
- Matomo, WebVitals — analytics browser
