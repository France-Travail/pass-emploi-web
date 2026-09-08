import React from 'react'

import DispositifTag from 'components/jeune/DispositifTag'
import SituationTag from 'components/jeune/SituationTag'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { CategorieSituation } from 'interfaces/beneficiaire'
import { estFranceTravail, estMilo } from 'interfaces/structure'
import { useConseiller } from 'utils/conseiller/conseillerContext'

import ListeBoutonsAjoutsFicheBeneficiaire from './ListeBoutonsAjoutsFicheBeneficiaire'

type HeaderDetailBeneficiaireProps = {
  beneficiaire: { id: string; nomComplet: string }
  dispositif: string
  withCreations: boolean
  situation: CategorieSituation
  onSupprimerBeneficiaire?: () => void
  onChangementDispositif?: () => void
}
export default function HeaderDetailBeneficiaire({
  beneficiaire,
  dispositif,
  onSupprimerBeneficiaire,
  onChangementDispositif,
  situation,
  withCreations,
}: Readonly<HeaderDetailBeneficiaireProps>) {
  const [conseiller] = useConseiller()

  return (
    <div className='rounded-t-[inherit] bg-primary-lighten px-6 py-4 flex flex-row gap-2 justify-between items-center'>
      <div>
        <h1 className='text-m-bold'>{beneficiaire.nomComplet}</h1>

        {(estMilo(conseiller.structure) ||
          estFranceTravail(conseiller.structure)) && (
          <dl className='mt-3 flex flex-row gap-1'>
            <dt className='sr-only'>Dispositif</dt>
            <dd className='flex items-center gap-2'>
              <DispositifTag dispositif={dispositif} onWhite={true} />
              {onChangementDispositif && (
                <button
                  type='button'
                  className='inline-flex items-center text-s-regular text-content-color underline hover:text-primary'
                  aria-label='Modifier le dispositif du bénéficiaire'
                  onClick={onChangementDispositif}
                >
                  <IconComponent
                    name={IconName.Edit}
                    aria-hidden={true}
                    focusable={false}
                    className='w-4 h-4 mr-1 fill-current'
                  />
                  Modifier
                </button>
              )}
            </dd>

            {estMilo(conseiller.structure) && (
              <>
                <dt className='sr-only'>Situation</dt>
                <dd>
                  <SituationTag situation={situation} />
                </dd>
              </>
            )}
          </dl>
        )}
      </div>

      <div className='flex gap-2 items-center justify-end flex-wrap layout-base:flex-nowrap'>
        {withCreations && (
          <ListeBoutonsAjoutsFicheBeneficiaire
            idBeneficiaire={beneficiaire.id}
          />
        )}

        {onSupprimerBeneficiaire && (
          <button
            onClick={onSupprimerBeneficiaire}
            type='button'
            title='Supprimer ce compte'
            className='h-fit rounded-full hover:bg-primary hover:fill-white hover:shadow-base'
          >
            <IconComponent
              name={IconName.Delete}
              focusable={false}
              aria-hidden={true}
              className='shrink-0 m-1 w-6 h-6'
            />
            <span className='sr-only'>Supprimer ce compte</span>
          </button>
        )}
      </div>
    </div>
  )
}
