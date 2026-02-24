import React, { useRef } from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'

interface ConfirmationRedirectionModalProps {
  lien: string
  onConfirmation: () => void
  onCancel: () => void
}

export default function ConfirmationRedirectionModal({
  lien,
  onConfirmation,
  onCancel,
}: ConfirmationRedirectionModalProps) {
  const modalRef = useRef<ModalHandles>(null)

  function confirmer() {
    onConfirmation()
    modalRef.current?.closeModal()
  }

  return (
    <Modal
      title='Redirection vers un site externe'
      onClose={onCancel}
      ref={modalRef}
      titleIcon={IconName.Warning}
    >
      <div className='px-20 text-center'>
        <p className='mt-6'>
          Vous allez quitter l&apos;espace conseiller pour accéder au site :
        </p>
        <p className='mt-4 text-s-bold break-all'>{lien}</p>
      </div>

      <div className='mt-14 flex justify-center'>
        <Button
          type='button'
          style={ButtonStyle.SECONDARY}
          onClick={(e) => modalRef.current!.closeModal(e)}
          className='mr-3'
        >
          Annuler
        </Button>
        <Button type='button' onClick={confirmer}>
          <IconComponent
            name={IconName.OpenInNew}
            className='w-4 h-4 mr-2'
            aria-hidden={true}
            focusable={false}
          />
          Continuer
        </Button>
      </div>
    </Modal>
  )
}
