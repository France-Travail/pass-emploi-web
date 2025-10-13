import { TagMetier } from 'components/ui/Indicateurs/Tag'

import { Dispositif, getLabelDispositif } from '../../interfaces/beneficiaire'

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
      return (
        'text-primary-darken ' + (onWhite ? 'bg-white' : 'bg-primary-lighten')
      )
  }
}
