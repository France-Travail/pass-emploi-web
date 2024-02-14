import Link from 'next/link'
import React, { ReactNode } from 'react'

import { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import styles from 'styles/components/Button.module.css'

interface Props {
  href: string
  externalLink?: boolean
  children?: ReactNode
  label?: string
  style?: ButtonStyle
  className?: string
  onClick?: () => void
}

export default function ButtonLink({
  children,
  href,
  className,
  externalLink,
  label,
  style = ButtonStyle.PRIMARY,
  onClick = () => {},
}: Props) {
  return (
    <>
      {!externalLink && (
        <Link
          href={href}
          className={`${
            className ? className : ''
          } flex items-center justify-center text-s-bold ${
            styles.button
          } ${getColorStyleClassName(style)}`}
          onClick={onClick}
        >
          {children}
        </Link>
      )}

      {externalLink && (
        <a
          href={href}
          target='_blank'
          rel='noreferrer noopener'
          className={`${
            className ? className : ''
          } flex items-center justify-center text-s-bold ${
            styles.button
          } ${getColorStyleClassName(style)}`}
          aria-label={`${label} (nouvelle fenêtre)`}
          onClick={onClick}
        >
          {label}
          <IconComponent
            name={IconName.OpenInNew}
            className='ml-1.5 w-4 h-4 fill-[currentColor]'
            focusable='false'
            aria-hidden={true}
          />
        </a>
      )}
    </>
  )
}

function getColorStyleClassName(style: ButtonStyle): string {
  switch (style) {
    case ButtonStyle.PRIMARY:
      return styles.buttonPrimary
    case ButtonStyle.SECONDARY:
      return styles.buttonSecondary
    case ButtonStyle.TERTIARY:
      return styles.buttonTertiary
    case ButtonStyle.WARNING:
      return styles.buttonWarning
    default:
      return styles.buttonPrimary
  }
}
