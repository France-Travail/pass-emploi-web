import React, { FormEvent, useRef, useState } from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { Dispositif } from 'interfaces/beneficiaire'
import { ImpactChangementDispositif } from 'interfaces/conseiller'
import {
  dispositifDeLaStructureFT,
  structuresFTHorsDispositif,
} from 'interfaces/profil'
import {
  labelStructure,
  Structure,
  structuresFranceTravail,
} from 'interfaces/structure'
import { EMAIL_SUPPORT } from 'referentiel/support'
import { useConseiller } from 'utils/conseiller/conseillerContext'

interface RenseignementDispositifModalProps {
  onDispositifChoisi: (dispositif: Dispositif) => Promise<void>
  dispositifActuel?: Dispositif
  onDispositifReconfirme?: (dispositif: Dispositif) => Promise<void>
  onClose?: () => void
}

type Mode = 'choix' | 'modification' | 'reconfirmation'

const LIBELLES: Record<
  Mode,
  {
    titre: string
    titreValidation: string
    information: string
    dispositif: string
    valider: string
  }
> = {
  choix: {
    titre: 'Choisissez votre dispositif',
    titreValidation: 'Choisissez votre dispositif',
    information:
      'Vos bénéficiaires seront rattachés au nouveau dispositif. Les réaffectations temporaires gardent leur dispositif actuel.',
    dispositif: 'Votre dispositif',
    valider: 'Suivant',
  },
  modification: {
    titre: 'Modifier mon dispositif',
    titreValidation: 'Modifier mon dispositif',
    information:
      'Vos bénéficiaires seront rattachés au nouveau dispositif. Les réaffectations temporaires gardent leur dispositif actuel.',
    dispositif: 'Sélectionner le nouveau dispositif dans la liste suivante',
    valider: 'Suivant',
  },
  reconfirmation: {
    titre: 'Indiquer mon dispositif',
    titreValidation: 'Valider mon dispositif',
    information:
      'Vos bénéficiaires seront rattachés au dispositif sélectionné. Les réaffectations temporaires gardent leur dispositif actuel.',
    dispositif: 'Sélectionner le dispositif dans la liste suivante',
    valider: 'Confirmer',
  },
}

