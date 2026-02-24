import { DateTime } from 'luxon'

import { ActualiteMessage } from 'interfaces/actualiteMilo'

export function uneActualiteMilo(
  args: Partial<ActualiteMessage> = {}
): ActualiteMessage {
  const defaults: ActualiteMessage = {
    id: 'actualite-1',
    titre: 'Nouvelle actualité',
    contenu: 'Voici le contenu de l actualité',
    dateCreation: DateTime.fromISO('2024-01-15T10:00:00'),
    titreLien: 'En savoir plus',
    lien: 'https://example.com/actualite',
    proprietaire: true,
    prenomNomConseiller: 'Nils Tavernier',
  }

  return { ...defaults, ...args }
}

export function desActualitesMilo(): ActualiteMessage[] {
  return [
    uneActualiteMilo({
      id: 'actualite-1',
      titre: 'Atelier découverte des métiers',
      contenu: 'Rejoignez-nous le 20 janvier pour découvrir les métiers du numérique',
      dateCreation: DateTime.fromISO('2024-01-15T10:00:00'),
      titreLien: 'S inscrire',
      lien: 'https://example.com/atelier',
      proprietaire: true,
      prenomNomConseiller: 'Nils Tavernier',
    }),
    uneActualiteMilo({
      id: 'actualite-2',
      titre: 'Journée portes ouvertes',
      contenu: 'Venez découvrir notre mission locale le 25 janvier',
      dateCreation: DateTime.fromISO('2024-01-15T14:30:00'),
      titreLien: 'Plus d informations',
      lien: 'https://example.com/portes-ouvertes',
      proprietaire: false,
      prenomNomConseiller: 'Laura Cadio',
    }),
    uneActualiteMilo({
      id: 'actualite-3',
      titre: 'Forum des entreprises',
      contenu: 'Rencontrez des employeurs le 5 février',
      dateCreation: DateTime.fromISO('2024-01-16T09:15:00'),
      titreLien: '',
      lien: '',
      proprietaire: true,
      prenomNomConseiller: 'Nils Tavernier',
    }),
  ]
}
