'use client'

import React from 'react'

import { ID_CONTENU } from 'components/globals'

type HeaderProps = {
  onNavigationRef: (el: HTMLDivElement | null) => void
  onActionsRef: (el: HTMLDivElement | null) => void
}

export default function Header({ onNavigationRef, onActionsRef }: HeaderProps) {
  return (
    <header
      id={ID_CONTENU}
      tabIndex={-1}
      role='banner'
      className='flex justify-between items-center px-12 py-8 border-b border-solid border-primary-lighten'
    >
      <div ref={onNavigationRef} />
      <div ref={onActionsRef} className='flex gap-6' />
    </header>
  )
}
