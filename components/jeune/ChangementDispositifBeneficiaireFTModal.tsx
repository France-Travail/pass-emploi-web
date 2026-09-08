import React, { FormEvent, useRef, useState } from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import { Dispositif } from 'interfaces/beneficiaire'
import {
  dispositifDeLaStructureFT,
  structureFTDuDispositif,
} from 'interfaces/profil'
import {
  labelStructure,
  Structure,
  structuresFranceTravail,
} from 'interfaces/structure'

type ChangementDispositifBeneficiaireFTModalProps = {
  dispositif: string
  onConfirm: (nouveauDispositif: Dispositif) => Promise<void>
  onCancel: () => void
}

// Changement de dispositif d'un bénéficiaire France Travail, sans transition :
// le bénéficiaire garde son historique. Le parent ferme la modale après succès.
export default function ChangementDispositifBeneficiaireFTModal({
  dispositif,
  onConfirm,
  onCancel,
}: Readonly<ChangementDispositifBeneficiaireFTModalProps>) {
  const modalRef = useRef<ModalHandles>(null)

  const [structureChoisie, setStructureChoisie] = useState<Structure | ''>(
    structureFTDuDispositif(dispositif) ?? ''
  )
  const [loading, setLoading] = useState<boolean>(false)

  const dispositifInchange =
    Boolean(structureChoisie) &&
    dispositifDeLaStructureFT(structureChoisie as Structure) === dispositif

  async function submitDispositif(e: FormEvent) {
    e.preventDefault()
    if (!structureChoisie || dispositifInchange) return

    setLoading(true)
    try {
      await onConfirm(dispositifDeLaStructureFT(structureChoisie))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      ref={modalRef}
      title='Modifier le dispositif du bénéficiaire'
      onClose={onCancel}
    >
      <form onSubmit={submitDispositif} className='px-10 pt-6'>
        <Label htmlFor='dispositif-beneficiaire' inputRequired={true}>
          Sélectionner le nouveau dispositif dans la liste suivante
        </Label>
        <Select
          id='dispositif-beneficiaire'
          required={true}
          defaultValue={structureChoisie}
          onChange={(value) => setStructureChoisie(value as Structure)}
        >
          {structuresFranceTravail.map((structure) => (
            <option key={structure} value={structure}>
              {labelStructure(structure)}
            </option>
          ))}
        </Select>

        <div className='mt-14 flex justify-center'>
          <Button
            type='button'
            style={ButtonStyle.SECONDARY}
            onClick={(e) => modalRef.current!.closeModal(e)}
          >
            Annuler
          </Button>
          <Button
            className='ml-6'
            type='submit'
            disabled={!structureChoisie || dispositifInchange}
            isLoading={loading}
          >
            Modifier
          </Button>
        </div>
      </form>
    </Modal>
  )
}
