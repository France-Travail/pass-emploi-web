'use client'

import { apm } from '@elastic/apm-rum'
import { ThemeProvider } from 'next-themes'
import React, { ReactNode } from 'react'

import ClientOnlyContainer from 'components/ClientOnlyContainer'
import {
  BeneficiaireFromListe,
  compareBeneficiairesByNom,
  extractBeneficiaireWithActivity,
} from 'interfaces/beneficiaire'
import { Conseiller } from 'interfaces/conseiller'
import { estPassEmploi } from 'interfaces/structure'
import { ActualitesProvider } from 'utils/actualitesContext'
import { AlerteProvider } from 'utils/alerteContext'
import { ChatCredentialsProvider } from 'utils/chat/chatCredentialsContext'
import { ChatsProvider } from 'utils/chat/chatsContext'
import { CurrentConversationProvider } from 'utils/chat/currentConversationContext'
import { ListeSelectionneeProvider } from 'utils/chat/listeSelectionneeContext'
import { ShowRubriqueListeProvider } from 'utils/chat/showRubriqueListeContext'
import {
  ConseillerProvider,
  useConseiller,
} from 'utils/conseiller/conseillerContext'
import { MobileViewportProvider } from 'utils/mobileViewportContext'
import { PortefeuilleProvider } from 'utils/portefeuilleContext'

export default function AppContextProviders({
  conseiller,
  portefeuille,
  children,
}: {
  conseiller: Conseiller
  portefeuille: BeneficiaireFromListe[]
  children: ReactNode
}) {
  const portefeuilleTrie = portefeuille
    .map(extractBeneficiaireWithActivity)
    .sort(compareBeneficiairesByNom)

  apm.setUserContext({
    id: conseiller.id,
    username: `${conseiller.firstName} ${conseiller.lastName}`,
    email: conseiller.email,
  })

  return (
    <MobileViewportProvider>
      <ConseillerProvider conseiller={conseiller}>
        <PortefeuilleProvider portefeuille={portefeuilleTrie}>
          <ActualitesProvider>
            <ChatCredentialsProvider>
              <ChatsProvider>
                <CurrentConversationProvider>
                  <ShowRubriqueListeProvider>
                    <ListeSelectionneeProvider>
                      <AlerteProvider>
                        <ClientOnlyContainer>
                          <ThemeDuConseiller>{children}</ThemeDuConseiller>
                        </ClientOnlyContainer>
                      </AlerteProvider>
                    </ListeSelectionneeProvider>
                  </ShowRubriqueListeProvider>
                </CurrentConversationProvider>
              </ChatsProvider>
            </ChatCredentialsProvider>
          </ActualitesProvider>
        </PortefeuilleProvider>
      </ConseillerProvider>
    </MobileViewportProvider>
  )
}

// Lit le conseiller du contexte : l'habillage suit un changement de dispositif
// sans rechargement.
function ThemeDuConseiller({ children }: Readonly<{ children: ReactNode }>) {
  const [conseiller] = useConseiller()
  const theme = estPassEmploi(conseiller.structure) ? 'darker' : 'neutral'

  return (
    <ThemeProvider
      defaultTheme={'neutral'}
      themes={['neutral', 'darker']}
      forcedTheme={theme}
    >
      {children}
    </ThemeProvider>
  )
}
