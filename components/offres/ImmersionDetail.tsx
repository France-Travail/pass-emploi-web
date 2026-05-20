import LienPartageOffre from 'components/offres/LienPartageOffre'
import TagAccessibleHandicap from 'components/offres/TagAccessibleHandicap'
import PageActionsPortal from 'components/PageActionsPortal'
import { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { DataTag } from 'components/ui/Indicateurs/DataTag'
import { Tag } from 'components/ui/Indicateurs/Tag'
import {
  DetailImmersion,
  ImmersionModeContact,
  ImmersionModeDistanciel,
} from 'interfaces/offre'
import { useLienExterne } from 'utils/hooks/useLienExterne'

type ImmersionDetailProps = {
  offre: DetailImmersion
}

export default function ImmersionDetail({
  offre,
}: Readonly<ImmersionDetailProps>) {
  const { confirmer, modal } = useLienExterne()

  const texteModeDistanciel = (() => {
    switch (offre.modeDistanciel) {
      case ImmersionModeDistanciel.FULL_REMOTE:
        return 'Télétravail'
      case ImmersionModeDistanciel.HYBRID:
        return 'Présentiel et à distance'
      case ImmersionModeDistanciel.ON_SITE:
        return 'Présentiel'
    }
  })()

  const { modeContactLabel, modeContactIcon } = (() => {
    switch (offre.contact.mode) {
      case ImmersionModeContact.EMAIL:
        return {
          modeContactLabel: 'Mise en relation par Mail',
          modeContactIcon: IconName.Mail,
        }
      case ImmersionModeContact.TELEPHONE:
        return {
          modeContactLabel: 'Mise en relation par Téléphone',
          modeContactIcon: IconName.Call,
        }
      case ImmersionModeContact.PRESENTIEL:
        return {
          modeContactLabel: 'Mise en relation en Présentiel',
          modeContactIcon: IconName.LocationOn,
        }
    }
  })()

  return (
    <>
      <PageActionsPortal>
        <LienPartageOffre
          titreOffre={offre.titre}
          href={`/offres/immersion/${offre.id}/partage`}
          style={ButtonStyle.PRIMARY}
        />
      </PageActionsPortal>

      <div className='max-w-2xl mx-auto'>
        <TagAccessibleHandicap
          accessibleTravailleurHandicape={offre.accessibleTravailleurHandicape}
          className='mb-2'
        />
        <h2 className='text-l-bold'>{offre.titre}</h2>

        <section aria-labelledby='heading-info' className='mt-2'>
          <h3 id='heading-info' className='sr-only'>
            Informations de l&apos;offre
          </h3>

          <dl>
            <dt className='sr-only'>Établissement</dt>
            <dd>{offre.nomEtablissement}</dd>

            <dt className='sr-only'>Secteur d&apos;activité</dt>
            <dd className='mt-2'>
              <DataTag text={offre.secteurActivite} compact />
            </dd>

            <div className='flex gap-2'>
              <dt className='sr-only'>Ville</dt>
              <dd className='mt-2'>
                <DataTag text={offre.ville} iconName={IconName.LocationOn} />
              </dd>

              <dt className='sr-only'>Mode de travail</dt>
              <dd className='mt-2'>
                <DataTag text={texteModeDistanciel} compact />
              </dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby='entreprise' className='mt-8'>
          <h3
            id='entreprise'
            className='inline-flex items-center w-full text-m-bold pb-6 mb-4 border-b border-solid border-primary-lighten'
          >
            L&apos;entreprise
          </h3>

          {offre.contact.mode && (
            <Tag
              label={modeContactLabel}
              iconName={modeContactIcon}
              className='rounded-base text-content-color bg-additional-4-lighten text-s-regular mb-4'
              isSmallTag
            />
          )}

          <dl>
            <dt className='text-base-bold'>Adresse</dt>
            <dd>{offre.contact.adresse}</dd>

            {offre.informationsComplementaires && (
              <>
                <dt className='text-base-bold mt-6'>
                  Informations complémentaires
                </dt>
                <dd>{offre.informationsComplementaires}</dd>
              </>
            )}
          </dl>

          {offre.siteWeb && (
            <>
              <h4 className='text-base-bold mt-6'>Site web</h4>
              <a
                href={offre.siteWeb}
                target='_blank'
                rel='noreferrer noopener'
                className='underline text-base text-primary-darken'
                onClick={(e) => confirmer(e, offre.siteWeb!)}
              >
                <IconComponent
                  name={IconName.OpenInNew}
                  className='inline shrink-0 w-4 h-4 ml-1 mr-1 fill-current'
                  focusable={false}
                  aria-hidden={true}
                />
                {offre.siteWeb}
              </a>
            </>
          )}
        </section>
      </div>

      {modal}
    </>
  )
}
