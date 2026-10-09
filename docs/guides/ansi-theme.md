---
id: ansi-theme
title: Customise ANSI Terminal Colours and Theme
sidebar_label: ANSI Theme
description: "Customise toAnsi() terminal output with the AnsiTheme interface: override heading, bullet, rule, and colour styles, with monochrome and colourful examples."
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
| `h1` | `AnsiStyle` | Bold + underline + magenta (`\x1b[1;4;35m` / `\x1b[0m`) |
| `h2` | `AnsiStyle` | Bold + underline + cyan (`\x1b[1;4;36m` / `\x1b[0m`) |
| `h3` | `AnsiStyle` | Bold + cyan (`\x1b[1;36m` / `\x1b[0m`), also used for `h4`–`h6` |
| `bold` | `AnsiStyle` | Bold (`\x1b[1m` / `\x1b[22m`) |
| `italic` | `AnsiStyle` | Italic (`\x1b[3m` / `\x1b[23m`) |
| `strikethrough` | `AnsiStyle` | Strikethrough (`\x1b[9m` / `\x1b[29m`) |
| `inlineCode` | `AnsiStyle` | Reverse video + yellow (`\x1b[7;33m` / `\x1b[0m`) |
| `codeBlock` | `AnsiStyle` | Dark grey (`\x1b[90m` / `\x1b[39m`), inside a box-drawing border |
| `blockquote` | `AnsiStyle` | Dark grey (`\x1b[90m` / `\x1b[39m`), applied to the `│` prefix |
| `link` | `AnsiStyle` | Underline + blue (`\x1b[4;34m` / `\x1b[0m`) |
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

## FAQ

### Can I use 256-colour or truecolour (RGB) codes in an AnsiTheme?

Yes. `open` and `close` are raw strings written as-is, so any SGR sequence works, such as `\x1b[38;5;39m` (256-colour) or `\x1b[38;2;255;135;0m` (RGB), closed with `\x1b[39m`. `toAnsi()` ignores escape sequences when it measures line width, so word-wrap stays correct.

```typescript
const theme: Partial<AnsiTheme> = {
  h1: { open: '\x1b[1;38;2;255;135;0m', close: '\x1b[0m' }, // bold, RGB orange
  link: { open: '\x1b[38;5;39m', close: '\x1b[39m' },       // 256-colour blue
}
```

### Can I build an AnsiTheme with ansi-styles?

Yes. Each style in the `ansi-styles` package (the module chalk uses for its codes) is an `{ open, close }` object, the same shape as `AnsiStyle`, so you can assign them directly:

```typescript
import styles from 'ansi-styles'
import type { AnsiTheme } from 'md-to-rich'

const theme: Partial<AnsiTheme> = { h1: styles.magentaBright, link: styles.cyan }
```

### Which parts of toAnsi() output can't be themed?

Table borders, ordered-list numbers and `[x]`/`[ ]` task markers are always plain text, and table header cells reuse the `bold` style. The `codeBlock` style colours the whole code frame, while the `blockquote` style applies only to the `│ ` prefix, not to the quoted text.

## Related

- [toAnsi() API](/docs/api/to-ansi): all options, including columns and hyperlinks
- [Playground](/playground): preview ANSI output in the browser
