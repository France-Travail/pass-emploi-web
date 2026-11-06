import dynamic from 'next/dynamic'
import { ReactElement } from 'react'

import { Conseiller } from 'interfaces/conseiller'

const OnboardingMILOModal = dynamic(
  () => import('components/onboarding/OnboardingMILOModal')
)
const OnboardingPEModal = dynamic(
  () => import('components/onboarding/OnboardingPEModal')
)

type OnboardingModalProps = {
  conseiller: Conseiller
  onClose: () => void
}
export default function OnboardingModal(
  props: OnboardingModalProps
): ReactElement {
  switch (props.conseiller.structure) {
    case 'POLE_EMPLOI':
    case 'POLE_EMPLOI_AIJ':
    case 'AVENIR_PRO':
      return <OnboardingPEModal {...props} />
    case 'POLE_EMPLOI_BRSA':
    case 'CONSEIL_DEPT':
    case 'FT_ACCOMPAGNEMENT_INTENSIF':
    case 'FT_ACCOMPAGNEMENT_GLOBAL':
    case 'FT_EQUIP_EMPLOI_RECRUT':
      return <OnboardingPEModal {...props} estPassEmploi={true} />
    case 'MILO':
      return <OnboardingMILOModal {...props} />
  }
}
