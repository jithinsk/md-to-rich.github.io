---
id: markdown-to-prosemirror
title: Convert Markdown to ProseMirror in TypeScript
sidebar_label: ProseMirror
description: "Convert Markdown to a ProseMirror document with md-to-rich: a complete TypeScript adapter for headings, lists, task items, tables, footnotes, marks, links and images."
---

# Convert Markdown to ProseMirror

Use `toDocTree()` from md-to-rich to parse Markdown into a typed JSON tree, then map that tree onto a ProseMirror schema with the adapter below. It covers every Doc Tree node, and its output passes `doc.check()`, so you can hand it straight to an `EditorState`.

## Install

```bash
npm install md-to-rich prosemirror-model prosemirror-state prosemirror-schema-basic prosemirror-schema-list prosemirror-tables
```

`md-to-rich` has no dependency on ProseMirror; the adapter is the only place the two meet.

## 1. Extend the schema

`prosemirror-schema-basic` covers paragraphs, headings, blockquotes, code blocks, rules, images, hard breaks and the `strong`, `em`, `code` and `link` marks. Markdown needs six things it lacks:

- **Lists**: added with `addListNodes()` from `prosemirror-schema-list` (`ordered_list`, `bullet_list`, `list_item`).
- **Task items**: `list_item` gets a `checked` attribute (`null`, `true` or `false`). Keeping tasks as an attribute, rather than adding a separate task-list node, means the list commands from `prosemirror-schema-list` keep working on them.
- **Code block language**: the basic `code_block` has no attributes, so it gets a `language` attribute.
- **Strikethrough**: a new `strikethrough` mark.
- **Tables**: `tableNodes()` from `prosemirror-tables`, with an `align` cell attribute for GFM column alignment.
- **Footnotes**: a `footnote_ref` inline atom for each `[^1]` marker and a `footnote` node for each definition, holding block content. `doc` becomes `block+ footnote*`, so footnotes always sit at the end of the document, where the Doc Tree puts them.

:::note
Footnotes and ordered list start numbers need md-to-rich 2.1.0 or later. On older versions the Doc Tree has no footnote nodes and no `DocList.start`.
:::

```typescript title="schema.ts"
import { Schema } from 'prosemirror-model'
import type { NodeSpec, MarkSpec } from 'prosemirror-model'
import { schema as basicSchema } from 'prosemirror-schema-basic'
import { addListNodes } from 'prosemirror-schema-list'
import { tableNodes } from 'prosemirror-tables'

// code_block from the basic schema has no attributes, so add `language`.
const codeBlock: NodeSpec = {
  ...basicSchema.spec.nodes.get('code_block'),
  attrs: { language: { default: null } },
  parseDOM: [
    {
      tag: 'pre',
      preserveWhitespace: 'full',
      getAttrs: (dom) => ({ language: (dom as HTMLElement).getAttribute('data-language') }),
    },
  ],
  toDOM: (node) => ['pre', { 'data-language': node.attrs.language }, ['code', 0]],
}

// list_item gains a `checked` attribute: null for a normal item,
// true/false for a GFM task item.
const listItem: NodeSpec = {
  content: 'paragraph block*',
  defining: true,
  attrs: { checked: { default: null } },
  parseDOM: [
    {
      tag: 'li',
      getAttrs: (dom) => {
        const value = (dom as HTMLElement).getAttribute('data-checked')
        return { checked: value === null ? null : value === 'true' }
      },
    },
  ],
  toDOM: (node) =>
    node.attrs.checked === null
      ? ['li', 0]
      : ['li', { 'data-task': '', 'data-checked': String(node.attrs.checked) }, 0],
}

// The basic schema has no strikethrough mark.
const strikethrough: MarkSpec = {
  parseDOM: [{ tag: 's' }, { tag: 'del' }, { tag: 'strike' }, { style: 'text-decoration=line-through' }],
  toDOM: () => ['s', 0],
}

// A footnote marker in the text: an inline atom that stores the identifier
// and shows the label as written ([^note] shows "note").
const footnoteRef: NodeSpec = {
  inline: true,
  group: 'inline',
  atom: true,
  attrs: { id: {}, label: { default: null } },
  parseDOM: [
    {
      tag: 'sup[data-footnote-ref]',
      getAttrs: (dom) => ({ id: (dom as HTMLElement).getAttribute('data-footnote-ref'), label: dom.textContent }),
    },
  ],
  toDOM: (node) => ['sup', { 'data-footnote-ref': node.attrs.id }, String(node.attrs.label ?? node.attrs.id)],
}

// A footnote body. It is not in the `block` group, so footnotes can only
// sit at the end of the document (see `doc` below), never inside other nodes.
const footnote: NodeSpec = {
  content: 'block+',
  defining: true,
  isolating: true,
  attrs: { id: {}, label: { default: null } },
  parseDOM: [
    {
      tag: 'div[data-footnote]',
      getAttrs: (dom) => ({
        id: (dom as HTMLElement).getAttribute('data-footnote'),
        label: (dom as HTMLElement).getAttribute('data-label'),
      }),
    },
  ],
  toDOM: (node) => ['div', { 'data-footnote': node.attrs.id, 'data-label': node.attrs.label }, 0],
}

const nodes = addListNodes(
  basicSchema.spec.nodes
    .update('doc', { content: 'block+ footnote*' })
    .update('code_block', codeBlock),
  'paragraph block*',
  'block',
)
  .update('list_item', listItem)
  .append(
    tableNodes({
      tableGroup: 'block',
      cellContent: 'block+',
      cellAttributes: {
        align: {
          default: null,
          getFromDOM: (dom) => dom.style.textAlign || null,
          setDOMAttr: (value, attrs) => {
            if (value) attrs.style = `text-align: ${String(value)}`
          },
        },
      },
    }),
  )
  .append({ footnote_ref: footnoteRef, footnote })

type NodeName =
  | 'doc' | 'paragraph' | 'blockquote' | 'horizontal_rule' | 'heading' | 'code_block'
  | 'text' | 'image' | 'hard_break' | 'ordered_list' | 'bullet_list' | 'list_item'
  | 'table' | 'table_row' | 'table_cell' | 'table_header' | 'footnote_ref' | 'footnote'
type MarkName = 'link' | 'em' | 'strong' | 'code' | 'strikethrough'

// Explicit names give typed access to schema.nodes.* and schema.marks.*
export const schema = new Schema<NodeName, MarkName>({
  nodes,
  marks: basicSchema.spec.marks.addToEnd('strikethrough', strikethrough),
})
```

