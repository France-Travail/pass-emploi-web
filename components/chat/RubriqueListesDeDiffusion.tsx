import React, { useState } from 'react'

import { DetailMessageListeDeDiffusion } from 'components/chat/DetailMessageListeDeDiffusion'
import ListeListesDeDiffusion from 'components/chat/ListeListesDeDiffusion'
import MessagesListeDeDiffusion from 'components/chat/MessagesListeDeDiffusion'
import { JeuneChat } from 'interfaces/jeune'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { MessageListeDiffusion } from 'interfaces/message'

type RubriqueListesDeDiffusionProps = {
  listesDeDiffusion: ListeDeDiffusion[] | undefined
  chats: JeuneChat[] | undefined
  onBack: () => void
}

export default function RubriqueListesDeDiffusion({
  listesDeDiffusion,
  chats,
  onBack,
}: RubriqueListesDeDiffusionProps) {
  const [listeSelectionnee, setListeSelectionnee] = useState<
    ListeDeDiffusion | undefined
  >()
  const [messageSelectionne, setMessageSelectionne] = useState<
    MessageListeDiffusion | undefined
  >()

  return (
    <div className='h-full flex flex-col bg-grey_100 '>
      {!listeSelectionnee && (
        <ListeListesDeDiffusion
          listesDeDiffusion={listesDeDiffusion}
          onAfficherListe={setListeSelectionnee}
          onBack={onBack}
        />
      )}

      {listeSelectionnee && !messageSelectionne && (
        <MessagesListeDeDiffusion
          liste={listeSelectionnee}
          onAfficherDetailMessage={setMessageSelectionne}
          onBack={() => setListeSelectionnee(undefined)}
        />
      )}

      {listeSelectionnee && messageSelectionne && (
        <DetailMessageListeDeDiffusion
          message={messageSelectionne}
          onBack={() => setMessageSelectionne(undefined)}
          chats={chats}
        />
      )}
    </div>
  )
}
