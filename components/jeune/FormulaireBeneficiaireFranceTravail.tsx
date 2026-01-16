import React, { FormEvent, useRef, useState } from 'react'

import Checkbox from 'components/offres/Checkbox'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import Input from 'components/ui/Form/Input'
import InputError from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import RecapitulatifErreursFormulaire, {
  LigneErreur,
} from 'components/ui/Notifications/RecapitulatifErreursFormulaire'
import { ValueWithError } from 'components/ValueWithError'
import { BeneficiaireFranceTravailFormData } from 'interfaces/json/beneficiaire'
import { Liste } from 'interfaces/liste'
import { estAvenirPro } from 'interfaces/structure'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { isEmailValid } from 'utils/helpers'

import LabelDeuxEtapes from '../ui/Form/LabelDeuxEtapes'

type FormulaireBeneficiaireFranceTravailProps = {
  aAccesMap: boolean
  creerBeneficiaireFranceTravail: (
    nouveauBeneficiaire: BeneficiaireFranceTravailFormData
  ) => void
  emailBeneficiaireExistant: (mail: string) => Promise<boolean>
  creationEnCours: boolean
  listes?: Liste[]
}

function FormulaireBeneficiaireFranceTravail({
  aAccesMap,
  listes,
  creerBeneficiaireFranceTravail,
  emailBeneficiaireExistant,
  creationEnCours,
}: Readonly<FormulaireBeneficiaireFranceTravailProps>) {
  const formErrorsRef = useRef<HTMLDivElement>(null)
  const etapeRef = useRef<HTMLDivElement>(null)

  const [etape, setEtape] = useState<1 | 2>(1)
  const [conseiller] = useConseiller()
  const estConseillerAvenirPro = estAvenirPro(conseiller.structure)

  const [prenom, setPrenom] = useState<ValueWithError>({
    value: '',
  })
  const [nom, setNom] = useState<ValueWithError>({
    value: '',
  })
  const [email, setEmail] = useState<ValueWithError>({
    value: '',
  })
  const [idListeSelectionnee, setIdListeSelectionnee] = useState<
    ValueWithError<string | undefined>
  >({
    value: undefined,
  })

  const [aBeneficiairePlusDeQuinzeAns, setABeneficiairePlusDeQuinzeAns] =
    useState<ValueWithError<boolean>>({ value: false })

  const validerIdentite = () => {
    let isValid = true
    if (!prenom.value) {
      setPrenom({
        value: prenom.value,
        error: 'Veuillez renseigner le prénom du bénéficiaire',
      })
      isValid = false
    }
    if (!nom.value) {
      setNom({
        value: nom.value,
        error: 'Veuillez renseigner le nom du bénéficiaire',
      })
      isValid = false
    }
    if (estConseillerAvenirPro && !idListeSelectionnee.value) {
      setIdListeSelectionnee({
        value: undefined,
        error: 'Veuillez sélectionner une liste',
      })
      isValid = false
    } else {
      setIdListeSelectionnee({ value: idListeSelectionnee.value, error: '' })
    }

    if (estConseillerAvenirPro && !aBeneficiairePlusDeQuinzeAns.value) {
      setABeneficiairePlusDeQuinzeAns({
        ...aBeneficiairePlusDeQuinzeAns,
        error:
          'Le bénéficiaire doit avoir plus de 15 ans pour créer un compte France Travail. Sélectionnez la case à cocher pour valider l’âge minimum requis.',
      })
      isValid = false
    }

    return isValid
  }

  const validerMail = () => {
    let isValid = true

    if (!email.value) {
      setEmail({
        value: email.value,
        error: "Veuillez renseigner l'e-mail du bénéficiaire",
      })
      isValid = false
    } else if (!isEmailValid(email.value)) {
      setEmail({
        value: email.value,
        error: 'L’e-mail renseigné n’est pas au bon format',
      })
      isValid = false
    }

    return isValid
  }

  function handleBeneficiaireSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const isValid = validerIdentite()

    if (!isValid) {
      formErrorsRef.current?.focus()
      return
    }

    if (isValid && !creationEnCours) {
      const newBeneficiaire: BeneficiaireFranceTravailFormData = {
        prenom: prenom.value,
        nom: nom.value,
        email: email.value,
        idListe: estConseillerAvenirPro ? idListeSelectionnee.value : undefined,
      }

      creerBeneficiaireFranceTravail(newBeneficiaire)
    }
  }
  function handleRetourEtape1() {
    setEtape(1)

    setPrenom({ value: prenom.value, error: '' })
    setNom({ value: nom.value, error: '' })
    setIdListeSelectionnee({ value: idListeSelectionnee.value, error: '' })
    setABeneficiairePlusDeQuinzeAns({
      value: aBeneficiairePlusDeQuinzeAns.value,
      error: '',
    })

    etapeRef.current?.focus()
  }

  async function handleVerifierMailBeneficiaire(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const isValid = validerMail()

    if (!isValid) {
      formErrorsRef.current?.focus()
      return
    }

    if (isValid && !creationEnCours) {
      const emailExistant: boolean = await emailBeneficiaireExistant(
        email.value
      )
      if (!emailExistant) {
        setEtape(2)
        etapeRef.current?.focus()
      }
    }
  }

  function handlePrenomChanges(value: string) {
    setPrenom({ value, error: '' })
  }

  function handleNomChanges(value: string) {
    setNom({ value, error: '' })
  }

  function handleEmailChanges(value: string) {
    setEmail({ value, error: '' })
  }

  function handleIdListeSelectionneeChanges() {
    if (!idListeSelectionnee.value) {
      setIdListeSelectionnee({
        ...idListeSelectionnee,
        error: 'Veuillez sélectionner une liste',
      })
    }
  }

  function handleAgeMinimumBeneficiaireChanges() {
    setABeneficiairePlusDeQuinzeAns({
      value: !aBeneficiairePlusDeQuinzeAns.value,
      error: '',
    })
  }

  function getErreurs(): LigneErreur[] {
    const erreurs = []
    if (prenom.error)
      erreurs.push({
        ancre: '#jeune-prenom',
        label: 'Le champ Prénom est vide.',
        titreChamp: 'Prénom',
      })
    if (nom.error)
      erreurs.push({
        ancre: '#jeune-nom',
        label: 'Le champ Nom est vide.',
        titreChamp: 'Nom',
      })
    if (email.error)
      erreurs.push({
        ancre: '#jeune-email',
        label: 'Le champ Email est vide.',
        titreChamp: 'Email',
      })
    if (idListeSelectionnee.error)
      erreurs.push({
        ancre: '#select-id-liste',
        label: 'Le champ Liste est vide.',
        titreChamp: 'Sélectionnez la liste du bénéficiaire',
      })
    if (aBeneficiairePlusDeQuinzeAns.error)
      erreurs.push({
        ancre: '#age-beneficiaire',
        label: 'La case Validation de l’âge du bénéficiaire n’est pas cochée.',
        titreChamp: "Certification de l'âge supérieur à 15 ans du bénéficiaire",
      })
    return erreurs
  }

  return (
    <>
      <RecapitulatifErreursFormulaire
        erreurs={getErreurs()}
        ref={formErrorsRef}
      />

      <LabelDeuxEtapes etape={etape} ref={etapeRef} />

      {etape === 1 && (
        <>
          <p className='text-m-bold mt-6 mb-4'>
            Renseignez l&#39;adresse mail du bénéficiaire
          </p>

          <form onSubmit={handleVerifierMailBeneficiaire} noValidate={true}>
            <Label htmlFor='jeune-email' inputRequired={true}>
              {{ main: 'E-mail', helpText: '(Obligatoire)' }}
            </Label>
            <p className='text-base-regular mb-3'>
              {aAccesMap
                ? "Utilisez l'adresse e-mail indiquée dans le dossier MAP du bénéficiaire."
                : "Utilisez l'adresse e-mail utilisée par votre bénéficiaire pour se connecter à son espace France Travail."}
            </p>
            {email.error && (
              <InputError id='jeune-email--error'>{email.error}</InputError>
            )}
            <div className='w-8/12'>
              <Input
                type='email'
                id='jeune-email'
                defaultValue={email.value}
                onChange={handleEmailChanges}
                invalid={Boolean(email.error)}
              />
            </div>

            <Button id='submit' type='submit' isLoading={creationEnCours}>
              Continuer
            </Button>
          </form>
        </>
      )}

      {etape === 2 && (
        <>
          <p className='text-m-bold mt-6 mb-4'>
            Renseignez l&#39;identité du bénéficiaire
          </p>

          <form onSubmit={handleBeneficiaireSubmit} noValidate={true}>
            <div className='text-s-bold mb-8'>
              Les champs sont obligatoires.
            </div>

            <Label htmlFor='jeune-prenom' inputRequired={true}>
              Prénom
            </Label>
            {prenom.error && (
              <InputError id='jeune-prenom--error'>{prenom.error}</InputError>
            )}
            <div className='w-8/12'>
              <Input
                type='text'
                id='jeune-prenom'
                defaultValue={prenom.value}
                onChange={handlePrenomChanges}
                invalid={Boolean(prenom.error)}
              />
            </div>

            <Label htmlFor='jeune-nom' inputRequired={true}>
              Nom
            </Label>
            {nom.error && (
              <InputError id='jeune-nom--error'>{nom.error}</InputError>
            )}
            <div className='w-8/12'>
              <Input
                type='text'
                id='jeune-nom'
                defaultValue={nom.value}
                onChange={handleNomChanges}
                invalid={Boolean(nom.error)}
              />
            </div>

            {estConseillerAvenirPro && (
              <>
                <Label htmlFor='select-id-liste' inputRequired={true}>
                  Sélectionnez la liste du bénéficiaire
                </Label>
                {idListeSelectionnee.error && (
                  <InputError id='select-id--error'>
                    {idListeSelectionnee.error}
                  </InputError>
                )}
                <div className='w-8/12'>
                  <Select
                    id='select-id-liste'
                    required={true}
                    onChange={(selectedValue) => {
                      setIdListeSelectionnee({ value: selectedValue })
                    }}
                    invalid={Boolean(idListeSelectionnee.error)}
                    onBlur={handleIdListeSelectionneeChanges}
                  >
                    {listes!.map(({ id, titre }) => (
                      <option key={id} value={id}>
                        {titre}
                      </option>
                    ))}{' '}
                  </Select>
                </div>

                <ButtonLink
                  href='/mes-jeunes/listes/edition-liste'
                  style={ButtonStyle.SECONDARY}
                  className='w-fit mb-8'
                >
                  <IconComponent
                    name={IconName.Add}
                    focusable={false}
                    aria-hidden={true}
                    className='mr-2 w-4 h-4'
                  />
                  Créer une liste
                </ButtonLink>

                <div className='mb-8'>
                  {aBeneficiairePlusDeQuinzeAns.error && (
                    <InputError id='age-beneficiaire--error' className='mt-2'>
                      {aBeneficiairePlusDeQuinzeAns.error}
                    </InputError>
                  )}
                  <Checkbox
                    id='age-beneficiaire'
                    label='Je certifie que le jeune renseigné est âgé de 15 ans ou plus à la date de création du compte.'
                    checked={aBeneficiairePlusDeQuinzeAns.value}
                    value='beneficiairePlusDeQuinzeAns'
                    onChange={handleAgeMinimumBeneficiaireChanges}
                  />
                </div>
              </>
            )}

            <div className='flex items-center gap-4'>
              <Button style={ButtonStyle.TERTIARY} onClick={handleRetourEtape1}>
                <IconComponent
                  name={IconName.ArrowBackward}
                  className='mr-2.5 w-3 h-3'
                  role='img'
                  focusable={false}
                  aria-label="Retour à l'étape 1 : saisie de l'adresse email"
                />
                Retour
              </Button>

              <Button id='submit' type='submit' isLoading={creationEnCours}>
                Créer le compte bénéficiaire
              </Button>
            </div>
          </form>
        </>
      )}
    </>
  )
}

export default FormulaireBeneficiaireFranceTravail
