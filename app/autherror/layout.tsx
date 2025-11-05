import React, { ReactNode } from 'react'

export default function FullPageLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <style>{`html {overflow-y: auto;}
      body 
                  {
                    position: static; 
                    height: auto;
                    overflow-y: auto;
                   } 
               `}</style>
      {children}
    </>
  )
}
