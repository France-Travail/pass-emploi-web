import { DateTime } from 'luxon'

export type ActualiteMessage = {
  id: string
  titre: string
  contenu: string
  dateCreation: DateTime
  dateSuppression?: DateTime
  titreLien?: string
  lien?: string
  proprietaire: boolean
  prenomNomConseiller: string
}
