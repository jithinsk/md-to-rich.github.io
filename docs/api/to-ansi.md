---
id: to-ansi
title: "toAnsi(): Render Markdown in the Terminal"
sidebar_label: toAnsi()
description: "toAnsi() API reference: render Markdown as ANSI terminal output in Node.js, with word-wrap, custom themes, box-drawing tables, and OSC 8 hyperlinks."
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
| `h1` | Bold + underline + magenta |
| `h2` | Bold + underline + cyan |
| `h3` | Bold + cyan (also used for `h4`–`h6`) |
| `bold` | Bold |
| `italic` | Italic |
| `strikethrough` | Strikethrough |
| `inlineCode` | Reverse video + yellow |
| `codeBlock` | Dark grey text inside a box-drawing border |
| `blockquote` | Dark grey `│` prefix |
| `link` | Underline + blue |
| `listBullet` | `•` character |
| `hrChar` | `─` character |

See the [ANSI Theme guide](/docs/guides/ansi-theme) for full details and examples.

## FAQ

### Can I use toAnsi() without colours?

`toAnsi()` always emits escape codes and doesn't read `NO_COLOR`. To get plain text, strip the codes with Node's `stripVTControlCharacters` (see [Respect NO_COLOR and piped output](/docs/guides/markdown-to-ansi-terminal#respect-no_color-and-piped-output)), or pass a `theme` whose styles all have empty `open` and `close` strings and leave `hyperlinks` off. Either way you keep the wrapping, bullets, code frames and table borders.

### How does toAnsi() show links and images?

By default a link prints as its label in the `link` style followed by the URL in parentheses, such as `Docs (https://example.com)`. With `hyperlinks: true` it becomes a clickable OSC 8 link that shows only the label. Images can't be drawn in a terminal, so `toAnsi()` prints `[image: alt text]` in their place, falling back to the URL when the alt text is empty. Links with unsafe URLs such as `javascript:` show only their label. Footnote references print as `[1]`, with the notes listed at the end (2.1.0+).

### Does toAnsi() syntax-highlight code blocks?

No. `toAnsi()` draws a fenced code block inside a `┌─ code (ts)` box-drawing frame, labelled with the language when there is one, and colours every line with the single `codeBlock` theme style.

## Related

- [Render Markdown in the terminal](/docs/guides/markdown-to-ansi-terminal): a complete Node.js CLI with paging and NO_COLOR support
- [ANSI Theme guide](/docs/guides/ansi-theme): customise every style
- [Comparison](/docs/comparison): how toAnsi() compares with marked-terminal
