import { ForwardedRef, forwardRef, useState } from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import Input from 'components/ui/Form/Input'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import { getLabelDispositif } from 'interfaces/beneficiaire'
import { MotifSuppressionBeneficiaire } from 'interfaces/referentiel'
import { toShortDate } from 'utils/date'

type Raison = 'erreur' | 'fin-accompagnement'

type ChangementDispositifBeneficiaireModalProps = {
  dispositif: string
  dispositifsCibles: string[]
  lastActivity?: string
  motifsFinAccompagnement: MotifSuppressionBeneficiaire[]
  onConfirm: (nouveauDispositif: string) => Promise<void>
  onConfirmFinAccompagnement: (
    nouveauDispositif: string,
    motif: string,
    dateFinAccompagnement: string
  ) => Promise<void>
  onCancel: () => void
}

function ChangementDispositifBeneficiaireModal(
  {
    dispositif,
    dispositifsCibles,
    lastActivity,
    motifsFinAccompagnement,
    onConfirm,
    onConfirmFinAccompagnement,
    onCancel,
  }: ChangementDispositifBeneficiaireModalProps,
  ref: ForwardedRef<ModalHandles>
) {
  const [raison, setRaison] = useState<Raison>()
  const [dispositifCible, setDispositifCible] = useState<string | undefined>(
    dispositifsCibles.length === 1 ? dispositifsCibles[0] : undefined
  )
  const [motif, setMotif] = useState<string>('')
  const [dateFinAccompagnement, setDateFinAccompagnement] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const labelDispositif = getLabelDispositif(dispositif)
  const doitChoisirLeDispositifCible = dispositifsCibles.length > 1
  const labelConfirmation = dispositifCible
    ? `Confirmer le passage du bénéficiaire en ${getLabelDispositif(dispositifCible)}`
    : 'Confirmer le changement de dispositif'

  function choisirErreur() {
    setRaison('erreur')
    if (doitChoisirLeDispositifCible) setDispositifCible(undefined)
  }

  function choisirFinAccompagnement(cible: string) {
    setRaison('fin-accompagnement')
    setDispositifCible(cible)
  }

  async function handleConfirmerErreur() {
    if (!dispositifCible) return

    setLoading(true)
    try {
      await onConfirm(dispositifCible)
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmerFinAccompagnement() {
    if (!dispositifCible) return

    setLoading(true)
    try {
      await onConfirmFinAccompagnement(
        dispositifCible,
        motif,
        dateFinAccompagnement
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      ref={ref}
      title='Confirmation du changement de dispositif Changement de dispositif sans perte de données'
      onClose={onCancel}
      titleIllustration={IllustrationName.ArrowForward}
    >
      <fieldset className='flex flex-col gap-4 mt-4'>
        <legend className='sr-only'>Raison du changement de dispositif</legend>

        <label className='flex gap-2 items-center cursor-pointer mt-10 mb-4'>
          <input
            type='radio'
            name='raison-changement'
            value='erreur'
            checked={raison === 'erreur'}
            onChange={choisirErreur}
          />
          Le dispositif {labelDispositif} a été sélectionné par erreur
        </label>

        {dispositifsCibles.map((cible) => (
          <label key={cible} className='flex gap-2 items-center cursor-pointer'>
            <input
              type='radio'
              name='raison-changement'
              value={`fin-accompagnement-${cible}`}
              checked={
                raison === 'fin-accompagnement' && dispositifCible === cible
              }
              onChange={() => choisirFinAccompagnement(cible)}
            />
            Fin d&#39;un accompagnement {labelDispositif} et poursuite en{' '}
            {getLabelDispositif(cible)}
          </label>
        ))}
      </fieldset>

      {raison === 'erreur' && (
        <>
          {doitChoisirLeDispositifCible && (
            <fieldset className='flex flex-col gap-4 mt-8'>
              <legend className='text-base-bold mb-4'>
                Sélectionner le dispositif du bénéficiaire
              </legend>

              {dispositifsCibles.map((cible) => (
                <label
                  key={cible}
                  className='flex gap-2 items-center cursor-pointer'
                >
                  <input
                    type='radio'
                    name='dispositif-cible'
                    value={cible}
                    checked={dispositifCible === cible}
                    onChange={() => setDispositifCible(cible)}
                  />
                  {getLabelDispositif(cible)}
                </label>
              ))}
            </fieldset>
          )}

          <Button
            style={ButtonStyle.PRIMARY}
            onClick={handleConfirmerErreur}
            className='block mx-auto mt-10'
            isLoading={loading}
            disabled={!dispositifCible}
          >
            {labelConfirmation}
          </Button>
        </>
      )}

      {raison === 'fin-accompagnement' && (
        <>
          <p className='mt-8 mb-8 text-base'>
            Merci de renseigner ces informations pour les statistiques du{' '}
            {labelDispositif}
          </p>

          <div className='flex flex-col gap-4'>
            <div>
              <Label htmlFor='motif-fin-accompagnement' inputRequired={true}>
                Motif de fin d&#39;accompagnement
              </Label>
              <Select
                id='motif-fin-accompagnement'
                required
                onChange={setMotif}
              >
                {motifsFinAccompagnement.map(({ motif: m }) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor='date-fin-accompagnement' inputRequired={true}>
                {lastActivity
                  ? {
                      main: "Date de fin d'accompagnement",
                      helpText: `la dernière activité date du ${toShortDate(lastActivity)}`,
                    }
                  : "Date de fin d'accompagnement"}
              </Label>
              <Input
                type='date'
                id='date-fin-accompagnement'
                onChange={setDateFinAccompagnement}
                required={true}
              />
            </div>
          </div>

          <Button
            style={ButtonStyle.PRIMARY}
            onClick={handleConfirmerFinAccompagnement}
            className='block mx-auto'
            isLoading={loading}
            disabled={!motif || !dateFinAccompagnement}
          >
            {labelConfirmation}
          </Button>
        </>
      )}
    </Modal>
  )
}

export default forwardRef(ChangementDispositifBeneficiaireModal)
