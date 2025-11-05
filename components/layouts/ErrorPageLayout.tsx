import React, { ReactNode } from 'react'

type ErrorPageLayoutProps = {
  title: string
  children: ReactNode
  ariaLabelledBy?: string
}

export default function ErrorPageLayout({
  title,
  children,
  ariaLabelledBy,
}: Readonly<ErrorPageLayoutProps>) {
  return (
    <>
      <header>
        <title>{title}</title>
      </header>
      <main
        role='main'
        aria-labelledby={ariaLabelledBy}
        className='flex flex-col justify-center min-h-screen w-full py-10 px-4 sm:px-10'
      >
        <div className='shadow-m flex flex-col justify-center w-full max-w-[800px] mx-auto p-4 sm:p-8 box-border'>
          {children}
        </div>
      </main>
    </>
  )
}
