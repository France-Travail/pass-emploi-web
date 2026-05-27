import apm, { UserObject } from 'elastic-apm-node'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Session } from 'next-auth'

import { getSessionServerSide } from 'utils/auth/auth'
import { RefreshAccessTokenError } from 'utils/auth/authenticator'
import { requestContext } from 'utils/monitoring/requestContext'

export default async function getMandatorySessionServerSide(): Promise<Session> {
  const session = await getSessionServerSide()
  if (!session) {
    const headersList = await headers()
    const currentPath = headersList.get('x-current-path')
    const redirectQueryParam = currentPath
      ? `?${new URLSearchParams({ redirectUrl: currentPath })}`
      : ''
    redirect('/login' + redirectQueryParam)
  }

  if (!session.user.estConseiller) redirect('/api/auth/federated-logout')

  if (session.error === RefreshAccessTokenError)
    redirect('/api/auth/federated-logout')

  const { user }: Session = session
  const userAPM: UserObject = {
    id: user.id,
    username: `${user.name}-${user.structure}`,
    email: user.email ?? '',
  }
  apm.setUserContext(userAPM)

  // Enrichissement RequestContext pour le mixin pino (nouveau)
  const store = requestContext.getStore()
  if (store && !store.has('USER')) {
    store.set('USER', {
      id: user.id,
      type: user.estConseiller ? 'CONSEILLER' : 'SUPERVISEUR',
      structure: user.structure,
    })
  }

  return session
}
