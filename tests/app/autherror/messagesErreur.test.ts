import {
  erreurBeneficiaire,
  erreurConseiller,
} from 'app/autherror/messagesErreur'

describe('messagesErreur', () => {
  describe('erreurConseiller', () => {
    it.each([
      ['UTILISATEUR_DEJA_MILO', 'Mission Locale', 'Mission Locale'],
      [
        'UTILISATEUR_DEJA_PE',
        "France Travail Contrat d'engagement jeune",
        "France Travail Contrat d'engagement jeune",
      ],
      [
        'UTILISATEUR_DEJA_PE_BRSA',
        'France Travail RSA rénové',
        'France Travail RSA rénové',
      ],
      [
        'UTILISATEUR_DEJA_PE_AIJ',
        'France Travail Accompagnement intensif jeunes',
        'France Travail Accompagnement intensif jeunes',
      ],
      [
        'UTILISATEUR_DEJA_AVENIR_PRO',
        'France Travail Avenir pro',
        'France Travail Avenir pro',
      ],
      [
        'UTILISATEUR_DEJA_ACCOMPAGNEMENT_INTENSIF',
        'France Travail REN-Intensif / FTT-FTX',
        'France Travail REN-Intensif',
      ],
      [
        'UTILISATEUR_DEJA_ACCOMPAGNEMENT_GLOBAL',
        'France Travail Accompagnement global',
        'France Travail Accompagnement global',
      ],
      [
        'UTILISATEUR_DEJA_EQUIP_EMPLOI_RECRUT',
        'France Travail Equip’Emploi / Equip’recrut',
        'France Travail Equip’Emploi / Equip’recrut',
      ],
    ])(
      '%s : explique le compte déjà associé, avec tuto',
      (reason, libelle, libelleCompteASupprimer) => {
        expect(erreurConseiller(reason)).toEqual({
          erreur: `Votre compte est déjà associé à l'accompagnement ${libelle}.\nPour vous connecter avec un autre dispositif, connectez vous au compte lié à l'accompagnement ${libelleCompteASupprimer} pour le supprimer ou contactez le support.`,
          withTuto: true,
        })
      }
    )

    it('nomme l’IdP en cas d’erreur de callback', () => {
      expect(erreurConseiller('Callback', 'MILO')).toEqual({
        erreur:
          'Une erreur i-Milo est survenue, veuillez réessayer ultérieurement.',
      })
    })

    it('renvoie le message par défaut pour une raison inconnue', () => {
      expect(erreurConseiller('INCONNUE')).toEqual({
        erreur: `Une erreur est survenue, veuillez fermer cette page et retenter de vous connecter.\n\nSi le problème persiste, veuillez supprimer le cache de votre navigateur.`,
      })
    })
  })

  describe('erreurBeneficiaire', () => {
    it('affiche l’email d’un bénéficiaire inexistant hors Mission Locale', () => {
      expect(
        erreurBeneficiaire('UTILISATEUR_INEXISTANT', 'FRANCE_TRAVAIL', 'a@b.fr')
      ).toEqual(
        "Votre compte n'est pas enregistré sur l'application, veuillez contacter votre conseiller.\n(votre adresse e-mail associée : a@b.fr)"
      )
    })

    it('n’affiche pas l’email d’un bénéficiaire Mission Locale', () => {
      expect(
        erreurBeneficiaire('UTILISATEUR_INEXISTANT', 'MILO', 'a@b.fr')
      ).toEqual(
        "Votre compte n'est pas enregistré sur l'application, veuillez contacter votre conseiller."
      )
    })

    it.each([
      'UTILISATEUR_DEJA_PE_BRSA',
      'UTILISATEUR_DEJA_PE_AIJ',
      'UTILISATEUR_DEJA_CONSEIL_DEPT',
      'UTILISATEUR_DEJA_AVENIR_PRO',
      'UTILISATEUR_DEJA_ACCOMPAGNEMENT_INTENSIF',
      'UTILISATEUR_DEJA_ACCOMPAGNEMENT_GLOBAL',
      'UTILISATEUR_DEJA_EQUIP_EMPLOI_RECRUT',
    ])('%s : renvoie vers France Travail sur Pass Emploi', (reason) => {
      expect(erreurBeneficiaire(reason)).toEqual(
        "Veuillez vous connecter en choisissant France Travail sur l'application Pass Emploi ou contacter votre conseiller pour recréer le compte."
      )
    })

    it('renvoie le message par défaut sans raison', () => {
      expect(erreurBeneficiaire()).toEqual(
        `Une erreur est survenue, veuillez fermer cette page et retenter de vous connecter.\n\nSi le problème persiste, veuillez supprimer le cache de votre navigateur ou contacter votre conseiller.`
      )
    })
  })
})
