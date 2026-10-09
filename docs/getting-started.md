---
id: getting-started
title: "Getting Started: Install and Convert Markdown"
sidebar_label: Getting Started
slug: /getting-started
description: Install md-to-rich and convert Markdown to HTML, ANSI terminal output, or a Doc Tree in a few lines. Quick-start examples for all three serializers.
---

# Getting Started

md-to-rich is a TypeScript library that converts Markdown into three formats: an HTML string, ANSI-styled terminal output, and a typed JSON Doc Tree for rich-text editors such as ProseMirror, Slate, and Quill. It runs on Node.js 20+ and ships ESM and CommonJS builds.

## Install

```bash
npm install md-to-rich
```

Requires Node.js ≥ 20.

---

## Quick Start

```typescript
import { toHtml, toAnsi, toDocTree } from 'md-to-rich'

// Markdown → HTML string
toHtml('# Hello\n\n**bold**')
// → '<h1 id="hello">Hello</h1><p><strong>bold</strong></p>'

// Markdown → ANSI terminal string
toAnsi('# Hello\n\n**bold**', { columns: 80 })
// → ANSI-escaped terminal output

// Markdown → structured JSON tree
toDocTree('# Hello')
// → { type: 'document', children: [{ type: 'heading', depth: 1, ... }] }
```

---

## Sub-path Imports

Import only the serializer you need to keep your bundle lean:

```typescript
// HTML only
import { toHtml } from 'md-to-rich/html'

// ANSI only
import { toAnsi } from 'md-to-rich/ansi'

// Doc Tree only
import { toDocTree } from 'md-to-rich/doc-tree'
```

All three sub-paths are also available from the main entry:

```typescript
import { toHtml, toAnsi, toDocTree, serialize } from 'md-to-rich'
```

---

## ESM and CJS

`md-to-rich` ships dual ESM and CJS output with full TypeScript declarations per entry point.

| Environment | Import |
|---|---|
| ESM (Node, bundlers, Deno) | `import { toHtml } from 'md-to-rich'` |
| CJS (CommonJS) | `const { toHtml } = require('md-to-rich')` |

---

## Next Steps

- **[toHtml() API →](/docs/api/to-html)** — options, class names, GFM features, security
- **[toAnsi() API →](/docs/api/to-ansi)** — columns, themes, OSC 8 hyperlinks
- **[toDocTree() API →](/docs/api/to-doc-tree)** — JSON output shape, use cases
- **[serialize() API →](/docs/api/serialize)** — generic dispatch, custom serializers
- **[Custom Serializer guide →](/docs/guides/custom-serializer)** — implement `Serializer<T>`

---

## FAQ

### Does md-to-rich work in the browser?

Yes. md-to-rich and its unified and remark dependencies support browsers, and the [Playground](/playground) runs the published package client-side. `toHtml()` and `toDocTree()` work as-is. `toAnsi()` falls back to `process.stdout.columns` when `columns` is omitted, so pass `columns` explicitly in the browser.

### Which Node.js versions does md-to-rich support?

The package's `engines` field is `"node": ">=20.0.0"`, and CI tests every change on Node.js 20, 22 and 24.

### Are toHtml(), toAnsi() and toDocTree() synchronous?

Yes. All three, and `serialize()`, return their result directly rather than a Promise. Because parsing runs synchronously, remark plugins with async transformers aren't supported; see [remark Plugins](/docs/guides/remark-plugins#faq).
