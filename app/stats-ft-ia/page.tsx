export default function StatsFTIA() {
  const iframeUrl = process.env.STATS_FTIA_IFRAME_URL
  return (
    <>
      <header>
        <title>Statistiques France Travail IA</title>
      </header>
      <iframe
        title="Statistiques d'usage de la fonctionnalité démarches par IA"
        src={iframeUrl}
        className='fixed top-0 left-0 w-full h-full border-0'
      ></iframe>
    </>
  )
}
