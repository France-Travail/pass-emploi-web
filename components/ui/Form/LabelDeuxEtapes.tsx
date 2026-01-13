import { ForwardedRef, forwardRef } from 'react'

const LabelDeuxEtapes = forwardRef(
  ({ etape }: { etape: 1 | 2 }, ref: ForwardedRef<HTMLDivElement>) => {
    return (
      <p
        className='bg-primary-lighten rounded-base w-auto inline-block p-2 text-base-medium text-primary'
        ref={ref}
        tabIndex={-1}
      >
        <span className='sr-only'>Création de compte : étape </span>
        {etape} sur 2
      </p>
    )
  }
)
LabelDeuxEtapes.displayName = 'LabelDeuxEtapes'
export default LabelDeuxEtapes
