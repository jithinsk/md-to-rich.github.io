---
id: markdown-to-quill
title: Convert Markdown to Quill Delta in TypeScript
sidebar_label: Quill
description: "Convert Markdown to a Quill Delta with a complete TypeScript converter: headings, nested lists, task items, code blocks, images, dividers and Quill 2 tables."
---

# Convert Markdown to Quill Delta

To convert Markdown to a Quill Delta, parse it with `toDocTree()` from md-to-rich and walk the typed Doc Tree into `quill-delta` insert operations with the converter below. It covers every node type, puts block formats on the trailing `\n` as Quill expects, and loads into Quill 2 with `setContents()` unchanged.

## Install

```bash
npm install md-to-rich quill quill-delta
```

`quill-delta` is the Delta class Quill itself uses, so the converter has no dependency on the editor and runs in Node as well as the browser.

## How Quill models a document

A Delta is a flat list of `insert` operations. Inline formats (`bold`, `italic`, `strike`, `code`, `link`) sit on the text they style. Block formats (`header`, `blockquote`, `code-block`, `list`, `indent`, `table`) sit **only on the `\n` that ends the line**:

```typescript
// "## Hello **world**"
const ops = [
  { insert: 'Hello ' },
  { insert: 'world', attributes: { bold: true } },
  { insert: '\n', attributes: { header: 2 } },
]
```

The Doc Tree is nested (lists inside list items, paragraphs inside blockquotes), so the converter flattens it into lines and works out each line's format from where it sits.

## 1. The converter

