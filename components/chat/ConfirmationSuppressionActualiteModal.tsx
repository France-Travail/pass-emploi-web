import { useRef } from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { IconName } from 'components/ui/IconComponent'

interface ConfirmationSuppressionActualiteModalProps {
  readonly onConfirmation: () => void
  readonly onCancel: () => void
}

export default function ConfirmationSuppressionActualiteModal({
  onConfirmation,
  onCancel,
}: ConfirmationSuppressionActualiteModalProps) {
  const modalRef = useRef<ModalHandles>(null)

  function confirmer() {
    modalRef.current?.closeModal()
    onConfirmation()
  }

  return (
    <Modal
      title="Supprimer l'actualité dans le fil de votre mission locale"
      onClose={onCancel}
      ref={modalRef}
      titleIcon={IconName.RemoveModalActualite}
      titleIconClassName='block w-[102px] h-[101px] m-auto mb-8'
    >
      <div className='px-20 text-center'>
        <p className='mt-6'>
          Êtes-vous bien sûr de vouloir supprimer cette actualité&nbsp;?
        </p>
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
          Confirmer
        </Button>
      </div>
    </Modal>
  )
}
