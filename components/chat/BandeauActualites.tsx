import React, { useEffect, useRef, useState } from 'react'

import BoutonRetour from 'components/chat/BoutonRetour'
import { MessagerieCachee } from 'components/chat/MessagerieCachee'
import BoutonDisplayPlus from 'components/ui/Button/BoutonDisplayPlus'
import Button from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import SpinningLoader from 'components/ui/SpinningLoader'

import { ActualiteMessage } from '../../interfaces/actualiteMilo'

import MessageActualites from './MessageActualites'

interface BandeauActualitesProps {
  readonly actualites: ActualiteMessage[] | undefined
  readonly onRetourMessagerie: () => void
}

export default function BandeauActualites({
  actualites,
  onRetourMessagerie,
}: BandeauActualitesProps) {
  const NB_ACTUALITES_PAR_PAGE = 5
  const retourRef = useRef<HTMLButtonElement>(null)
  const idPrecedentePremiereActualite = useRef<string | undefined>(undefined)

  const [messagerieEstVisible, setMessagerieEstVisible] =
    useState<boolean>(true)
  const [nombreActualitesAffichees, setNombreActualitesAffichees] =
    useState<number>(NB_ACTUALITES_PAR_PAGE)
  const [loadingMoreActualites, setLoadingMoreActualites] =
    useState<boolean>(false)
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true)

  const isLoading = actualites === undefined

  const actualitesAffichees = actualites?.slice(
    Math.max(0, actualites.length - nombreActualitesAffichees)
  )
  const aPlusActualites =
    actualites && actualites.length > nombreActualitesAffichees

  function ouvrirFormulaire() {}

  function permuterVisibiliteMessagerie() {
    setMessagerieEstVisible(!messagerieEstVisible)
  }

  function chargerPlusActualites() {
    if (actualitesAffichees && actualitesAffichees.length > 0) {
      idPrecedentePremiereActualite.current = actualitesAffichees[0].id
    }
    setIsInitialLoad(false)
    setLoadingMoreActualites(true)
    setTimeout(() => {
      setNombreActualitesAffichees(
        nombreActualitesAffichees + NB_ACTUALITES_PAR_PAGE
      )
      setLoadingMoreActualites(false)
    }, 300)
  }

  useEffect(() => {
    if (
      !loadingMoreActualites &&
      idPrecedentePremiereActualite.current &&
      nombreActualitesAffichees > NB_ACTUALITES_PAR_PAGE
    ) {
      const elementToFocus = document.querySelector(
        `[id="${idPrecedentePremiereActualite.current}"]`
      ) as HTMLElement
      if (elementToFocus) {
        elementToFocus.scrollIntoView({ block: 'nearest', inline: 'nearest' })
        elementToFocus.setAttribute('tabIndex', '-1')
        elementToFocus.focus()
      }
      idPrecedentePremiereActualite.current = undefined
    }
  }, [loadingMoreActualites, nombreActualitesAffichees, NB_ACTUALITES_PAR_PAGE])

  return (
    <>
      <div className='items-center mx-4 my-6'>
        <BoutonRetour
          ref={retourRef}
          labelRetour='Retour'
          onBack={onRetourMessagerie}
        />
        <h2 className='w-full text-left text-primary text-m-bold ml-2 mt-4'>
          Actualités de ma mission locale
        </h2>
      </div>

      {messagerieEstVisible && (
        <div className='items-center relative h-full overflow-y-auto p-4'>
          {isLoading && <SpinningLoader alert={true} />}

          {!isLoading && (
            <>
              {actualites && actualites.length > 0 ? (
                <>
                  {aPlusActualites && (
                    <BoutonDisplayPlus
                      onClick={chargerPlusActualites}
                      isLoading={loadingMoreActualites}
                      label='Voir actualités plus anciennes'
                    />
                  )}
                  {!aPlusActualites &&
                    actualites.length > NB_ACTUALITES_PAR_PAGE && (
                      <p className='text-xs-regular text-center block mb-3'>
                        Aucune actualité plus ancienne
                      </p>
                    )}
                  <MessageActualites
                    messages={actualitesAffichees!}
                    shouldAutoFocusLastMessage={isInitialLoad}
                  />
                </>
              ) : (
                <div className='bg-primary-lighten p-6 rounded-base mb-6'>
                  <div className='flex items-start gap-4'>
                    <div className='flex flex-col items-center gap-4 '>
                      <p className='text-center text-base-bold'>
                        Vous pouvez partager ici les actualités de votre mission
                        locale
                      </p>
                      <p className='text-center text-base-regular'>
                        Elles seront visibles par l&apos;ensemble des
                        bénéficiaires de votre mission locale
                      </p>
                      <IconComponent
                        name={IconName.SpeakerWithCircle}
                        className='w-32 h-32 fill-primary'
                        aria-hidden={true}
                        focusable={false}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className='flex justify-center gap-4'>
        <Button onClick={ouvrirFormulaire}>
          <IconComponent
            name={IconName.Add}
            className='w-4 h-4 mr-2'
            aria-hidden={true}
            focusable={false}
          />
          Créer une actualité
        </Button>
      </div>

      {!messagerieEstVisible && (
        <MessagerieCachee
          permuterVisibiliteMessagerie={permuterVisibiliteMessagerie}
        />
      )}
    </>
  )
}
