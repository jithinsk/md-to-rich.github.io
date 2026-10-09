---
id: markdown-to-slate
title: Convert Markdown to Slate in TypeScript
sidebar_label: Slate
description: "Convert Markdown to Slate editor JSON with a complete TypeScript converter: headings, lists, tasks, tables, links and images that pass Slate normalisation."
---

# Convert Markdown to Slate

To convert Markdown to Slate, parse it with `toDocTree()` from md-to-rich and map the typed Doc Tree to Slate `Descendant[]` with the converter below. It handles every node type, and its output is already normalised, so Slate leaves it unchanged when it loads.

## Install

```bash
npm install md-to-rich slate slate-react slate-history
```

`md-to-rich` has no dependency on Slate; the converter is the only place the two meet.

## 1. Declare the Slate types

Slate is typed through declaration merging on `CustomTypes`. Every element below maps to one Doc Tree node; the [Doc Tree Node Types](/docs/reference/doc-tree-nodes) reference lists the source shapes.

```typescript title="slate-types.ts"
import type { BaseEditor } from 'slate'
import type { ReactEditor } from 'slate-react'
import type { HistoryEditor } from 'slate-history'

export type CustomText = {
  text: string
  bold?: true
  italic?: true
  strikethrough?: true
  code?: true
}

export type LinkElement = { type: 'link'; url: string; title: string | null; children: InlineChild[] }
export type ImageElement = {
  type: 'image'
  url: string
  alt: string | null
  title: string | null
  children: [{ text: '' }]
}
export type InlineElement = LinkElement | ImageElement
export type InlineChild = CustomText | InlineElement

export type ParagraphElement = { type: 'paragraph'; children: InlineChild[] }
export type HeadingElement = {
  type: 'heading'
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: InlineChild[]
}
export type BlockQuoteElement = { type: 'block-quote'; children: BlockElement[] }
export type CodeBlockElement = { type: 'code-block'; lang: string | null; children: CustomText[] }
export type ListItemElement = { type: 'list-item'; checked?: boolean; children: BlockElement[] }
export type BulletedListElement = { type: 'bulleted-list'; children: ListItemElement[] }
export type NumberedListElement = { type: 'numbered-list'; children: ListItemElement[] }
export type TableCellElement = {
  type: 'table-cell'
  header: boolean
  align: 'left' | 'right' | 'center' | null
  children: InlineChild[]
}
export type TableRowElement = { type: 'table-row'; children: TableCellElement[] }
export type TableElement = { type: 'table'; children: TableRowElement[] }
export type ThematicBreakElement = { type: 'thematic-break'; children: [{ text: '' }] }

export type BlockElement =
  | ParagraphElement
  | HeadingElement
  | BlockQuoteElement
  | CodeBlockElement
  | BulletedListElement
  | NumberedListElement
  | ListItemElement
  | TableElement
  | TableRowElement
  | TableCellElement
  | ThematicBreakElement

export type CustomElement = BlockElement | InlineElement

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor
    Element: CustomElement
    Text: CustomText
  }
}
```

Two Slate rules shape these types:

- **Void elements still have children.** `image` and `thematic-break` carry `children: [{ text: '' }]`; Slate requires one empty text leaf even though it never renders it.
- **Leaves carry marks as optional `true` flags.** A mark that is off is omitted rather than set to `false`, because Slate compares leaves by their keys when merging them.

## 2. The converter

