import { redirect } from 'next/navigation'

import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'
import { toEcsError } from 'utils/monitoring/ecsHelpers'
import { rootLogger } from 'utils/monitoring/logger'

export async function GET(
  _: Request,
  { params }: { params: Promise<{ idFichier: string }> }
) {
  const { accessToken } = await getMandatorySessionServerSide()

  try {
    const { idFichier } = await params
    redirect(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/fichiers/${idFichier}?token=${accessToken}`
    )
  } catch (error) {
    if ((error as Error)?.message.startsWith('NEXT_REDIRECT')) throw error

    rootLogger.error({ error: toEcsError(error) }, 'request_failed')
    redirect(process.env.NEXTAUTH_URL ?? '')
  }
}
