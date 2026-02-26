import React, { useEffect, useRef, useState } from 'react'

import BoutonRetour from 'components/chat/BoutonRetour'
import Modal from 'components/Modal'
import BoutonDisplayPlus from 'components/ui/Button/BoutonDisplayPlus'
import Button from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import SpinningLoader from 'components/ui/SpinningLoader'
import { creerActualiteMissionLocaleClientSide } from 'services/actualites.service'

import { ActualiteMessage } from 'interfaces/actualiteMilo'

import FormulaireActualite from './FormulaireActualite'
import MessageActualites from './MessageActualites'

interface BandeauActualitesProps {
  readonly actualites: ActualiteMessage[] | undefined
  readonly onRetourMessagerie: () => void
  readonly onActualiteCreee?: () => void
}
const NB_ACTUALITES_PAR_PAGE = 10
export default function BandeauActualites({
  actualites,
  onRetourMessagerie,
  onActualiteCreee,
}: BandeauActualitesProps) {
  const retourRef = useRef<HTMLButtonElement>(null)
  const idPrecedentePremiereActualite = useRef<string | undefined>(undefined)

  const [nombreActualitesAffichees, setNombreActualitesAffichees] =
    useState<number>(NB_ACTUALITES_PAR_PAGE)
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true)
  const [afficherModal, setAfficherModal] = useState<boolean>(false)
  const [erreurCreation, setErreurCreation] = useState<string | undefined>()

  const isLoading = actualites === undefined

  const actualitesAffichees = actualites?.slice(
    Math.max(0, actualites.length - nombreActualitesAffichees)
  )
  const aPlusActualites =
    actualites && actualites.length > nombreActualitesAffichees

  function ouvrirFormulaire() {
    setAfficherModal(true)
  }

  function fermerModal() {
    setAfficherModal(false)
  }

  async function creerActualite(
    titre: string,
    contenu: string,
    titreLien?: string,
    lien?: string
  ) {
    try {
      await creerActualiteMissionLocaleClientSide(titre, contenu, titreLien, lien)
      fermerModal()
      if (onActualiteCreee) onActualiteCreee()
    } catch {
      setErreurCreation(
        "Une erreur est survenue lors de la diffusion de l'actualité. Veuillez réessayer."
      )
    }
  }

  function chargerPlusActualites() {
    if (actualitesAffichees && actualitesAffichees.length > 0) {
      idPrecedentePremiereActualite.current = actualitesAffichees[0].id
    }
    setIsInitialLoad(false)
    setNombreActualitesAffichees(
      nombreActualitesAffichees + NB_ACTUALITES_PAR_PAGE
    )
  }

  useEffect(() => {
    if (
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
  }, [nombreActualitesAffichees])

  return (
    <>
      <div className='flex items-center mx-4 my-6'>
        <BoutonRetour
          ref={retourRef}
          labelRetour='Retour'
          onBack={onRetourMessagerie}
        />
        <h2 className='w-full text-left text-primary text-m-bold ml-2 mt-4'>
          Actualités de ma mission locale
        </h2>
      </div>

      <div className='relative h-full overflow-y-auto p-4'>
        {isLoading && <SpinningLoader alert={true} />}

        {!isLoading && (
          <>
            {actualites && actualites.length > 0 ? (
              <>
                {aPlusActualites && (
                  <BoutonDisplayPlus
                    onClick={chargerPlusActualites}
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

      <div className='justify-center mb-6 mr-4 ml-4'>
        <Button onClick={ouvrirFormulaire} className='w-full'>
          <IconComponent
            name={IconName.SpeakerButton}
            className='w-4 h-4 mr-2 mt-1'
            aria-hidden={true}
            focusable={false}
          />
          Diffuser une actualité
        </Button>
      </div>

      {afficherModal && (
        <Modal
          titleIcon={IconName.ChevronWithCircle}
          titleIconClassName='w-[140px] h-[140px] m-auto fill-primary mb-8'
          title='Partager ici une actualité de votre mission locale'
          onClose={fermerModal}
          containerClassName='rounded-large bg-white w-[620px] max-w-[90%] max-h-[90vh] overflow-auto p-3'
        >
          {erreurCreation && (
            <p role='alert' className='text-warning text-s-bold mb-4'>
              {erreurCreation}
            </p>
          )}
          <FormulaireActualite onCreation={creerActualite} />
        </Modal>
      )}
    </>
  )
}
