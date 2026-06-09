import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { getSessionServerSide } from 'utils/auth/auth'
import { toEcsError } from 'utils/monitoring/ecsHelpers'
import { rootLogger } from 'utils/monitoring/logger'
import { initRequestId } from 'utils/monitoring/requestStore'

const rootUrl: string | undefined = process.env.NEXTAUTH_URL

export async function GET() {
  const requestId = (await headers()).get('x-request-id')
  if (requestId) initRequestId(requestId)

  if (!(await getSessionServerSide())) redirect('/login')

  try {
    const issuerLogout = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/logout`
    const redirectToSessionLogout = new URLSearchParams({
      client_id: process.env.KEYCLOAK_ID ?? '',
      post_logout_redirect_uri: rootUrl ? `${rootUrl}/logout` : '',
      redirect_uri: rootUrl ? `${rootUrl}/logout` : '',
    })

    redirect(`${issuerLogout}?${redirectToSessionLogout}`)
  } catch (error) {
    if ((error as Error)?.message.startsWith('NEXT_REDIRECT')) throw error

    rootLogger.error(
      {
        event: { action: 'request_failed', outcome: 'failure' },
        error: toEcsError(error),
      },
      'request_failed'
    )
    redirect(rootUrl ?? '')
  }
}
