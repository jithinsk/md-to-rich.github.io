import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Layout from '@theme/Layout'
import Head from '@docusaurus/Head'
import Link from '@docusaurus/Link'
import { useColorMode } from '@docusaurus/theme-common'
import styles from './playground.module.css'
import { toHtml, toDocTree, toAnsi } from 'md-to-rich'

const EXAMPLE_MARKDOWN = `# Heading 1 — md-to-rich Demo

## Inline Formatting

A paragraph with **bold**, *italic*, ~~strikethrough~~, and \`inline code\`.

Here is a [hyperlink](https://md-to-rich.jithins.dev).

## Code Block

\`\`\`typescript
import { toHtml } from 'md-to-rich'
const html = toHtml('# Hello')
\`\`\`

## Lists

- Alpha
- Beta with **bold**

1. First
2. Second

- [x] Done
- [ ] Pending

## Blockquote

> "The best tools disappear into the work."

---

## Table

| Option | Type | Default |
|--------|------|---------|
| \`headingIds\` | boolean | \`true\` |
| \`gfm\` | boolean | \`true\` |
`

type Format = 'html' | 'doctree' | 'ansi'
type HtmlSubTab = 'preview' | 'source'

interface ConversionResult {
  html: string
  docTree: unknown
  ansi: string
  error: string | null
}

function runConversion(md: string): ConversionResult {
  try {
    const html = toHtml(md)
    const docTree = toDocTree(md)
    const ansi = toAnsi(md, { columns: 80 })
    return { html, docTree, ansi, error: null }
  } catch (e) {
    return {
      html: '',
      docTree: null,
      ansi: '',
      error: e instanceof Error ? e.message : String(e),
    }
  }
}

// Theme variables the preview document needs, with light-mode fallbacks for
// the server render (no computed styles exist there).
const PREVIEW_VARS: Record<string, string> = {
  '--ifm-font-family-base': 'system-ui, sans-serif',
  '--ifm-font-family-monospace': 'ui-monospace, monospace',
  '--ifm-font-color-base': '#1c1e21',
  '--ifm-color-primary': '#5a67d8',
  '--ifm-background-surface-color': '#ffffff',
  '--ifm-color-emphasis-100': '#f5f6f7',
  '--ifm-color-emphasis-200': '#ebedf0',
  '--ifm-color-emphasis-300': '#dadde1',
  '--ifm-color-emphasis-700': '#606770',
}

function readPreviewVars(): Record<string, string> {
  if (typeof window === 'undefined') return PREVIEW_VARS
  const computed = getComputedStyle(document.documentElement)
  return Object.fromEntries(
    Object.entries(PREVIEW_VARS).map(([name, fallback]) => [
      name,
      computed.getPropertyValue(name).trim() || fallback,
    ]),
  )
}

// The preview renders in its own document so the demo's headings don't add a
// second <h1> to the playground page, and user-typed HTML stays sandboxed.
function previewDocument(html: string, vars: Record<string, string>, dark: boolean): string {
  const rootVars = Object.entries(vars).map(([k, v]) => `${k}:${v};`).join('')
  return `<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><style>
:root{${rootVars}color-scheme:${dark ? 'dark' : 'light'}}
body{margin:0;padding:1.5rem;font-family:var(--ifm-font-family-base);font-size:0.9375rem;line-height:1.6;color:var(--ifm-font-color-base);background:var(--ifm-background-surface-color)}
h1,h2,h3,h4{margin-top:1.25rem;margin-bottom:0.5rem;line-height:1.3}
p{margin:0.75rem 0}
a{color:var(--ifm-color-primary)}
table{border-collapse:collapse;width:100%;margin:1rem 0}
th,td{border:1px solid var(--ifm-color-emphasis-300);padding:0.4rem 0.75rem;text-align:left}
th{background:var(--ifm-background-surface-color);font-weight:600}
blockquote{border-left:4px solid var(--ifm-color-emphasis-300);margin:1rem 0;padding:0.5rem 1rem;color:var(--ifm-color-emphasis-700)}
pre{background:var(--ifm-background-surface-color);border:1px solid var(--ifm-color-emphasis-200);border-radius:6px;padding:1rem;overflow:auto;font-size:0.85rem}
code{font-family:var(--ifm-font-family-monospace);font-size:0.875em;background:var(--ifm-color-emphasis-100);padding:0.1em 0.35em;border-radius:3px}
pre code{background:transparent;padding:0}
ul,ol{padding-left:1.5rem;margin:0.5rem 0}
li{margin:0.25rem 0}
hr{border:none;border-top:1px solid var(--ifm-color-emphasis-200);margin:1.5rem 0}
</style></head><body>${html}</body></html>`
}