```typescript title="markdown-to-quill.ts"
import Delta from 'quill-delta'
import { toDocTree } from 'md-to-rich'
import type {
  DocBlockNode,
  DocDocument,
  DocInlineNode,
  DocList,
  DocListItem,
} from 'md-to-rich'

type Attributes = Record<string, unknown>

export interface QuillDeltaOptions {
  /** Emit Quill 2 table cells (needs `modules: { table: true }`). Default: tab-separated lines. */
  tables?: boolean
}

interface Context {
  quote: boolean
  depth: number
  options: QuillDeltaOptions
  nextRowId: () => string
}

const MAX_INDENT = 8 // Quill's indent whitelist is 1–8

export function docToDelta(doc: DocDocument, options: QuillDeltaOptions = {}): Delta {
  const delta = new Delta()
  let rows = 0
  const ctx: Context = { quote: false, depth: 0, options, nextRowId: () => `row-${++rows}` }
  for (const block of doc.children) writeBlock(delta, block, ctx)
  // A Delta document must end with a newline (empty input, or a trailing divider).
  const last = delta.ops[delta.ops.length - 1]
  if (typeof last?.insert !== 'string' || !last.insert.endsWith('\n')) delta.insert('\n')
  return delta
}

export function markdownToDelta(md: string, options: QuillDeltaOptions = {}): Delta {
  return docToDelta(toDocTree(md), options)
}

function writeBlock(delta: Delta, node: DocBlockNode, ctx: Context): void {
  switch (node.type) {
    case 'heading':
      writeLine(delta, node.children, { header: node.depth })
      break
    case 'paragraph':
      writeLine(delta, node.children, ctx.quote ? { blockquote: true } : {})
      break
    case 'blockquote':
      for (const child of node.children) writeBlock(delta, child, { ...ctx, quote: true })
      break
    case 'code': {
      const format = { 'code-block': node.lang ?? 'plain' }
      for (const line of node.value.split('\n')) {
        if (line) delta.insert(line)
        delta.insert('\n', format)
      }
      break
    }
    case 'list':
      writeList(delta, node, ctx)
      break
    case 'table':
      for (const row of node.children) {
        if (ctx.options.tables) {
          // Quill 2 table module: one line per cell, all cells of a row share a row id.
          const table = ctx.nextRowId()
          for (const cell of row.children) {
            writeInlines(delta, cell.children, null, row.isHeader ? { bold: true } : {})
            delta.insert('\n', { table })
          }
        } else {
          row.children.forEach((cell, i) => {
            if (i > 0) delta.insert('\t')
            writeInlines(delta, cell.children, null, row.isHeader ? { bold: true } : {})
          })
          delta.insert('\n')
        }
      }
      break
    case 'thematicBreak':
      // Block embed: Quill drops it unless the DividerBlot below is registered.
      delta.insert({ divider: true })
      break
  }
}

function writeList(delta: Delta, list: DocList, ctx: Context): void {
  for (const item of list.children) writeListItem(delta, item, list.ordered, ctx)
}

function writeListItem(delta: Delta, item: DocListItem, ordered: boolean, ctx: Context): void {
  const list = item.checked === null ? (ordered ? 'ordered' : 'bullet') : item.checked ? 'checked' : 'unchecked'
  const indent = Math.min(ctx.depth, MAX_INDENT)
  const bullet: Attributes = indent > 0 ? { list, indent } : { list }
  const continuation: Attributes = { indent: Math.min(ctx.depth + 1, MAX_INDENT) }
  let first = true
  let inline: DocInlineNode[] = []

  const flush = () => {
    if (inline.length === 0) return
    writeLine(delta, inline, first ? bullet : continuation, continuation)
    first = false
    inline = []
  }

  for (const child of item.children) {
    if (child.type === 'paragraph') {
      flush()
      writeLine(delta, child.children, first ? bullet : continuation, continuation)
      first = false
    } else if (child.type === 'list') {
      flush()
      if (first) writeLine(delta, [], bullet) // empty item that only holds a sub-list
      first = false
      writeList(delta, child, { ...ctx, depth: ctx.depth + 1 })
    } else if (isInline(child)) {
      inline.push(child)
    } else {
      flush()
      writeBlock(delta, child, ctx)
      first = false
    }
  }
  flush()
  if (first) writeLine(delta, [], bullet)
}

function isInline(node: DocBlockNode | DocInlineNode): node is DocInlineNode {
  return ['text', 'inlineCode', 'link', 'image', 'break'].includes(node.type)
}

/** Format for the current line, and for lines started by a hard break. */
interface Line {
  format: Attributes
  next: Attributes
}

/** Inline content followed by the `\n` that carries the line (block) format. */
function writeLine(delta: Delta, inlines: DocInlineNode[], format: Attributes, next = format): void {
  const line: Line = { format, next }
  writeInlines(delta, inlines, line, {})
  delta.insert('\n', line.format)
}

/** `line: null` means the content cannot be split into lines (table cells). */
function writeInlines(delta: Delta, inlines: DocInlineNode[], line: Line | null, marks: Attributes): void {
  for (const node of inlines) {
    switch (node.type) {
      case 'text':
        insertText(delta, node.value, {
          ...marks,
          ...(node.bold ? { bold: true } : {}),
          ...(node.italic ? { italic: true } : {}),
          ...(node.strikethrough ? { strike: true } : {}),
        })
        break
      case 'inlineCode':
        insertText(delta, node.value, { ...marks, code: true })
        break
      case 'link':
        writeInlines(delta, node.children, line, { ...marks, link: safeUrl(node.url) })
        break
      case 'image':
        delta.insert(
          { image: safeUrl(node.url) },
          { ...(node.alt ? { alt: node.alt } : {}), ...(marks.link ? { link: marks.link } : {}) },
        )
        break
      case 'break':
        // Quill has no soft break inside a line: end this line and start the next one.
        if (line) {
          delta.insert('\n', line.format)
          line.format = line.next
        } else {
          delta.insert(' ', marks)
        }
        break
    }
  }
}

// Allow-list link and image URLs before they reach the editor.
function safeUrl(url: string): string {
  const compact = url.replace(/[\u0000- \u007f]/g, '')
  if (!/^[a-z][a-z0-9+.-]*:/i.test(compact)) return url // relative URL or #fragment
  return /^(https?|mailto|tel):/i.test(compact) ? url : '#'
}

function insertText(delta: Delta, value: string, attributes: Attributes): void {
  // Soft-wrapped Markdown keeps raw `\n`s; in a Delta they would end the line unformatted.
  // Empty text nodes are skipped.
  const text = value.replace(/\n/g, ' ')
  if (text) delta.insert(text, attributes)
}
```

### What each node becomes

| Doc Tree node | Quill Delta |
|---|---|
| `heading` | text, then `\n` with `{ header: 1–6 }` |
| `paragraph` | text, then `\n` (with `{ blockquote: true }` inside a quote) |
| `blockquote` | its children, with paragraphs marked `blockquote` |
| `code` | one `\n` per source line, each with `{ 'code-block': lang ?? 'plain' }` |
| `list` / `listItem` | `\n` with `{ list: 'bullet' \| 'ordered' \| 'checked' \| 'unchecked' }` |
| nested `list` | the same, plus `{ indent: n }` (capped at 8) |
| extra paragraph in an item | `\n` with `{ indent: depth + 1 }` |
| `table` | Quill 2 cells (`{ table: rowId }`) or tab-separated lines |
| `thematicBreak` | `{ insert: { divider: true } }` block embed |
| `text` | insert with `bold`, `italic`, `strike` |
| `inlineCode` | insert with `{ code: true }` |
| `link` | its children, each with `{ link: safeUrl(url) }` |
| `image` | `{ insert: { image: safeUrl(url) } }`, with `alt` (and `link` if wrapped) |
| `break` | `\n` carrying the current line's format |

