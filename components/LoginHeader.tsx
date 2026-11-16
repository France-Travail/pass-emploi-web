import Image from 'next/image'
import React from 'react'

import logo1j1sApp from 'assets/images/logo_1j1s_app.png'
import IllustrationLogoPassemploi from 'assets/images/logo_pass_emploi.svg'

type LoginHeaderProps = {
  title: string
  subtitle?: string
}
export default function LoginHeader({ title, subtitle }: LoginHeaderProps) {
  return (
    <>
      <div className='flex items-start justify-center gap-8'>
        {/* 54px : hauteur réelle du dessin pass emploi, son SVG a une marge en bas */}
        <Image
          src={logo1j1sApp}
          alt=''
          aria-hidden={true}
          className='h-[54px] w-auto rounded-base'
        />

        <IllustrationLogoPassemploi
          className='h-[60px]'
          focusable={false}
          aria-hidden={true}
        />
      </div>

      <header role='banner' className='my-8'>
        <h1 className='text-xl-bold text-primary-darken text-center'>
          {title}
        </h1>
        {subtitle && (
          <p className='text-m-regular text-primary-darken text-center mt-8'>
            {subtitle}
          </p>
        )}
      </header>
    </>
  )
}
