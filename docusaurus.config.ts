import { themes as prismThemes } from 'prism-react-renderer'
import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'

const config: Config = {
  title: 'md-to-rich',
  tagline: 'Convert Markdown to HTML, ANSI terminal output, and Doc Tree',
  favicon: 'img/logo.svg',
  headTags: [
    {
      tagName: 'script',
      attributes: {},
      innerHTML: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-T7FDLQ8Z');`,
    },
    {
      tagName: 'script',
      attributes: { type: 'application/ld+json' },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'md-to-rich',
        applicationCategory: 'DeveloperApplication',
        description: 'Convert Markdown to HTML, ANSI terminal output, and Doc Tree via an extensible Serializer interface. TypeScript-first, tree-shakeable, ESM + CJS dual output.',
        url: 'https://md-to-rich.jithins.dev/',
        downloadUrl: 'https://www.npmjs.com/package/md-to-rich',
        softwareVersion: '1.0.2',
        operatingSystem: 'Node.js ≥ 18',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        author: { '@type': 'Person', name: 'Jithin Sebastian' },
        license: 'https://opensource.org/licenses/MIT',
        codeRepository: 'https://github.com/jithinsk/md-to-rich.github.io',
      }),
    },
  ],

  url: 'https://md-to-rich.jithins.dev',
  baseUrl: '/',

  organizationName: 'jithinsk',
  projectName: 'md-to-rich.github.io',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/jithinsk/md-to-rich.github.io/tree/main/',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          createSitemapItems: async (params) => {
            const { defaultCreateSitemapItems, ...rest } = params
            const items = await defaultCreateSitemapItems(rest)
            return items.map((item) => {
              if (item.url === 'https://md-to-rich.jithins.dev/') {
                return { ...item, priority: 1.0, changefreq: 'monthly' }
              }
              if (item.url.includes('/getting-started') || item.url.includes('/api/')) {
                return { ...item, priority: 0.9 }
              }
              if (item.url.includes('/guides/')) {
                return { ...item, priority: 0.8 }
              }
              return item
            })
          },
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.svg',
    metadata: [
      { name: 'keywords', content: 'markdown, html, ansi, terminal, doc-tree, rich-text, serializer, remark, mdast, gfm, prosemirror, slate, typescript, npm' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'md-to-rich' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@jithinsk' },
    ],
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'md-to-rich',
      logo: {
        alt: 'md-to-rich logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'mainSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://www.npmjs.com/package/md-to-rich',
          label: 'npm',
          position: 'right',
        },
        {
          href: 'https://github.com/jithinsk/md-to-rich.github.io',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            { label: 'Getting Started', to: '/docs/getting-started' },
            { label: 'API: toHtml()', to: '/docs/api/to-html' },
            { label: 'API: toAnsi()', to: '/docs/api/to-ansi' },
            { label: 'API: toDocTree()', to: '/docs/api/to-doc-tree' },
            { label: 'API: serialize()', to: '/docs/api/serialize' },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'GitHub', href: 'https://github.com/jithinsk/md-to-rich.github.io' },
            { label: 'npm', href: 'https://www.npmjs.com/package/md-to-rich' },
            { label: 'Changelog', to: '/docs/changelog' },
            { label: 'Security', to: '/docs/security' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Jithin Sebastian. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'typescript', 'json'],
    },
  } satisfies Preset.ThemeConfig,
}

export default config
