import React from 'react'

import { estPassEmploi } from 'interfaces/structure'

export function titreSite(structure: string): string {
  return (
    'Espace conseiller ' + (estPassEmploi(structure) ? 'pass emploi' : 'CEJ')
  )
}

// Titre précis construit avec les données déjà chargées par la page : le
// metadata reste générique pour ne coûter aucun appel api au prefetch.
// React remonte ce <title> dans le <head>, sans le template du layout.
export default function TitrePage({
  titre,
  structure,
}: Readonly<{
  titre: string
  structure: string
}>) {
  return <title>{`${titre} - ${titreSite(structure)}`}</title>
}
