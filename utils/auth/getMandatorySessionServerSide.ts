import apm, { UserObject } from 'elastic-apm-node'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Session } from 'next-auth'

import { getSessionServerSide } from 'utils/auth/auth'
import { RefreshAccessTokenError } from 'utils/auth/authenticator'
import { requestContext } from 'utils/monitoring/requestContext'
import {
  initRequestId,
  initRequestUser,
  LogUser,
} from 'utils/monitoring/requestStore'

export default async function getMandatorySessionServerSide(): Promise<Session> {
  const session = await getSessionServerSide()
  const headersList = await headers()

  if (!session) {
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

  const logUser: LogUser = {
    id: user.id,
    type: user.estConseiller ? 'CONSEILLER' : 'SUPERVISEUR',
    structure: user.structure,
  }
  const store = requestContext.getStore()
  if (store && !store.has('USER')) store.set('USER', logUser)

  // Le rendu RSC ne voit pas l'AsyncLocalStorage de server.ts : on redouble
  // dans le requestStore (React.cache) pour que le mixin pino retrouve le contexte.
  initRequestUser(logUser)
  const requestId = headersList.get('x-request-id')
  if (requestId) initRequestId(requestId)

  return session
}
