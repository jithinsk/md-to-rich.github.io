---
id: to-ansi
title: toAnsi()
sidebar_label: toAnsi()
---

# `toAnsi(md, options?): string`

Converts a Markdown string to an ANSI-escaped terminal string suitable for printing in a terminal emulator.

## Import

```typescript
import { toAnsi } from 'md-to-rich'
// or sub-path:
import { toAnsi } from 'md-to-rich/ansi'
```

## Signature

```typescript
function toAnsi(md: string, options?: AnsiOptions): string
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `columns` | `number` | `process.stdout.columns ?? 80` | Terminal column width for word-wrap and horizontal rules |
| `hyperlinks` | `boolean` | `false` | Emit OSC 8 hyperlink sequences (clickable links in supported terminals) |
| `theme` | `Partial<AnsiTheme>` | built-in | Override individual ANSI styles — only specified keys are replaced |
| `gfm` | `boolean` | `true` | Enable GitHub Flavored Markdown |
| `remarkPlugins` | `Plugin[]` | `[]` | Additional remark plugins applied before serialization |

## Examples

### Basic

```typescript
import { toAnsi } from 'md-to-rich'

const output = toAnsi('# Hello\n\n**bold** and *italic*', { columns: 80 })
process.stdout.write(output)
```

### OSC 8 hyperlinks

```typescript
toAnsi('[Docs](https://example.com)', { hyperlinks: true })
// → OSC 8 ;; https://example.com \a Docs OSC 8 ;; \a
```

Supported in iTerm2, Kitty, WezTerm, and most modern terminal emulators.

### Custom theme

```typescript
import type { AnsiTheme } from 'md-to-rich'

const theme: Partial<AnsiTheme> = {
  h1: { open: '\x1b[1m', close: '\x1b[0m' },
  listBullet: '→',
}

toAnsi('# Title\n\n- item', { theme })
```

## Default Theme

The built-in theme uses only inline ANSI constants — no external dependencies like `chalk`:

| Key | Effect |
|---|---|
| `h1` | Bold + underline |
| `h2` | Bold |
| `h3` | Bold |
| `bold` | Bold |
| `italic` | Italic |
| `strikethrough` | Strikethrough |
| `inlineCode` | Reverse video |
| `codeBlock` | Box-drawing border |
| `blockquote` | Dim + `│` prefix |
| `link` | Underline |
| `listBullet` | `•` character |
| `hrChar` | `─` character |

See the [ANSI Theme guide](/docs/guides/ansi-theme) for full details and examples.
