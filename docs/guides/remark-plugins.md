---
id: remark-plugins
title: remark Plugins
sidebar_label: remark Plugins
---

# remark Plugins

All serializers accept a `remarkPlugins` option that injects additional remark transform plugins into the pipeline.

## How Plugins Work

Plugins run **after** `remark-parse` (and `remark-gfm` if `gfm: true`) but **before** serialization. This means you can transform the MDAST tree before it reaches any serializer.

```
Markdown string
  → remark-parse
  → remark-gfm  (if gfm: true)
  → [...remarkPlugins]
  → Serializer.serialize(ast)
```

## `uppercaseHeadings` Example

A hand-rolled no-dependency plugin that transforms all heading text to uppercase:

```typescript
import type { Plugin } from 'unified'
import type { Root, Text } from 'mdast'
import { visit } from 'unist-util-visit'
import { toHtml, toDocTree } from 'md-to-rich'

const uppercaseHeadings: Plugin<[], Root> = () => (tree: Root) => {
  visit(tree, 'heading', (heading) => {
    visit(heading, 'text', (textNode: Text) => {
      textNode.value = textNode.value.toUpperCase()
    })
  })
}

const md = `
# hello world

A normal paragraph.

## section two
`

toHtml(md, { remarkPlugins: [uppercaseHeadings] })
// → '<h1 id="hello-world">HELLO WORLD</h1>...<h2 id="section-two">SECTION TWO</h2>'
```

Plugins also work with every other serializer:

```typescript
const doc = toDocTree(md, { remarkPlugins: [uppercaseHeadings] })
// doc.children[0].children[0].value === 'HELLO WORLD'
```

## Third-party Plugin Pattern

Any remark ecosystem plugin can be passed in:

```typescript
import { toHtml } from 'md-to-rich'
// Install separately: npm install remark-frontmatter
import remarkFrontmatter from 'remark-frontmatter'

const html = toHtml(markdownWithFrontmatter, {
  remarkPlugins: [remarkFrontmatter],
})
// YAML front matter is stripped from the HTML output
```

## Common Use Cases

| Plugin | Purpose |
|---|---|
| `remark-frontmatter` | Strip YAML/TOML front matter before rendering |
| `remark-math` | Parse `$...$` and `$$...$$` math expressions |
| `remark-directive` | Parse `:::{type}` directives |
| `remark-emoji` | Convert `:smile:` to emoji |
| Custom | Transform any MDAST node before serialization |

## Notes

- Plugins receive the full MDAST `Root` and can mutate it freely.
- Plugin execution order matches the array order.
- The `gfm` option controls `remark-gfm` separately from `remarkPlugins` — you can disable GFM and still add custom plugins.
