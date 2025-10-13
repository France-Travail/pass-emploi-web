import { TagMetier } from 'components/ui/Indicateurs/Tag'

import { Dispositif } from '../../interfaces/beneficiaire'

type DispositifTagProps = {
  dispositif: string
  onWhite?: boolean
}

export default function DispositifTag(props: DispositifTagProps) {
  return (
    <TagMetier
      label={getLabelDispositif(props.dispositif)}
      className={getStyle(props)}
    />
  )
}

function getStyle({ dispositif, onWhite }: DispositifTagProps): string {
  switch (dispositif) {
    case Dispositif.PACEA:
    case Dispositif.ACCOMPAGNEMENT_GLOBAL:
      return 'text-success bg-success-lighten'
    case Dispositif.BRSA:
      return 'text-accent-1 bg-accent-1-lighten'
    case Dispositif.AIJ:
      return 'bg-additional-1-lighten'
    case Dispositif.CONSEIL_DEPT:
      return 'text-primary bg-primary-lighten'
    case Dispositif.AVENIR_PRO:
      return 'bg-additional-3-lighten'
    case Dispositif.ACCOMPAGNEMENT_INTENSIF:
      return 'bg-additional-5-lighten'
    case Dispositif.EQUIP_EMPLOI_RECRUT:
      return 'bg-warning-lighten'
    case Dispositif.CEJ:
    default:
      return 'text-primary ' + (onWhite ? 'bg-white' : 'bg-primary-lighten')
  }
}

export function getLabelDispositif(dispositif: string): string {
  switch (dispositif) {
    case 'CEJ':
      return 'CEJ'
    case 'BRSA':
      return 'RSA rénové'
    case 'AIJ':
      return 'AIJ'
    case 'ACCOMPAGNEMENT_INTENSIF':
      return 'REN-Intensif / FTT-FTX'
    case 'ACCOMPAGNEMENT_GLOBAL':
      return 'Accompagnement global'
    case 'EQUIP_EMPLOI_RECRUT':
      return 'Equip’emploi / Equip’recrut'
    case 'AVENIR_PRO':
      return 'Avenirpro'
    default:
      return dispositif
  }
}
