import React, { type ReactNode } from 'react'
import Head from '@docusaurus/Head'
import Layout from '@theme-original/DocItem/Layout'
import type LayoutType from '@theme/DocItem/Layout'
import type { WrapperProps } from '@docusaurus/types'
import { useDoc } from '@docusaurus/plugin-content-docs/client'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

type Props = WrapperProps<typeof LayoutType>

// Adds TechArticle JSON-LD to every doc page, linked to the site-wide
// Person / WebSite / software nodes declared in docusaurus.config.ts.
export default function LayoutWrapper(props: Props): ReactNode {
  const { siteConfig } = useDocusaurusContext()
  const { metadata } = useDoc()
  const site = siteConfig.url
  const url = `${site}${metadata.permalink}`

  const article = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': `${url}#article`,
    headline: metadata.title,
    description: metadata.description,
    url,
    mainEntityOfPage: url,
    inLanguage: 'en',
    image: `${site}/img/social-card.png`,
    ...(metadata.lastUpdatedAt && {
      dateModified: new Date(metadata.lastUpdatedAt).toISOString(),
    }),
    author: { '@id': `${site}/#author` },
    publisher: { '@id': `${site}/#author` },
    isPartOf: { '@id': `${site}/#website` },
    about: { '@id': `${site}/#software` },
  }

  return (
    <>
      <Head>
        <script type="application/ld+json">{JSON.stringify(article)}</script>
      </Head>
      <Layout {...props} />
    </>
  )
}
