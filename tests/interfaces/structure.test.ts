import {
  estPassEmploi,
  getUrlFormulaireSupport,
  getUrlSiteRessource,
  Structure,
  structureAccompagnementGlobal,
  structureAccompagnementIntensif,
  structureAij,
  structureAvenirPro,
  structureBrsa,
  structureConseilDepartemental,
  structureEquipEmploiRecrut,
  structureFTCej,
  structureMilo,
} from 'interfaces/structure'

describe('structure', () => {
  const structuresPassEmploi: Structure[] = [
    structureBrsa,
    structureAccompagnementIntensif,
    structureAccompagnementGlobal,
    structureEquipEmploiRecrut,
    structureConseilDepartemental,
  ]

  describe('estPassEmploi', () => {
    it.each(structuresPassEmploi)('%s est sur pass emploi', (structure) => {
      expect(estPassEmploi(structure)).toEqual(true)
    })

    it.each([structureMilo, structureFTCej, structureAij, structureAvenirPro])(
      '%s est sur 1jeune1solution',
      (structure) => {
        expect(estPassEmploi(structure)).toEqual(false)
      }
    )
  })

  describe('AIJ et Avenir Pro', () => {
    const urlSupportPe = 'http://support-pe/'
    const urlSupportPassEmploi = 'http://support-pass-emploi/'
    const envInitial = process.env

    beforeEach(() => {
      process.env = {
        ...envInitial,
        NEXT_PUBLIC_FAQ_PE_EXTERNAL_LINK: urlSupportPe,
        NEXT_PUBLIC_FAQ_PASS_EMPLOI_EXTERNAL_LINK: urlSupportPassEmploi,
      }
    })

    afterEach(() => {
      process.env = envInitial
    })

    it.each([structureAij, structureAvenirPro] as const)(
      '%s utilise le site ressources et le support France Travail CEJ',
      (structure) => {
        expect(getUrlSiteRessource(structure)).toEqual(
          getUrlSiteRessource(structureFTCej)
        )
        expect(getUrlFormulaireSupport(structure)).toEqual(
          getUrlFormulaireSupport(structureFTCej)
        )
        expect(getUrlFormulaireSupport(structure)).toEqual(
          urlSupportPe + 'formuler-une-demande/'
        )
      }
    )

    it('garde le site ressources pass emploi pour les autres dispositifs', () => {
      expect(getUrlSiteRessource(structureBrsa)).toEqual(urlSupportPassEmploi)
    })
  })
})
