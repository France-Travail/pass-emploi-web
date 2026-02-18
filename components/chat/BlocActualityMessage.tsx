import { DateTime } from 'luxon'
import React from 'react'

import { toFrenchDateTime, toFrenchTime } from '../../utils/date'
import IconComponent, { IconName } from '../ui/IconComponent'

import DateMessage from './DateMessage'

type ActualiteMessage = {
  id: string
  titre: string
  contenu: string
  dateCreation: DateTime
  titreLien: string
  lien: string
  proprietaire: boolean
  prenomNomConseiller: string
}

type BlocMessageProps = {
  readonly messages: readonly ActualiteMessage[]
}

export default function BlocActualityMessage({ messages }: BlocMessageProps) {
  function permuterMenuEdition() {}

  let afficherMenuEdition
  return (
    <ul className='w-full'>
      {messages.map((m) => (
        <li key={m.id}>
          <DateMessage date={m.dateCreation} />
          <div
            className={`text-base-regular break-words p-4 rounded-base bg-white mt-0 mr-0 mb-1`}
          >
            <p className='text-primary-darken text-base-bold'>{m.titre}</p>
            <p className='text-primary-darken text-s-regular'>{m.contenu}</p>
          </div>
          <div className='relative'>
            <button
              type='button'
              onClick={permuterMenuEdition}
              title={`${afficherMenuEdition ? 'Cacher' : 'Voir'} les actions possibles pour votre message du ${toFrenchDateTime(m.dateCreation)}`}
              aria-label={`
          ${afficherMenuEdition ? 'Cacher' : 'Voir'} les actions possibles pour
          votre message du ${toFrenchDateTime(m.dateCreation, { a11y: true })}
        `}
              className='flex items-center gap-2 ml-auto text-xs-medium text-content'
            >
              <div
                className={
                  afficherMenuEdition
                    ? 'bg-primary rounded-full fill-white'
                    : 'fill-grey-800 hover:rounded-full hover:shadow-m'
                }
              >
                <IconComponent
                  focusable={false}
                  aria-hidden={true}
                  className='inline w-4 h-4 m-1'
                  name={IconName.More}
                />
              </div>

              <p>
                <span className='sr-only'>
                  Posté par ${m.prenomNomConseiller}
                </span>
                <span aria-label={toFrenchTime(m.dateCreation, { a11y: true })}>
                  {toFrenchTime(m.dateCreation)}
                </span>
              </p>
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
