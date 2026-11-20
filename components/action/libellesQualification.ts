export const LIBELLE_ERREUR_QUALIFICATION =
  'Suite à un problème inconnu la qualification a échoué. Vous pouvez réessayer.'

export const LIBELLE_ACTION_EN_ERREUR =
  'La qualification de cette action a échoué. Vous pouvez réessayer.'

export function libelleActionsEnErreur(
  nombreEnErreur: number,
  nombreTotal: number
): string {
  if (nombreTotal === 1)
    return 'L’action n’a pas pu être qualifiée. Vous pouvez réessayer.'
  if (nombreEnErreur === 1)
    return `1 action sur ${nombreTotal} n’a pas pu être qualifiée. Vous pouvez réessayer.`
  return `${nombreEnErreur} actions sur ${nombreTotal} n’ont pas pu être qualifiées. Vous pouvez réessayer.`
}
