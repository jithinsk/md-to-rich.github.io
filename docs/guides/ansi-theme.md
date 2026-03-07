---
id: ansi-theme
title: ANSI Theme
sidebar_label: ANSI Theme
---

# ANSI Theme

The `theme` option in `toAnsi()` lets you override individual style entries. Only the keys you provide are replaced; everything else falls back to the built-in defaults.

## `AnsiStyle` Shape

```typescript
interface AnsiStyle {
  open: string   // ANSI escape sequence to start the style
  close: string  // ANSI escape sequence to end the style
}
```

## `AnsiTheme` Key Reference

| Key | Type | Default effect |
|---|---|---|
| `h1` | `AnsiStyle` | Bold + underline (`\x1b[1;4m` / `\x1b[0m`) |
| `h2` | `AnsiStyle` | Bold (`\x1b[1m` / `\x1b[0m`) |
| `h3` | `AnsiStyle` | Bold (`\x1b[1m` / `\x1b[0m`) |
| `bold` | `AnsiStyle` | Bold (`\x1b[1m` / `\x1b[22m`) |
| `italic` | `AnsiStyle` | Italic (`\x1b[3m` / `\x1b[23m`) |
| `strikethrough` | `AnsiStyle` | Strikethrough (`\x1b[9m` / `\x1b[29m`) |
| `inlineCode` | `AnsiStyle` | Reverse video (`\x1b[7m` / `\x1b[27m`) |
| `codeBlock` | `AnsiStyle` | Box-drawing border |
| `blockquote` | `AnsiStyle` | Dim (`\x1b[2m` / `\x1b[22m`) + `│` prefix |
| `link` | `AnsiStyle` | Underline (`\x1b[4m` / `\x1b[24m`) |
| `listBullet` | `string` | `•` |
| `hrChar` | `string` | `─` |

## Monochrome Theme Example

Bold only, no colour — useful for accessibility or non-colour terminals:

```typescript
import { toAnsi } from 'md-to-rich'
import type { AnsiTheme } from 'md-to-rich'

const monochromeTheme: Partial<AnsiTheme> = {
  h1: { open: '\x1b[1m', close: '\x1b[0m' },
  h2: { open: '\x1b[1m', close: '\x1b[0m' },
  h3: { open: '\x1b[1m', close: '\x1b[0m' },
  inlineCode: { open: '\x1b[7m', close: '\x1b[27m' },   // reverse video
  codeBlock: { open: '', close: '' },
  blockquote: { open: '\x1b[2m', close: '\x1b[22m' },   // dim
  link: { open: '\x1b[4m', close: '\x1b[24m' },         // underline only
  hrChar: '─',
  listBullet: '-',
}

const output = toAnsi(md, { columns: 80, theme: monochromeTheme })
```

## Fun Theme Example

Custom bullet points and HR character:

```typescript
const funTheme: Partial<AnsiTheme> = {
  listBullet: '→',
  hrChar: '·',
}

toAnsi('- Alpha\n- Beta\n- Gamma\n\n---', { columns: 40, theme: funTheme })
// → List items prefixed with →
// → HR rendered as ·····...
```

## Colour Codes Reference

Common ANSI escape sequences for building themes:

| Effect | Open | Close |
|---|---|---|
| Bold | `\x1b[1m` | `\x1b[22m` |
| Dim | `\x1b[2m` | `\x1b[22m` |
| Italic | `\x1b[3m` | `\x1b[23m` |
| Underline | `\x1b[4m` | `\x1b[24m` |
| Reverse | `\x1b[7m` | `\x1b[27m` |
| Strikethrough | `\x1b[9m` | `\x1b[29m` |
| Red fg | `\x1b[31m` | `\x1b[39m` |
| Green fg | `\x1b[32m` | `\x1b[39m` |
| Blue fg | `\x1b[34m` | `\x1b[39m` |
| Cyan fg | `\x1b[36m` | `\x1b[39m` |
| Reset all | `\x1b[0m` | — |
