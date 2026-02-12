import React, { useRef, useState } from 'react'

import HeaderChat from 'components/chat/HeaderChat'
import { MessagerieCachee } from 'components/chat/MessagerieCachee'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import Label from 'components/ui/Form/Label'
import Textarea from 'components/ui/Form/Textarea'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import SpinningLoader from 'components/ui/SpinningLoader'
import { ValueWithError } from 'components/ValueWithError'
import { ActualiteMissionLocale } from 'interfaces/actualites'
import { creerActualiteMissionLocaleClientSide } from 'services/actualites.service'

interface BandeauActualitesProps {
  actualites: ActualiteMissionLocale[] | undefined
  onRetourMessagerie: () => void
  onActualiteCreee: () => Promise<void>
}

export default function BandeauActualites({
  actualites,
  onRetourMessagerie,
  onActualiteCreee,
}: BandeauActualitesProps) {
  const headerRef = useRef<{ focusRetour: () => void }>(null)
  const [afficherFormulaire, setAfficherFormulaire] = useState<boolean>(false)
  const [actualite, setActualite] = useState<ValueWithError<string>>({
    value: '',
  })
  const [messagerieEstVisible, setMessagerieEstVisible] =
    useState<boolean>(true)
  const [isPublishing, setIsPublishing] = useState<boolean>(false)

  const isLoading = actualites === undefined

  function ouvrirFormulaire() {
    setAfficherFormulaire(true)
  }

  function annuler() {
    setAfficherFormulaire(false)
    setActualite({ value: '' })
  }

  async function publierActualite() {
    if (!actualite.value.trim()) return

    try {
      setIsPublishing(true)
      await creerActualiteMissionLocaleClientSide(actualite.value)
      setAfficherFormulaire(false)
      setActualite({ value: '' })
      await onActualiteCreee()
    } catch (error) {
      console.error('Erreur lors de la publication:', error)
    } finally {
      setIsPublishing(false)
    }
  }

  function permuterVisibiliteMessagerie() {
    setMessagerieEstVisible(!messagerieEstVisible)
  }

  return (
    <>
      <HeaderChat
        ref={headerRef}
        titre='Actualités de ma mission locale'
        labelRetour='Retour sur ma messagerie'
        onBack={onRetourMessagerie}
        onPermuterVisibiliteMessagerie={permuterVisibiliteMessagerie}
        messagerieEstVisible={messagerieEstVisible}
      />

      {messagerieEstVisible && (
        <div className='mx-3'>
          {isLoading && <SpinningLoader alert={true} />}

          {!isLoading && !afficherFormulaire && (
            <>
              {actualites && actualites.length > 0 ? (
                <div className='flex flex-col gap-4 mb-6'>
                  {actualites.map((actu) => (
                    <div
                      key={actu.id}
                      className='bg-white p-4 rounded-base shadow-base'
                    >
                      <div className='flex items-start gap-3'>
                        <IconComponent
                          name={IconName.Notification}
                          className='w-6 h-6 fill-primary flex-shrink-0 mt-1'
                          aria-hidden={true}
                          focusable={false}
                        />
                        <div className='flex-1'>
                          <p className='text-base-regular text-content whitespace-pre-wrap'>
                            {actu.contenu}
                          </p>
                          <p className='text-xs-regular text-content_color mt-2'>
                            {new Date(actu.datePublication).toLocaleDateString(
                              'fr-FR',
                              {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='bg-primary-lighten p-6 rounded-base mb-6'>
                  <div className='flex items-start gap-4'>
                    <IconComponent
                      name={IconName.Notification}
                      className='w-8 h-8 fill-primary flex-shrink-0 mt-1'
                      aria-hidden={true}
                      focusable={false}
                    />
                    <div className='flex flex-col gap-2'>
                      <p className='text-base-bold text-primary'>
                        Vous pouvez partager ici les actualités de votre mission
                        locale
                      </p>
                      <p className='text-base-regular text-content'>
                        Elles seront visibles par l&apos;ensemble des
                        bénéficiaires de votre mission locale
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className='flex justify-end gap-4'>
                <Button onClick={ouvrirFormulaire}>
                  <IconComponent
                    name={IconName.Add}
                    className='w-4 h-4 mr-2'
                    aria-hidden={true}
                    focusable={false}
                  />
                  Créer une actualité
                </Button>
              </div>
            </>
          )}

          {!isLoading && afficherFormulaire && (
            <div className='bg-white p-6 rounded-base'>
              <div className='flex flex-col gap-4'>
                <Label htmlFor='actualite'>Rédigez votre actualité</Label>
                <Textarea
                  id='actualite'
                  defaultValue={actualite.value}
                  onChange={(value: string) => setActualite({ value })}
                  rows={8}
                />
              </div>

              <div className='flex justify-end gap-4 mt-6'>
                <Button
                  style={ButtonStyle.SECONDARY}
                  onClick={annuler}
                  disabled={isPublishing}
                >
                  Annuler
                </Button>
                <Button
                  onClick={publierActualite}
                  disabled={!actualite.value.trim() || isPublishing}
                >
                  {isPublishing ? 'Publication...' : "Publier l'actualité"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {!messagerieEstVisible && (
        <MessagerieCachee
          permuterVisibiliteMessagerie={permuterVisibiliteMessagerie}
        />
      )}
    </>
  )
}
