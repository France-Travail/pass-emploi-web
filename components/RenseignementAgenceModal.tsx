import React, { useRef } from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import RenseignementAgenceForm from 'components/RenseignementAgenceForm'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { Agence } from 'interfaces/referentiel'

interface RenseignementAgenceModalProps {
  referentielAgences: Agence[]
  onAgenceChoisie: (agence: { id?: string; nom: string }) => void
  onClose?: () => void
  avecSaisieLibre?: boolean
}

export default function RenseignementAgenceModal({
  referentielAgences,
  onAgenceChoisie,
  onClose,
  avecSaisieLibre = true,
}: RenseignementAgenceModalProps) {
  const modalRef = useRef<ModalHandles>(null)
  const fermable = Boolean(onClose)

  return (
    <Modal
      ref={modalRef}
      title={titre(avecSaisieLibre, fermable)}
      onClose={() => onClose?.()}
      fermable={fermable}
    >
      {avecSaisieLibre && (
        <>
          <InformationMessage label='La liste des agences a été mise à jour et les accents sont pris en compte.' />
          <div className='mt-2'>
            <InformationMessage label='Une fois votre agence renseignée, ce message n’apparaîtra plus.' />
          </div>
        </>
      )}

      {!avecSaisieLibre && (
        <InformationMessage label='Sélectionnez l’agence dans laquelle vous travaillez actuellement. Elle vous sera redemandée tous les 6 mois.' />
      )}

      <RenseignementAgenceForm
        referentielAgences={referentielAgences}
        onAgenceChoisie={onAgenceChoisie}
        avecSaisieLibre={avecSaisieLibre}
        onClose={fermable ? (e) => modalRef.current!.closeModal(e) : undefined}
      />
    </Modal>
  )
}

function titre(avecSaisieLibre: boolean, fermable: boolean): string {
  if (avecSaisieLibre) return 'Ajoutez votre agence à votre profil'
  return fermable ? 'Modifier votre agence' : 'Confirmez votre agence'
}
