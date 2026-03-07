---
id: doc-tree-nodes
title: Doc Tree Node Types
sidebar_label: Doc Tree Node Types
---

# Doc Tree Node Types

Complete type reference for the `DocDocument` tree returned by `toDocTree()`.

## Type Hierarchy

```
DocDocument
└── children: DocBlockNode[]
    ├── DocHeading           { depth: 1-6, children: DocInlineNode[] }
    ├── DocParagraph         { children: DocInlineNode[] }
    ├── DocBlockquote        { children: DocBlockNode[] }
    ├── DocCodeBlock         { lang: string|null, value: string }
    ├── DocList              { ordered: boolean, children: DocListItem[] }
    │   └── DocListItem      { checked: boolean|null, children: (DocBlockNode|DocInlineNode)[] }
    ├── DocTable             { align: [...], children: DocTableRow[] }
    │   └── DocTableRow      { isHeader: boolean, children: DocTableCell[] }
    │       └── DocTableCell { children: DocInlineNode[] }
    └── DocHorizontalRule    { type: 'thematicBreak' }

DocInlineNode
    ├── DocText              { value: string, bold: boolean, italic: boolean, strikethrough: boolean }
    ├── DocInlineCode        { value: string }
    ├── DocLink              { url: string, title: string|null, children: DocInlineNode[] }
    ├── DocImage             { url: string, alt: string|null, title: string|null }
    └── DocBreak
```

---

## Block Node Interfaces

### `DocDocument`

```typescript
interface DocDocument {
  type: 'document'
  children: DocBlockNode[]
}
```

The root of every tree returned by `toDocTree()`.

---

### `DocHeading`

```typescript
interface DocHeading {
  type: 'heading'
  depth: 1 | 2 | 3 | 4 | 5 | 6
  children: DocInlineNode[]
}
```

---

### `DocParagraph`

```typescript
interface DocParagraph {
  type: 'paragraph'
  children: DocInlineNode[]
}
```

---

### `DocBlockquote`

```typescript
interface DocBlockquote {
  type: 'blockquote'
  children: DocBlockNode[]
}
```

Blockquotes can contain any block-level content including nested blockquotes.

---

### `DocCodeBlock`

```typescript
interface DocCodeBlock {
  type: 'code'
  lang: string | null
  value: string
}
```

`lang` is the info string from a fenced code block (e.g., `"typescript"`), or `null` for indented or unlabelled blocks.

---

### `DocList`

```typescript
interface DocList {
  type: 'list'
  ordered: boolean
  children: DocListItem[]
}
```

---

### `DocListItem`

```typescript
interface DocListItem {
  type: 'listItem'
  checked: boolean | null
  children: (DocBlockNode | DocInlineNode)[]
}
```

`checked` is `true`/`false` for GFM task list items (`- [x]` / `- [ ]`) and `null` for regular list items.

---

### `DocTable`

```typescript
interface DocTable {
  type: 'table'
  align: Array<'left' | 'right' | 'center' | null>
  children: DocTableRow[]
}
```

`align` contains one entry per column. `null` means no alignment specified.

---

### `DocTableRow`

```typescript
interface DocTableRow {
  type: 'tableRow'
  isHeader: boolean
  children: DocTableCell[]
}
```

`isHeader` is `true` for the first row (the header row) of a GFM table.

---

### `DocTableCell`

```typescript
interface DocTableCell {
  type: 'tableCell'
  children: DocInlineNode[]
}
```

---

### `DocHorizontalRule`

```typescript
interface DocHorizontalRule {
  type: 'thematicBreak'
}
```

---

## Inline Node Interfaces

### `DocText`

```typescript
interface DocText {
  type: 'text'
  value: string
  bold: boolean
  italic: boolean
  strikethrough: boolean
}
```

Nested `strong`/`emphasis`/`delete` marks from the MDAST are flattened into boolean flags. A node that is both bold and italic has `bold: true, italic: true`.

---

### `DocInlineCode`

```typescript
interface DocInlineCode {
  type: 'inlineCode'
  value: string
}
```

---

### `DocLink`

```typescript
interface DocLink {
  type: 'link'
  url: string
  title: string | null
  children: DocInlineNode[]
}
```

`url` has already been sanitised — dangerous protocols are replaced with `#`.

---

### `DocImage`

```typescript
interface DocImage {
  type: 'image'
  url: string
  alt: string | null
  title: string | null
}
```

`url` has been sanitised.

---

### `DocBreak`

```typescript
interface DocBreak {
  type: 'break'
}
```

Represents a hard line break (two trailing spaces or `\` before newline).

---

## Union Type Aliases

```typescript
type DocInlineNode =
  | DocText
  | DocInlineCode
  | DocLink
  | DocImage
  | DocBreak

type DocBlockNode =
  | DocHeading
  | DocParagraph
  | DocBlockquote
  | DocCodeBlock
  | DocList
  | DocTable
  | DocHorizontalRule

type DocTreeNode =
  | DocDocument
  | DocBlockNode
  | DocListItem
  | DocTableRow
  | DocTableCell
  | DocInlineNode
```

---

## Full JSON Example

Input Markdown:

```markdown
# Title

A paragraph with **bold** and *italic*.

> Blockquote

- [x] Task done
- [ ] Task pending

| Name | Age |
|------|-----|
| Alice | 30 |
```

Output (abbreviated):

```json
{
  "type": "document",
  "children": [
    { "type": "heading", "depth": 1, "children": [{ "type": "text", "value": "Title", "bold": false, "italic": false, "strikethrough": false }] },
    { "type": "paragraph", "children": [
        { "type": "text", "value": "A paragraph with ", "bold": false, "italic": false, "strikethrough": false },
        { "type": "text", "value": "bold", "bold": true, "italic": false, "strikethrough": false },
        { "type": "text", "value": " and ", "bold": false, "italic": false, "strikethrough": false },
        { "type": "text", "value": "italic", "bold": false, "italic": true, "strikethrough": false },
        { "type": "text", "value": ".", "bold": false, "italic": false, "strikethrough": false }
      ]
    },
    { "type": "blockquote", "children": [{ "type": "paragraph", "children": [{ "type": "text", "value": "Blockquote", "bold": false, "italic": false, "strikethrough": false }] }] },
    { "type": "list", "ordered": false, "children": [
        { "type": "listItem", "checked": true, "children": [{ "type": "text", "value": "Task done", "bold": false, "italic": false, "strikethrough": false }] },
        { "type": "listItem", "checked": false, "children": [{ "type": "text", "value": "Task pending", "bold": false, "italic": false, "strikethrough": false }] }
      ]
    },
    { "type": "table", "align": [null, null], "children": [
        { "type": "tableRow", "isHeader": true, "children": [
            { "type": "tableCell", "children": [{ "type": "text", "value": "Name", "bold": false, "italic": false, "strikethrough": false }] },
            { "type": "tableCell", "children": [{ "type": "text", "value": "Age", "bold": false, "italic": false, "strikethrough": false }] }
          ]
        },
        { "type": "tableRow", "isHeader": false, "children": [
            { "type": "tableCell", "children": [{ "type": "text", "value": "Alice", "bold": false, "italic": false, "strikethrough": false }] },
            { "type": "tableCell", "children": [{ "type": "text", "value": "30", "bold": false, "italic": false, "strikethrough": false }] }
          ]
        }
      ]
    }
  ]
}
```
