---
id: to-html
title: toHtml()
sidebar_label: toHtml()
description: toHtml() API reference — convert Markdown to HTML with heading IDs, custom CSS class names, GFM tables, task lists, and built-in URL sanitisation.
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

## URL Sanitisation

URL sanitisation is **always on** regardless of options. Any `href` or `src` attribute containing a dangerous protocol is replaced with `#`.

See the [Security page](/docs/security) for the full list of blocked and allowed protocols.

:::danger allowRawHtml

Setting `allowRawHtml: true` passes raw HTML nodes from the Markdown source through to the output unchanged. **This opens an XSS risk** if the output is injected into a browser DOM.

Only enable this option when the Markdown source is fully trusted (e.g., stored in your own database, never user-supplied).

:::
