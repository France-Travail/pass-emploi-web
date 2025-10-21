import React, { ReactNode } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

interface InformationMessageProps {
  label: string
  iconName?: IconName
  children?: ReactNode
  onAcknowledge?: () => void
  className?: string
}

export default function InformationMessage({
  label,
  iconName,
  children,
  onAcknowledge,
  className = '',
}: InformationMessageProps) {
  return (
    <div
      role='status'
      aria-label={label}
      className={`p-6 bg-primary-lighten rounded-base text-primary ${className}`}
    >
      <div className='flex justify-between'>
        <div className='flex items-center'>
          <IconComponent
            name={iconName ?? IconName.Info}
            focusable={false}
            aria-hidden={true}
            className='mr-2 w-6 h-6 fill-primary shrink-0'
          />

          <p className='text-base-bold'>{label}</p>
        </div>
        {onAcknowledge && (
          <button
            aria-label="J'ai compris"
            onClick={onAcknowledge}
            className='border-none'
          >
            <IconComponent
              name={IconName.Close}
              focusable={false}
              aria-hidden={true}
              className='h-6 w-6 fill-primary shrink-0'
            />
          </button>
        )}
      </div>
      {children && (
        <div className='mt-2 [&_a]:hover:text-primary-darken'>{children}</div>
      )}
    </div>
  )
}