```typescript title="markdown-to-slate.ts"
import { toDocTree } from 'md-to-rich'
import type { DocBlockNode, DocDocument, DocInlineNode, DocListItem } from 'md-to-rich'
import { Text } from 'slate'
import type { Descendant, Editor } from 'slate'
import type { BlockElement, CustomText, InlineChild, ListItemElement } from './slate-types'

export function markdownToSlate(md: string): Descendant[] {
  return docToSlate(toDocTree(md))
}

export function docToSlate(doc: DocDocument): Descendant[] {
  return toBlocks(doc.children)
}

// Register the inline and void element types with the editor.
export function withMarkdownElements<T extends Editor>(editor: T): T {
  const { isInline, isVoid } = editor
  editor.isInline = (element) =>
    element.type === 'link' || element.type === 'image' || isInline(element)
  editor.isVoid = (element) =>
    element.type === 'image' || element.type === 'thematic-break' || isVoid(element)
  return editor
}

// ---------------------------------------------------------------------------
// Blocks
// ---------------------------------------------------------------------------

function blockToSlate(node: DocBlockNode): BlockElement {
  switch (node.type) {
    case 'heading':
      return { type: 'heading', level: node.depth, children: toInlines(node.children) }
    case 'paragraph':
      return { type: 'paragraph', children: toInlines(node.children) }
    case 'blockquote':
      return { type: 'block-quote', children: toBlocks(node.children) }
    case 'code':
      return { type: 'code-block', lang: node.lang, children: [{ text: node.value }] }
    case 'list':
      return {
        type: node.ordered ? 'numbered-list' : 'bulleted-list',
        children: node.children.map(listItemToSlate),
      }
    case 'table':
      return {
        type: 'table',
        children: node.children.map((row) => ({
          type: 'table-row',
          children: row.children.map((cell, i) => ({
            type: 'table-cell',
            header: row.isHeader,
            align: node.align[i] ?? null,
            children: toInlines(cell.children),
          })),
        })),
      }
    case 'thematicBreak':
      return { type: 'thematic-break', children: [{ text: '' }] }
  }
}

function listItemToSlate(item: DocListItem): ListItemElement {
  const element: ListItemElement = { type: 'list-item', children: toBlocks(item.children) }
  if (item.checked !== null) element.checked = item.checked
  return element
}

// Block containers must hold only blocks: wrap any run of loose inline
// nodes in a paragraph, and never return an empty array.
function toBlocks(nodes: (DocBlockNode | DocInlineNode)[]): BlockElement[] {
  const blocks: BlockElement[] = []
  let run: DocInlineNode[] = []
  const flush = () => {
    if (run.length > 0) blocks.push({ type: 'paragraph', children: toInlines(run) })
    run = []
  }
  for (const node of nodes) {
    if (isInlineNode(node)) {
      run.push(node)
    } else {
      flush()
      blocks.push(blockToSlate(node))
    }
  }
  flush()
  return blocks.length > 0 ? blocks : [{ type: 'paragraph', children: [{ text: '' }] }]
}

function isInlineNode(node: DocBlockNode | DocInlineNode): node is DocInlineNode {
  return (
    node.type === 'text' ||
    node.type === 'inlineCode' ||
    node.type === 'link' ||
    node.type === 'image' ||
    node.type === 'break'
  )
}

// ---------------------------------------------------------------------------
// Inlines
// ---------------------------------------------------------------------------

function inlineToSlate(node: DocInlineNode): InlineChild {
  switch (node.type) {
    case 'text': {
      const leaf: CustomText = { text: node.value }
      if (node.bold) leaf.bold = true
      if (node.italic) leaf.italic = true
      if (node.strikethrough) leaf.strikethrough = true
      return leaf
    }
    case 'inlineCode':
      return { text: node.value, code: true }
    case 'break':
      return { text: '\n' }
    case 'link':
      return {
        type: 'link',
        url: safeUrl(node.url),
        title: node.title,
        children: toInlines(node.children),
      }
    case 'image':
      return {
        type: 'image',
        url: safeUrl(node.url),
        alt: node.alt,
        title: node.title,
        children: [{ text: '' }],
      }
  }
}

// Allow-list link and image URLs before they reach the editor.
function safeUrl(url: string): string {
  const compact = url.replace(/[\u0000- \u007f]/g, '')
  if (!/^[a-z][a-z0-9+.-]*:/i.test(compact)) return url // relative URL or #fragment
  return /^(https?|mailto|tel):/i.test(compact) ? url : '#'
}

// Apply Slate's inline normalisation rules up front, so the value is
// already canonical: merge adjacent leaves with identical marks, drop
// redundant empty leaves, and make sure every inline element sits
// between two text leaves.
function toInlines(nodes: DocInlineNode[]): InlineChild[] {
  const out: InlineChild[] = []
  for (const node of nodes) {
    const child = inlineToSlate(node)
    const prev = out[out.length - 1]
    if (Text.isText(child)) {
      if (prev && Text.isText(prev)) {
        if (Text.equals(prev, child, { loose: true })) {
          prev.text += child.text
          continue
        }
        if (prev.text === '') {
          out[out.length - 1] = child
          continue
        }
        if (child.text === '') continue
      }
    } else if (!prev || !Text.isText(prev)) {
      out.push({ text: '' })
    }
    out.push(child)
  }
  const last = out[out.length - 1]
  if (!last || !Text.isText(last)) out.push({ text: '' })
  return out
}
```

### What each node becomes

| Doc Tree node | Slate node |
| --- | --- |
| `heading` | `{ type: 'heading', level: 1–6 }` |
| `paragraph` | `{ type: 'paragraph' }` |
| `blockquote` | `{ type: 'block-quote' }` with block children |
| `code` | `{ type: 'code-block', lang }` with one text leaf holding the source |
| `list` | `bulleted-list` or `numbered-list` |
| `listItem` | `{ type: 'list-item' }`, plus `checked` for task items |
| `table` / `tableRow` / `tableCell` | `table` / `table-row` / `table-cell` with `header` and `align` |
| `thematicBreak` | `{ type: 'thematic-break' }` (void block) |
| `text` | leaf with `bold`, `italic`, `strikethrough` |
| `inlineCode` | leaf with `code: true` |
| `link` | `{ type: 'link', url, title }` (inline, URL checked by `safeUrl()`) |
| `image` | `{ type: 'image', url, alt, title }` (inline void, URL checked by `safeUrl()`) |
| `break` | `'\n'` inside the surrounding text leaf |

