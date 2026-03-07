---
id: to-doc-tree
title: toDocTree()
sidebar_label: toDocTree()
description: toDocTree() API reference — convert Markdown to a typed DocDocument JSON tree, ready to map into ProseMirror, Slate, Quill, or any rich-text editor schema.
---

# `toDocTree(md, options?): DocDocument`

Converts a Markdown string to a typed `DocDocument` tree (plain JSON, no HTML, no ANSI).

## Import

```typescript
import { toDocTree } from 'md-to-rich'
// or sub-path:
import { toDocTree } from 'md-to-rich/doc-tree'
```

## Signature

```typescript
function toDocTree(md: string, options?: DocTreeOptions): DocDocument
```

`DocTreeOptions` inherits from `BaseOptions` (`gfm`, `remarkPlugins`).

## JSON Output Example

```typescript
import { toDocTree } from 'md-to-rich'

const tree = toDocTree('# Hello\n\nThis is **bold** and *italic*.')
```

```json
{
  "type": "document",
  "children": [
    {
      "type": "heading",
      "depth": 1,
      "children": [
        { "type": "text", "value": "Hello", "bold": false, "italic": false, "strikethrough": false }
      ]
    },
    {
      "type": "paragraph",
      "children": [
        { "type": "text", "value": "This is ", "bold": false, "italic": false, "strikethrough": false },
        { "type": "text", "value": "bold", "bold": true, "italic": false, "strikethrough": false },
        { "type": "text", "value": " and ", "bold": false, "italic": false, "strikethrough": false },
        { "type": "text", "value": "italic", "bold": false, "italic": true, "strikethrough": false },
        { "type": "text", "value": ".", "bold": false, "italic": false, "strikethrough": false }
      ]
    }
  ]
}
```

## Use Cases

`toDocTree` outputs a plain JSON tree with no runtime dependencies — ideal for:

- **ProseMirror** — map `DocBlockNode` → `PMNode`, `DocText` marks → `PMMark`
- **Slate** — map `DocBlockNode` → Slate element, `DocText` → Slate leaf
- **Quill** — convert to Delta operations
- **Custom renderers** — traverse the tree to build any output format
- **Server-side storage** — store structured content and re-render later

## Tree Traversal Example

```typescript
import { toDocTree } from 'md-to-rich'
import type { DocBlockNode, DocInlineNode, DocDocument } from 'md-to-rich'

function collectText(doc: DocDocument): string[] {
  const texts: string[] = []

  function visitInline(node: DocInlineNode) {
    if (node.type === 'text') texts.push(node.value)
    if (node.type === 'link') node.children.forEach(visitInline)
  }

  function visitBlock(node: DocBlockNode) {
    if ('children' in node) {
      for (const child of node.children) {
        if ('value' in child || child.type === 'text' || child.type === 'link') {
          visitInline(child as DocInlineNode)
        } else {
          visitBlock(child as DocBlockNode)
        }
      }
    }
  }

  doc.children.forEach(visitBlock)
  return texts
}
```

## Notes

- Nested `strong`/`emphasis`/`delete` marks are **flattened** into `DocText` boolean flags (`bold`, `italic`, `strikethrough`). A node that is both bold and italic will have `bold: true, italic: true`.
- `DocListItem.checked` is `true` / `false` for GFM task list items and `null` for regular list items.
- `DocTableRow.isHeader` is `true` for the first row (the header row) in a GFM table.

See [Doc Tree Node Types](/docs/reference/doc-tree-nodes) for the complete type reference.
