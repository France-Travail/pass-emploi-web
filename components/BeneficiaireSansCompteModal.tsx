import { useRef } from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import { estPassEmploi } from 'interfaces/structure'
import { useConseiller } from 'utils/conseiller/conseillerContext'

type BeneficiaireSansCompteModalProps = {
  dossierMilo: string
  onClose: () => void
}

export default function BeneficiaireSansCompteModal({
  dossierMilo,
  onClose,
}: Readonly<BeneficiaireSansCompteModalProps>) {
  const [conseiller] = useConseiller()
  const modalRef = useRef<ModalHandles>(null)

  return (
    <Modal
      ref={modalRef}
      title='Créez le compte de ce jeune'
      titleIllustration={IllustrationName.Info}
      onClose={onClose}
    >
      <p className='text-center'>
        Ce jeune n’a pas encore de compte sur l’application{' '}
        {estPassEmploi(conseiller.structure)
          ? 'pass emploi'
          : '1jeune1solution'}
        . Créez-le maintenant pour commencer son accompagnement.
      </p>

      <div className='mt-8 flex justify-center gap-3'>
        <Button
          type='button'
          style={ButtonStyle.SECONDARY}
          onClick={(e) => modalRef.current!.closeModal(e)}
        >
          Plus tard
        </Button>
        <ButtonLink
          href={`/mes-jeunes/creation-jeune?dossierMilo=${encodeURIComponent(dossierMilo)}`}
        >
          Créer le compte
        </ButtonLink>
      </div>
    </Modal>
  )
}
