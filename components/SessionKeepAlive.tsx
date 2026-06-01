'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useRef } from 'react'

// Marge max avant l'expiration à laquelle on déclenche le refresh. Doit rester
// inférieure au skew de refresh côté serveur (voir authenticator.ts) pour que
// l'appel /api/auth/session rafraîchisse effectivement le token. Pour les
// tokens très courts, on se rabat sur la moitié de la durée restante afin de
// ne jamais reprogrammer un refresh immédiat en boucle.
const MARGE_AVANT_EXPIRATION_MS = 10_000
const DELAI_MINIMUM_MS = 1_000

/**
 * Maintient la session vivante côté navigateur en rafraîchissant le token juste
 * avant son expiration. Le timing est dérivé de la date d'expiration réelle
 * renvoyée par le serveur d'auth (et non d'une durée codée en dur), donc il
 * s'adapte automatiquement si la durée de vie de l'access token change.
 *
 * update() appelle /api/auth/session, seul contexte où next-auth réécrit le
 * cookie de session : c'est ce qui persiste le refresh_token rotaté côté client,
 * sans état serveur (compatible déploiement stateless multi-instances).
 */
export default function SessionKeepAlive() {
  const { data: session, update } = useSession()
  const expiresAtTimestamp = session?.expiresAtTimestamp

  // update() peut changer d'identité entre les rendus : on le garde dans une ref
  // pour ne pas reprogrammer le timer à chaque rendu.
  const updateRef = useRef(update)
  useEffect(() => {
    updateRef.current = update
  }, [update])

  useEffect(() => {
    if (!expiresAtTimestamp) return

    const dureeRestante = expiresAtTimestamp - Date.now()
    const marge = Math.min(MARGE_AVANT_EXPIRATION_MS, dureeRestante / 2)
    const delai = Math.max(dureeRestante - marge, DELAI_MINIMUM_MS)

    const timer = setTimeout(() => {
      updateRef.current()
    }, delai)
    return () => clearTimeout(timer)
  }, [expiresAtTimestamp])

  // Au retour sur l'onglet, les timers ont pu être throttlés en arrière-plan ;
  // on resynchronise immédiatement.
  useEffect(() => {
    function rafraichirSiVisible() {
      if (document.visibilityState === 'visible') updateRef.current()
    }
    document.addEventListener('visibilitychange', rafraichirSiVisible)
    return () =>
      document.removeEventListener('visibilitychange', rafraichirSiVisible)
  }, [])

  return null
}
