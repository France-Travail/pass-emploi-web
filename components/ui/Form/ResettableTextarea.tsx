import React, {
  ChangeEvent,
  ForwardedRef,
  forwardRef,
  MouseEvent,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import styles from 'styles/components/ResettableTextInput.module.css'
import { useDebounce } from 'utils/hooks/useDebounce'

interface ResettableTextareaProps {
  id: string
  value: string
  onChange: (value: string) => void
  onReset: () => void
  rows?: number
  className?: string
  required?: boolean
  invalid?: boolean
  maxLength?: number
  placeholder?: string
}

type DecompteCaracteresProps = {
  readonly id: string
  readonly debounced: string
  readonly maxLength: number
  readonly invalid: boolean
}

function DecompteCaracteres({
  id,
  debounced,
  maxLength,
  invalid,
}: DecompteCaracteresProps) {
  return (
    <div className='text-xs-regular text-right mt-1'>
      <p
        id={id + '--length'}
        aria-live='polite'
        aria-atomic={true}
        className='sr-only'
      >
        {debounced.length} sur {maxLength} caractères autorisés
      </p>
      <p aria-hidden={true} className={invalid ? 'text-warning' : ''}>
        {debounced.length} / {maxLength}
      </p>
    </div>
  )
}

function ResettableTextarea(
  {
    id,
    value,
    onChange,
    onReset,
    rows = 5,
    className,
    required = false,
    invalid = false,
    maxLength,
    placeholder,
  }: ResettableTextareaProps,
  ref: ForwardedRef<HTMLTextAreaElement>
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  useImperativeHandle(ref, () => textareaRef.current!)

  const [internalValue, setInternalValue] = useState<string>(value)
  const debounced = useDebounce(internalValue, 500)

  function applyChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const newValue = e.target.value
    setInternalValue(newValue)
    onChange(newValue)
  }

  function applyReset(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()

    setInternalValue('')
    onReset()
    textareaRef.current!.focus()
  }

  return (
    <>
      <div
        className={
          styles.wrapper +
          (invalid ? ' ' + styles.invalid : '') +
          ' flex flex-horizontal overflow-hidden bg-white relative ' +
          (className ?? '')
        }
      >
        <textarea
          id={id}
          name={id}
          ref={textareaRef}
          value={value}
          onChange={applyChange}
          rows={rows}
          maxLength={maxLength}
          placeholder={placeholder}
          className='flex-1 p-3 bg-white rounded-l-base outline-hidden resize-none'
          required={required}
          aria-describedby={invalid ? id + '--error' : undefined}
          aria-invalid={invalid || undefined}
        />
        <button
          type='reset'
          className='absolute top-3 right-3 w-10 h-10 rounded-full hover:rounded-full hover:bg-primary-lighten'
          onClick={applyReset}
        >
          <span id={id + '--reset-label'} className='sr-only'>
            Effacer le champ de saisie
          </span>
          <IconComponent
            name={IconName.Close}
            focusable={false}
            role='img'
            aria-labelledby={id + '--reset-label'}
            title='Effacer le champ de saisie'
            className='m-auto w-6 h-6 fill-current'
          />
        </button>
      </div>
      {Boolean(maxLength) && (
        <DecompteCaracteres
          id={id}
          debounced={debounced}
          maxLength={maxLength!}
          invalid={invalid}
        />
      )}
    </>
  )
}

export default forwardRef(ResettableTextarea)
