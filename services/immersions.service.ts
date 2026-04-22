import { getSession } from 'next-auth/react'

import { apiGet } from 'clients/api.client'
import { ValueWithError } from 'components/ValueWithError'
import {
  DetailImmersionJson,
  SearchImmersionsResultJson,
  jsonToDetailImmersion,
} from 'interfaces/json/immersion'
import {
  BaseImmersion,
  DetailImmersion,
  TypeOffre,
  buildImmersionId,
  parseImmersionId,
} from 'interfaces/offre'
import { Commune, Metier } from 'interfaces/referentiel'
import { MetadonneesPagination } from 'types/pagination'
import { ApiError } from 'utils/httpClient'

export type SearchImmersionsQuery = {
  commune: ValueWithError<Commune | undefined>
  metier: ValueWithError<Metier | undefined>
  rayon: number
}

const LIMIT = 10

export async function getImmersionServerSide(
  idImmersion: string,
  accessToken: string
): Promise<DetailImmersion | undefined> {
  const { siret, appellationCode, locationId } = parseImmersionId(idImmersion)
  try {
    const { content: immersionJson } = await apiGet<DetailImmersionJson>(
      `/offres-immersion/v3/${siret}/${appellationCode}/${locationId}`,
      accessToken
    )
    return jsonToDetailImmersion(immersionJson)
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 404) {
      return undefined
    }
    throw e
  }
}

export async function searchImmersions(
  query: SearchImmersionsQuery,
  page: number
): Promise<{ offres: BaseImmersion[]; metadonnees: MetadonneesPagination }> {
  const session = await getSession()
  const path = '/offres-immersion/v3?'
  const searchParams = buildSearchParams(query, page)
  const { content } = await apiGet<SearchImmersionsResultJson>(
    path + searchParams,
    session!.accessToken
  )

  return {
    metadonnees: {
      nombreTotal: content.nombreTotal,
      nombrePages: content.nombrePages,
    },
    offres: content.offres.map(
      ({ metier, siret, appellationCode, locationId, ...rest }) => ({
        type: TypeOffre.IMMERSION,
        titre: metier,
        id: buildImmersionId(siret, appellationCode, locationId),
        ...rest,
      })
    ),
  }
}

function buildSearchParams(
  recherche: SearchImmersionsQuery,
  page: number
): URLSearchParams {
  return new URLSearchParams({
    lat: recherche.commune.value!.latitude.toString(),
    lon: recherche.commune.value!.longitude.toString(),
    distance: recherche.rayon.toString(),
    rome: recherche.metier.value!.code,
    page: page.toString(),
    limit: LIMIT.toString(),
  })
}
