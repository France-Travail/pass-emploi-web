import { JourRdvAVenirItem, RdvListItem } from 'interfaces/rdv'
import { dateIsToday, formatWeekdayWithMonth } from 'utils/date'

export const AUJOURDHUI_LABEL = 'aujourd’hui'

export function listeRdvAVenirItem(
  mesRendezVous: RdvListItem[]
): Array<JourRdvAVenirItem | RdvListItem> {
  const rdvTries = [...mesRendezVous].sort(trierParDate)
  const items: Array<JourRdvAVenirItem | RdvListItem> = []
  let dernierJour = ''
  for (let rdv of rdvTries) {
    const jour = jourDuRdvFormate(new Date(rdv.date))
    if (jour !== dernierJour) {
      dernierJour = jour
      items.push(new JourRdvAVenirItem(jour))
    }
    items.push(rdv)
  }
  return items
}

function jourDuRdvFormate(date: Date): string {
  return dateIsToday(date) ? AUJOURDHUI_LABEL : formatWeekdayWithMonth(date)
}

function trierParDate(a: RdvListItem, b: RdvListItem) {
  return new Date(a.date) < new Date(b.date) ? -1 : 1
}
