import { DateTime } from 'luxon'
import { Session } from 'next-auth'

import { apiDelete, apiGet, apiPost, apiPut } from 'clients/api.client'
import { uneBaseBeneficiaire } from 'fixtures/beneficiaire'
import {
  unBaseConseillerJson,
  unConseiller,
  unConseillerJson,
} from 'fixtures/conseiller'
import { unDossierMilo } from 'fixtures/milo'
import { Dispositif } from 'interfaces/beneficiaire'
import { structureMilo } from 'interfaces/structure'
import {
  createCompteJeuneMilo,
  getConseillers,
  getConseillerServerSide,
  getDossierJeune,
  modifierAgence,
  modifierDateSignatureCGU,
  modifierNotificationsSonores,
  recupererBeneficiaires,
  supprimerConseiller,
} from 'services/conseiller.service'

import { BeneficiaireMiloFormData } from '../../interfaces/json/beneficiaire'

jest.mock('clients/api.client')

describe('ConseillerApiService', () => {
  describe('.getConseillerServerSide', () => {
    it('renvoie les informations d’un conseiller', async () => {
      // Given
      const accessToken = 'accessToken'
      const uneDate = '2023-10-03T00:00:00.000+02:00'

      const user: Session.HydratedUser = {
        id: 'id-user',
        name: 'Albert Durant',
        structure: structureMilo,
        email: 'albert.durant@gmail.com',
        estConseiller: true,
        estSuperviseur: false,
      }
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: unConseillerJson({
          agence: {
            nom: 'Milo Marseille',
            id: 'id-agence',
          },
          dateSignatureCGU: uneDate,
          dateVisionnageActus: uneDate,
          dateDeMigration: '2025-11-25',
        }),
      })

      // When
      const actual = await getConseillerServerSide(user, accessToken)

      // Then
      expect(apiGet).toHaveBeenCalledWith('/conseillers/id-user', accessToken)
      expect(actual).toEqual(
        unConseiller({
          agence: { nom: 'Milo Marseille', id: 'id-agence' },
          dateSignatureCGU: uneDate,
          dateVisionnageActus: uneDate,
          dateDeMigration: DateTime.fromISO('2025-11-25'),
        })
      )
    })
    it("ne renseigne pas de date de migration si elle n'existe pas", async () => {
      // Given
      const accessToken = 'accessToken'

      const user: Session.HydratedUser = {
        id: 'id-user',
        name: 'Albert Durant',
        structure: structureMilo,
        email: 'albert.durant@gmail.com',
        estConseiller: true,
        estSuperviseur: false,
      }
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: unConseillerJson({
          dateDeMigration: undefined,
        }),
      })

      // When
      const actual = await getConseillerServerSide(user, accessToken)

      // Then
      expect(apiGet).toHaveBeenCalledWith('/conseillers/id-user', accessToken)
      expect(actual.dateDeMigration).toBeUndefined()
    })
    it('ne renseigne pas de date de migration si elle est invalide', async () => {
      // Given
      const accessToken = 'accessToken'

      const user: Session.HydratedUser = {
        id: 'id-user',
        name: 'Albert Durant',
        structure: structureMilo,
        email: 'albert.durant@gmail.com',
        estConseiller: true,
        estSuperviseur: false,
      }
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: unConseillerJson({
          dateDeMigration: 'mauvaise-date',
        }),
      })

      // When
      const actual = await getConseillerServerSide(user, accessToken)

      // Then
      expect(apiGet).toHaveBeenCalledWith('/conseillers/id-user', accessToken)
      expect(actual.dateDeMigration).toBeUndefined()
    })
  })

  describe('.getConseillers', () => {
    it('renvoie les informations des conseillers', async () => {
      // Given
      const accessToken = 'accessToken'
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: [unBaseConseillerJson()],
      })

      // When
      const actual = await getConseillers('conseiller@email.com')

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers?q=conseiller@email.com',
        accessToken
      )
      expect(actual).toEqual([
        {
          id: 'id-conseiller-1',
          firstName: 'Nils',
          lastName: 'Tavernier',
          email: 'nils.tavernier@mail.com',
        },
      ])
    })
    it('renvoie les informations des conseillers de la structure demandée', async () => {
      // Given
      const accessToken = 'accessToken'
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: [unBaseConseillerJson()],
      })

      // When
      const actual = await getConseillers('conseiller@email.com')

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers?q=conseiller@email.com',
        accessToken
      )
      expect(actual).toEqual([
        {
          id: 'id-conseiller-1',
          firstName: 'Nils',
          lastName: 'Tavernier',
          email: 'nils.tavernier@mail.com',
        },
      ])
    })
  })

  describe('.modifierDateSignatureCGU', () => {
    it('modifie le conseiller avec la nouvelle date de signature des CGU', async () => {
      const nouvelleDate = DateTime.now()

      // When
      await modifierDateSignatureCGU(nouvelleDate)

      // Then
      expect(apiPut).toHaveBeenCalledWith(
        '/conseillers/id-conseiller-1',
        { dateSignatureCGU: nouvelleDate },
        'accessToken'
      )
    })
  })

  describe('.modifierAgence', () => {
    it("modifie le conseiller avec l'id de l'agence", async () => {
      // When
      await modifierAgence({ id: 'id-agence', nom: 'Agence' })

      // Then
      expect(apiPut).toHaveBeenCalledWith(
        '/conseillers/id-conseiller-1',
        { agence: { id: 'id-agence' } },
        'accessToken'
      )
    })

    it("modifie le conseiller avec le nom de l'agence", async () => {
      // When
      await modifierAgence({ nom: 'Agence libre' })

      // Then
      expect(apiPut).toHaveBeenCalledWith(
        '/conseillers/id-conseiller-1',
        { agence: { nom: 'Agence libre' } },
        'accessToken'
      )
    })
  })

  describe('.modifierNotificationsSonores', () => {
    it("modifie le conseiller avec l'activation des notifications sonores", async () => {
      // When
      await modifierNotificationsSonores('id-conseiller-1', true)

      // Then
      expect(apiPut).toHaveBeenCalledWith(
        '/conseillers/id-conseiller-1',
        { notificationsSonores: true },
        'accessToken'
      )
    })
  })

  describe('.recupererBeneficiaires', () => {
    it('récupère les bénéficiaires transférés temporairement', async () => {
      // When
      await recupererBeneficiaires()

      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/conseillers/id-conseiller-1/recuperer-mes-jeunes',
        {},
        'accessToken'
      )
    })
  })

  describe('.supprimerConseiller', () => {
    it('supprime le conseiller', async () => {
      // Given
      const accessToken = 'accessToken'

      // When
      await supprimerConseiller('id-conseiller-1')

      // Then
      expect(apiDelete).toHaveBeenCalledWith(
        '/conseillers/id-conseiller-1',
        accessToken
      )
    })
  })

  describe('.getDossierJeune', () => {
    it('récupère un dossier jeune depuis i-milo', async () => {
      // Given
      const accessToken = 'accessToken'
      const dossier = unDossierMilo()
      ;(apiGet as jest.Mock).mockResolvedValue({ content: dossier })

      // When
      const actual = await getDossierJeune('1234')

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers/milo/dossiers/1234',
        accessToken
      )
      expect(actual).toEqual(dossier)
    })

    it(`renvoie undefined si le dossier n'existe pas`, async () => {
      // Given
      const accessToken = 'accessToken'
      ;(apiGet as jest.Mock).mockResolvedValue({ content: undefined })

      // When
      const actual = await getDossierJeune('9999')

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers/milo/dossiers/9999',
        accessToken
      )
      expect(actual).toBeUndefined()
    })
  })

  describe('.createCompteJeuneMilo', () => {
    it('crée un compte bénéficiaire MILO sans surcharge', async () => {
      // Given
      const accessToken = 'accessToken'
      const beneficiaire = uneBaseBeneficiaire()
      ;(apiPost as jest.Mock).mockResolvedValue({ content: beneficiaire })

      const newJeune: BeneficiaireMiloFormData = {
        idDossier: '1234',
        nom: 'GIRAC',
        prenom: 'Kenji',
        email: 'kenji@mail.com',
        dispositif: Dispositif.CEJ,
        peutVoirLeCompteurDesHeures: false,
      }

      // When
      const actual = await createCompteJeuneMilo(newJeune)

      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/conseillers/milo/jeunes',
        {
          ...newJeune,
          idConseiller: 'id-conseiller-1',
          surcharge: undefined,
        },
        accessToken
      )
      expect(actual).toEqual(beneficiaire)
    })

    it('crée un compte bénéficiaire MILO avec surcharge à false', async () => {
      // Given
      const accessToken = 'accessToken'
      const beneficiaire = uneBaseBeneficiaire()
      ;(apiPost as jest.Mock).mockResolvedValue({ content: beneficiaire })

      const newJeune: BeneficiaireMiloFormData = {
        idDossier: '1234',
        nom: 'GIRAC',
        prenom: 'Kenji',
        email: 'kenji@mail.com',
        dispositif: Dispositif.PACEA,
        peutVoirLeCompteurDesHeures: true,
      }

      // When
      const actual = await createCompteJeuneMilo(newJeune, { surcharge: false })

      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/conseillers/milo/jeunes',
        {
          ...newJeune,
          idConseiller: 'id-conseiller-1',
          surcharge: false,
        },
        accessToken
      )
      expect(actual).toEqual(beneficiaire)
    })

    it('crée un compte bénéficiaire MILO avec surcharge à true', async () => {
      // Given
      const accessToken = 'accessToken'
      const beneficiaire = uneBaseBeneficiaire()
      ;(apiPost as jest.Mock).mockResolvedValue({ content: beneficiaire })

      const newJeune: BeneficiaireMiloFormData = {
        idDossier: '1234',
        nom: 'GIRAC',
        prenom: 'Kenji',
        email: 'kenji@mail.com',
        dispositif: Dispositif.CEJ,
        peutVoirLeCompteurDesHeures: false,
      }

      // When
      const actual = await createCompteJeuneMilo(newJeune, { surcharge: true })

      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/conseillers/milo/jeunes',
        {
          ...newJeune,
          idConseiller: 'id-conseiller-1',
          surcharge: true,
        },
        accessToken
      )
      expect(actual).toEqual(beneficiaire)
    })
  })
})
