# Contexte Technique - Pass Emploi Web

## Projet

**Nom :** Pass Emploi Web (anciennement CEJ - Contrat d'Engagement Jeune)
**Rôle :** Espace conseiller pour accompagner les bénéficiaires du CEJ
**Repo :** pass-emploi-web
**Version actuelle :** 6.6.3

---

## Stack Technique

### Framework & Runtime

| Technologie | Version | Notes |
|------------|---------|-------|
| **Next.js** | 15.5.8 | App Router (pas Pages Router) |
| **React** | 19.2.3 | Mode strict activé |
| **TypeScript** | 5.8.3 | Config stricte |
| **Node.js** | 22.14.0 | Défini dans engines + .nvmrc |
| **Package Manager** | Yarn 4.5.1 | Pas npm, toujours utiliser `yarn` |

### Bibliothèques Principales

**Authentification & Sécurité :**
- `next-auth@4.24.13` : Gestion auth (sessions, tokens)
- `jsonwebtoken@9.0.3` : Manipulation JWT
- `crypto-js@4.2.0` : Chiffrement (chat)
- `sanitize-html@2.17.0` : Protection XSS
- `dotvault@0.0.9` : Chiffrement variables d'env

**UI & Styling :**
- `tailwindcss@4.1.8` : Framework CSS
- Fonts Marianne : DSFR (Design System de l'État Français)
- `@svgr/webpack@8.1.0` : Import SVG as React components

**Data & Temps :**
- `luxon@3.6.1` : Manipulation dates (pas Moment.js ni date-fns)
- `firebase@11.8.1` : Messagerie temps réel uniquement

**Monitoring & Analytics :**
- `elastic-apm-node@4.13.0` : APM backend
- `@elastic/apm-rum@5.17.0` : APM frontend
- `matomo-tracker@2.2.4` : Analytics (pas Google Analytics)

**Utilitaires :**
- `html-react-parser@5.2.5` : Parse HTML en React
- `lodash.isequal@4.5.0` : Comparaison profonde
- `next-themes@0.4.6` : Gestion thèmes
- `pino@9.7.0` : Logging structuré

### Testing & Quality

- **Tests :** Jest 29.7.0 + Testing Library (React 16.3.0, DOM 10.4.0, User Event 14.6.1)
- **Accessibilité :** `jest-axe@10.0.0`
- **Linting :** ESLint 9.28.0 (flat config) + Prettier 3.5.3
- **Type checking :** TypeScript strict mode
- **Coverage :** Jest coverage intégré

---

## Architecture

### Structure des Répertoires

```
/
├── app/                    # Next.js App Router (routes & pages)
│   ├── (connexion)/        # Groupe de routes : login, logout
│   ├── (connected)/        # Groupe de routes authentifiées
│   │   ├── (full-page)/    # Layout pleine page (sans sidebar)
│   │   └── (with-sidebar)/ # Layout avec sidebar
│   │       ├── (with-chat)/        # Avec chat
│   │       ├── (without-chat)/     # Sans chat
│   │       └── messagerie/         # Page messagerie
│   ├── api/                # API Routes (health, auth, fichiers, etc.)
│   └── components/         # Composants spécifiques à app/
│
├── components/             # Composants React globaux (par domaine)
│   ├── action/             # Composants actions
│   ├── chat/               # Composants messagerie
│   ├── jeune/              # Composants bénéficiaires
│   ├── ui/                 # Composants UI génériques
│   ├── global/             # Composants globaux (Analytics, etc.)
│   └── layouts/            # Layouts réutilisables
│
├── services/               # Logique métier (business logic)
│   ├── actions.service.ts
│   ├── beneficiaires.service.ts
│   ├── conseiller.service.ts
│   └── ...                 # 1 service par domaine métier
│
├── clients/                # Clients HTTP (communication externe)
│   ├── api.client.ts       # Client API backend
│   └── firebase.client.ts  # Client Firebase
│
├── interfaces/             # Types TypeScript
│   ├── action.ts           # Types métier
│   ├── beneficiaire.ts
│   └── json/               # Types API (JSON)
│       ├── action.ts       # Avec fonctions de transformation
│       └── ...
│
├── utils/                  # Utilitaires & helpers
│   ├── analytics/          # Matomo
│   ├── auth/               # Helpers auth (sessions)
│   ├── chat/               # Crypto chat
│   ├── hooks/              # Custom hooks React
│   ├── monitoring/         # Elastic APM
│   ├── date.ts             # Helpers dates
│   ├── helpers.ts          # Helpers généraux
│   └── httpClient.ts       # Fetch wrapper
│
├── fixtures/               # Données de test (factories)
├── tests/                  # Tests unitaires (mirror structure)
├── referentiel/            # Référentiels métier (domaines, événements)
├── types/                  # Type definitions globales (.d.ts)
├── styles/                 # CSS globaux + Tailwind
├── public/                 # Assets statiques
└── dist/                   # Build server.ts (gitignored)
```

### Patterns & Conventions

**Architecture en couches :**
1. **Routes** (`app/`) → appellent les services
2. **Services** (`services/`) → logique métier, appellent les clients
3. **Clients** (`clients/`) → communication HTTP/Firebase
4. **Interfaces** → transformation JSON ↔ Modèle métier

**Transformation des données :**
```typescript
// Pattern systématique dans interfaces/json/
export function jsonToAction(json: ActionJson): Action { ... }
export function actionToJson(action: Action): ActionJson { ... }
```

**Server-side data fetching :**
```typescript
// Pattern dans services/
export async function getConseillerServerSide(
  userId: string
): Promise<Conseiller> {
  const session = await getMandatorySessionServerSide()
  return apiGet(`/conseillers/${userId}`, session.accessToken)
}
```

**Context providers :**
- Centralisés dans `utils/AppContextProviders.tsx`
- Contextes : actualites, alerte, portefeuille, mobileViewport

**Custom hooks :**
- `useDebounce` : Debouncing valeurs
- `useSessionStorage` : Persist state dans sessionStorage
- `useConfirmBeforeLeaving` : Confirm navigation

---

## Conventions de Code

### Prettier (`.prettierrc`)

```json
{
  "semi": false,              // Pas de point-virgule
  "trailingComma": "es5",     // Trailing comma ES5
  "singleQuote": true,        // Guillemets simples
  "jsxSingleQuote": true,     // Guillemets simples en JSX
  "tabWidth": 2,              // 2 espaces
  "useTabs": false            // Pas de tabs
}
```

### ESLint (règles importantes)

- **Import ordering :** Ordre alphabétique avec groupes (builtin, external, internal, parent, sibling)
- **Newlines between imports :** Toujours
- **Unused vars :** Erreur (sauf si préfixe `_`)
- **React compiler :** Activé (optimisations auto)
- **a11y :** Règles strictes avec composants custom mappés

### TypeScript

- **Strict mode :** Activé
- **baseUrl :** `.` (imports absolus depuis racine)
- **Pas de `any`** sans justification

### Nommage

- **Composants :** PascalCase (`BeneficiaireCard.tsx`)
- **Hooks :** `use` prefix (`useDebounce.ts`)
- **Services :** `*.service.ts`
- **Tests :** `*.test.ts` (à côté du fichier ou dans `tests/`)
- **Types :** PascalCase pour interfaces/types
- **Constantes :** UPPER_SNAKE_CASE pour constantes globales

---

## Authentification & Sécurité

### next-auth

- **Provider :** Custom provider (France Travail)
- **Sessions :** JWT stockées côté serveur
- **Routes :**
  - `/api/auth/[...nextauth]` : Endpoints next-auth
  - `/api/auth/federated-logout` : Logout fédéré
- **Helper :** `getMandatorySessionServerSide()` pour récupérer session en SSR

### dotvault (Secrets)

```bash
# Déchiffrer les variables d'env
npx dotvault decrypt

# Chiffrer après modification
npx dotvault encrypt
```

- **Fichier template :** `.env.local.template`
- **Clé vault :** Demander à l'équipe ou Vaultwarden
- **Fichier chiffré :** `.vault` (commité)

### Sécurité

- **XSS :** `sanitize-html` pour contenu utilisateur
- **CVEs :** Resolutions dans `package.json` (ex: glob >= 10.5.0)
- **Headers :** Middleware ajoute `x-current-path`
- **Source maps :** Activées en prod pour debugging

---

## Développement Local

### Setup Initial

```bash
# 1. Installer la bonne version de Node
nvm install  # lit .nvmrc (22.14.0)

# 2. Installer Yarn globalement
npm install --global yarn

# 3. Installer les dépendances
yarn

# 4. Configurer les variables d'env
cp .env.local.template .env.local
# Demander la dotvault key à l'équipe
npx dotvault decrypt

# 5. Lancer le serveur de dev
yarn dev
```

### Scripts Disponibles

| Commande | Description |
|----------|-------------|
| `yarn dev` | Serveur de dev sur http://localhost:3000 (avec pino-pretty pour les logs) |
| `yarn watch` | Alias de `dev` |
| `yarn build` | Build production (Next.js + server.ts) |
| `yarn start` | Démarre le serveur prod (après build) |
| `yarn lint` | ESLint |
| `yarn test` | Jest avec coverage |
| `yarn test:watch` | Jest en mode watch |
| `yarn release:patch` | Release patch (x.x.X) |
| `yarn release:minor` | Release minor (x.X.0) |
| `yarn release:major` | Release major (X.0.0) |

### Testing

- **Config :** `jest.config.js` (utilise `next/jest`)
- **Setup :** `setupTests.ts` (jest-axe, etc.)
- **Environment :** jsdom
- **Coverage :** Activé par défaut avec `yarn test`
- **Timezone :** Europe/Paris (défini dans script test)

### Custom Server

⚠️ **Important :** Le projet utilise un custom server (`server.ts`) pour Elastic APM.

```typescript
// server.ts
import apm from 'elastic-apm-node/start'  // DOIT être en premier
import next from 'next'
```

**Conséquence :** Certaines optimisations Next.js (Automatic Static Optimization) ne sont pas disponibles.

---

## Déploiement & Environnements

### Scalingo

**Environnements :**
- **Staging :** `pa-front-staging` (branche `develop`)
- **Production :** `pa-front-prod` (branche `master`)

**Déploiement automatique :** Push sur `develop` ou `master` déclenche un deploy.

**Review Apps :** Activées sur staging uniquement
- Nommage : `pa-front-staging-pr[numéro]`
- Création : Automatique à l'ouverture d'une PR sur `develop`
- Destruction : Automatique au merge

### Process de Release (Production)

```bash
# Depuis develop
git checkout develop
git pull

# Créer la release (patch/minor/major)
yarn release:patch  # ou minor/major

# Pusher tags et develop
git push --tags
git push origin develop

# Merger sur master
git checkout master
git pull
git merge develop
git push

# Un deploy auto se lance sur Scalingo prod
```

**Hotfix :** Utiliser `yarn release:patch` puis `cherry-pick` sur master.

### Variables d'Environnement

**Principales vars (voir `.env.local.template`) :**
- `NEXT_PUBLIC_API_ENDPOINT` : URL API backend
- `NEXT_PUBLIC_MATOMO_*` : Config Matomo
- `NEXTAUTH_*` : Config next-auth
- `ELASTIC_APM_*` : Config APM
- `LOGO_AUTHORIZED_URL` : Domaines autorisés pour images

---

## Monitoring & Analytics

### Elastic APM

**Backend :** `elastic-apm-node` (démarré dans `server.ts`)
**Frontend :** `@elastic/apm-rum-react`

- Transaction name : `METHOD /path` (défini dans server.ts)
- Composant : `<RealUserMonitoring />` dans root layout

### Matomo

- Config : `utils/analytics/matomo.ts`
- Composant : `<Analytics />` dans root layout
- Tracking : Pages vues, événements custom

### Web Vitals

- Composant : `<WebVitals />` dans root layout
- Envoie CLS, FID, LCP, etc. à Matomo/APM

---

## Spécificités Techniques

### Next.js App Router

⚠️ **Utilise App Router (pas Pages Router)**

**Routes groupées :** `(nom-groupe)` n'apparaît pas dans l'URL
```
app/(connected)/mes-jeunes/page.tsx  →  /mes-jeunes
```

**Layouts imbriqués :** Chaque segment peut avoir son `layout.tsx`

**Middleware :** `middleware.ts` à la racine (pas dans `app/`)

### Webpack Custom

**SVG Loader :**
```typescript
// next.config.ts
config.module.rules.push({
  test: /\.svg$/i,
  use: [{ loader: '@svgr/webpack', options: { titleProp: true } }],
})
```

Usage :
```tsx
import MonIcone from 'assets/icone.svg'
<MonIcone title="Description" />
```

### Firebase

**Utilisation :** Messagerie temps réel uniquement (pas auth, pas Firestore pour autre chose)

**Client :** `clients/firebase.client.ts`

**Chiffrement :** Messages chiffrés avec `crypto-js` (voir `utils/chat/chatCrypto.ts`)

### Images

**Next Image :** Domaines autorisés définis dans `LOGO_AUTHORIZED_URL` (env var)
```typescript
// next.config.ts
images: {
  remotePatterns: process.env.LOGO_AUTHORIZED_URL.split(',').map(...)
}
```

### Fonts

**Marianne (DSFR) :** Chargée en local font dans `app/layout.tsx`
- Regular (400)
- Medium (500)
- Bold (700)

---

## CI/CD

### GitHub Actions

**Workflow :** `.github/workflows/github-actions.yml`

**Déclenchement :**
- Push sur `develop` ou `master`
- Ouverture/sync PR (sauf draft)

**Jobs :**
1. **Install :** `yarn`
2. **Lint :** `yarn lint`
3. **Test :** `yarn test` (avec coverage)
4. **SonarQube :** Scan qualité code

**Node version :** 22.14.0 (matrix strategy)

### Semgrep

**Workflow :** `.github/workflows/semgrep-analysis.yml`
**Status :** ⚠️ Désactivé actuellement (problèmes de fonctionnement)

### SonarQube

**Config :** `sonar-project.properties`
**Secret :** `SONAR_TOKEN` (GitHub secret)

---

## Notes Importantes

### Dependabot / Renovate

**Config :** `renovate.json`
**Resolutions :** Certains packages ont des resolutions forcées pour CVEs (voir `package.json` comments)

### Bundle Analyzer

```bash
ANALYZE=true yarn build
```

Génère un rapport visuel des bundles (gzip sizes).

### Migrations

**Next.js 15 :** Le projet utilise Next.js 15 (sortie fin 2024)
- React 19 compatible
- App Router stable
- Turbopack disponible (pas activé)

**React Compiler :** Plugin ESLint activé, optimisations auto des re-renders

---

## Glossaire Métier

- **CEJ :** Contrat d'Engagement Jeune
- **Bénéficiaire / Jeune :** Utilisateur accompagné par un conseiller
- **Conseiller :** Utilisateur de cette application
- **Action :** Tâche assignée à un bénéficiaire
- **MILO :** Mission Locale (structure d'accompagnement)
- **France Travail :** Nouveau nom de Pôle Emploi
- **SNP :** Situation Non Professionnelle
- **Portefeuille :** Ensemble des bénéficiaires d'un conseiller