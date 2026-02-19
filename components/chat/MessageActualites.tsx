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

export default function MessageActualites({ messages }: BlocMessageProps) {
  function permuterMenuEdition() {}

  let afficherMenuEdition

  const messagesParDate = messages.reduce<
    Map<string, { date: DateTime; messages: ActualiteMessage[] }>
  >((acc, m) => {
    const cle = m.dateCreation.toISODate() ?? ''
    if (!acc.has(cle)) acc.set(cle, { date: m.dateCreation, messages: [] })
    acc.get(cle)!.messages.push(m)
    return acc
  }, new Map())

  return (
    <div className='w-full'>
      {Array.from(messagesParDate.values()).map(
        ({ date, messages: groupe }) => (
          <div key={date.toISODate()}>
            <DateMessage date={date} />
            <ul>
              {groupe.map((m) => (
                <li key={m.id}>
                  <div
                    className={`text-base-regular break-words p-4 rounded-base bg-white mt-0 mr-0 mb-1`}
                  >
                    <p className='text-primary-darken text-base-bold'>
                      {m.titre}
                    </p>
                    <p className='text-primary-darken text-s-regular'>
                      {m.contenu}
                    </p>
                    {m.lien && m.titreLien && (
                      <a
                        href={m.lien}
                        target='_blank'
                        rel='noreferrer'
                        className='underline text-base-medium text-primary-darken'
                      >
                        <IconComponent
                          name={IconName.OpenInNew}
                          className='inline shrink-0 w-5 h-5 ml-1 mr-1 fill-current'
                          focusable={false}
                          aria-hidden={true}
                        />
                        {m.titreLien}
                      </a>
                    )}
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
                        <span className='text-xs-medium'>
                          Posté par {m.prenomNomConseiller} ·{' '}
                        </span>
                        <span
                          className='text-xs-medium'
                          aria-label={toFrenchTime(m.dateCreation, {
                            a11y: true,
                          })}
                        >
                          {toFrenchTime(m.dateCreation)}
                        </span>
                      </p>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )
      )}
    </div>
  )
}
