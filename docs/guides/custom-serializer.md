---
id: custom-serializer
title: Custom Serializer
sidebar_label: Custom Serializer
---

# Building a Custom Serializer

`md-to-rich` is built around the `Serializer<TOutput, TOptions>` interface. Implement it to add any output format without touching this package.

## The Interface

```typescript
import type { Root } from 'mdast'

/** Core extension point — implement this to create a new output format */
export interface Serializer<TOutput, TOptions = Record<never, never>> {
  serialize(ast: Root, options: TOptions): TOutput
}
```

The `ast` argument is an MDAST [`Root`](https://github.com/syntax-tree/mdast#root) node — the full parsed Markdown tree. Walk it with any MDAST utility.

## 4-Step Guide

### Step 1 — Define your options type

```typescript
import type { BaseOptions } from 'md-to-rich'

interface MyOptions extends BaseOptions {
  uppercase?: boolean
}
```

Extending `BaseOptions` gives you `remarkPlugins` and `gfm` for free.

### Step 2 — Implement the serializer

```typescript
import type { Root } from 'mdast'
import type { Serializer } from 'md-to-rich'

const MySerializer: Serializer<string, MyOptions> = {
  serialize(ast: Root, options: MyOptions): string {
    const result = walkAst(ast)
    return options.uppercase ? result.toUpperCase() : result
  },
}
```

### Step 3 — Wrap it in a convenience function

```typescript
import { serialize } from 'md-to-rich'

export function toMy(md: string, options?: MyOptions): string {
  return serialize(md, MySerializer, options)
}
```

### Step 4 — Use it

```typescript
toMy('# Hello\n\nWorld', { uppercase: true })
// → 'HELLOWORLD'
```

---

## PlainText Serializer — Full Example

A serializer that extracts all text content from Markdown:

```typescript
import type { Root } from 'mdast'
import { serialize } from 'md-to-rich'
import type { Serializer } from 'md-to-rich'

const PlainTextSerializer: Serializer<string> = {
  serialize(ast: Root): string {
    function extract(node: { type: string; value?: string; children?: unknown[] }): string {
      if (node.value !== undefined) return node.value
      if (node.children) {
        return (node.children as typeof node[]).map(extract).join('')
      }
      return ''
    }
    return extract(ast as any)
  },
}

const plain = serialize('# Hello\n\nThis is **bold** and *italic* text.', PlainTextSerializer)
// → 'HelloThis is bold and italic text.'
```

---

## WordCount Serializer — Full Example

A serializer with typed options:

```typescript
import type { Root } from 'mdast'
import { serialize } from 'md-to-rich'
import type { BaseOptions, Serializer } from 'md-to-rich'

interface WordCountOptions extends BaseOptions {
  /** Only count words of at least this length (default: 1) */
  minLength?: number
}

const WordCountSerializer: Serializer<number, WordCountOptions> = {
  serialize(ast: Root, options: WordCountOptions): number {
    function extract(node: { type: string; value?: string; children?: unknown[] }): string {
      if (node.value !== undefined) return node.value
      if (node.children) {
        return (node.children as typeof node[]).map(extract).join(' ')
      }
      return ''
    }
    const text = extract(ast as any)
    const min = options.minLength ?? 1
    return text.split(/\s+/).filter((w) => w.length >= min).length
  },
}

const md = '# The Quick Brown Fox\n\nJumped over the **lazy** dog near the riverbank.'

const total = serialize(md, WordCountSerializer)
// → 12

const longWords = serialize(md, WordCountSerializer, { minLength: 5 })
// → 5 (words with 5+ characters)
```

---

## MDAST Traversal Tip

For complex traversals, use [`unist-util-visit`](https://github.com/syntax-tree/unist-util-visit):

```typescript
import { visit } from 'unist-util-visit'
import type { Root, Text } from 'mdast'

const MySerializer: Serializer<string[]> = {
  serialize(ast: Root): string[] {
    const links: string[] = []
    visit(ast, 'link', (node) => {
      links.push(node.url)
    })
    return links
  },
}
```

`unist-util-visit` is a peer of `remark` (transitively included when you install `md-to-rich`).