The explicit `NodeName` and `MarkName` unions give you typed `schema.nodes.*` and `schema.marks.*`, so the adapter compiles without non-null assertions, even with `noUncheckedIndexedAccess`.

## 2. Map the Doc Tree to ProseMirror nodes

```typescript title="markdown-to-prosemirror.ts"
import { toDocTree } from 'md-to-rich'
import type { DocBlockNode, DocInlineNode, DocListItem, DocTableRow } from 'md-to-rich'
import { Mark } from 'prosemirror-model'
import type { Attrs, Node as PMNode, NodeType } from 'prosemirror-model'
import { schema } from './schema'

const { nodes, marks } = schema

// Build a node, letting ProseMirror insert any required filler
// (e.g. an empty paragraph in an empty blockquote or table cell).
function make(type: NodeType, attrs: Attrs | null, content: PMNode[] = []): PMNode {
  const node = type.createAndFill(attrs, content)
  if (!node) throw new Error(`Invalid content for ${type.name}`)
  return node
}

// Allow-list link and image URLs before they reach the editor.
function safeUrl(url: string): string {
  const compact = url.replace(/[\u0000- \u007f]/g, '')
  if (!/^[a-z][a-z0-9+.-]*:/i.test(compact)) return url // relative URL or #fragment
  return /^(https?|mailto|tel):/i.test(compact) ? url : '#'
}

function inlineToNodes(node: DocInlineNode, inherited: readonly Mark[] = []): PMNode[] {
  switch (node.type) {
    case 'text': {
      // Soft line breaks arrive as "\n" inside text; render them as spaces.
      const value = node.value.replace(/\n/g, ' ')
      if (!value) return []
      const set = [...inherited]
      if (node.bold) set.push(marks.strong.create())
      if (node.italic) set.push(marks.em.create())
      if (node.strikethrough) set.push(marks.strikethrough.create())
      return [schema.text(value, Mark.setFrom(set))]
    }
    case 'inlineCode':
      return node.value ? [schema.text(node.value, Mark.setFrom([...inherited, marks.code.create()]))] : []
    case 'link': {
      const link = marks.link.create({ href: safeUrl(node.url), title: node.title })
      return node.children.flatMap((child) => inlineToNodes(child, [...inherited, link]))
    }
    case 'image':
      return [nodes.image.create({ src: safeUrl(node.url), alt: node.alt, title: node.title }, null, Mark.setFrom(inherited))]
    case 'break':
      return [nodes.hard_break.create()]
    case 'footnoteReference':
      return [nodes.footnote_ref.create({ id: node.identifier, label: node.label }, null, Mark.setFrom(inherited))]
    default:
      return [] // unknown inline node from a newer md-to-rich: skip it
  }
}

function inlines(children: DocInlineNode[]): PMNode[] {
  return children.flatMap((child) => inlineToNodes(child))
}

const INLINE_TYPES = new Set(['text', 'inlineCode', 'link', 'image', 'break', 'footnoteReference'])

function isInline(node: DocBlockNode | DocInlineNode): node is DocInlineNode {
  return INLINE_TYPES.has(node.type)
}

// List items are typed as (block | inline)[]; wrap any loose inline runs in paragraphs.
function listItemToNode(item: DocListItem): PMNode {
  const content: PMNode[] = []
  let run: DocInlineNode[] = []
  const flush = () => {
    if (run.length) content.push(make(nodes.paragraph, null, inlines(run)))
    run = []
  }
  for (const child of item.children) {
    if (isInline(child)) {
      run.push(child)
    } else {
      flush()
      content.push(...blockToNodes(child))
    }
  }
  flush()
  return make(nodes.list_item, { checked: item.checked }, content)
}

function rowToNode(row: DocTableRow, align: Array<string | null>): PMNode {
  const cellType = row.isHeader ? nodes.table_header : nodes.table_cell
  const cells = row.children.map((cell, i) =>
    make(cellType, { align: align[i] ?? null }, [make(nodes.paragraph, null, inlines(cell.children))]),
  )
  return make(nodes.table_row, null, cells)
}

function blockToNodes(node: DocBlockNode): PMNode[] {
  switch (node.type) {
    case 'heading':
      return [make(nodes.heading, { level: node.depth }, inlines(node.children))]
    case 'paragraph':
      return [make(nodes.paragraph, null, inlines(node.children))]
    case 'blockquote':
      return [make(nodes.blockquote, null, node.children.flatMap(blockToNodes))]
    case 'code':
      return [make(nodes.code_block, { language: node.lang }, node.value ? [schema.text(node.value)] : [])]
    case 'list': {
      const items = node.children.map(listItemToNode)
      return [node.ordered ? make(nodes.ordered_list, { order: node.start ?? 1 }, items) : make(nodes.bullet_list, null, items)]
    }
    case 'table':
      return [make(nodes.table, null, node.children.map((row) => rowToNode(row, node.align)))]
    case 'thematicBreak':
      return [nodes.horizontal_rule.create()]
    case 'footnoteDefinition':
      return [make(nodes.footnote, { id: node.identifier, label: node.label }, node.children.flatMap(blockToNodes))]
    default:
      return [] // unknown block node from a newer md-to-rich: skip it
  }
}

export function markdownToProseMirror(markdown: string): PMNode {
  const tree = toDocTree(markdown)
  return make(nodes.doc, null, tree.children.flatMap(blockToNodes))
}
```

