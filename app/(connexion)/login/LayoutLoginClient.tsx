'use client'

import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from 'next/navigation'
import { getSession } from 'next-auth/react'
import React, { ReactNode, useEffect, useState } from 'react'

import { MIN_DESKTOP_WIDTH } from 'components/globals'
import Footer from 'components/layouts/Footer'
import OnboardingMobileModal from 'components/onboarding/OnboardingMobileModal'
import { trackPage } from 'utils/analytics/matomo'
import { signin } from 'utils/auth/auth'
import { LoginErrorMessageProvider } from 'utils/auth/loginErrorMessageContext'
import { liensFooterLogin } from 'utils/liensFooter'

export default function LayoutLoginClient({
  children,
}: {
  children: ReactNode
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMsg, setErrorMsg] = useState<string>()
  const [afficherOnboarding, setAfficherOnboarding] = useState<boolean>(false)

  const isFromEmail = getIsFromEmail(searchParams)

  useEffect(() => {
    trackPage({
      customTitle: isFromEmail ? 'Connexion - Origine email' : 'Connexion',
      structure: null,
      aDesBeneficiaires: null,
    })
  }, [])

  useEffect(() => {
    getSession().then((session) => {
      const defaultRedirectUrl = searchParams.has('source')
        ? `/?source=${searchParams.get('source')}`
        : '/'
      const redirectUrl = searchParams.get('redirectUrl') ?? defaultRedirectUrl

      if (session) router.replace(redirectUrl)
      else {
        const provider = searchParams.get('provider')
        if (provider) signin(`${provider}-conseiller`, setErrorMsg, redirectUrl)
      }
    })
  }, [])

  useEffect(() => {
    // setTimeout car window n'est accessible qu'après le rendu côté client
    const id = setTimeout(() => {
      if (window.innerWidth < MIN_DESKTOP_WIDTH) setAfficherOnboarding(true)
    }, 0)
    return () => clearTimeout(id)
  }, [])

  return (
    <>
      <LoginErrorMessageProvider state={[errorMsg, setErrorMsg]}>
        <div className='flex flex-col h-screen w-screen overflow-y-auto'>
          <div className='grow flex flex-col justify-center items-center bg-primary-lighten'>
            <div className='max-w-[1020px] w-full bg-white rounded-large p-16'>
              {children}
            </div>
          </div>

          <Footer liens={liensFooterLogin} />
        </div>
      </LoginErrorMessageProvider>

      {afficherOnboarding && (
        <OnboardingMobileModal onClose={() => setAfficherOnboarding(false)} />
      )}
    </>
  )
}

function getIsFromEmail(searchParams: ReadonlyURLSearchParams): boolean {
  return Boolean(
    searchParams.get('source') ||
    searchParams.get('redirectUrl')?.includes('notif-mail')
  )
}
