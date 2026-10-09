---
id: html-classnames
title: Add CSS Classes (Tailwind, BEM) to Markdown HTML
sidebar_label: HTML Class Names
description: Add CSS class names to each HTML element md-to-rich generates with the classNames option. Includes Tailwind CSS and BEM examples for every element.
---

# HTML Class Names

The `classNames` option in `toHtml()` lets you inject CSS class strings per HTML element type.

## Usage

```typescript
toHtml(md, {
  classNames: {
    h1: 'heading-xl',
    p: 'prose text-base leading-relaxed',
    a: 'link text-indigo-600 hover:underline',
    code: 'font-mono bg-gray-100 px-1 rounded',
  },
})
```

## Supported Elements (`HtmlElement`)

The full union of element names that accept class injection:

```typescript
type HtmlElement =
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'p' | 'blockquote' | 'pre' | 'code' | 'hr'
  | 'ul' | 'ol' | 'li' | 'table' | 'thead' | 'tbody' | 'tr' | 'th' | 'td'
  | 'a' | 'img' | 'strong' | 'em' | 'del'
```

Each key is optional — only the elements you specify receive a class attribute.

## Tailwind CSS Example

```typescript
import { toHtml } from 'md-to-rich'

const html = toHtml(markdownContent, {
  classNames: {
    h1: 'text-4xl font-bold tracking-tight mt-8 mb-4',
    h2: 'text-3xl font-semibold mt-6 mb-3',
    h3: 'text-2xl font-semibold mt-5 mb-2',
    p: 'text-base leading-7 mb-4',
    a: 'text-indigo-600 hover:text-indigo-800 underline',
    blockquote: 'border-l-4 border-indigo-300 pl-4 italic text-gray-600',
    code: 'bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded font-mono text-sm',
    pre: 'bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto',
    ul: 'list-disc pl-6 mb-4',
    ol: 'list-decimal pl-6 mb-4',
    li: 'mb-1',
    table: 'w-full border-collapse border border-gray-300',
    th: 'border border-gray-300 bg-gray-50 px-3 py-2 text-left font-semibold',
    td: 'border border-gray-300 px-3 py-2',
    img: 'max-w-full h-auto rounded',
  },
})
```

## BEM Example

```typescript
const html = toHtml(markdownContent, {
  classNames: {
    h1: 'article__heading article__heading--h1',
    h2: 'article__heading article__heading--h2',
    p: 'article__paragraph',
    a: 'article__link',
    blockquote: 'article__blockquote',
    code: 'article__inline-code',
    pre: 'article__code-block',
    ul: 'article__list article__list--unordered',
    ol: 'article__list article__list--ordered',
    li: 'article__list-item',
  },
})
```

## Notes

- The class string is injected verbatim as the `class` attribute value. You can include multiple space-separated classes.
- Elements that already have attributes (e.g., `<a href="...">`) will have the `class` attribute appended.
- Fenced code blocks with a language combine both classes on `<code>`: `class="language-ts mono"` (since 2.1.0; earlier versions emitted a second `class` attribute that browsers ignored).
- Heading `id` attributes (from `headingIds: true`) are not affected by `classNames`.

## FAQ

### How do I style Markdown HTML without adding classes to every element?

`toHtml()` returns an HTML fragment with no wrapper element, so put it inside your own container and style descendants from there, for example `.article h2 { … }`. With Tailwind CSS, a `<div class="prose">` wrapper from the Typography plugin styles the whole fragment without any `classNames`.

### Can I add attributes other than class, such as target="_blank" or rel?

Not through options: `classNames` only sets the `class` attribute, and `toHtml()` has no other per-element attribute option. Post-process the HTML string, or write a [custom serializer](/docs/guides/custom-serializer).

```typescript
const html = toHtml(md).replace(
  /<a href="(https?:\/\/[^"]*)"/g,
  '<a href="$1" target="_blank" rel="noopener noreferrer"',
)
```

### Can I add a class to task-list checkboxes or line breaks?

No. `input` and `br` aren't in the `HtmlElement` union, so `toHtml()` always emits a class-less `<input type="checkbox" disabled>` (plus `checked` for done items) and `<br>`. Target them with CSS selectors such as `li > input[type="checkbox"]` instead.

## Related

- [toHtml() API](/docs/api/to-html): every HTML option
- [Security](/docs/security): what is sanitised in the generated HTML
