import React, { useRef, useState } from 'react'

import BoutonRetour from 'components/chat/BoutonRetour'
import { MessagerieCachee } from 'components/chat/MessagerieCachee'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import SpinningLoader from 'components/ui/SpinningLoader'

import { ActualiteMessage } from '../../interfaces/actualiteMilo'
import Button from '../ui/Button/Button'

import MessageActualites from './MessageActualites'

interface BandeauActualitesProps {
  readonly actualites: ActualiteMessage[] | undefined
  readonly onRetourMessagerie: () => void
}

export default function BandeauActualites({
  actualites,
  onRetourMessagerie,
}: BandeauActualitesProps) {
  const retourRef = useRef<HTMLButtonElement>(null)

  const [messagerieEstVisible, setMessagerieEstVisible] =
    useState<boolean>(true)

  const isLoading = actualites === undefined

  function ouvrirFormulaire() {}

  function permuterVisibiliteMessagerie() {
    setMessagerieEstVisible(!messagerieEstVisible)
  }

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
                <MessageActualites messages={actualites} />
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
