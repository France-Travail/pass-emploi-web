import React from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'

interface BoutonDisplayPlusProps {
  onClick: () => void
  isLoading: boolean
  label: string
}

export default function BoutonDisplayPlus({
  onClick,
  isLoading,
  label,
}: BoutonDisplayPlusProps) {
  return (
    <Button
      onClick={onClick}
      style={ButtonStyle.TERTIARY}
      className='mx-auto mb-3'
      isLoading={isLoading}
      type='button'
    >
      <IconComponent
        name={IconName.ChevronUp}
        aria-hidden={true}
        focusable={false}
        className='w-4 h-4 fill-current mr-2'
      />
      {label}
    </Button>
  )
}
