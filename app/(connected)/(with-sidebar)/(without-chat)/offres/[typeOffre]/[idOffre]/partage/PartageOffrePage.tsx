'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { useRouter } from 'next/navigation'
import React, { FormEvent, ReactElement, useMemo, useState } from 'react'

import BeneficiairesMultiselectAutocomplete, {
  OptionBeneficiaire,
} from 'components/jeune/BeneficiairesMultiselectAutocomplete'
import ImmersionCard from 'components/offres/ImmersionCard'
import OffreEmploiCard from 'components/offres/OffreEmploiCard'
import ServiceCiviqueCard from 'components/offres/ServiceCiviqueCard'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import Etape from 'components/ui/Form/Etape'
import Label from 'components/ui/Form/Label'
import Textarea from 'components/ui/Form/Textarea'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { getNomBeneficiaireComplet } from 'interfaces/beneficiaire'
import { Liste } from 'interfaces/liste'
import { DetailOffre, TypeOffre } from 'interfaces/offre'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

type PartageOffrePageProps = {
  readonly offre: DetailOffre
  readonly listes?: Liste[]
  readonly returnTo: string
}

function PartageOffrePage({
  offre,
  listes = [],
  returnTo,
}: PartageOffrePageProps) {
  const chatCredentials = useChatCredentials()
  const router = useRouter()
  const [_, setAlerte] = useAlerte()

  const [portefeuille] = usePortefeuille()
  const [idsBeneficiairesDirects, setIdsBeneficiairesDirects] = useState<
    string[]
  >([])
  const [idsListes, setIdsListes] = useState<string[]>([])
  const [message, setMessage] = useState<string | undefined>()
  const [isPartageEnCours, setIsPartageEnCours] = useState<boolean>(false)
  const [errorDestinataires, setErrorDestinataires] = useState<
    string | undefined
  >(undefined)

  function formIsValid(): boolean {
    const isValid = idsDestinataires.length > 0

    if (!isValid) {
      setErrorDestinataires(
        'Le champ "Destinataires" est vide. Sélectionnez au moins un destinataire.'
      )
    }
    return isValid
  }

  function buildOptionsJeunes(): OptionBeneficiaire[] {
    return portefeuille.map((jeune) => ({
      id: jeune.id,
      value: getNomBeneficiaireComplet(jeune),
    }))
  }

  function updateIdsDestinataires(selectedIds: {
    beneficiaires?: string[]
    listeListes?: string[]
  }) {
    if (selectedIds.beneficiaires !== undefined) {
      setIdsBeneficiairesDirects(selectedIds.beneficiaires)
    }

    if (selectedIds.listeListes !== undefined) {
      setIdsListes(selectedIds.listeListes)
    }

    if (
      (selectedIds.beneficiaires && selectedIds.beneficiaires.length > 0) ||
      (selectedIds.listeListes && selectedIds.listeListes.length > 0) ||
      idsBeneficiairesDirects.length > 0 ||
      idsListes.length > 0
    ) {
      setErrorDestinataires(undefined)
    }
  }

  const idsDestinataires = useMemo(() => {
    const idsDesListes = listes
      .filter((liste) => idsListes.includes(liste.id))
      .flatMap((liste) => liste.beneficiaires.map((b) => b.id))

    return Array.from(new Set([...idsBeneficiairesDirects, ...idsDesListes]))
  }, [idsBeneficiairesDirects, idsListes, listes])

  async function partager(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!formIsValid()) return

    setIsPartageEnCours(true)
    const messageDefault = getDefaultMessage(offre.type)

    try {
      const { partagerOffre } = await import('services/messages.service')
      await partagerOffre({
        offre,
        idsDestinataires,
        cleChiffrement: chatCredentials!.cleChiffrement,
        message: message || messageDefault,
      })
      setAlerte(AlerteParam.partageOffre)
      router.push(returnTo)
    } finally {
      setIsPartageEnCours(false)
    }
  }

  function OffreCard(): ReactElement {
    switch (offre.type) {
      case TypeOffre.EMPLOI:
      case TypeOffre.ALTERNANCE:
        return <OffreEmploiCard offre={offre} />
      case TypeOffre.SERVICE_CIVIQUE:
        return <ServiceCiviqueCard offre={offre} />
      case TypeOffre.IMMERSION:
        return <ImmersionCard offre={offre} />
    }
  }

  useMatomo('Partage offre', portefeuille.length > 0)

  return (
    <>
      <OffreCard />

      <form onSubmit={partager} noValidate={true} className='mt-8'>
        <Etape numero={1} titre='Bénéficiaires'>
          <BeneficiairesMultiselectAutocomplete
            id={'select-beneficiaires'}
            beneficiaires={buildOptionsJeunes()}
            listes={listes}
            typeSelection='Bénéficiaires'
            onUpdate={updateIdsDestinataires}
            error={errorDestinataires}
          />
        </Etape>

        <Etape numero={2} titre='Écrivez votre message'>
          <Label htmlFor='message' withBulleMessageSensible={true}>
            Message
          </Label>
          <Textarea id='message' rows={10} onChange={setMessage} />
        </Etape>

        <div className='flex justify-center'>
          <ButtonLink href={returnTo} style={ButtonStyle.SECONDARY}>
            Annuler
          </ButtonLink>

          <Button
            type='submit'
            className='ml-3 flex items-center'
            isLoading={isPartageEnCours}
          >
            <IconComponent
              name={IconName.Send}
              aria-hidden={true}
              focusable={false}
              className='mr-2 h-4 w-4 fill-white'
            />
            Envoyer
          </Button>
        </div>
      </form>
    </>
  )
}

function getDefaultMessage(typeOffre: TypeOffre): string {
  switch (typeOffre) {
    case TypeOffre.EMPLOI:
      return 'Bonjour, je vous partage une offre d’emploi qui pourrait vous intéresser.'
    case TypeOffre.SERVICE_CIVIQUE:
      return 'Bonjour, je vous partage une offre de service civique qui pourrait vous intéresser.'
    case TypeOffre.IMMERSION:
      return "Bonjour, je vous partage une offre d'immersion qui pourrait vous intéresser."
    case TypeOffre.ALTERNANCE:
      return "Bonjour, je vous partage une offre d'alternance qui pourrait vous intéresser."
  }
}

export default withTransaction(PartageOffrePage.name, 'page')(PartageOffrePage)
