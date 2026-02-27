import React, { FormEvent, useState } from 'react'

import Button from 'components/ui/Button/Button'
import InputError from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import ResettableTextarea from 'components/ui/Form/ResettableTextarea'
import ResettableTextInput from 'components/ui/Form/ResettableTextInput'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { ValueWithError } from 'components/ValueWithError'

type FormulaireActualiteProps = {
  onCreation: (
    titre: string,
    contenu: string,
    titreLien?: string,
    lien?: string
  ) => Promise<void>
}

export default function FormulaireActualite({
  onCreation,
}: Readonly<FormulaireActualiteProps>) {
  const [titre, setTitre] = useState<ValueWithError>({ value: '' })
  const [contenu, setContenu] = useState<ValueWithError>({ value: '' })
  const [titreLien, setTitreLien] = useState<ValueWithError>({ value: '' })
  const [lien, setLien] = useState<ValueWithError>({ value: '' })

  const [creationEnCours, setCreationEnCours] = useState<boolean>(false)

  function validerFormulaire(): boolean {
    let isValid = true

    if (!titre.value.trim()) {
      setTitre({
        value: titre.value,
        error: 'Le champ "Titre" est obligatoire',
      })
      isValid = false
    }

    if (!contenu.value.trim()) {
      setContenu({
        value: contenu.value,
        error: 'Le champ "Contenu" est obligatoire',
      })
      isValid = false
    }

    function lienInvalide(): boolean {
      let url: URL
      try {
        url = new URL(lien.value?.trim())
      } catch {
        return true
      }

      const protocolValide = ['http:', 'https:'].includes(url.protocol)
      const hostValide = !!url.hostname
      const sansIdentifiants = !url.username && !url.password

      return !protocolValide || !hostValide || !sansIdentifiants
    }

    if (titreLien.value.trim() && !lien.value.trim()) {
      setLien({
        value: lien.value,
        error: 'Si vous renseignez un titre de lien, le lien est obligatoire',
      })
      isValid = false
    } else if (lien.value && lienInvalide()) {
      setLien({
        value: lien.value,
        error: 'Le lien est invalide (ex. : https://exemple.fr)',
      })
      isValid = false
    }

    return isValid
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!validerFormulaire()) {
      return
    }

    try {
      setCreationEnCours(true)
      await onCreation(
        titre.value.trim(),
        contenu.value.trim(),
        titreLien.value.trim() || undefined,
        lien.value.trim() || undefined
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
      <div className='flex flex-col'>
        <Label
          htmlFor='actualite-titre'
          inputRequired={true}
          mainClassName='text-base-bold'
        >
          Titre
        </Label>
        {titre.error && (
          <InputError id='actualite-titre--error' className='mb-2'>
            {titre.error}
          </InputError>
        )}
        <ResettableTextInput
          type='text'
          id='actualite-titre'
          value={titre.value}
          onChange={(value) => {
            if (value.length <= 100) setTitre({ value, error: '' })
          }}
          onReset={() => setTitre({ value: '', error: '' })}
          invalid={Boolean(titre.error)}
          placeholder='Renseigner un titre pour votre actualité'
        />
        <div className='text-xs-regular text-right mt-1'>
          {titre.value.length} / 100
        </div>
      </div>

      <div className='flex flex-col'>
        <Label
          htmlFor='actualite-contenu'
          mainClassName='text-base-bold'
          inputRequired={true}
        >
          Contenu
        </Label>
        {contenu.error && (
          <InputError id='actualite-contenu--error' className='mb-2'>
            {contenu.error}
          </InputError>
        )}
        <ResettableTextarea
          id='actualite-contenu'
          value={contenu.value}
          onChange={(value) => setContenu({ value, error: '' })}
          onReset={() => setContenu({ value: '', error: '' })}
          invalid={Boolean(contenu.error)}
          rows={5}
          maxLength={500}
          placeholder='Renseigner une description pour votre actualité'
        />
      </div>

      <div className='flex flex-col'>
        <Label htmlFor='actualite-titre-lien' mainClassName='text-base-bold'>
          Titre du lien
        </Label>
        <ResettableTextInput
          type='text'
          id='actualite-titre-lien'
          value={titreLien.value}
          onChange={(value) => {
            if (value.length <= 50) setTitreLien({ value, error: '' })
          }}
          onReset={() => setTitreLien({ value: '', error: '' })}
          invalid={Boolean(lien.error)}
          placeholder="Nom du lien qui s'affichera auprès des bénéficiaires"
        />
        <div className='text-xs-regular text-right mt-1'>
          {titreLien.value.length} / 50
        </div>
      </div>

      <div className='flex flex-col'>
        <Label htmlFor='actualite-lien' mainClassName='text-base-bold'>
          Lien de redirection
        </Label>
        {lien.error && (
          <InputError id='actualite-lien--error' className='mb-2'>
            {lien.error}
          </InputError>
        )}
        <ResettableTextInput
          type='url'
          id='actualite-lien'
          value={lien.value}
          onChange={(value) => setLien({ value, error: '' })}
          onReset={() => setLien({ value: '', error: '' })}
          invalid={Boolean(lien.error)}
          placeholder='https://exemple.fr'
        />
      </div>

      <div className='flex justify-center gap-4'>
        <Button type='submit' className='w-full' isLoading={creationEnCours}>
          <IconComponent
            name={IconName.Send}
            focusable={false}
            aria-hidden={true}
            className='mr-2 w-4 h-4'
          />
          Diffuser mon actualité
        </Button>
      </div>
    </form>
  )
}