Every node is built through `make()`, which calls `NodeType.createAndFill()`. ProseMirror then adds any filler a content expression requires, such as an empty paragraph inside an empty blockquote, an empty task item or an empty table cell, instead of producing an invalid document.

## 3. Load it into an EditorState

```typescript title="load-state.ts"
import { EditorState } from 'prosemirror-state'
import { schema } from './schema'
import { markdownToProseMirror } from './markdown-to-prosemirror'

export function createState(markdown: string): EditorState {
  const doc = markdownToProseMirror(markdown)
  doc.check() // throws if the document doesn't match the schema
  return EditorState.create({ schema, doc })
}
```

Pass the state to `new EditorView(mount, { state })` from `prosemirror-view`, along with whatever plugins (history, keymaps, input rules) your editor uses. To replace the content of an editor that is already running, dispatch `state.tr.replaceWith(0, state.doc.content.size, doc.content)` instead of creating a new state.

For the Markdown input from the [Doc Tree reference](/docs/reference/doc-tree-nodes#full-json-example), `doc.toString()` gives:

```
doc(heading("Title"), paragraph("A paragraph with ", strong("bold"), " and ", em("italic"), "."), blockquote(paragraph("Blockquote")), bullet_list(list_item(paragraph("Task done")), list_item(paragraph("Task pending"))), table(table_row(table_header(paragraph("Name")), table_header(paragraph("Age"))), table_row(table_cell(paragraph("Alice")), table_cell(paragraph("30")))))
```

The two list items carry `checked: true` and `checked: false` in their attributes.

## Design notes

### Flat marks become a ProseMirror mark set

`toDocTree()` flattens nested `strong`/`emphasis`/`delete` into boolean flags on each `DocText`, so `***both***` arrives as one text node with `bold: true, italic: true`. ProseMirror stores marks the same way, as a flat set on each text node, so each flag becomes one mark and no nesting has to be unpicked. Links are the one inline node with children: the adapter passes the link mark down to them as an inherited mark, which is how ProseMirror represents a bold link. `Mark.setFrom()` sorts the set into schema order, which `doc.check()` requires.

### `isHeader` picks the cell type

`prosemirror-tables` distinguishes `table_header` from `table_cell`. Rows with `isHeader: true` (the first row of every GFM table) use `table_header`; all other rows use `table_cell`. The table's `align` array is copied onto each cell's `align` attribute by column index.

### Footnotes stay out of the `block` group

A `footnote` could be an ordinary block, but then it would be allowed inside blockquotes, list items and other footnotes. Leaving it out of the `block` group and setting `doc` to `block+ footnote*` matches the Doc Tree, which moves every definition to the end of the document: referenced ones in order of first reference, then unreferenced ones. A `footnote_ref` is an atom, so the cursor treats it as a single character and it can't be edited by typing. It stores the definition's `identifier` as `id` and renders the label as written (`[^note]` shows `note`).

The Doc Tree carries no footnote numbers. To show numbers, number the definitions in document order: since they arrive in order of first reference, the first `footnote` is note 1, and a `footnote_ref` takes the number of the footnote with the same `id`. Definitions that are never referenced come last, so you can also drop them.

### `checked` is a list item attribute

`DocListItem.checked` is `null` for normal items and `true`/`false` for GFM task items. The adapter copies it straight onto the `list_item`'s `checked` attribute, and `toDOM` renders task items as `<li data-task data-checked="true">`. Use a node view or CSS to draw the checkbox.

## Common pitfalls

### How do I keep unknown nodes from throwing?

Each `switch` ends in a `default` branch that returns `[]`, so a node type added in a later md-to-rich release is skipped instead of crashing the conversion. Content that doesn't fit the schema is patched by `createAndFill()`; if it still cannot build a valid node, `make()` throws with the node type's name, which points you at the schema rule to relax.

### Why does my ordered list always start at 1?

You are on md-to-rich 2.0.x or earlier. From 2.1.0, `DocList.start` holds the first item number (`3` for `3. Third`), and the adapter copies it onto `ordered_list`'s `order` attribute. Older versions don't carry the number, so `node.start` is `undefined` and the adapter falls back to `order: 1`.

### Are link and image URLs safe to render?

Yes, from md-to-rich 2.0.1: `toDocTree()` replaces `javascript:`, `data:` and other unsafe URLs with `#`. In 2.0.0 and earlier they passed through as written, so the adapter checks them again as a second layer. `safeUrl()` keeps relative URLs, fragments and `http`, `https`, `mailto` and `tel` links, and replaces everything else with `#`. Note that `toDocTree()` itself only allows `http`, `https` and `mailto`, so `tel:` links already arrive as `#`. Customise the allow-list if you need more schemes, such as `data:image/` for inline images.

### Why do some list items start with an empty paragraph?

ProseMirror list items must start with a paragraph (`paragraph block*`), which is what list commands like `splitListItem` expect. A Markdown item that starts with a code block, or that is empty, gets an empty paragraph in front from `createAndFill()`. For the same reason, Markdown that holds only footnote definitions produces an empty paragraph before the footnotes, since `doc` needs at least one block.

## Related

- [toDocTree() API](/docs/api/to-doc-tree): options and output shape of the Doc Tree
- [Doc Tree Node Types](/docs/reference/doc-tree-nodes): every node and field the adapter maps
- [Convert Markdown to Slate](/docs/guides/markdown-to-slate): the same approach for Slate editors
- [Convert Markdown to Quill](/docs/guides/markdown-to-quill): build Quill Delta operations from the Doc Tree
- [Playground](/playground): see the Doc Tree for your own Markdown
