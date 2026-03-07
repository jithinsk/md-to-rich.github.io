---
id: prosemirror-slate
title: ProseMirror / Slate Adapter Guide
sidebar_label: ProseMirror / Slate
description: Map md-to-rich DocTree output to ProseMirror nodes, Slate elements, and Quill Delta operations. Complete TypeScript adapter examples with flat inline mark handling.
---

# ProseMirror / Slate Adapter Guide

`toDocTree` outputs a plain JSON tree with no runtime dependencies — ideal for mapping into rich-text editor schemas.

## ProseMirror Adapter

```typescript
import { toDocTree } from 'md-to-rich'
import type { DocBlockNode, DocInlineNode } from 'md-to-rich'
import { schema } from 'prosemirror-schema-basic'

function blockToNode(node: DocBlockNode) {
  if (node.type === 'paragraph') {
    return schema.nodes.paragraph!.create(null, node.children.map(inlineToNode))
  }
  if (node.type === 'heading') {
    return schema.nodes.heading!.create({ level: node.depth }, node.children.map(inlineToNode))
  }
  // ... other block types
}

function inlineToNode(node: DocInlineNode) {
  if (node.type === 'text') {
    const marks = []
    if (node.bold) marks.push(schema.marks.strong!.create())
    if (node.italic) marks.push(schema.marks.em!.create())
    return schema.text(node.value, marks)
  }
  // ... other inline types
}

const doc = toDocTree(markdownString)
const pmDoc = schema.nodes.doc!.create(null, doc.children.map(blockToNode))
```

## Slate Mapping

Map `DocBlockNode` to Slate elements and `DocText` to Slate leaf nodes:

```typescript
import { toDocTree } from 'md-to-rich'
import type { DocBlockNode, DocInlineNode, DocText } from 'md-to-rich'

function docToSlate(doc: ReturnType<typeof toDocTree>) {
  return doc.children.map(blockToSlate)
}

function blockToSlate(node: DocBlockNode): object {
  if (node.type === 'paragraph') {
    return { type: 'paragraph', children: node.children.map(inlineToSlate) }
  }
  if (node.type === 'heading') {
    return { type: `h${node.depth}`, children: node.children.map(inlineToSlate) }
  }
  if (node.type === 'code') {
    return { type: 'code-block', lang: node.lang, children: [{ text: node.value }] }
  }
  if (node.type === 'list') {
    return {
      type: node.ordered ? 'numbered-list' : 'bulleted-list',
      children: node.children.map((item) => ({
        type: 'list-item',
        checked: item.checked,
        children: item.children.map((c) => inlineToSlate(c as DocInlineNode)),
      })),
    }
  }
  return { type: node.type, children: [{ text: '' }] }
}

function inlineToSlate(node: DocInlineNode): object {
  if (node.type === 'text') {
    return {
      text: node.value,
      ...(node.bold ? { bold: true } : {}),
      ...(node.italic ? { italic: true } : {}),
      ...(node.strikethrough ? { strikethrough: true } : {}),
    }
  }
  if (node.type === 'inlineCode') {
    return { text: node.value, code: true }
  }
  if (node.type === 'link') {
    return {
      type: 'link',
      url: node.url,
      children: node.children.map(inlineToSlate),
    }
  }
  return { text: '' }
}
```

## Key Design Notes

### DocText — Flat Marks

Nested `strong`/`emphasis`/`delete` marks in the MDAST are **flattened** into `DocText` boolean flags:

```typescript
interface DocText {
  type: 'text'
  value: string
  bold: boolean
  italic: boolean
  strikethrough: boolean
}
```

A node that is both bold and italic has `bold: true, italic: true`. This eliminates nested structure and maps directly to ProseMirror marks or Slate leaf properties.

### DocTableRow — isHeader

The first row of a GFM table has `isHeader: true`:

```typescript
if (row.isHeader) {
  return { type: 'table-header-row', cells: row.children.map(...) }
}
```

### DocListItem — checked

GFM task list items carry a `checked` boolean; regular list items have `checked: null`:

```typescript
if (item.checked !== null) {
  // task list item — render a checkbox
} else {
  // regular list item
}
```

## Quill Delta Example

```typescript
import { toDocTree } from 'md-to-rich'

function toQuillDelta(md: string) {
  const doc = toDocTree(md)
  const ops: object[] = []

  for (const block of doc.children) {
    if (block.type === 'paragraph') {
      for (const inline of block.children) {
        if (inline.type === 'text') {
          ops.push({
            insert: inline.value,
            ...(inline.bold || inline.italic ? {
              attributes: {
                ...(inline.bold ? { bold: true } : {}),
                ...(inline.italic ? { italic: true } : {}),
              },
            } : {}),
          })
        }
      }
      ops.push({ insert: '\n' })
    }
    // ... handle other block types
  }

  return { ops }
}
```
