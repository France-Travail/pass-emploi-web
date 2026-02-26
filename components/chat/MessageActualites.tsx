import { DateTime } from 'luxon'
import React, { useEffect, useRef, useState } from 'react'

import ConfirmationRedirectionModal from 'components/ConfirmationRedirectionModal'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { ActualiteMessage } from 'interfaces/actualiteMilo'
import { toFrenchTime } from 'utils/date'

import DateMessage from './DateMessage'

type BlocMessageProps = {
  readonly messages: readonly ActualiteMessage[]
  readonly shouldAutoFocusLastMessage?: boolean
}

export default function MessageActualites({
  messages,
  shouldAutoFocusLastMessage = true,
}: BlocMessageProps) {
  const [lienAOuvrir, setLienAOuvrir] = useState<string | null>(null)

  function confirmerRedirectionLienExterne(
    e: React.MouseEvent<HTMLAnchorElement>,
    lien: string
  ) {
    e.preventDefault()
    setLienAOuvrir(lien)
  }

  function ouvrirLienExterne() {
    if (lienAOuvrir) {
      window.open(lienAOuvrir, '_blank', 'noopener,noreferrer')
      setLienAOuvrir(null)
    }
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
    <>
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
                      <div className='break-words p-4 rounded-base bg-white mt-0 mr-0 mb-1'>
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
                              confirmerRedirectionLienExterne(e, m.lien!)
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
                      <div className='flex items-center gap-2 text-xs-medium text-content mt-1'>
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
                      </div>
                    </li>
                  )
                })}
              </ul>
            </li>
          )
        )}
      </ul>

      {lienAOuvrir && (
        <ConfirmationRedirectionModal
          lien={lienAOuvrir}
          onConfirmation={ouvrirLienExterne}
          onCancel={() => setLienAOuvrir(null)}
        />
      )}
    </>
  )
}
