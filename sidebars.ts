import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

const sidebars: SidebarsConfig = {
  mainSidebar: [
    {
      type: 'doc',
      id: 'getting-started',
      label: 'Getting Started',
    },
    {
      type: 'category',
      label: 'API Reference',
      collapsed: false,
      items: [
        { type: 'doc', id: 'api/to-html', label: 'toHtml()' },
        { type: 'doc', id: 'api/to-ansi', label: 'toAnsi()' },
        { type: 'doc', id: 'api/to-doc-tree', label: 'toDocTree()' },
        { type: 'doc', id: 'api/serialize', label: 'serialize()' },
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      collapsed: false,
      items: [
        { type: 'doc', id: 'guides/markdown-to-prosemirror', label: 'Markdown to ProseMirror' },
        { type: 'doc', id: 'guides/markdown-to-slate', label: 'Markdown to Slate' },
        { type: 'doc', id: 'guides/markdown-to-quill', label: 'Markdown to Quill' },
        { type: 'doc', id: 'guides/markdown-to-ansi-terminal', label: 'Markdown in the Terminal' },
        { type: 'doc', id: 'guides/custom-serializer', label: 'Custom Serializer' },
        { type: 'doc', id: 'guides/html-classnames', label: 'HTML Class Names' },
        { type: 'doc', id: 'guides/ansi-theme', label: 'ANSI Theme' },
        { type: 'doc', id: 'guides/remark-plugins', label: 'remark Plugins' },
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: true,
      items: [
        { type: 'doc', id: 'reference/doc-tree-nodes', label: 'Doc Tree Node Types' },
      ],
    },
    {
      type: 'doc',
      id: 'comparison',
      label: 'Comparison',
    },
    {
      type: 'doc',
      id: 'security',
      label: 'Security',
    },
    {
      type: 'doc',
      id: 'changelog',
      label: 'Changelog',
    },
  ],
}

export default sidebars
