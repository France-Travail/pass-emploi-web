import { screen } from '@testing-library/react'
import React from 'react'

import DisplayMessageBeneficiaire from 'components/chat/DisplayMessageBeneficiaire'
import { unConseiller } from 'fixtures/conseiller'
import { unMessage } from 'fixtures/message'
import { TypeMessage } from 'interfaces/message'
import renderWithContexts from 'tests/renderWithContexts'

describe('<DiplayMessageBeneficiaire />', () => {
  it('affiche un message envoyé par le bénéficiaire', async () => {
    const beneficiaireNomComplet = 'Père Castor'

    //Given
    const message = unMessage({
      sentBy: 'jeune',
      content: 'Je vais vous raconter une histoire',
    })

    //When
    await renderWithContexts(
      <DisplayMessageBeneficiaire
        message={message}
        beneficiaireNomComplet={beneficiaireNomComplet}
      />
    )

    // Then
    expect(screen.getByText('Père Castor :')).toBeInTheDocument()
  })

  it('affiche un message supprimé par le bénéficiaire', async () => {
    const beneficiaireNomComplet = 'Père Castor'

    //Given
    const message = unMessage({
      sentBy: 'jeune',
      content: 'Rdv demain 10h',
      status: 'deleted',
    })

    //When
    await renderWithContexts(
      <DisplayMessageBeneficiaire
        message={message}
        beneficiaireNomComplet={beneficiaireNomComplet}
      />
    )

    // Then
    expect(screen.getByText('Message supprimé')).toBeInTheDocument()
    expect(() => screen.getByText(message.content)).toThrow()
  })

  it('affiche un message modifié par le bénéficiaire', async () => {
    const beneficiaireNomComplet = 'Père Castor'

    //Given
    const message = unMessage({
      sentBy: 'jeune',
      content: 'Rdv demain 10h',
      status: 'edited',
    })

    //When
    await renderWithContexts(
      <DisplayMessageBeneficiaire
        message={message}
        beneficiaireNomComplet={beneficiaireNomComplet}
      />
    )

    // Then
    expect(screen.getByText(/Modifié/)).toBeInTheDocument()
  })

  it('affiche un résultat de recherche surligné', async () => {
    const beneficiaireNomComplet = 'Père Castor'

    //Given
    const message = unMessage({
      sentBy: 'jeune',
      content: 'Je vais vous raconter une histoire',
    })

    //When
    await renderWithContexts(
      <DisplayMessageBeneficiaire
        message={message}
        beneficiaireNomComplet={beneficiaireNomComplet}
        highlight={{ match: [0, 1], key: 'content' }}
      />
    )

    // Then
    const markedElements = screen.getAllByText('Je', {
      selector: 'mark',
    })
    expect(markedElements.length).toEqual(1)
  })

  describe('quand il y a une session Milo', () => {
    it('affiche le lien de session pour AUTO_DESINSCRIPTION', async () => {
      // Given
      const message = unMessage({
        sentBy: 'jeune',
        content: 'Vous avez été désinscrit de cette session',
        type: TypeMessage.AUTO_DESINSCRIPTION,
        infoSessionMilo: {
          id: 'id-session',
          titre: 'Titre de la session',
        },
      })

      // When
      await renderWithContexts(
        <DisplayMessageBeneficiaire
          message={message}
          beneficiaireNomComplet='Père Castor'
        />
      )

      // Then
      expect(screen.getByText('Titre de la session')).toBeInTheDocument()
    })

    it("affiche le motif d'annulation quand présent", async () => {
      // Given
      const message = unMessage({
        sentBy: 'jeune',
        content: 'Session annulée',
        type: TypeMessage.AUTO_DESINSCRIPTION,
        infoSessionMilo: {
          id: 'id-session',
          titre: 'Titre de la session',
          motifAnnulation: 'Problème logistique',
        },
      })

      // When
      await renderWithContexts(
        <DisplayMessageBeneficiaire
          message={message}
          beneficiaireNomComplet='Père Castor'
        />
      )

      // Then
      expect(screen.getByText(/Problème logistique/)).toBeInTheDocument()
    })

    it("n'affiche pas de motif d'annulation quand absent", async () => {
      // Given
      const message = unMessage({
        sentBy: 'jeune',
        content: 'Session Milo',
        type: TypeMessage.MESSAGE_SESSION_MILO,
        infoSessionMilo: {
          id: 'id-session',
          titre: 'Titre de la session',
        },
      })

      // When
      await renderWithContexts(
        <DisplayMessageBeneficiaire
          message={message}
          beneficiaireNomComplet='Père Castor'
        />
      )

      // Then
      expect(() => screen.getByText("Motif d'annulation :")).toThrow()
    })

    it("utilise la couleur d'annulation pour AUTO_DESINSCRIPTION", async () => {
      // Given
      const message = unMessage({
        sentBy: 'jeune',
        content: 'Désinscription',
        type: TypeMessage.AUTO_DESINSCRIPTION,
        infoSessionMilo: { id: 'id', titre: 'Titre' },
      })

      // When
      const { container } = await renderWithContexts(
        <DisplayMessageBeneficiaire
          message={message}
          beneficiaireNomComplet='Père Castor'
        />
      )

      // Then
      expect(container.querySelector('.bg-cancellation')).toBeInTheDocument()
      expect(
        container.querySelector('.bg-primary-darken')
      ).not.toBeInTheDocument()
    })
  })

  describe('quand il y a une pièce jointe', () => {
    it('pas de statut', async () => {
      const beneficiaireNomComplet = 'Père Castor'

      //Given
      const message = unMessage({
        sentBy: 'jeune',
        content: 'Rdv demain 10h',
        infoPiecesJointes: [
          {
            id: 'id-pj',
            nom: 'piece-jointe.jpg',
          },
        ],
        type: TypeMessage.MESSAGE_PJ,
      })

      //When
      await renderWithContexts(
        <DisplayMessageBeneficiaire
          message={message}
          beneficiaireNomComplet={beneficiaireNomComplet}
        />
      )

      // Then
      expect(screen.getByText('piece-jointe.jpg')).toBeInTheDocument()
    })

    it('statut analyse_a_faire', async () => {
      const beneficiaireNomComplet = 'Père Castor'

      //Given
      const message = unMessage({
        sentBy: 'jeune',
        content: 'Rdv demain 10h',
        infoPiecesJointes: [
          {
            id: 'id-pj',
            nom: 'piece-jointe.jpg',
            statut: 'analyse_a_faire',
          },
        ],
        type: TypeMessage.MESSAGE_PJ,
      })

      //When
      await renderWithContexts(
        <DisplayMessageBeneficiaire
          message={message}
          beneficiaireNomComplet={beneficiaireNomComplet}
        />
      )

      // Then
      expect(
        screen.getByText(message.infoPiecesJointes![0].nom)
      ).toBeInTheDocument()
      expect(() =>
        screen.getByRole('link', { name: message.infoPiecesJointes![0].nom })
      ).toThrow()
    })

    it('statut analyse_en_cours', async () => {
      const beneficiaireNomComplet = 'Père Castor'

      //Given
      const message = unMessage({
        sentBy: 'jeune',
        content: 'Rdv demain 10h',
        infoPiecesJointes: [
          {
            id: 'id-pj',
            nom: 'piece-jointe.jpg',
            statut: 'analyse_en_cours',
          },
        ],
        type: TypeMessage.MESSAGE_PJ,
      })

      //When
      await renderWithContexts(
        <DisplayMessageBeneficiaire
          message={message}
          beneficiaireNomComplet={beneficiaireNomComplet}
        />
      )

      // Then
      expect(
        screen.getByText(message.infoPiecesJointes![0].nom)
      ).toBeInTheDocument()
      expect(() =>
        screen.getByRole('link', { name: message.infoPiecesJointes![0].nom })
      ).toThrow()
    })

    describe('statut valide', () => {
      it('conseiller Avenir Pro', async () => {
        const conseiller = unConseiller({ structure: 'AVENIR_PRO' })
        const beneficiaireNomComplet = 'Père Castor'

        //Given
        const message = unMessage({
          sentBy: 'jeune',
          content: 'Rdv demain 10h',
          infoPiecesJointes: [
            {
              id: 'id-pj',
              nom: 'piece-jointe.jpg',
              statut: 'valide',
            },
          ],
          type: TypeMessage.MESSAGE_PJ,
        })

        //When
        await renderWithContexts(
          <DisplayMessageBeneficiaire
            message={message}
            beneficiaireNomComplet={beneficiaireNomComplet}
          />,
          {
            customConseiller: conseiller,
          }
        )

        // Then
        expect(
          screen.getByRole('link', {
            name:
              'Télécharger la pièce jointe ' +
              message.infoPiecesJointes![0].nom,
          })
        ).toBeInTheDocument()

        expect(() =>
          screen.getByText(
            'Enregistrez la dans i-milo pour la conserver de manière sécurisée.'
          )
        ).toThrow()
      })

      it('conseiller pas Avenir Pro', async () => {
        const beneficiaireNomComplet = 'Père Castor'

        //Given
        const message = unMessage({
          sentBy: 'jeune',
          content: 'Rdv demain 10h',
          infoPiecesJointes: [
            {
              id: 'id-pj',
              nom: 'piece-jointe.jpg',
              statut: 'valide',
            },
          ],
          type: TypeMessage.MESSAGE_PJ,
        })

        //When
        await renderWithContexts(
          <DisplayMessageBeneficiaire
            message={message}
            beneficiaireNomComplet={beneficiaireNomComplet}
          />
        )

        // Then
        expect(
          screen.getByRole('link', {
            name:
              'Télécharger la pièce jointe ' +
              message.infoPiecesJointes![0].nom,
          })
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            /Enregistrez la dans i-milo pour la conserver de manière sécurisée./
          )
        ).toBeInTheDocument()
      })
    })

    it('statut expirée', async () => {
      const beneficiaireNomComplet = 'Père Castor'

      //Given
      const message = unMessage({
        sentBy: 'jeune',
        content: 'Rdv demain 10h',
        infoPiecesJointes: [
          {
            id: 'id-pj',
            nom: 'piece-jointe.jpg',
            statut: 'expiree',
          },
        ],
        type: TypeMessage.MESSAGE_PJ,
      })

      //When
      await renderWithContexts(
        <DisplayMessageBeneficiaire
          message={message}
          beneficiaireNomComplet={beneficiaireNomComplet}
        />
      )

      // Then
      expect(
        screen.getByText('piece-jointe.jpg (Pièce jointe expirée)')
      ).toBeInTheDocument()
    })

    it('affiche un résultat de recherche avec nom de la pj surligné', async () => {
      const beneficiaireNomComplet = 'Père Castor'

      //Given
      const message = unMessage({
        sentBy: 'jeune',
        content: 'Je vais vous raconter une histoire',
        infoPiecesJointes: [
          {
            id: 'id-pj',
            nom: 'toto.jpg',
            statut: 'valide',
          },
        ],
        type: TypeMessage.MESSAGE_PJ,
      })

      //When
      await renderWithContexts(
        <DisplayMessageBeneficiaire
          message={message}
          beneficiaireNomComplet={beneficiaireNomComplet}
          highlight={{ match: [0, 3], key: 'piecesJointes.nom' }}
        />
      )

      // Then
      const markedElements = screen.getAllByText('toto', {
        selector: 'mark',
      })
      expect(markedElements.length).toEqual(1)
    })
  })
})
