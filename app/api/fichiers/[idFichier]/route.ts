import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'
import { toEcsError } from 'utils/monitoring/ecsHelpers'
import { rootLogger } from 'utils/monitoring/logger'
import { initRequestId } from 'utils/monitoring/requestStore'

export async function GET(
  _: Request,
  { params }: { params: Promise<{ idFichier: string }> }
) {
  const requestId = (await headers()).get('x-request-id')
  if (requestId) initRequestId(requestId)

  const { accessToken } = await getMandatorySessionServerSide()

  try {
    const { idFichier } = await params
    redirect(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/fichiers/${idFichier}?token=${accessToken}`
    )
  } catch (error) {
    if ((error as Error)?.message.startsWith('NEXT_REDIRECT')) throw error

    rootLogger.error(
      {
        event: { action: 'request_failed', outcome: 'failure' },
        error: toEcsError(error),
      },
      'request_failed'
    )
    redirect(process.env.NEXTAUTH_URL ?? '')
  }
}
