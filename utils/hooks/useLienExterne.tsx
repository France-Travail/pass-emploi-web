import React, { useState } from 'react'

import ConfirmationRedirectionModal from 'components/ConfirmationRedirectionModal'

export function useLienExterne() {
  const [lienAOuvrir, setLienAOuvrir] = useState<string | null>(null)

  function confirmer(e: React.MouseEvent<HTMLAnchorElement>, lien: string) {
    e.preventDefault()
    setLienAOuvrir(lien)
  }

  function ouvrir() {
    if (lienAOuvrir) {
      window.open(lienAOuvrir, '_blank', 'noopener,noreferrer')
      setLienAOuvrir(null)
    }
  }

  const modal = lienAOuvrir ? (
    <ConfirmationRedirectionModal
      lien={lienAOuvrir}
      onConfirmation={ouvrir}
      onCancel={() => setLienAOuvrir(null)}
    />
  ) : null

  return { confirmer, modal }
}