## 3. Use it in an editor

Wrap the editor with `withMarkdownElements` so Slate knows which elements are inline and void, then pass the converted value as `initialValue`:

```tsx title="MarkdownEditor.tsx"
import { useState } from 'react'
import { createEditor } from 'slate'
import { withHistory } from 'slate-history'
import { Editable, Slate, withReact } from 'slate-react'
import { markdownToSlate, withMarkdownElements } from './markdown-to-slate'

export function MarkdownEditor({ markdown }: { markdown: string }) {
  const [editor] = useState(() => withMarkdownElements(withHistory(withReact(createEditor()))))
  const [initialValue] = useState(() => markdownToSlate(markdown))

  return (
    <Slate editor={editor} initialValue={initialValue}>
      <Editable />
    </Slate>
  )
}
```

`initialValue` is only read on mount. To load new Markdown later, remount the component (for example with a `key`) or replace `editor.children` and call `editor.onChange()`.

`Editable` renders every element as a `div` by default; supply `renderElement` and `renderLeaf` to draw headings, lists, tables, links and images. Remember to render `children` inside void elements too, as Slate requires.

## Design Notes

### Flat marks map directly to Slate leaves

The Doc Tree flattens nested `strong`/`emphasis`/`delete` into boolean flags on each `DocText`. Slate leaves work the same way, so `***~~text~~***` becomes one leaf, `{ text: 'text', bold: true, italic: true, strikethrough: true }`, with no nesting to unwind. Inline code becomes a leaf with `code: true`.

### Output is pre-normalised

Slate repairs invalid documents when it normalises them, silently rewriting content you passed in. `toInlines()` and `toBlocks()` apply the same rules first, so the value is already canonical:

- **Adjacent leaves with identical marks are merged.** A hard break becomes `'\n'` and joins its neighbours, so `a  \nb` is a single leaf `'a\nb'`.
- **Redundant empty leaves are dropped.** The Doc Tree can contain empty `text` nodes, for example between a link and an image.
- **Inline elements sit between text leaves.** A link or image at the start or end of a block, or next to another inline, gets an empty `{ text: '' }` on each side. This applies inside links too, such as an image wrapped in a link.
- **No element is empty.** An empty heading gets `[{ text: '' }]`; an empty blockquote or list item gets an empty paragraph.
- **Containers never mix blocks and inlines.** `DocListItem.children` may hold both, so runs of inline nodes are wrapped in a `paragraph`. md-to-rich wraps list item text in paragraphs already, so `list-item` children are always blocks.

These rules were checked by loading the output for a sample covering every node type into `createEditor()`, running `Editor.normalize(editor, { force: true })`, and confirming the value did not change.

### Check link and image URLs

Since md-to-rich 2.0.1, `toDocTree()` replaces dangerous link and image URLs with `#`. The converter checks them again as a second layer, which also protects you on older versions, where `[a](javascript:alert(1))` arrived as `url: 'javascript:alert(1)'`. `safeUrl()` allow-lists `http`, `https`, `mailto` and `tel`, keeps relative URLs and `#fragment` links, and replaces any other scheme (`javascript:`, `data:`, `vbscript:` and so on) with `#`. It strips spaces and control characters before checking, so `java script:` is caught too. Extend the allow-list if your editor needs other schemes. `toDocTree()` itself only allows `http`, `https` and `mailto`, so `tel:` links already arrive as `#`; widen both if you need them.

## FAQ

### How is this different from remark-slate or remark-slate-transformer?

Those packages are remark plugins: you assemble a unified pipeline and work with mdast-shaped output. Here the converter is about 170 lines of your own TypeScript over a small, fully typed tree, so you choose the element names and fields to match your editor schema and change them without forking a dependency.

### Can I rename the element types?

Yes. The `type` strings and fields are defined only in `slate-types.ts` and the converter. Rename them to match your existing `renderElement`; keep `withMarkdownElements` in sync so Slate still treats links and images as inline and void.

### Why is an image an inline element and not a block?

Markdown images are inline: they can sit mid-sentence or inside a link. Treating them as inline voids keeps them in their paragraph. If your editor only supports block images, add a pass that lifts paragraphs whose only content is an image into a block `image` element, and remove `'image'` from `isInline`.

### Does it work with Plate?

Plate is built on Slate, so the value is valid Slate JSON. Plate plugins expect their own element type names, so map the `type` strings in the converter to the keys your Plate plugins use.

## Related

- [toDocTree() API](/docs/api/to-doc-tree): options and the output shape this converter consumes
- [Doc Tree Node Types](/docs/reference/doc-tree-nodes): every node the converter maps
- [Convert Markdown to ProseMirror](/docs/guides/markdown-to-prosemirror): the same tree mapped to ProseMirror nodes
- [Convert Markdown to Quill](/docs/guides/markdown-to-quill): the same tree mapped to Quill Delta operations
- [Playground](/playground): see the Doc Tree for your own Markdown
