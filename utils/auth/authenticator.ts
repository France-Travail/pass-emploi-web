import { decode, JwtPayload } from 'jsonwebtoken'
import { DateTime } from 'luxon'
import { Account } from 'next-auth'
import { HydratedJWT, JWT } from 'next-auth/jwt'

import { UserRole, UserType } from 'interfaces/conseiller'
import { fetchJson } from 'utils/httpClient'
import { toEcsError } from 'utils/monitoring/ecsHelpers'
import { rootLogger } from 'utils/monitoring/logger'

function secondsToMilliseconds(seconds: number): number {
  return seconds * 1000
}

interface RefreshedTokens {
  access_token: string | undefined
  refresh_token: string | undefined
  expires_in: number | undefined
}

export const RefreshAccessTokenError = 'RefreshAccessTokenError'

const issuerPrefix = process.env.KEYCLOAK_ISSUER

const pendingRefreshes = new Map<string, Promise<HydratedJWT>>()

export async function handleJWTAndRefresh({
  jwt,
  account,
}: {
  jwt: JWT | HydratedJWT
  account?: Account | null
}): Promise<HydratedJWT> {
  if (account) return hydrateJwtAtFirstSignin(account, jwt)

  const hydratedJWT = jwt as HydratedJWT
  const tokenIsExpired = hydratedJWT.expiresAtTimestamp
    ? DateTime.now() >
      DateTime.fromMillis(hydratedJWT.expiresAtTimestamp).minus({
        second: 15,
      })
    : false

  if (!tokenIsExpired) return hydratedJWT

  const key = hydratedJWT.refreshToken
  if (!key) return refreshAccessToken(hydratedJWT)

  if (!pendingRefreshes.has(key)) {
    const promise = refreshAccessToken(hydratedJWT).finally(() =>
      pendingRefreshes.delete(key)
    )
    pendingRefreshes.set(key, promise)
  }
  return pendingRefreshes.get(key)!
}

async function hydrateJwtAtFirstSignin(
  { access_token, expires_at, refresh_token }: Account,
  jwt: JWT
): Promise<HydratedJWT> {
  const { userId, userStructure, userRoles, userType } = decode(
    <string>access_token
  ) as JwtPayload

  rootLogger.info(
    {
      event: { action: 'auth_succeeded', outcome: 'success' },
      'log.logger': 'Authenticator',
      user: { id: userId, type: userType, structure: userStructure },
    },
    'auth_succeeded'
  )

  const expiresAt = expires_at ? secondsToMilliseconds(expires_at) : undefined

  return {
    ...jwt,
    accessToken: access_token,
    refreshToken: refresh_token,
    idConseiller: userId,
    structureConseiller: userStructure,
    estConseiller: userType === UserType.CONSEILLER,
    estSuperviseur: Boolean(userRoles?.includes(UserRole.SUPERVISEUR)),
    expiresAtTimestamp: expiresAt,
  }
}

async function refreshAccessToken(jwt: HydratedJWT): Promise<HydratedJWT> {
  try {
    const refreshedTokens = await fetchRefreshedTokens(jwt.refreshToken)

    const expiresAtMs = refreshedTokens.expires_in
      ? DateTime.now().plus({ second: refreshedTokens.expires_in }).toMillis()
      : jwt.expiresAtTimestamp

    rootLogger.info(
      {
        event: { action: 'token_refreshed', outcome: 'success' },
        'log.logger': 'Authenticator',
      },
      'token_refreshed'
    )

    return {
      ...jwt,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token ?? jwt.refreshToken,
      expiresAtTimestamp: expiresAtMs,
    }
  } catch (error) {
    rootLogger.info(
      {
        event: { action: 'token_refresh_failed', outcome: 'failure' },
        'log.logger': 'Authenticator',
        error: toEcsError(error),
      },
      'token_refresh_failed'
    )

    return {
      ...jwt,
      error: RefreshAccessTokenError,
    }
  }
}

async function fetchRefreshedTokens(
  refreshToken?: string
): Promise<RefreshedTokens> {
  const url = `${issuerPrefix}/protocol/openid-connect/token`
  const body = new URLSearchParams({
    client_id: process.env.KEYCLOAK_ID ?? '',
    client_secret: process.env.KEYCLOAK_SECRET ?? '',
    grant_type: 'refresh_token',
    refresh_token: `${refreshToken}`,
  })

  const { content: tokens } = await fetchJson(url, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
    body,
  })
  return tokens
}
