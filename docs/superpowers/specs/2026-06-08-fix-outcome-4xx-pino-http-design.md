# Fix `outcome: "success"` sur les réponses 4xx dans pino-http

**Date :** 2026-06-08
**Branche :** chore/logs-format-ecs
**Portée :** `server.ts` uniquement

---

## Problème

`customSuccessObject` dans `server.ts` retourne systématiquement `outcome: "success"` pour toutes les réponses non-erreur (< 500, sans erreur Node.js), y compris les 4xx.

Exemple observé en staging :
```json
{"res":{"statusCode":404},"event":{"action":"request_completed","outcome":"success"}}
```

Un 404 devrait avoir `outcome: "failure"` et `action: "request_failed"`.

---

## Décision

Approche A : corriger `customSuccessObject` pour conditionner l'event sur `res.statusCode`.

Les autres approches écartées :
- **Élever les 4xx en `warn`** : pollue les warnings avec des erreurs client normales (scanners, bots)
- **Helper partagé** : sur-ingénierie pour 3 lignes

---

## Changement

**Fichier :** `server.ts`

```typescript
// Avant
customSuccessObject: (_req, _res, val) => ({
  ...val,
  event: { action: 'request_completed', outcome: 'success' },
}),

// Après
customSuccessObject: (_req, res, val) => ({
  ...val,
  event: {
    action: res.statusCode >= 400 ? 'request_failed' : 'request_completed',
    outcome: res.statusCode >= 400 ? 'failure' : 'success',
  },
}),
```

Le log level reste `info` pour les 4xx : une erreur client n'est pas une erreur serveur.

---

## Comportement attendu après fix

| Status | `log.level` | `event.action`      | `event.outcome` |
|--------|-------------|---------------------|-----------------|
| 2xx    | info        | request_completed   | success         |
| 3xx    | info        | request_completed   | success         |
| 4xx    | info        | request_failed      | failure         |
| 5xx    | error       | request_failed      | failure         |

---

## Tests

Pas de test unitaire pour `server.ts` (custom server Node.js). La validation est par les logs de staging. Aucun fichier de test à modifier.

---

## Périmètre

- Aucune interface publique modifiée
- Aucune dépendance ajoutée
- `customErrorObject` (5xx + erreurs Node) : inchangé
