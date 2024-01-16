import React, { ReactNode } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

export type NumeroEtape = 1 | 2 | 3 | 4 | 5
type EtapeProps = {
  numero: NumeroEtape
  titre: string
  children: Exclude<ReactNode, string | number | boolean | null | undefined>
}

export function Etape({ numero, titre, children }: EtapeProps) {
  return (
    <fieldset className='flex flex-col mb-7'>
      <legend className='flex items-center text-m-bold text-grey_800 mb-4'>
        <IconComponent
          name={getIconNumero(numero)}
          focusable={false}
          aria-hidden={true}
          className='mr-2 w-8 h-8'
        />
        <span className='sr-only'>Étape {numero}: </span> {titre}
      </legend>
      {children}
    </fieldset>
  )

  function getIconNumero(numeroEtape: NumeroEtape): IconName {
    switch (numeroEtape) {
      case 1:
        return IconName.NumberCircleOne
      case 2:
        return IconName.NumberCircleTwo
      case 3:
        return IconName.NumberCircleThree
      case 4:
        return IconName.NumberCircleFour
      case 5:
        return IconName.NumberCircleFive
    }
  }
}
