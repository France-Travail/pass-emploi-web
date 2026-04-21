import { Tag } from 'components/ui/Indicateurs/Tag'
import { ImmersionAccessibleTravailleurHandicape } from 'interfaces/offre'

type Props = {
  accessibleTravailleurHandicape?: ImmersionAccessibleTravailleurHandicape
  className?: string
}

export default function TagAccessibleHandicap({
  accessibleTravailleurHandicape,
  className = '',
}: Readonly<Props>) {
  if (
    !accessibleTravailleurHandicape ||
    accessibleTravailleurHandicape ===
      ImmersionAccessibleTravailleurHandicape.NO
  )
    return null

  return (
    <Tag
      label='Personnes en situation de handicap bienvenues'
      className={`rounded-base text-content-color bg-additional-5-lighten text-s-regular ${className}`}
      isSmallTag
    />
  )
}
