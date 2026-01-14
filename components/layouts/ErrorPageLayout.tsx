import React, { ReactNode } from 'react'

type ErrorPageLayoutProps = {
  title: string
  children: ReactNode
  ariaLabelledBy?: string
  className?: string
}

export default function ErrorPageLayout({
  title,
  children,
  ariaLabelledBy,
  className,
}: Readonly<ErrorPageLayoutProps>) {
  return (
    <>
      <header>
        <title>{title}</title>
      </header>
      <main
        role='main'
        aria-labelledby={ariaLabelledBy}
        className={`flex flex-col justify-center min-h-screen w-full py-10 px-4 sm:px-10 ${className ?? ''}`}
      >
        <div className='shadow-m flex flex-col justify-center w-full max-w-[800px] mx-auto p-4 sm:p-8 box-border bg-white rounded-xl'>
          {children}
        </div>
      </main>
    </>
  )
}
