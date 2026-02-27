import TexteAvecLien from 'components/chat/TexteAvecLien'
import BulleMessageSensible from 'components/ui/Form/BulleMessageSensible'

type ComplexLabel = {
  main: string
  helpText: string | string[]
  precision?: string
}
type LabelProps = {
  htmlFor: string
  children: string | string[] | ComplexLabel
  inputRequired?: boolean
  withBulleMessageSensible?: boolean
  className?: string
  mainClassName?: string
  helpTextClassName?: string
  precisionClassName?: string
}
export default function Label({
  htmlFor,
  inputRequired = false,
  withBulleMessageSensible = false,
  children,
  className,
  mainClassName,
  helpTextClassName,
  precisionClassName,
}: Readonly<LabelProps>) {
  const { main, helpText, precision } = isComplexLabel(children)
    ? children
    : { main: children, helpText: undefined, precision: undefined }

  const labelClassName =
    className || 'flex flex-wrap items-baseline text-content-color mb-3'
  const mainSpanClassName = mainClassName || 'text-base-regular'
  const helpTextSpanClassName = helpTextClassName || 'text-s-regular ml-2'
  const precisionSpanClassName = precisionClassName || 'text-xs-regular ml-2'

  return (
    <label htmlFor={htmlFor} className={labelClassName}>
      <span className={mainSpanClassName}>
        {inputRequired && <span>*&nbsp;</span>}
        {main}
        {withBulleMessageSensible && (
          <span className='ml-2'>
            <BulleMessageSensible />
          </span>
        )}
      </span>
      {helpText && <span className={helpTextSpanClassName}> {helpText}</span>}
      {precision && (
        <span className={precisionSpanClassName}>
          <TexteAvecLien texte={precision} />
        </span>
      )}
    </label>
  )
}

function isComplexLabel(
  children: string | string[] | ComplexLabel
): children is ComplexLabel {
  return Object.prototype.hasOwnProperty.call(children, 'main')
}
