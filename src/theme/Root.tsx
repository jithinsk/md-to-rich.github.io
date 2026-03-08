import React from 'react'

export default function Root({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <>
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-T7FDLQ8Z"
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
      {children}
    </>
  )
}
