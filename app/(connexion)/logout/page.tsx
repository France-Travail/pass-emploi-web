import { Metadata } from 'next'

import LogoutPage from 'app/(connexion)/logout/LogoutPage'
import { estFranceTravail } from 'interfaces/structure'
import { getSessionServerSide } from 'utils/auth/auth'

export const metadata: Metadata = { title: 'Déconnexion' }

export default async function Logout() {
  let callbackUrl = '/login'

  const session = await getSessionServerSide()
  if (session && estFranceTravail(session.user.structure))
    callbackUrl += '/france-travail'

  return <LogoutPage callbackUrl={callbackUrl} />
}
