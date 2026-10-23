# Pass Emploi Web

> Espace conseiller (Next.js App Router + custom server). Versions : `package.json` et `.nvmrc`. Toujours `yarn`.

@../pass-emploi-tools/docs/CONTEXTE-TRANSVERSE.md

---

## Vérifications après modification

| Vérification | Commande                                         |
|--------------|--------------------------------------------------|
| Typecheck    | `yarn tsc` (`tsconfig.json` est en `noEmit`)     |
| Lint         | `yarn lint` / `yarn lint:fix`                    |
| Tests        | `yarn test` (Jest + coverage, `TZ=Europe/Paris`) |
| Un fichier   | `TZ=Europe/Paris yarn jest tests/chemin/Fichier.test.tsx` |

Pas de scan sécurité local : il ne tourne qu'en CI (`security-checks.yml`).

---

## Architecture

En couches : `app/` (routes) → `services/` (métier, 1 par domaine) → `clients/` (`api.client.ts`, `firebase.client.ts`).

- `interfaces/` : types métier ; `interfaces/json/` : types API + fonctions `jsonToXxx` / `xxxToJson`.
- `components/` : composants par domaine, `components/ui/` pour le générique.
- `utils/` : `auth/` (`getMandatorySessionServerSide()` en SSR), `hooks/`, `analytics/` (Matomo),
  `chat/` (chiffrement des messages), `AppContextProviders.tsx` (contextes React).
- `fixtures/` : factories de test ; `tests/` : tests, structure miroir.
- Route groups `(nom)` : absents de l'URL ; `(connected)` = authentifié.
- `proxy.ts` à la racine (ex-`middleware.ts`, renommé par Next 16).
- **Custom server `server.ts`** : démarre Elastic APM avant Next. Conséquence : pas d'Automatic Static
  Optimization.
- **Firebase** : messagerie temps réel uniquement, messages chiffrés côté client.
- SVG importés comme composants React (`@svgr/webpack`, `next.config.ts`).

---

## Conventions de code

Prettier et ESLint font foi. Points non évidents :

- **Apostrophes** : apostrophe typographique `’` (U+2019) dans tout texte affiché. En JSX, `&apos;` ou `’`
  directement. Dans les tests, doubles guillemets autour d'un texte qui contient `’`. Sans apostrophe :
  single quotes.
- Imports ordonnés par groupes, ligne vide entre groupes (règle ESLint, `lint:fix` corrige).
- React Compiler activé (plugin ESLint).
- Dates : `luxon`. Analytics : Matomo. Imports absolus depuis la racine (`baseUrl: .`).

---

## Auth

`next-auth` avec provider custom vers pass-emploi-connect (`utils/auth/authenticator.ts`). Routes
`app/api/auth/[...nextauth]` et `app/api/auth/federated-logout`.

---

## Développement local

`yarn dev` (`.env.local` tel quel), `yarn dev:local` (API locale `localhost:5000`), `yarn dev:staging`
(API staging) ; alias `yarn watch[:local|:staging]`.

`.env.api-local` / `.env.api-staging` sont **committés et sans secret** : ils surchargent
`NEXT_PUBLIC_API_ENDPOINT` par-dessus `.env.local`, chargés avant lui via `dotenv-cli` (premier
fichier gagne). L'auth (`KEYCLOAK_ISSUER`, `NEXTAUTH_URL`) reste celle de `.env.local`
(staging) dans les deux profils — seule l'API backend ciblée change.

Secrets : `.env.local.template` + dotvault (voir `CONTEXTE-TRANSVERSE.md`).

---

## Déploiement

Scalingo : `pa-front-staging` (`develop`), `pa-front-prod` (`master`). Review apps sur PR vers `develop`
(`pa-front-staging-pr<numéro>`), détruites au merge.
