import React, { FormEvent, useState } from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import InputError from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import ResettableTextarea from 'components/ui/Form/ResettableTextarea'
import ResettableTextInput from 'components/ui/Form/ResettableTextInput'

type FormulaireActualiteProps = {
  onCreation: (
    titre: string,
    contenu: string,
    titreLien?: string,
    lien?: string
  ) => Promise<void>
  onAnnulation: () => void
}

export default function FormulaireActualite({
  onCreation,
  onAnnulation,
}: Readonly<FormulaireActualiteProps>) {
  const [titre, setTitre] = useState<string>('')
  const [contenu, setContenu] = useState<string>('')
  const [titreLien, setTitreLien] = useState<string>('')
  const [lien, setLien] = useState<string>('')

  const [erreurTitre, setErreurTitre] = useState<string | undefined>()
  const [erreurContenu, setErreurContenu] = useState<string | undefined>()
  const [erreurLien, setErreurLien] = useState<string | undefined>()

  const [creationEnCours, setCreationEnCours] = useState<boolean>(false)

  function validerFormulaire(): boolean {
    let isValid = true

    if (!titre.trim()) {
      setErreurTitre('Le champ "Titre" est obligatoire')
      isValid = false
    }

    if (!contenu.trim()) {
      setErreurContenu('Le champ "Contenu" est obligatoire')
      isValid = false
    }

    if (titreLien.trim() && !lien.trim()) {
      setErreurLien(
        'Si vous renseignez un titre de lien, le lien est obligatoire'
      )
      isValid = false
    }

    return isValid
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setErreurTitre(undefined)
    setErreurContenu(undefined)
    setErreurLien(undefined)

    if (!validerFormulaire()) {
      return
    }

    try {
      setCreationEnCours(true)
      await onCreation(
        titre.trim(),
        contenu.trim(),
        titreLien.trim() || undefined,
        lien.trim() || undefined
      )
    } finally {
      setCreationEnCours(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate={true}
      className='flex flex-col gap-6'
    >
      <div>
        <Label
          htmlFor='actualite-titre'
          inputRequired={true}
          mainClassName='text-base-bold'
        >
          Titre
        </Label>
        {erreurTitre && (
          <InputError id='actualite-titre--error' className='mb-2'>
            {erreurTitre}
          </InputError>
        )}
        <ResettableTextInput
          type='text'
          id='actualite-titre'
          value={titre}
          onChange={(value) => {
            if (value.length <= 100) {
              setTitre(value)
              setErreurTitre(undefined)
            }
          }}
          onReset={() => {
            setTitre('')
            setErreurTitre(undefined)
          }}
          invalid={Boolean(erreurTitre)}
        />
        <div className='text-xs-regular text-right mt-1'>
          {titre.length} / 100
        </div>
      </div>

      <div>
        <Label
          htmlFor='actualite-contenu'
          mainClassName='text-base-bold'
          inputRequired={true}
        >
          Contenu
        </Label>
        {erreurContenu && (
          <InputError id='actualite-contenu--error' className='mb-2'>
            {erreurContenu}
          </InputError>
        )}
        <ResettableTextarea
          id='actualite-contenu'
          value={contenu}
          onChange={(value) => {
            setContenu(value)
            setErreurContenu(undefined)
          }}
          onReset={() => {
            setContenu('')
            setErreurContenu(undefined)
          }}
          invalid={Boolean(erreurContenu)}
          rows={5}
          maxLength={500}
          placeholder='Renseigner une description pour votre actualité'
        />
      </div>

      <div>
        <Label htmlFor='actualite-titre-lien' mainClassName='text-base-bold'>
          Titre du lien
        </Label>
        <ResettableTextInput
          type='text'
          id='actualite-titre-lien'
          value={titreLien}
          onChange={(value) => {
            if (value.length <= 50) {
              setTitreLien(value)
              setErreurLien(undefined)
            }
          }}
          onReset={() => {
            setTitreLien('')
            setErreurLien(undefined)
          }}
          invalid={Boolean(erreurLien)}
        />
        <div className='text-xs-regular text-right mt-1'>
          {titreLien.length} / 50
        </div>
      </div>

      <div>
        <Label htmlFor='actualite-lien' mainClassName='text-base-bold'>
          Lien
        </Label>
        {erreurLien && (
          <InputError id='actualite-lien--error' className='mb-2'>
            {erreurLien}
          </InputError>
        )}
        <ResettableTextInput
          type='url'
          id='actualite-lien'
          value={lien}
          onChange={(value) => {
            setLien(value)
            setErreurLien(undefined)
          }}
          onReset={() => {
            setLien('')
            setErreurLien(undefined)
          }}
          invalid={Boolean(erreurLien)}
        />
      </div>

      <div className='flex justify-center gap-4'>
        <Button
          type='button'
          onClick={onAnnulation}
          style={ButtonStyle.SECONDARY}
        >
          Annuler
        </Button>
        <Button type='submit' isLoading={creationEnCours}>
          Diffuser mon actualité aux bénéficiaires
        </Button>
      </div>
    </form>
  )
}
