import React, { FormEvent, useRef, useState } from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
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

interface RenseignementDispositifModalProps {
  onDispositifChoisi: (dispositif: Dispositif) => Promise<void>
  dispositifActuel?: Dispositif
  onClose?: () => void
}

// Sans onClose, la modale ne peut pas être fermée : le conseiller doit choisir.
export default function RenseignementDispositifModal({
  onDispositifChoisi,
  dispositifActuel,
  onClose,
}: Readonly<RenseignementDispositifModalProps>) {
  const modalRef = useRef<ModalHandles>(null)
  const fermable = Boolean(onClose)

  const [structureChoisie, setStructureChoisie] = useState<Structure | ''>(
    dispositifActuel ? (structureFTDuDispositif(dispositifActuel) ?? '') : ''
  )
  const [loading, setLoading] = useState<boolean>(false)

  async function submitDispositif(e: FormEvent) {
    e.preventDefault()
    if (!structureChoisie) return

    setLoading(true)
    try {
      await onDispositifChoisi(dispositifDeLaStructureFT(structureChoisie))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      ref={modalRef}
      title={
        dispositifActuel
          ? 'Modifier mon dispositif'
          : 'Choisissez votre dispositif'
      }
      onClose={() => onClose?.()}
      fermable={fermable}
    >
      {!fermable && (
        <InformationMessage label='Une fois votre dispositif renseigné, ce message n’apparaîtra plus.' />
      )}
      <div className='mt-2'>
        <InformationMessage label='Vos bénéficiaires seront rattachés au nouveau dispositif. Les réaffectations temporaires gardent leur dispositif actuel.' />
      </div>

      <form onSubmit={submitDispositif} className='px-10 pt-6'>
        <Label htmlFor='dispositif' inputRequired={true}>
          {dispositifActuel
            ? 'Sélectionner le nouveau dispositif dans la liste suivante'
            : 'Votre dispositif'}
        </Label>
        <Select
          id='dispositif'
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
          {fermable && (
            <Button
              type='button'
              style={ButtonStyle.SECONDARY}
              onClick={(e) => modalRef.current!.closeModal(e)}
            >
              Annuler
            </Button>
          )}
          <Button
            className={fermable ? 'ml-6' : ''}
            type='submit'
            disabled={!structureChoisie}
            isLoading={loading}
          >
            {dispositifActuel ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
