import React, { FormEvent, MouseEvent, useRef, useState } from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import InputError from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import ResettableTextInput from 'components/ui/Form/ResettableTextInput'
import SelectAutocomplete from 'components/ui/Form/SelectAutocomplete'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { ValueWithError } from 'components/ValueWithError'
import { Agence } from 'interfaces/referentiel'
import { EMAIL_SUPPORT } from 'referentiel/support'

const NB_CARACTERES_MINIMUM_RECHERCHE = 3

function libelleAgence({ nom, codeDepartement }: Agence): string {
  return codeDepartement ? `${nom} (${codeDepartement})` : nom
}

function libelleDansLeReferentiel(
  agence: { id?: string; nom: string },
  referentiel: Agence[]
): string | undefined {
  const trouvee = referentiel.find(({ id }) => id === agence.id)
  return trouvee && libelleAgence(trouvee)
}

interface RenseignementAgenceFormProps {
  referentielAgences: Agence[]
  onAgenceChoisie: (agence: { id?: string; nom: string }) => void
  onClose?: (e: MouseEvent) => void
  avecSaisieLibre?: boolean
  agenceActuelle?: { id?: string; nom: string }
}

export default function RenseignementAgenceForm({
  referentielAgences,
  onAgenceChoisie,
  onClose,
  avecSaisieLibre = true,
  agenceActuelle,
}: RenseignementAgenceFormProps) {
  const libelleAgenceActuelle = agenceActuelle
    ? (libelleDansLeReferentiel(agenceActuelle, referentielAgences) ??
      agenceActuelle.nom)
    : ''
  const [idAgenceSelectionnee, setIdAgenceSelectionnee] =
    useState<ValueWithError>({ value: agenceActuelle?.id ?? '' })
  const [agenceNonTrouvee, setAgenceNonTrouvee] = useState<boolean>(false)
  const [agenceLibre, setAgenceLibre] = useState<ValueWithError>({ value: '' })
  const [recherche, setRecherche] = useState<string>(libelleAgenceActuelle)
  const searchAgenceRef = useRef<HTMLInputElement>(null)
  const agenceLibreRef = useRef<HTMLInputElement>(null)

  const showAgenceLibre = avecSaisieLibre && agenceNonTrouvee

  const suggestions =
    recherche.length < NB_CARACTERES_MINIMUM_RECHERCHE
      ? []
      : referentielAgences.filter((agence) =>
          libelleAgence(agence).toLowerCase().includes(recherche.toLowerCase())
        )

  function selectAgence(saisie: string) {
    setRecherche(saisie)
    const agence = referentielAgences.find((a) => libelleAgence(a) === saisie)
    setIdAgenceSelectionnee({ value: agence?.id ?? '' })
  }

  function submitAgenceSelectionnee(e: FormEvent) {
    e.preventDefault()
    if (!showAgenceLibre) {
      if (!idAgenceSelectionnee.value) {
        setIdAgenceSelectionnee({
          ...idAgenceSelectionnee,
          error: `Sélectionner une agence dans la liste`,
        })
      } else {
        const agenceChoisie = referentielAgences.find(
          ({ id }) => id === idAgenceSelectionnee.value
        )
        onAgenceChoisie(agenceChoisie!)
      }
    } else {
      if (!agenceLibre.value) {
        setAgenceLibre({ ...agenceLibre, error: `Saisir une agence` })
      } else {
        onAgenceChoisie({ nom: agenceLibre.value })
      }
    }
  }

  function toggleAgenceNonTrouvee(
    e: React.ChangeEvent<HTMLInputElement>
  ): void {
    setAgenceNonTrouvee(e.target.checked)
    if (!avecSaisieLibre) return

    if (e.target.checked) {
      searchAgenceRef.current!.value = ''
      setRecherche('')
      setIdAgenceSelectionnee({ value: '' })
    } else {
      agenceLibreRef.current!.value = ''
      setAgenceLibre({ value: '' })
    }
  }

  return (
    <form
      onSubmit={submitAgenceSelectionnee}
      noValidate={true}
      className='px-10 pt-6'
    >
      <Label htmlFor='search-agence'>
        Taper 3 caractères minimum pour rechercher votre agence ci-dessous
      </Label>
      {idAgenceSelectionnee.error && (
        <InputError id='search-agence--error' className='mt-2'>
          {idAgenceSelectionnee.error}
        </InputError>
      )}
      <SelectAutocomplete
        id='search-agence'
        ref={searchAgenceRef}
        options={suggestions.map((agence) => ({
          id: agence.id,
          value: libelleAgence(agence),
        }))}
        onChange={selectAgence}
        defaultValue={libelleAgenceActuelle}
        invalid={Boolean(idAgenceSelectionnee.error)}
        disabled={showAgenceLibre}
      />

      <input
        type='checkbox'
        id='agence-not-found'
        onChange={toggleAgenceNonTrouvee}
        className='mt-6'
      />
      <label htmlFor='agence-not-found' className='ml-2 text-base-regular mb-4'>
        Mon agence n’apparaît pas dans la liste
      </label>

      {avecSaisieLibre && (
        <div
          className={`${!showAgenceLibre ? 'invisible' : ''}`}
          aria-hidden={!showAgenceLibre}
        >
          <Label htmlFor='agence-libre'>Saisir le nom de votre agence</Label>
          {agenceLibre.error && (
            <InputError id='agence-libre--error'>
              {agenceLibre.error}
            </InputError>
          )}
          <ResettableTextInput
            id='agence-libre'
            ref={agenceLibreRef}
            value={agenceLibre.value ?? ''}
            onChange={(value) => setAgenceLibre({ value })}
            onReset={() => setAgenceLibre({ value: '' })}
            className={`mt-2 border border-solid rounded-base w-full ${
              agenceLibre.error
                ? 'border-warning text-warning'
                : 'border-content-color'
            }`}
          />
        </div>
      )}

      {!avecSaisieLibre && agenceNonTrouvee && (
        <InformationMessage
          className='mt-6'
          label={`Si vous ne trouvez pas votre agence, veuillez contacter le support à cet adresse email : ${EMAIL_SUPPORT}`}
        />
      )}

      <div className='mt-14 flex justify-center'>
        {onClose && (
          <Button type='button' style={ButtonStyle.SECONDARY} onClick={onClose}>
            Annuler
          </Button>
        )}
        <Button className={onClose ? 'ml-6' : ''} type='submit'>
          {agenceActuelle ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  )
}