function makeAnsiReadable(raw: string): string {
  return raw.replace(/\x1b/g, '␛')
}

function PlaygroundApp(): React.JSX.Element {
  const [markdown, setMarkdown] = useState(EXAMPLE_MARKDOWN)
  const [result, setResult] = useState<ConversionResult>(() => runConversion(EXAMPLE_MARKDOWN))
  const [format, setFormat] = useState<Format>('html')
  const [htmlSubTab, setHtmlSubTab] = useState<HtmlSubTab>('preview')
  const [liveMode, setLiveMode] = useState(true)
  const [copied, setCopied] = useState(false)
  const { colorMode } = useColorMode()
  const [previewVars, setPreviewVars] = useState(PREVIEW_VARS)

  // Re-read theme colours after hydration and whenever the colour mode flips.
  useEffect(() => {
    setPreviewVars(readPreviewVars())
  }, [colorMode])

  const previewSrcDoc = useMemo(
    () => previewDocument(result.html, previewVars, colorMode === 'dark'),
    [result.html, previewVars, colorMode],
  )

  useEffect(() => {
    if (!liveMode) return
    const timer = setTimeout(() => {
      setResult(runConversion(markdown))
    }, 300)
    return () => clearTimeout(timer)
  }, [markdown, liveMode])

  const handleConvert = useCallback(() => {
    setResult(runConversion(markdown))
  }, [markdown])

  const handleReset = useCallback(() => {
    setMarkdown(EXAMPLE_MARKDOWN)
    setResult(runConversion(EXAMPLE_MARKDOWN))
  }, [])

  const handleCopyAnsi = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(result.ansi)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable
    }
  }, [result.ansi])

  return (
    <>
      <div className={styles.pageWrapper}>
        <div className={styles.pageHeader}>
          <h1>Playground</h1>
          <p>Type Markdown in the editor and see the converted output update as you type.</p>
        </div>

        <div className={styles.splitPane}>
          {/* Input pane */}
          <div className={styles.inputPane}>
            <div className={styles.paneHeader}>
              <span className={styles.paneLabel}>Markdown Input</span>
              <button className={styles.resetBtn} onClick={handleReset}>
                Reset
              </button>
            </div>

            <textarea
              className={styles.textarea}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              spellCheck={false}
              aria-label="Markdown input"
            />

            <div className={styles.inputFooter}>
              <label className={styles.liveToggle}>
                <input
                  type="checkbox"
                  checked={liveMode}
                  onChange={(e) => setLiveMode(e.target.checked)}
                />
                Live preview
              </label>
              {!liveMode && (
                <button className={styles.convertBtn} onClick={handleConvert}>
                  Convert
                </button>
              )}
            </div>
          </div>

          {/* Output pane */}
          <div className={styles.outputPane}>
            <div className={styles.paneHeader}>
              <span className={styles.paneLabel}>Output</span>
              <div className={styles.formatTabs}>
                {(['html', 'doctree', 'ansi'] as Format[]).map((f) => (
                  <button
                    key={f}
                    className={`${styles.formatTab} ${format === f ? styles.formatTabActive : ''}`}
                    onClick={() => setFormat(f)}
                  >
                    {f === 'html' ? 'HTML' : f === 'doctree' ? 'Doc Tree' : 'ANSI'}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.outputBody}>
              {result.error && (
                <div className={styles.errorBanner}>
                  <strong>Error:</strong> {result.error}
                </div>
              )}

              {!result.error && format === 'html' && (
                <>
                  <div className={styles.subTabs}>
                    <button
                      className={`${styles.subTab} ${htmlSubTab === 'preview' ? styles.subTabActive : ''}`}
                      onClick={() => setHtmlSubTab('preview')}
                    >
                      Preview
                    </button>
                    <button
                      className={`${styles.subTab} ${htmlSubTab === 'source' ? styles.subTabActive : ''}`}
                      onClick={() => setHtmlSubTab('source')}
                    >
                      Source
                    </button>
                  </div>
                  {htmlSubTab === 'preview' ? (
                    <iframe
                      className={styles.htmlPreview}
                      title="Rendered HTML preview"
                      sandbox="allow-popups allow-popups-to-escape-sandbox"
                      srcDoc={previewSrcDoc}
                    />
                  ) : (
                    <pre className={styles.codeOutput}>{result.html}</pre>
                  )}
                </>
              )}

              {!result.error && format === 'doctree' && (
                <pre className={styles.codeOutput}>
                  {JSON.stringify(result.docTree, null, 2)}
                </pre>
              )}

              {!result.error && format === 'ansi' && (
                <>
                  <div className={styles.ansiNote}>
                    ANSI escape codes are shown as <code>␛</code> for readability. Use{' '}
                    <strong>Copy raw</strong> to get the real escape sequences.
                  </div>
                  <div className={styles.ansiToolbar}>
                    <span className={styles.ansiToolbarLabel}>ANSI output (80 columns)</span>
                    <button className={styles.copyBtn} onClick={handleCopyAnsi}>
                      {copied ? 'Copied!' : 'Copy raw'}
                    </button>
                  </div>
                  <pre className={styles.codeOutput}>{makeAnsiReadable(result.ansi)}</pre>
                </>
              )}
            </div>
          </div>
        </div>

        <section className={styles.about}>
          <h2>What the playground shows</h2>
          <p>
            The playground runs the published <code>md-to-rich</code> package in your browser.
            Everything you type is converted by the same three functions you would call in
            Node.js:
          </p>
          <ul>
            <li>
              <strong>HTML</strong> uses <Link to="/docs/api/to-html">toHtml()</Link>, with
              heading IDs, GFM tables and task lists, and URL sanitisation always on.
            </li>
            <li>
              <strong>Doc Tree</strong> uses <Link to="/docs/api/to-doc-tree">toDocTree()</Link>,
              a typed JSON tree you can map into{' '}
              <Link to="/docs/guides/markdown-to-prosemirror">ProseMirror</Link>,{' '}
              <Link to="/docs/guides/markdown-to-slate">Slate</Link>, or{' '}
              <Link to="/docs/guides/markdown-to-quill">Quill</Link>.
            </li>
            <li>
              <strong>ANSI</strong> uses <Link to="/docs/api/to-ansi">toAnsi()</Link> at 80
              columns. Use <em>Copy raw</em> to paste the real escape codes into a terminal.
            </li>
          </ul>
          <p>
            Nothing you type leaves your browser. To use the library in a project, start with{' '}
            <Link to="/docs/getting-started">Getting Started</Link>.
          </p>
        </section>
      </div>
    </>
  )
}

export default function Playground(): React.JSX.Element {
  return (
    <Layout
      title="Markdown Converter Playground"
      description="Try md-to-rich in your browser: type Markdown and see it converted to HTML, a rich-text JSON Doc Tree, and ANSI terminal output as you type."
    >
      <Head>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': 'https://md-to-rich.jithins.dev/playground#webpage',
            url: 'https://md-to-rich.jithins.dev/playground',
            name: 'Markdown Converter Playground',
            isPartOf: { '@id': 'https://md-to-rich.jithins.dev/#website' },
            about: { '@id': 'https://md-to-rich.jithins.dev/#software' },
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://md-to-rich.jithins.dev/' },
                { '@type': 'ListItem', position: 2, name: 'Playground', item: 'https://md-to-rich.jithins.dev/playground' },
              ],
            },
          })}
        </script>
      </Head>
      <PlaygroundApp />
    </Layout>
  )
}
