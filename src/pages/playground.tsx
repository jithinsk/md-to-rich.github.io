import React, { useState, useEffect, useCallback } from 'react'
import Layout from '@theme/Layout'
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

function makeAnsiReadable(raw: string): string {
  return raw.replace(/\x1b/g, '␛')
}

export default function Playground(): React.JSX.Element {
  const [markdown, setMarkdown] = useState(EXAMPLE_MARKDOWN)
  const [result, setResult] = useState<ConversionResult>(() => runConversion(EXAMPLE_MARKDOWN))
  const [format, setFormat] = useState<Format>('html')
  const [htmlSubTab, setHtmlSubTab] = useState<HtmlSubTab>('preview')
  const [liveMode, setLiveMode] = useState(false)
  const [copied, setCopied] = useState(false)

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
    <Layout title="Playground" description="Interactive md-to-rich playground — type Markdown and see live HTML, Doc Tree, and ANSI output">
      <div className={styles.pageWrapper}>
        <div className={styles.pageHeader}>
          <h1>Playground</h1>
          <p>Type Markdown on the left and see live conversion output on the right.</p>
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
                    <div
                      className={styles.htmlPreview}
                      dangerouslySetInnerHTML={{ __html: result.html }}
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
      </div>
    </Layout>
  )
}