// Sans onClose la modale est non fermable. Deux étapes : choix, puis confirmation chiffrée.
// Avec onDispositifReconfirme, le dispositif actuel reste proposé : le rechoisir saute la 2e étape.
export default function RenseignementDispositifModal({
  onDispositifChoisi,
  dispositifActuel,
  onDispositifReconfirme,
  onClose,
}: Readonly<RenseignementDispositifModalProps>) {
  const modalRef = useRef<ModalHandles>(null)
  const [conseiller] = useConseiller()
  const fermable = Boolean(onClose)
  const mode = determinerMode(dispositifActuel, onDispositifReconfirme)
  const libelles = LIBELLES[mode]

  const [structureChoisie, setStructureChoisie] = useState<Structure | ''>('')
  const structuresProposees =
    mode === 'reconfirmation'
      ? structuresFranceTravail
      : structuresFTHorsDispositif(dispositifActuel)
  const [impact, setImpact] = useState<ImpactChangementDispositif>()
  const [loading, setLoading] = useState<boolean>(false)

  async function passerALaConfirmation(e: FormEvent) {
    e.preventDefault()
    if (!structureChoisie) return

    setLoading(true)
    try {
      const dispositifChoisi = dispositifDeLaStructureFT(structureChoisie)
      if (onDispositifReconfirme && dispositifChoisi === dispositifActuel) {
        await onDispositifReconfirme(dispositifChoisi)
        return
      }

      const { getImpactChangementDispositif } =
        await import('services/conseiller.service')
      setImpact(await getImpactChangementDispositif(conseiller.id))
    } finally {
      setLoading(false)
    }
  }

  async function confirmer() {
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
      title={impact ? libelles.titreValidation : libelles.titre}
      onClose={() => onClose?.()}
      fermable={fermable}
    >
      {!impact && (
        <>
          {mode === 'choix' && (
            <InformationMessage label='Une fois votre dispositif renseigné, ce message n’apparaîtra plus.' />
          )}
          <div className='mt-2'>
            <InformationMessage label={libelles.information} />
          </div>

          <form onSubmit={passerALaConfirmation} className='px-10 pt-6'>
            <Label htmlFor='dispositif' inputRequired={true}>
              {libelles.dispositif}
            </Label>
            <Select
              id='dispositif'
              required={true}
              defaultValue={structureChoisie}
              onChange={(value) => setStructureChoisie(value as Structure)}
            >
              {structuresProposees.map((structure) => (
                <option key={structure} value={structure}>
                  {labelStructure(structure)}
                </option>
              ))}
            </Select>

            {mode === 'reconfirmation' && (
              <p className='mt-6 text-base-regular'>
                En cas de problème technique lors du choix de votre dispositif,
                contactez le support :
                <br />
                <a
                  href={`mailto:${EMAIL_SUPPORT}`}
                  className='underline text-primary hover:text-primary-darken'
                >
                  {EMAIL_SUPPORT}
                </a>
              </p>
            )}

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
                {libelles.valider}
              </Button>
            </div>
          </form>
        </>
      )}

      {impact && structureChoisie && (
        <div className='px-10 pt-6 flex flex-col gap-4 text-base-regular'>
          <p className='text-base-bold'>
            Confirmez-vous le passage au dispositif{' '}
            {labelStructure(structureChoisie)} ?
          </p>
          <p>
            {phraseBeneficiairesConcernes(
              impact,
              labelStructure(structureChoisie)
            )}
          </p>
          {impact.nbBeneficiairesSuivisTemporairement > 0 && (
            <p>
              {phraseBeneficiairesSuivisTemporairement(
                impact.nbBeneficiairesSuivisTemporairement
              )}
            </p>
          )}
          <p>
            Vous serez déconnecté après validation. Reconnectez-vous pour
            retrouver votre portefeuille, avec vos identifiants habituels.
          </p>

          <div className='mt-10 flex justify-center'>
            <Button
              type='button'
              style={ButtonStyle.SECONDARY}
              onClick={() => setImpact(undefined)}
            >
              Retour
            </Button>
            <Button
              className='ml-6'
              type='button'
              onClick={confirmer}
              isLoading={loading}
            >
              Confirmer
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

function determinerMode(
  dispositifActuel?: Dispositif,
  onDispositifReconfirme?: (dispositif: Dispositif) => Promise<void>
): Mode {
  if (onDispositifReconfirme) return 'reconfirmation'
  return dispositifActuel ? 'modification' : 'choix'
}

function phraseBeneficiairesConcernes(
  {
    nbBeneficiairesConcernes,
    nbBeneficiairesTransferesTemporairement,
  }: ImpactChangementDispositif,
  labelDispositif: string
): string {
  if (nbBeneficiairesConcernes === 0)
    return `Aucun bénéficiaire de votre portefeuille ne passera au dispositif ${labelDispositif}.`

  const concernes =
    nbBeneficiairesConcernes === 1
      ? `1 bénéficiaire de votre portefeuille passera au dispositif ${labelDispositif}.`
      : `${nbBeneficiairesConcernes} bénéficiaires de votre portefeuille passeront au dispositif ${labelDispositif}.`

  if (nbBeneficiairesTransferesTemporairement === 0) return concernes

  const transferes =
    nbBeneficiairesTransferesTemporairement === 1
      ? 'Dont 1 bénéficiaire actuellement suivi à titre temporaire par un autre conseiller.'
      : `Dont ${nbBeneficiairesTransferesTemporairement} bénéficiaires actuellement suivis à titre temporaire par un autre conseiller.`
  return `${concernes} ${transferes}`
}

function phraseBeneficiairesSuivisTemporairement(nb: number): string {
  if (nb === 1)
    return '1 bénéficiaire gardera son dispositif actuel car vous le suivez temporairement.'
  return `${nb} bénéficiaires garderont leur dispositif actuel car vous les suivez temporairement.`
}
