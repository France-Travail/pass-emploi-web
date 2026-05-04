import { act, screen, within } from '@testing-library/react'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import React from 'react'

import OffrePage from 'app/(connected)/(with-sidebar)/(with-chat)/offres/[typeOffre]/[idOffre]/OffrePage'
import { unDetailImmersion } from 'fixtures/offre'
import {
  DetailImmersion,
  ImmersionAccessibleTravailleurHandicape,
  ImmersionModeContact,
  ImmersionModeDistanciel,
} from 'interfaces/offre'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('components/PageActionsPortal')

describe('OffrePage client side - Immersion', () => {
  let container: HTMLElement
  let offre: DetailImmersion

  beforeEach(async () => {
    // Given
    offre = unDetailImmersion()

    // When
    ;({ container } = await renderWithContexts(<OffrePage offre={offre} />))
  })

  it('a11y', async () => {
    let results: AxeResults

    await act(async () => {
      results = await axe(container)
    })

    expect(results!).toHaveNoViolations()
  })

  it("permet de partager l'offre", () => {
    // Then
    expect(
      screen.getByRole('link', { name: `Partager offre ${offre.titre}` })
    ).toHaveAttribute('href', `/offres/immersion/${offre.id}/partage`)
  })

  it("affiche le titre de l'offre", () => {
    // Then
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: offre.titre,
      })
    ).toBeInTheDocument()
  })

  it("affiche les informations principales de l'offre", () => {
    const section = screen.getByRole('region', {
      name: "Informations de l'offre",
    })
    expect(
      within(section).getByRole('heading', { level: 3 })
    ).toHaveAccessibleName("Informations de l'offre")

    expect(getByDescriptionTerm('Établissement', section)).toHaveTextContent(
      offre.nomEtablissement
    )
    expect(
      getByDescriptionTerm("Secteur d'activité", section)
    ).toHaveTextContent(offre.secteurActivite)
    expect(getByDescriptionTerm('Ville', section)).toHaveTextContent(
      offre.ville
    )
    expect(getByDescriptionTerm('Mode de travail', section)).toHaveTextContent(
      'Présentiel et à distance'
    )
  })

  it("affiche les informations de l'entreprise", () => {
    const section = screen.getByRole('region', { name: "L'entreprise" })
    expect(
      within(section).getByRole('heading', { level: 3 })
    ).toHaveAccessibleName("L'entreprise")

    expect(getByDescriptionTerm('Adresse', section)).toHaveTextContent(
      offre.contact.adresse
    )
  })

  it("n'affiche pas le tag handicap si non renseigné", () => {
    expect(
      screen.queryByText('Personnes en situation de handicap bienvenues')
    ).not.toBeInTheDocument()
  })

  it('affiche le tag handicap quand accessible', async () => {
    // Given
    const offreHandicap = unDetailImmersion({
      accessibleTravailleurHandicape:
        ImmersionAccessibleTravailleurHandicape.YES_FT_CERTIFIED,
    })

    // When
    await renderWithContexts(<OffrePage offre={offreHandicap} />)

    // Then
    expect(
      screen.getAllByText('Personnes en situation de handicap bienvenues')[0]
    ).toBeInTheDocument()
  })

  it('affiche le mode de contact', () => {
    expect(
      screen.getByText('Mise en relation en Présentiel')
    ).toBeInTheDocument()
  })

  it('affiche les informations complémentaires quand présentes', async () => {
    // Given
    const offreAvecInfos = unDetailImmersion({
      informationsComplementaires: 'Venez avec votre CV.',
    })

    // When
    const { container: c } = await renderWithContexts(
      <OffrePage offre={offreAvecInfos} />
    )
    const section = within(c).getByRole('region', { name: "L'entreprise" })

    // Then
    expect(
      getByDescriptionTerm('Informations complémentaires', section)
    ).toHaveTextContent('Venez avec votre CV.')
  })

  it('affiche le mode distanciel', () => {
    // HYBRID → 'Présentiel et à distance' (vérifié dans les infos principales)
    const section = screen.getByRole('region', {
      name: "Informations de l'offre",
    })
    expect(getByDescriptionTerm('Mode de travail', section)).toHaveTextContent(
      'Présentiel et à distance'
    )
  })

  it('affiche le télétravail', async () => {
    // Given
    const offreDistanciel = unDetailImmersion({
      modeDistanciel: ImmersionModeDistanciel.FULL_REMOTE,
    })

    // When
    await renderWithContexts(<OffrePage offre={offreDistanciel} />)

    // Then
    expect(screen.getAllByText('Télétravail')[0]).toBeInTheDocument()
  })

  it('affiche le présentiel', async () => {
    // Given
    const offrePresentiel = unDetailImmersion({
      modeDistanciel: ImmersionModeDistanciel.ON_SITE,
    })

    // When
    await renderWithContexts(<OffrePage offre={offrePresentiel} />)

    // Then
    expect(screen.getAllByText('Présentiel')[0]).toBeInTheDocument()
  })

  it('affiche le mode de contact email', async () => {
    // Given
    const offreEmail = unDetailImmersion({
      contact: {
        adresse: '1 rue de la Paix',
        mode: ImmersionModeContact.EMAIL,
      },
    })

    // When
    await renderWithContexts(<OffrePage offre={offreEmail} />)

    // Then
    expect(
      screen.getAllByText('Mise en relation par Mail')[0]
    ).toBeInTheDocument()
  })
})