## 2. Register a divider

Quill core has no horizontal rule. Register a small block embed once, before you create the editor, or Quill silently drops the `divider` inserts:

```typescript title="divider.ts"
import Quill from 'quill'
import { BlockEmbed } from 'quill/blots/block'

class DividerBlot extends BlockEmbed {
  static blotName = 'divider'
  static tagName = 'hr'
}

Quill.register(DividerBlot)
```

## 3. Load it with `setContents()`

```typescript title="editor.ts"
import Quill from 'quill'
import './divider'
import { markdownToDelta } from './markdown-to-quill'

const markdown = `# Release notes

- [x] Tables
- [ ] Footnotes

| Package | Version |
| ------- | ------- |
| quill   | 2.0.3   |`

const quill = new Quill('#editor', {
  theme: 'snow',
  modules: { table: true },
})

quill.setContents(markdownToDelta(markdown, { tables: true }))
```

Remember to load a theme stylesheet such as `quill/dist/quill.snow.css`. `setContents()` replaces the whole document. To add Markdown at the cursor instead, pass the Delta to `quill.updateContents()` after a `retain` to the insertion point.

## Tables

Quill 1 has no table format. Quill 2 ships a basic table module, enabled with `modules: { table: true }`. It models every cell as a line whose `\n` carries `{ table: rowId }`, and cells that share a row id form one row. There are no header cells, alignment, column widths or merged cells.

The converter therefore has two modes:

- **`{ tables: true }`**: emits Quill 2 cells. The header row is bolded, because the module has no `<th>`. Row ids are `row-1`, `row-2` and so on, numbered per call.
- **Default**: each row becomes one plain line with cells separated by `\t`, header cells in bold. This works in any Quill version and with no table module, and the data stays readable and copyable.

If you need header cells, column resizing or merged cells, a third-party module such as quill-table-better adds them, but it uses its own Delta format. Map `DocTable` to that module's documented format rather than to `{ table: rowId }`.

## Design notes

### Each line gets exactly one block format

A Quill line is a single block, so it cannot be a heading *and* a quote, or a list item *and* a code line. When Markdown nests blocks this way, the inner format wins: a heading, list or code block inside a blockquote keeps its own format, and only plain paragraphs are marked `blockquote`.

### Soft wraps become spaces

`toDocTree()` keeps the newline from a soft-wrapped Markdown line inside `DocText.value` (for example `"a soft\nwrap"`). In a Delta, a bare `\n` ends the line without a format, so the converter replaces it with a space, which is how Markdown renders it. A hard break (`DocBreak`) does start a new line.

### Code languages

Code lines carry the fence's info string, or `'plain'` when there is none, because that is what the full `quill` build reports back from `getContents()`. With the syntax module enabled, a language missing from its `languages` list is shown unhighlighted, so map short names such as `ts` to `typescript` first if you use it.

### Unsafe URLs are replaced

`toDocTree()` already replaces unsafe link and image URLs with `#` (since md-to-rich 2.0.1). `safeUrl()` checks them again as a second layer: it allow-lists `http`, `https`, `mailto`, `tel` and relative URLs and turns anything else, such as `javascript:` or `data:`, into `#`.

## FAQ

### Does the Delta round-trip through Quill unchanged?

Yes. Tested with Quill 2.0.3: after `quill.setContents(delta)`, `quill.getContents()` returns the same operations for every node type, in both table modes. Adjacent lists or code blocks share one container in the DOM, but each line keeps its own format.

### Why is my horizontal rule missing?

Quill drops embeds it doesn't recognise. Register the `DividerBlot` from step 2 before creating the editor, or remove the `thematicBreak` case if you don't want rules.

### Can I convert a Quill Delta back to Markdown?

Not with md-to-rich. It converts Markdown into other formats and has no reverse path from a Delta.

### Does it work with Quill 1?

Mostly. Quill 1 has no `checked`/`unchecked` list values (it uses `list: 'checked'` with a different checklist UI) and no table module, so use the default tab-separated tables and check the task-list output in your version.

## Related

- [toDocTree() API](/docs/api/to-doc-tree): options and output shape of the Doc Tree
- [Doc Tree Node Types](/docs/reference/doc-tree-nodes): every node and flag the converter handles
- [Convert Markdown to ProseMirror](/docs/guides/markdown-to-prosemirror): the same tree mapped to a ProseMirror document
- [Convert Markdown to Slate](/docs/guides/markdown-to-slate): the same tree mapped to Slate elements
- [Playground](/playground): see the Doc Tree for your own Markdown
