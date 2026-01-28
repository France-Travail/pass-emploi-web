import React, { useState } from 'react'

import IndicationRechercheDossier from 'components/jeune/IndicationRechercheDossier'
import Button from 'components/ui/Button/Button'
import Input from 'components/ui/Form/Input'
import InputError from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'

type FormulaireRechercheDossierProps = {
  onRechercheDossier: (idDossier: string) => Promise<void>
  idDossier?: string
}

export default function FormulaireRechercheDossier({
  onRechercheDossier,
  idDossier: idDossierProp = '',
}: Readonly<FormulaireRechercheDossierProps>) {
  const [idDossier, setIdDossier] = useState<string>(idDossierProp)
  const [messageErreur, setMessageErreur] = useState<string | undefined>()
  const [rechercheEnCours, setRechercheEnCours] = useState<boolean>(false)

  async function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!idDossier) {
      setMessageErreur(
        'Le champ "Numéro de dossier" est vide. Renseigner un numéro. Exemple : 123456'
      )
      return
    }

    try {
      setRechercheEnCours(true)
      await onRechercheDossier(idDossier)
    } finally {
      setRechercheEnCours(false)
    }
  }

  function handleSearchInputChanges(value: string) {
    setMessageErreur(undefined)
    setIdDossier(value)
  }

  return (
    <>
      <p className='text-m-bold mb-4'>
        Saisissez le numéro de dossier du jeune pour lequel vous voulez créer un
        compte
      </p>

      <IndicationRechercheDossier />

      <form onSubmit={handleSearchSubmit}>
        <Label htmlFor='recherche-numero'>
          {{ main: 'Numéro de dossier', helpText: 'Exemple : 123456' }}
        </Label>
        <div className='w-8/12'></div>

        {messageErreur && (
          <InputError id='recherche-numero--error' className='mb-2'>
            {messageErreur}
          </InputError>
        )}

        <Input
          type='text'
          id='recherche-numero'
          defaultValue={idDossier}
          onChange={handleSearchInputChanges}
          invalid={Boolean(messageErreur)}
          placeholder='123456'
        />

        <Button type='submit' isLoading={rechercheEnCours}>
          Valider le numéro
        </Button>
      </form>
    </>
  )
}
