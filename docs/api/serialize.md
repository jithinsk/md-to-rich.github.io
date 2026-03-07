---
id: serialize
title: serialize()
sidebar_label: serialize()
---

# `serialize(md, serializer, options?): T`

Generic dispatch function — parses Markdown once and delegates serialization to any `Serializer<T>` implementation.

## Import

```typescript
import { serialize } from 'md-to-rich'
import type { Serializer } from 'md-to-rich'
```

## Signature

```typescript
function serialize<T, O extends BaseOptions = BaseOptions>(
  md: string,
  serializer: Serializer<T, O>,
  options?: O,
): T
```

## How It Works

1. Parses `md` into an MDAST `Root` node using `remark` + `remark-gfm` (when `gfm: true`)
2. Applies any extra `remarkPlugins` from options
3. Calls `serializer.serialize(ast, options ?? {})` and returns the result

The built-in `toHtml`, `toAnsi`, and `toDocTree` functions are thin wrappers around `serialize`:

```typescript
// Conceptually equivalent to:
function toHtml(md: string, options?: HtmlOptions): string {
  return serialize(md, HtmlSerializer, options)
}
```

## Built-in Serializer Example

```typescript
import { serialize } from 'md-to-rich'
import type { HtmlOptions } from 'md-to-rich'

// Using the underlying HtmlSerializer directly is rare —
// toHtml() is the intended API. But you can:
import { HtmlSerializer } from 'md-to-rich/html'

const html = serialize('# Hello', HtmlSerializer, { headingIds: false })
```

## Custom Serializer Example

```typescript
import type { Root } from 'mdast'
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

serialize('# Hello\n\nWorld', PlainText)
// → 'HelloWorld'
```

## Multi-format Parse-once Pattern

Parse the same Markdown once and produce multiple outputs efficiently:

```typescript
import { toHtml, toDocTree } from 'md-to-rich'

// Each call parses independently. For multiple formats from the same source,
// consider caching or using a single parse with a multi-output serializer.

const md = loadMarkdown()
const html = toHtml(md)
const tree = toDocTree(md)
```

For a true parse-once multi-output pattern, implement a single `Serializer<{ html: string; tree: DocDocument }>`.

See the [Custom Serializer guide](/docs/guides/custom-serializer) for full details.
