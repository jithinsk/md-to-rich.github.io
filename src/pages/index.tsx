import React from 'react'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import CodeBlock from '@theme/CodeBlock'
import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'
import styles from './index.module.css'

const toHtmlExample = `import { toHtml } from 'md-to-rich'

const html = toHtml(\`
# Welcome

A paragraph with **bold**, *italic*, and \\\`inline code\\\`.

> A blockquote

- Item one
- Item two
\`, { headingIds: true, classNames: { p: 'prose' } })

// Output:
// <h1 id="welcome">Welcome</h1>
// <p class="prose">A paragraph with <strong>bold</strong>,
//   <em>italic</em>, and <code>inline code</code>.</p>
// <blockquote><p>A blockquote</p></blockquote>
// <ul><li>Item one</li><li>Item two</li></ul>`

const toAnsiExample = `import { toAnsi } from 'md-to-rich'

const output = toAnsi(\`
# Hello World

A paragraph with **bold** and *italic* text.

\\\`\\\`\\\`typescript
const x: number = 42
\\\`\\\`\\\`
\`, { columns: 80, hyperlinks: false })

// Output: ANSI-escaped string rendered in terminal
// - h1 rendered bold + underlined
// - Bold/italic inline styles
// - Code block with box-drawing border`

const toDocTreeExample = `import { toDocTree } from 'md-to-rich'
import type { DocDocument } from 'md-to-rich'

const tree: DocDocument = toDocTree('# Hello\\n\\nWorld')

// Output:
// {
//   type: 'document',
//   children: [
//     { type: 'heading', depth: 1,
//       children: [{ type: 'text', value: 'Hello',
//                    bold: false, italic: false, strikethrough: false }] },
//     { type: 'paragraph',
//       children: [{ type: 'text', value: 'World',
//                    bold: false, italic: false, strikethrough: false }] }
//   ]
// }`

const customSerializerExample = `import type { Root } from 'mdast'
import { serialize } from 'md-to-rich'
import type { Serializer } from 'md-to-rich'

const PlainText: Serializer<string> = {
  serialize(ast: Root): string {
    function extract(node: any): string {
      if (node.value !== undefined) return node.value
      if (node.children) return node.children.map(extract).join('')
      return ''
    }
    return extract(ast)
  },
}

const result = serialize('# Hello\\n\\nThis is **bold** text.', PlainText)
// → 'HelloThis is bold text.'`

export default function Home(): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout description={siteConfig.tagline}>
      {/* Hero */}
      <header className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
          <p className={styles.heroTagline}>{siteConfig.tagline}</p>
          <div className={styles.heroButtons}>
            <Link className={styles.btnPrimary} to="/docs/getting-started">
              Get Started
            </Link>
            <Link
              className={styles.btnOutline}
              href="https://github.com/jithinsk/markdown-to-richtext"
            >
              GitHub
            </Link>
            <Link
              className={styles.btnOutline}
              href="https://www.npmjs.com/package/md-to-rich"
            >
              npm
            </Link>
          </div>
        </div>
      </header>

      {/* Install strip */}
      <div className={styles.installStrip}>
        <code className={styles.installCode}>
          <span>$</span> npm install md-to-rich
        </code>
      </div>

      <main>
        {/* Feature cards */}
        <section className={styles.features}>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🌐</div>
              <h3 className={styles.featureTitle}>HTML Output</h3>
              <p className={styles.featureDesc}>
                Convert Markdown to clean HTML with optional heading IDs, custom CSS
                class injection per element, GFM tables, task lists, and built-in URL
                sanitisation.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🖥</div>
              <h3 className={styles.featureTitle}>ANSI Terminal</h3>
              <p className={styles.featureDesc}>
                Render Markdown in the terminal with ANSI escape codes. Fully themeable
                without chalk, with word-wrap, box-drawing tables, and OSC 8 hyperlink
                support.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🌲</div>
              <h3 className={styles.featureTitle}>Doc Tree</h3>
              <p className={styles.featureDesc}>
                Parse Markdown into a typed JSON tree. Perfect for ProseMirror, Slate,
                Quill, and other rich-text editors. Flat inline marks — no nested AST
                wrangling.
              </p>
            </div>
          </div>
        </section>

        {/* Code example tabs */}
        <section className={styles.codeExamples}>
          <div className={styles.codeExamplesInner}>
            <h2 className={styles.sectionTitle}>See It In Action</h2>
            <Tabs>
              <TabItem value="toHtml" label="toHtml()">
                <CodeBlock language="typescript">{toHtmlExample}</CodeBlock>
              </TabItem>
              <TabItem value="toAnsi" label="toAnsi()">
                <CodeBlock language="typescript">{toAnsiExample}</CodeBlock>
              </TabItem>
              <TabItem value="toDocTree" label="toDocTree()">
                <CodeBlock language="typescript">{toDocTreeExample}</CodeBlock>
              </TabItem>
              <TabItem value="custom" label="Custom Serializer">
                <CodeBlock language="typescript">{customSerializerExample}</CodeBlock>
              </TabItem>
            </Tabs>
          </div>
        </section>

        {/* Extensibility callout */}
        <section>
          <div className={styles.callout}>
            <h2 className={styles.calloutTitle}>Extensible by Design</h2>
            <p className={styles.calloutDesc}>
              The <code>Serializer&lt;T&gt;</code> interface is the only contract. Implement
              it to add any output format — plain text, Word count, PDF metadata — without
              touching this package. No inheritance, no registration, no boilerplate.
            </p>
            <CodeBlock language="typescript">{`export interface Serializer<TOutput, TOptions = Record<never, never>> {
  serialize(ast: Root, options: TOptions): TOutput
}`}</CodeBlock>
            <p style={{ marginTop: '1.5rem' }}>
              <Link to="/docs/guides/custom-serializer">Read the Custom Serializer guide →</Link>
            </p>
          </div>
        </section>
      </main>
    </Layout>
  )
}
