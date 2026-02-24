import { DateTime } from 'luxon'
import React, { useEffect, useRef, useState } from 'react'

import { ActualiteMessage } from '../../interfaces/actualiteMilo'
import { toFrenchDateTime, toFrenchTime } from '../../utils/date'
import IconComponent, { IconName } from '../ui/IconComponent'

import DateMessage from './DateMessage'

type BlocMessageProps = {
  readonly messages: readonly ActualiteMessage[]
  readonly shouldAutoFocusLastMessage?: boolean
}

function confirmerRedirectionLienExterne(
  e: React.MouseEvent<HTMLAnchorElement>,
  lien: string
) {
  e.preventDefault()
  if (globalThis.confirm('Vous allez quitter l\u2019espace conseiller')) {
    window.open(lien, '_blank', 'noopener, noreferrer')
  }
}

export default function MessageActualites({
  messages,
  shouldAutoFocusLastMessage = true,
}: BlocMessageProps) {
  const [afficherMenuEdition, setAfficherMenuEdition] = useState(false)

  function permuterMenuEdition() {
    setAfficherMenuEdition(!afficherMenuEdition)
  }

  const dernierMessageRef = useRef<HTMLLIElement>(null)
  const idDernierMessage = messages.at(-1)?.id ?? null

  const messagesParDate = messages.reduce<
    Map<string, { date: DateTime; messages: ActualiteMessage[] }>
  >((acc, m) => {
    const cle = m.dateCreation.toISODate() ?? ''
    if (!acc.has(cle)) acc.set(cle, { date: m.dateCreation, messages: [] })
    acc.get(cle)!.messages.push(m)
    return acc
  }, new Map())

  useEffect(() => {
    if (shouldAutoFocusLastMessage && dernierMessageRef.current) {
      dernierMessageRef.current.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
      })
      const button = dernierMessageRef.current.querySelector('button')
      button?.focus()
    }
  }, [messages, shouldAutoFocusLastMessage])

  return (
    <ul className='w-full space-y-6'>
      {Array.from(messagesParDate.values()).map(
        ({ date, messages: groupe }) => (
          <li key={date.toISODate()}>
            <DateMessage date={date} />
            <ul className='space-y-6'>
              {groupe.map((m) => {
                const estDernierMessage = m.id === idDernierMessage
                return (
                  <li
                    key={m.id}
                    ref={estDernierMessage ? dernierMessageRef : null}
                    id={m.id}
                  >
                    <div
                      className={`break-words p-4 rounded-base bg-white mt-0 mr-0 mb-1`}
                    >
                      <p className='text-primary-darken text-base-bold mb-2'>
                        {m.titre}
                      </p>
                      <p className='text-primary-darken text-s-regular mb-2'>
                        {m.contenu}
                      </p>
                      {m.lien && m.titreLien && (
                        <a
                          href={m.lien}
                          target='_blank'
                          rel='noreferrer noopener'
                          className='underline text-base text-primary-darken'
                          onClick={(e) =>
                            confirmerRedirectionLienExterne(e, m.lien)
                          }
                        >
                          <IconComponent
                            name={IconName.OpenInNew}
                            className='inline shrink-0 w-4 h-4 ml-1 mr-1 fill-current'
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
                        className='flex items-center gap-2 text-xs-medium text-content'
                      >
                        <p>
                          <span
                            className='text-xs-medium'
                            aria-label={toFrenchTime(m.dateCreation, {
                              a11y: true,
                            })}
                          >
                            {toFrenchTime(m.dateCreation)} ·{' '}
                          </span>
                          <span className='text-xs-medium'>
                            Posté par {m.prenomNomConseiller}
                          </span>
                        </p>

                        <div className='fill-grey-800 hover:rounded-full hover:shadow-m'>
                          <IconComponent
                            focusable={false}
                            aria-hidden={true}
                            className='inline w-4 h-4 m-1'
                            name={IconName.More}
                          />
                        </div>
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </li>
        )
      )}
    </ul>
  )
}
