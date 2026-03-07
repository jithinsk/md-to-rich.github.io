import { themes as prismThemes } from 'prism-react-renderer'
import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'

const config: Config = {
  title: 'md-to-rich',
  tagline: 'Convert Markdown to HTML, ANSI terminal output, and Doc Tree',
  favicon: 'img/logo.svg',

  url: 'https://jithinsk.github.io',
  baseUrl: '/md-to-rich.github.io/',

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
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
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
