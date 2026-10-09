import { themes as prismThemes } from 'prism-react-renderer'
import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'
import cspHeaders from './plugins/csp-headers'

const SITE = 'https://md-to-rich.jithins.dev'

const config: Config = {
  title: 'md-to-rich',
  tagline: 'Convert Markdown to HTML, ANSI terminal output, and Doc Tree',
  favicon: 'img/logo.svg',
  headTags: [
    {
      tagName: 'link',
      attributes: { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/img/favicon-32.png' },
    },
    {
      tagName: 'link',
      attributes: { rel: 'apple-touch-icon', sizes: '180x180', href: '/img/apple-touch-icon.png' },
    },
    {
      tagName: 'script',
      attributes: { type: 'application/ld+json' },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Person',
            '@id': `${SITE}/#author`,
            name: 'Jithin Sebastian',
            url: 'https://github.com/jithinsk',
            sameAs: ['https://github.com/jithinsk', 'https://www.npmjs.com/~jithins'],
          },
          {
            '@type': 'WebSite',
            '@id': `${SITE}/#website`,
            url: `${SITE}/`,
            name: 'md-to-rich',
            description: 'Documentation for md-to-rich, a TypeScript library that converts Markdown to HTML, ANSI terminal output, and a typed Doc Tree.',
            inLanguage: 'en',
            publisher: { '@id': `${SITE}/#author` },
          },
          {
            '@type': ['SoftwareApplication', 'SoftwareSourceCode'],
            '@id': `${SITE}/#software`,
            name: 'md-to-rich',
            description: 'Convert Markdown to HTML, ANSI terminal output, and Doc Tree via an extensible Serializer interface. TypeScript-first, tree-shakeable, ESM + CJS dual output.',
            url: `${SITE}/`,
            image: `${SITE}/img/social-card.png`,
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Cross-platform (Node.js 20+)',
            programmingLanguage: 'TypeScript',
            runtimePlatform: 'Node.js',
            codeRepository: 'https://github.com/jithinsk/markdown-to-richtext',
            downloadUrl: 'https://www.npmjs.com/package/md-to-rich',
            // Kept as a literal: .github/workflows/sync-library.yml bumps it with sed.
            softwareVersion: '2.0.1',
            license: 'https://opensource.org/licenses/MIT',
            isAccessibleForFree: true,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            author: { '@id': `${SITE}/#author` },
            sameAs: ['https://www.npmjs.com/package/md-to-rich', 'https://github.com/jithinsk/markdown-to-richtext'],
          },
        ],
      }),
    },
  ],

  url: SITE,
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
          showLastUpdateTime: true,
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

  plugins: [
    cspHeaders,
    [
      'docusaurus-plugin-llms',
      {
        description:
          'md-to-rich is a TypeScript library that converts Markdown to HTML, ANSI terminal output, and a typed Doc Tree (JSON) for rich-text editors such as ProseMirror, Slate, and Quill.',
        generateMarkdownFiles: true,
        excludeImports: true,
        includeOrder: ['getting-started.md', 'api/*', 'guides/*', 'reference/*', 'security.md', 'changelog.md'],
      },
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
        width: 32,
        height: 32,
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
            { label: 'Report a vulnerability', href: 'https://github.com/jithinsk/markdown-to-richtext/security/advisories/new' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} <a href="https://github.com/jithinsk">Jithin Sebastian</a>. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'typescript', 'json'],
    },
  } satisfies Preset.ThemeConfig,
}

export default config
