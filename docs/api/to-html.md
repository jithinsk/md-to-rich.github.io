---
id: to-html
title: "toHtml(): Convert Markdown to HTML in TypeScript"
sidebar_label: toHtml()
description: "toHtml() API reference: convert Markdown to HTML with heading IDs, per-element CSS classes, GFM tables, task lists, and built-in URL sanitisation."
---

# `toHtml(md, options?): string`

Converts a Markdown string to an HTML string.

## Import

```typescript
import { toHtml } from 'md-to-rich'
// or sub-path:
import { toHtml } from 'md-to-rich/html'
```

## Signature

```typescript
function toHtml(md: string, options?: HtmlOptions): string
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `headingIds` | `boolean` | `true` | Inject slug-based `id` attributes on headings (collision-safe) |
| `classNames` | `Partial<Record<HtmlElement, string>>` | `{}` | Map of element name → CSS class string |
| `renderImages` | `boolean` | `true` | Render `<img>` tags; set to `false` to suppress all images |
| `allowRawHtml` | `boolean` | `false` | Pass raw HTML nodes from Markdown through to output |
| `gfm` | `boolean` | `true` | Enable GitHub Flavored Markdown |
| `remarkPlugins` | `Plugin[]` | `[]` | Additional remark plugins applied before serialization |

## Examples

### Basic

```typescript
toHtml('# Hello\n\n**Bold** and *italic*.')
// → '<h1 id="hello">Hello</h1><p><strong>Bold</strong> and <em>italic</em>.</p>'
```

### Custom class names

```typescript
toHtml('# Title\n\nParagraph.', {
  classNames: {
    h1: 'heading-xl',
    p: 'prose text-base',
  },
})
// → '<h1 id="title" class="heading-xl">Title</h1>
//    <p class="prose text-base">Paragraph.</p>'
```

### Disable heading IDs

```typescript
toHtml('# Title', { headingIds: false })
// → '<h1>Title</h1>'
```

### Suppress images

```typescript
toHtml('![alt](https://example.com/img.png)', { renderImages: false })
// → '' (image element omitted)
```

## GFM Features

When `gfm: true` (the default), the following GitHub Flavored Markdown extensions are enabled:

| Feature | Markdown | Output |
|---|---|---|
| Tables | `\| a \| b \|` | `<table>` with `style="text-align:..."` per column |
| Task lists | `- [x] done` | `<input type="checkbox" disabled checked>` |
| Strikethrough | `~~text~~` | `<del>text</del>` |
| Autolinks | `https://example.com` | `<a href="...">` |
| Footnotes (2.1.0+) | `text[^1]` … `[^1]: note` | `<sup><a href="#fn-1">1</a></sup>` and a closing `<section class="footnotes">` with back-links |

Reference-style links and images (`[text][ref]` with `[ref]: url`) resolve to normal links and images. Ordered lists keep their start number (`<ol start="3">`). Both need 2.1.0 or later.

## URL Sanitisation

URL sanitisation is **always on** regardless of options. Any `href` or `src` attribute containing a dangerous protocol is replaced with `#`.

See the [Security page](/docs/security) for the full list of blocked and allowed protocols.

:::danger allowRawHtml

Setting `allowRawHtml: true` passes raw HTML nodes from the Markdown source through to the output unchanged. **This opens an XSS risk** if the output is injected into a browser DOM.

Only enable this option when the Markdown source is fully trusted (e.g., stored in your own database, never user-supplied).

:::

## FAQ

### Is toHtml() safe for user-submitted Markdown?

Yes, with the default options. `toHtml()` escapes all text, strips raw HTML such as `<script>` or `<img onerror>`, and replaces link and image URLs that use `javascript:`, `data:` or any scheme other than `http`, `https` and `mailto` with `#`. Keep `allowRawHtml` off for untrusted input; see [Security](/docs/security).

### How do I add syntax highlighting to code blocks?

md-to-rich doesn't highlight code. `toHtml()` emits fenced code as `<pre><code class="language-ts">…</code></pre>` with the code HTML-escaped, which is the class convention Prism and highlight.js look for, so run one of them over the output in the browser or at build time.

### Can I turn off GitHub Flavored Markdown in toHtml()?

Yes: pass `gfm: false` and `remark-gfm` isn't loaded. Tables then render as plain paragraphs, `- [x]` stays literal text, `~~text~~` isn't struck through, and bare URLs aren't linked.

```typescript
toHtml('~~old~~ https://example.com', { gfm: false })
// → '<p>~~old~~ https://example.com</p>'
```

### How do I get heading IDs for a table of contents?

`toHtml()` adds an `id` to every heading by default (`headingIds: true`): the heading text is lowercased, characters other than ASCII letters, digits, spaces, hyphens and underscores are removed, spaces and underscores become hyphens, and repeats get `-1`, `-2` suffixes. Read them back from the output to build a table of contents:

```typescript
const html = toHtml('# Guide\n\n## Install\n\n## Usage')
const toc = [...html.matchAll(/<h([1-6]) id="([^"]*)"[^>]*>(.*?)<\/h\1>/g)].map(
  ([, depth, id, inner]) => ({ depth: Number(depth), id, text: inner.replace(/<[^>]+>/g, '') }),
)
// → [{ depth: 1, id: 'guide', text: 'Guide' }, { depth: 2, id: 'install', ... }, ...]
```

## Related

- [HTML Class Names guide](/docs/guides/html-classnames): add Tailwind or BEM classes per element
- [Security](/docs/security): URL sanitisation and raw HTML handling
- [remark Plugins](/docs/guides/remark-plugins): transform the Markdown before it is serialised
