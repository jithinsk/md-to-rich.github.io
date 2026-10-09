---
id: remark-plugins
title: Use remark Plugins with md-to-rich
sidebar_label: remark Plugins
description: Add remark plugins to the md-to-rich pipeline to transform the Markdown AST before it is serialised. Examples with remark-frontmatter and a custom plugin.
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

const uppercaseHeadings: Plugin = () => (tree) => {
  visit(tree as Root, 'heading', (heading) => {
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
| `remark-emoji` | Convert `:smile:` to emoji |
| Custom | Transform any MDAST node before serialization |

Plugins that add new node types, such as `remark-math` or `remark-directive`, parse fine, but the built-in serializers don't know those nodes and drop them. Pair them with a plugin that converts the new nodes into standard ones (see the FAQ below), or write a [custom serializer](/docs/guides/custom-serializer).

## Notes

- Plugins receive the full MDAST `Root` and can mutate it freely.
- Plugin execution order matches the array order.
- The `gfm` option controls `remark-gfm` separately from `remarkPlugins` — you can disable GFM and still add custom plugins.

## FAQ

### Can I use async remark plugins with md-to-rich?

No. md-to-rich runs the remark pipeline synchronously, so a plugin whose transformer returns a Promise makes `toHtml()`, `toAnsi()`, `toDocTree()` and `serialize()` throw ``"`runSync` finished async. Use `run` instead"``. Do any async work before you call md-to-rich, then pass a synchronous plugin.

### How do I pass options to a remark plugin?

`remarkPlugins` takes plugin functions, not `[plugin, options]` tuples. Wrap the plugin in a function that calls it with your options:

```typescript
import type { Plugin } from 'unified'
import remarkGfm from 'remark-gfm'

const gfmDoubleTilde: Plugin = function () {
  return remarkGfm.call(this, { singleTilde: false })
}

toHtml('~one~ and ~~two~~', { gfm: false, remarkPlugins: [gfmDoubleTilde] })
// → '<p>~one~ and <del>two</del></p>'
```

### Why does content from remark-math or remark-directive disappear?

The built-in serializers only render standard Markdown and GFM nodes, and they silently skip node types they don't know, such as `math`, `inlineMath` or `containerDirective`. Add a second plugin that turns those nodes into ones md-to-rich renders, or write a [custom serializer](/docs/guides/custom-serializer) that handles them:

```typescript
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import remarkMath from 'remark-math'

const mathAsCode: Plugin = () => (tree) => {
  visit(tree, (node: any) => {
    if (node.type === 'inlineMath') node.type = 'inlineCode'
    if (node.type === 'math') Object.assign(node, { type: 'code', lang: 'math' })
  })
}

toHtml('Area: $\\pi r^2$', { remarkPlugins: [remarkMath, mathAsCode] })
// → '<p>Area: <code>\pi r^2</code></p>'
```

## Related

- [Custom Serializer guide](/docs/guides/custom-serializer): write your own output format
- [toHtml() API](/docs/api/to-html): the remarkPlugins option alongside the other HTML options
