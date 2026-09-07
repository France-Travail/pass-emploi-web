import { Dispositif } from 'interfaces/beneficiaire'
import { Profil } from 'interfaces/profil'

export const unProfilMilo = (dispositif: Dispositif | null = null): Profil => ({
  structure: 'MILO',
  dispositif,
})

export const unProfilFT = (
  dispositif: Dispositif = Dispositif.CEJ
): Profil => ({
  structure: 'FRANCE_TRAVAIL',
  dispositif,
})

export const unProfilCD = (): Profil => ({
  structure: 'CONSEIL_DEPARTEMENTAL',
  dispositif: null,
})
