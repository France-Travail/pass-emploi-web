import { DateTime } from 'luxon'
import React, { useEffect, useRef, useState } from 'react'

import ConfirmationRedirectionModal from 'components/ConfirmationRedirectionModal'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { ActualiteMessage } from 'interfaces/actualiteMilo'
import { toFrenchDateTime, toFrenchTime } from 'utils/date'

import DateMessage from './DateMessage'

type BlocMessageProps = {
  readonly messages: readonly ActualiteMessage[]
  readonly shouldAutoFocusLastMessage?: boolean
  readonly onModification?: (actualite: ActualiteMessage) => void
}

export default function MessageActualites({
  messages,
  shouldAutoFocusLastMessage = true,
  onModification,
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
      dernierMessageRef.current.focus()
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
                      tabIndex={estDernierMessage ? -1 : undefined}
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
                      <FooterActualite
                        message={m}
                        onModification={onModification}
                      />
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

function FooterActualite({
  message,
  onModification,
}: {
  message: ActualiteMessage
  onModification?: (actualite: ActualiteMessage) => void
}) {
  const [afficherMenu, setAfficherMenu] = useState(false)

  function scrollToRef(element: HTMLElement | null) {
    if (element)
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      })
  }

  return (
    <div className='relative flex items-center gap-2 text-xs-medium text-content mt-1'>
      <span
        className='text-xs-medium'
        aria-label={toFrenchTime(message.dateCreation, { a11y: true })}
      >
        {toFrenchTime(message.dateCreation)} ·{' '}
      </span>
      <span className='text-xs-medium'>
        Posté par {message.prenomNomConseiller}
      </span>

      {message.proprietaire && onModification && (
        <>
          <button
            type='button'
            onClick={() => setAfficherMenu(!afficherMenu)}
            aria-label={`${afficherMenu ? 'Cacher' : 'Voir'} les actions possibles pour l'actualité du ${toFrenchDateTime(message.dateCreation, { a11y: true })}`}
            className='flex items-center'
          >
            <div
              className={
                afficherMenu
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
          </button>

          {afficherMenu && (
            <div
              className='absolute top-[2em] left-0 z-10 bg-white rounded-base p-2 shadow-m'
              ref={scrollToRef}
            >
              <button
                type='button'
                onClick={() => {
                  setAfficherMenu(false)
                  onModification(message)
                }}
                className='p-2 flex items-center text-s-bold gap-2 hover:text-primary hover:rounded-base hover:bg-primary-lighten hover:shadow-m'
              >
                <IconComponent
                  focusable={false}
                  aria-hidden={true}
                  className='inline w-4 h-4 fill-current'
                  name={IconName.Edit}
                />
                Modifier l&apos;actualité
                <span className='sr-only'>
                  du {toFrenchDateTime(message.dateCreation, { a11y: true })}
                </span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
