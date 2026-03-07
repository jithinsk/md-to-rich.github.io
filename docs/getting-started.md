---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
slug: /getting-started
description: Install md-to-rich and convert Markdown to HTML, ANSI terminal output, or a Doc Tree in seconds. Quick start guide with examples for all three built-in serializers.
---

# Getting Started

## Install

```bash
npm install md-to-rich
```

Requires Node.js ≥ 18.

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

All four sub-paths are also available from the main entry:

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
