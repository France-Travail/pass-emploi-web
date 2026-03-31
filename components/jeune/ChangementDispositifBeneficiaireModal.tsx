import { ForwardedRef, forwardRef, useState } from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import Input from 'components/ui/Form/Input'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import { MotifSuppressionBeneficiaire } from 'interfaces/referentiel'
import { toShortDate } from 'utils/date'

type ChangementDispositifBeneficiaireModalProps = {
  dispositif: string
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
    lastActivity,
    motifsFinAccompagnement,
    onConfirm,
    onConfirmFinAccompagnement,
    onCancel,
  }: ChangementDispositifBeneficiaireModalProps,
  ref: ForwardedRef<ModalHandles>
) {
  const [raison, setRaison] = useState<'erreur' | 'fin-accompagnement'>()
  const [motif, setMotif] = useState<string>('')
  const [dateFinAccompagnement, setDateFinAccompagnement] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const nouveauDispositif = dispositif === 'CEJ' ? 'PACEA' : 'CEJ'

  async function handleConfirmerErreur() {
    setLoading(true)
    try {
      await onConfirm(nouveauDispositif)
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmerFinAccompagnement() {
    setLoading(true)
    try {
      await onConfirmFinAccompagnement(
        nouveauDispositif,
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
      title={`Confirmation du changement de dispositif — Passage en ${nouveauDispositif} sans perte de données`}
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
            onChange={() => setRaison('erreur')}
          />
          Le dispositif {dispositif} a été sélectionné par erreur
        </label>

        <label className='flex gap-2 items-center cursor-pointer'>
          <input
            type='radio'
            name='raison-changement'
            value='fin-accompagnement'
            onChange={() => setRaison('fin-accompagnement')}
          />
          Fin d&#39;un accompagnement {dispositif} et poursuite en{' '}
          {nouveauDispositif}
        </label>
      </fieldset>

      {raison === 'erreur' && (
        <Button
          style={ButtonStyle.PRIMARY}
          onClick={handleConfirmerErreur}
          className='block mx-auto mt-10'
          isLoading={loading}
        >
          Confirmer le passage du bénéficiaire en {nouveauDispositif}
        </Button>
      )}

      {raison === 'fin-accompagnement' && (
        <>
          <p className='mt-8 mb-8 text-base'>
            Merci de renseigner ces informations pour les statistiques du{' '}
            {dispositif}
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
            Confirmer le passage du bénéficiaire en {nouveauDispositif}
          </Button>
        </>
      )}
    </Modal>
  )
}

export default forwardRef(ChangementDispositifBeneficiaireModal)
