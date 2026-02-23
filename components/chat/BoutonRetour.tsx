import React, { ForwardedRef, forwardRef } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

interface BoutonRetourProps {
  labelRetour: string
  onBack: () => void
  messagerieFullScreen?: boolean
}

function BoutonRetour(
  { labelRetour, onBack, messagerieFullScreen }: BoutonRetourProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  return (
    <button
      ref={ref}
      id='chat-bouton-retour'
      className={`border-none rounded-full mr-2 ${messagerieFullScreen ? '' : 'bg-primary-lighten'} flex items-center hover:text-primary focus:pr-2`}
      aria-label={labelRetour}
      onClick={onBack}
      type='button'
    >
      <IconComponent
        name={IconName.ArrowBackward}
        aria-hidden={true}
        focusable={false}
        className='w-5 h-5 fill-primary mr-3'
      />
      <span className='text-s-regular text-content underline'>Retour</span>
    </button>
  )
}

export default forwardRef(BoutonRetour)
