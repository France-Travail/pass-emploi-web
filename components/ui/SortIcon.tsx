import IconComponent, { IconName } from 'components/ui/IconComponent'

export default function SortIcon({
  isDesc,
  isSorted = true,
}: {
  isDesc: boolean
  isSorted?: boolean
}) {
  return (
    <IconComponent
      name={
        isSorted
          ? isDesc
            ? IconName.ArrowUpward
            : IconName.ArrowDownward
          : IconName.SwapVert
      }
      focusable='false'
      aria-hidden='true'
      className={`w-6 h-6 ml-2 fill-primary`}
    />
  )
}
