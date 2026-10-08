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
      attributes: { type: 'application/ld+json' },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'md-to-rich',
        applicationCategory: 'DeveloperApplication',
        description: 'Convert Markdown to HTML, ANSI terminal output, and Doc Tree via an extensible Serializer interface. TypeScript-first, tree-shakeable, ESM + CJS dual output.',
        url: 'https://md-to-rich.jithins.dev/',
        downloadUrl: 'https://www.npmjs.com/package/md-to-rich',
        softwareVersion: '2.0.0',
        operatingSystem: 'Node.js ≥ 20',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        author: { '@type': 'Person', name: 'Jithin Sebastian' },
        license: 'https://opensource.org/licenses/MIT',
        codeRepository: 'https://github.com/jithinsk/markdown-to-richtext',
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
          editUrl: 'https://github.com/jithinsk/markdown-to-richtext/tree/main/',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          lastmod: 'date',
          // Google ignores changefreq and priority, so omit them.
          changefreq: null,
          priority: null,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    metadata: [
      { name: 'keywords', content: 'markdown, html, ansi, terminal, doc-tree, rich-text, serializer, remark, mdast, gfm, prosemirror, slate, typescript, npm' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'md-to-rich' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: 'md-to-rich: convert Markdown to HTML, ANSI terminal output, and Doc Tree' },
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
        { to: '/playground', label: 'Playground', position: 'left' },
        {
          href: 'https://www.npmjs.com/package/md-to-rich',
          label: 'npm',
          position: 'right',
        },
        {
          href: 'https://github.com/jithinsk/markdown-to-richtext',
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
            { label: 'GitHub', href: 'https://github.com/jithinsk/markdown-to-richtext' },
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
