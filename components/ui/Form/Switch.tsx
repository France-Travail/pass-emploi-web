import { ChangeEvent } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import styles from 'styles/components/Switch.module.css'

import { TagMetier } from '../Indicateurs/Tag'

type SwitchProps = {
  id: string
  checked: boolean
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  checkedLabel?: string
  uncheckedLabel?: string
  disabled?: boolean
  isLoading?: boolean
  labelVariant?: 'text' | 'badge'
  size?: 'default' | 'small'
  ariaLabel?: string
}

export function Switch({
  id,
  checked,
  disabled,
  isLoading,
  checkedLabel = 'Oui',
  uncheckedLabel = 'Non',
  onChange,
  labelVariant = 'text',
  size = 'default',
  ariaLabel,
}: SwitchProps) {
  return (
    <label className='relative cursor-pointer flex items-center'>
      <span role='alert'>
        {isLoading && (
          <>
            <IconComponent
              name={IconName.Spinner}
              focusable={false}
              role='img'
              aria-labelledby='loading-label'
              title='Chargement en cours'
              className='w-6 h-6 animate-spin absolute top-1 bottom-1 left-3 right-3'
            />
            <span id='loading-label' className='sr-only'>
              Chargement en cours
            </span>
          </>
        )}
      </span>

      <input
        id={id}
        type='checkbox'
        role='switch'
        checked={checked}
        disabled={disabled}
        className={styles.checkbox}
        onChange={onChange}
        aria-label={ariaLabel}
      />

      <span
        className={
          styles.toggle +
          (isLoading ? ' invisible after:invisible' : '') +
          (size === 'small' ? ` ${styles.toggleSmall}` : '')
        }
      />

      {labelVariant === 'text' &&
        (checked ? (
          <span aria-hidden={true} className='ml-3'>
            {checkedLabel}
          </span>
        ) : (
          <span aria-hidden={true} className='ml-3'>
            {uncheckedLabel}
          </span>
        ))}

      {labelVariant === 'badge' && (
        <span aria-hidden={true} className='ml-3'>
          <TagMetier
            label={checked ? checkedLabel : uncheckedLabel}
            className={
              checked
                ? 'text-green-600 bg-green-100'
                : 'text-grey-700 bg-grey-100'
            }
          />
        </span>
      )}
    </label>
  )
}
