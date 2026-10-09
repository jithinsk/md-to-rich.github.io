---
id: custom-serializer
title: Build a Custom Markdown Serializer in TypeScript
sidebar_label: Custom Serializer
description: Build your own Serializer<T> for md-to-rich in four steps, with full examples for a plain-text extractor and a word-count serializer with typed options.
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

`unist-util-visit` is a dependency of `md-to-rich`, so it is installed with it. Add it to your own `package.json` if you import it directly.

## FAQ

### Should I write a custom serializer or a remark plugin?

Use a [remark plugin](/docs/guides/remark-plugins) when you want to change the content but keep one of the built-in outputs (HTML, ANSI or Doc Tree). Write a `Serializer<T>` when you need a new output format, such as plain text, a word count or another editor's JSON.

### Where does the Root type for a custom serializer come from?

`Root` and the other MDAST node types come from the `@types/mdast` package. md-to-rich's remark dependencies already install it, but add it to your own `devDependencies` (`npm install -D @types/mdast`) so `import type { Root } from 'mdast'` doesn't rely on a transitive install.

### What should my serializer do with node types it doesn't recognise?

Skip them, as the built-in serializers do: `toHtml()` renders unknown nodes as an empty string and `toDocTree()` leaves them out. Ending your `switch (node.type)` with a `default` branch that returns an empty result keeps your serializer working when a remark plugin or a new Markdown feature adds node types.

## Related

- [serialize() API](/docs/api/serialize): the dispatch function that runs your serializer
- [remark Plugins](/docs/guides/remark-plugins): transform the AST before your serializer sees it
- [Doc Tree Node Types](/docs/reference/doc-tree-nodes): a ready-made JSON output to compare against
