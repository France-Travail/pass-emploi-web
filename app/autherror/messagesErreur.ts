// Messages des erreurs d'authentification sans écran dédié, selon la raison
// renvoyée par connect.

const MESSAGE_PAR_DEFAUT_BENEFICIAIRE = `Une erreur est survenue, veuillez fermer cette page et retenter de vous connecter.\n\nSi le problème persiste, veuillez supprimer le cache de votre navigateur ou contacter votre conseiller.`
const MESSAGE_PAR_DEFAUT_CONSEILLER = `Une erreur est survenue, veuillez fermer cette page et retenter de vous connecter.\n\nSi le problème persiste, veuillez supprimer le cache de votre navigateur.`

const MESSAGE_DEJA_FRANCE_TRAVAIL_PASS_EMPLOI =
  "Veuillez vous connecter en choisissant France Travail sur l'application Pass Emploi ou contacter votre conseiller pour recréer le compte."

const MESSAGE_DEJA_FRANCE_TRAVAIL_1J1S =
  'Veuillez vous connecter en choisissant France Travail sur l’application 1jeune1solution ou contacter votre conseiller pour recréer le compte.'

const MESSAGES_BENEFICIAIRE: Record<string, string> = {
  UTILISATEUR_DEJA_MILO:
    'Veuillez vous connecter en choisissant Mission Locale sur l’application 1jeune1solution ou contacter votre conseiller pour recréer le compte.',
  UTILISATEUR_DEJA_PE: MESSAGE_DEJA_FRANCE_TRAVAIL_1J1S,
  UTILISATEUR_DEJA_PE_BRSA: MESSAGE_DEJA_FRANCE_TRAVAIL_PASS_EMPLOI,
  UTILISATEUR_DEJA_PE_AIJ: MESSAGE_DEJA_FRANCE_TRAVAIL_1J1S,
  UTILISATEUR_DEJA_CONSEIL_DEPT: MESSAGE_DEJA_FRANCE_TRAVAIL_PASS_EMPLOI,
  UTILISATEUR_DEJA_AVENIR_PRO: MESSAGE_DEJA_FRANCE_TRAVAIL_1J1S,
  UTILISATEUR_DEJA_ACCOMPAGNEMENT_INTENSIF:
    MESSAGE_DEJA_FRANCE_TRAVAIL_PASS_EMPLOI,
  UTILISATEUR_DEJA_ACCOMPAGNEMENT_GLOBAL:
    MESSAGE_DEJA_FRANCE_TRAVAIL_PASS_EMPLOI,
  UTILISATEUR_DEJA_EQUIP_EMPLOI_RECRUT: MESSAGE_DEJA_FRANCE_TRAVAIL_PASS_EMPLOI,
  FRANCE_TRAVAIL_INDISPONIBLE:
    'Une erreur est survenue avec le système France Travail, votre compte n’a pas pu être créé.\nVeuillez réessayer plus tard.',
}

// Libellé de l'accompagnement déjà associé au compte du conseiller. Le second
// libellé, s'il existe, est celui du compte à supprimer.
const ACCOMPAGNEMENTS_DEJA_ASSOCIES: Record<string, [string, string?]> = {
  UTILISATEUR_DEJA_MILO: ['Mission Locale'],
  UTILISATEUR_DEJA_PE: ["France Travail Contrat d'engagement jeune"],
  UTILISATEUR_DEJA_PE_BRSA: ['France Travail RSA rénové'],
  UTILISATEUR_DEJA_PE_AIJ: ['France Travail Accompagnement intensif jeunes'],
  UTILISATEUR_DEJA_AVENIR_PRO: ['France Travail Avenir pro'],
  UTILISATEUR_DEJA_ACCOMPAGNEMENT_INTENSIF: [
    'France Travail REN-Intensif / FTT-FTX',
    'France Travail REN-Intensif',
  ],
  UTILISATEUR_DEJA_ACCOMPAGNEMENT_GLOBAL: [
    'France Travail Accompagnement global',
  ],
  UTILISATEUR_DEJA_EQUIP_EMPLOI_RECRUT: [
    'France Travail Equip’Emploi / Equip’recrut',
  ],
}

export function erreurBeneficiaire(
  reason?: string,
  structureUtilisateur?: string,
  email?: string
): string {
  if (reason === 'UTILISATEUR_INEXISTANT') {
    const avecEmail = email && structureUtilisateur !== 'MILO'
    return `Votre compte n'est pas enregistré sur l'application, veuillez contacter votre conseiller.${avecEmail ? `\n(votre adresse e-mail associée : ${email})` : ''}`
  }
  if (reason === 'Callback') return erreurIdp(structureUtilisateur)
  return (
    (reason && MESSAGES_BENEFICIAIRE[reason]) ?? MESSAGE_PAR_DEFAUT_BENEFICIAIRE
  )
}

export function erreurConseiller(
  reason?: string,
  structureUtilisateur?: string
): { erreur: string; withTuto?: boolean } {
  const accompagnement = reason && ACCOMPAGNEMENTS_DEJA_ASSOCIES[reason]
  if (accompagnement) {
    const [libelle, libelleCompteASupprimer = libelle] = accompagnement
    return {
      erreur: `Votre compte est déjà associé à l'accompagnement ${libelle}.\nPour vous connecter avec un autre dispositif, connectez vous au compte lié à l'accompagnement ${libelleCompteASupprimer} pour le supprimer ou contactez le support.`,
      withTuto: true,
    }
  }

  switch (reason) {
    case 'Callback':
      return { erreur: erreurIdp(structureUtilisateur) }
    case 'VerificationConseillerDepartemental':
      return {
        erreur: `Vous n'êtes pas autorisé à vous connecter. Veuiller contacter le support.`,
      }
    default:
      return { erreur: MESSAGE_PAR_DEFAUT_CONSEILLER }
  }
}

function erreurIdp(structureUtilisateur?: string): string {
  return `Une erreur ${nomIdp(structureUtilisateur)} est survenue, veuillez réessayer ultérieurement.`
}

function nomIdp(structureUtilisateur?: string): string {
  switch (structureUtilisateur) {
    case 'MILO':
      return 'i-Milo'
    case 'POLE_EMPLOI':
    case 'POLE_EMPLOI_BRSA':
    case 'POLE_EMPLOI_AIJ':
    case 'AVENIR_PRO':
    case 'FT_ACCOMPAGNEMENT_INTENSIF':
    case 'FT_ACCOMPAGNEMENT_GLOBAL':
    case 'FT_EQUIP_EMPLOI_RECRUT':
    case 'FRANCE_TRAVAIL':
      return 'France Travail Connect'
    default:
      return 'du fournisseur d’identité'
  }
}
