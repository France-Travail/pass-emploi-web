import { redirect } from 'next/navigation'

import AuthErrorPage from 'app/autherror/AuthErrorPage'
import { ecranMigration } from 'app/autherror/ecranMigration'
import {
  erreurBeneficiaire,
  erreurConseiller,
} from 'app/autherror/messagesErreur'
import {
  estStructure,
  getUrlFormulaireSupport,
  Structure,
} from 'interfaces/structure'

type AuthErrorSearchParams = Promise<
  Partial<{
    reason: string
    typeUtilisateur: string
    structureUtilisateur: string
    email?: string
    prenom?: string
    nom?: string
    population: string
  }>
>

export default async function AuthError({
  searchParams,
}: Readonly<{
  searchParams?: AuthErrorSearchParams
}>) {
  const params = (await searchParams) ?? {}
  const { reason, typeUtilisateur, structureUtilisateur, email } = params

  const ecran = ecranMigration(params)
  if (ecran) return ecran

  if (typeUtilisateur === 'CONSEILLER') {
    if (reason === 'UTILISATEUR_INEXISTANT') redirect('/login')

    const { erreur, withTuto } = erreurConseiller(reason, structureUtilisateur)
    return (
      <AuthErrorPage
        erreur={erreur}
        codeErreur={reason}
        withStructure={
          structureUtilisateur
            ? {
                structure: structureUtilisateur as Structure,
                lienFormulaire: lienFormulaireConseiller(structureUtilisateur),
                withTuto,
              }
            : undefined
        }
      />
    )
  }

  return (
    <AuthErrorPage
      erreur={erreurBeneficiaire(reason, structureUtilisateur, email)}
      codeErreur={reason}
    />
  )
}

function lienFormulaireConseiller(
  structureUtilisateur: string
): string | undefined {
  if (!estStructure(structureUtilisateur)) return
  return getUrlFormulaireSupport(structureUtilisateur)
}
