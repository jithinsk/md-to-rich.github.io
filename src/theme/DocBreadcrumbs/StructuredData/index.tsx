import React, { type ReactNode } from 'react'
import Head from '@docusaurus/Head'
import { useDoc } from '@docusaurus/plugin-content-docs/client'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

// Sidebar categories have no URL, so the default breadcrumb JSON-LD collapses
// to a single item, which Google rejects. Emit Home > Docs > page instead.
export default function DocBreadcrumbsStructuredData(): ReactNode {
  const { siteConfig } = useDocusaurusContext()
  const { metadata } = useDoc()
  const site = siteConfig.url
  const isDocsHome = metadata.permalink === '/docs/getting-started'

  const trail = [
    { name: 'Home', item: `${site}/` },
    ...(isDocsHome ? [] : [{ name: 'Docs', item: `${site}/docs/getting-started` }]),
    { name: metadata.title, item: `${site}${metadata.permalink}` },
  ]

  return (
    <Head>
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: trail.map((crumb, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            ...crumb,
          })),
        })}
      </script>
    </Head>
  )
}
