import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import MessageriePage from 'app/(connected)/(with-sidebar)/messagerie/MessageriePage'
import { estMilo } from 'interfaces/structure'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

export const metadata: Metadata = { title: 'Messagerie' }

export default async function Messagerie() {
  const { user } = await getMandatorySessionServerSide()
  if (estMilo(user.structure)) notFound()

  return <MessageriePage />
}
