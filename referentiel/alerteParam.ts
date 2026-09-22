export enum AlerteParam {
  // Événements
  creationRDV = 'creationRDV',
  modificationRDV = 'modificationRDV',
  suppressionRDV = 'suppressionRDV',
  creationAnimationCollective = 'creationAnimationCollective',
  modificationAnimationCollective = 'modificationAnimationCollective',
  suppressionAnimationCollective = 'suppressionAnimationCollective',
  clotureEvenement = 'clotureEvenement',
  clotureSession = 'clotureSession',
  // Bénéficiaires
  recuperationBeneficiaires = 'recuperationBeneficiaires',
  creationBeneficiaire = 'creationBeneficiaire',
  reaffectation = 'reaffectation',
  // Actions
  multiQualificationSNP = 'multiQualificationSNP',
  multiQualificationNonSNP = 'multiQualificationNonSNP',
  // Listes
  creationListe = 'creationListe',
  modificationListe = 'modificationListe',
  suppressionListe = 'suppressionListe',
  // Autre
  choixAgence = 'choixAgence',
  modificationAgence = 'modificationAgence',
  envoiMessage = 'envoiMessage',
  changementDispositif = 'changementDispositif',
  confirmationDispositif = 'confirmationDispositif',
  modificationIdentifiantPartenaire = 'modificationIdentifiantPartenaire',
  partageOffre = 'partageOffre',
  suggestionRecherche = 'suggestionRecherche',
  modificationAtelier = 'modificationAtelier',
  modificationInformationCollective = 'modificationInformationCollective',
}
