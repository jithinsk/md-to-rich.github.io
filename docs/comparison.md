---
id: comparison
title: md-to-rich vs marked, markdown-it, and remark
sidebar_label: Comparison
description: An honest comparison of md-to-rich with marked, markdown-it, remark, marked-terminal, prosemirror-markdown and remark-slate, with a feature matrix and FAQ.
---

# md-to-rich vs marked, markdown-it, remark, and others

Choose md-to-rich when one Markdown source has to become safe HTML, ANSI terminal output and editor-ready JSON, and you want all three from a single typed API with sanitisation switched on by default. Look elsewhere if you only need fast Markdown-to-HTML, need to turn editor content back into Markdown, or rely on a large plugin ecosystem. marked, markdown-it, remark, prosemirror-markdown and remark-slate each cover those cases better.

## Feature matrix

✅ means the package does this itself. "via plugin" means a separate package or extension you add. ❌ means the package doesn't provide it.

| | md-to-rich | marked | markdown-it | remark / unified | marked-terminal | prosemirror-markdown | remark-slate |
|---|---|---|---|---|---|---|---|
| HTML output | ✅ | ✅ | ✅ | via plugin (remark-html, remark-rehype) | ❌ | ❌ | ❌ |
| Terminal / ANSI output | ✅ | via plugin (marked-terminal) | ❌ | ❌ | ✅ | ❌ | ❌ |
| Rich-text JSON for editors | ✅ generic Doc Tree | ❌ (tokens only) | ❌ (tokens only) | ❌ (MDAST only) | ❌ | ✅ ProseMirror only | ✅ Slate only |
| Bundled TypeScript types | ✅ | ✅ | ✅ | ✅ | ❌ (`@types/marked-terminal`) | ✅ | ✅ |
| GFM tables and task lists | ✅ | ✅ | Tables ✅, tasks via plugin | via plugin (remark-gfm) | ✅ | ❌ by default | ❌ |
| URL sanitisation / raw HTML handling | ✅ always on | ❌ | ✅ | remark-html ✅; remark-rehype needs rehype-sanitize | n/a (terminal) | ✅ (via markdown-it) | ❌ |
| Plugin ecosystem | remark plugins | ✅ | ✅ | ✅ largest | ❌ | markdown-it plugins | remark plugins |
| Custom output formats | ✅ `Serializer` interface | ✅ custom renderer | ✅ renderer rules | ✅ | ❌ | ❌ | Node names only |
| Serialise back to Markdown | ❌ | ❌ | ❌ | ✅ (remark-stringify) | ❌ | ✅ | ✅ |

Notes on the less obvious cells:

- **Sanitisation.** In HTML output, md-to-rich replaces `javascript:`, `data:` and `vbscript:` URLs with `#` and strips raw HTML unless you opt in. Doc Tree link and image URLs get the same treatment (since 2.0.1). See [Security](/docs/security). marked passes both `javascript:` links and raw HTML through unchanged; its README tells you to sanitise the output with a library such as DOMPurify. markdown-it refuses to turn `javascript:` URLs into links and escapes raw HTML by default (`html: false`). remark-html sanitises by default. remark-rehype drops raw HTML but keeps `javascript:` hrefs unless you add rehype-sanitize. remark-slate passes `javascript:` URLs straight into the Slate value.
- **GFM in prosemirror-markdown and remark-slate.** The default prosemirror-markdown parser uses markdown-it's `commonmark` preset with a CommonMark-only schema, so tables and task lists need a custom schema and parser. remark-slate (tested with remark-parse 11 and remark-gfm) drops tables and loses task-list checked state.
- **Types.** markdown-it bundles its own types as of v15. Older versions use `@types/markdown-it`. marked-terminal ships no types. The community `@types/marked-terminal` package targets older marked releases.
- **"Generic" Doc Tree.** md-to-rich's Doc Tree isn't any editor's native format. You map it to ProseMirror, Slate or Quill with a small adapter. prosemirror-markdown and remark-slate produce native documents directly.

## Choose md-to-rich if…

- You need **more than one output** from the same Markdown, such as HTML for the web, ANSI for a CLI and JSON for an editor, and want them to agree on how Markdown is parsed.
- You render **untrusted Markdown** and want dangerous URLs and raw HTML handled without extra setup.
- You want **typed JSON** you can walk with exhaustive `switch` statements instead of a token stream.
- You want to write your **own output format** against a small `Serializer` interface while still using remark plugins upstream.

Don't choose it if you need Markdown output (it has no Markdown serialiser), maximum throughput, or syntax-highlighted code in the terminal (`toAnsi` doesn't highlight code).

## Choose marked if…

- You want the **fastest, simplest** Markdown-to-HTML conversion and can sanitise the output yourself (DOMPurify or similar).
- You want a mature, extremely widely used library with GFM on by default, an extension API and a CLI.

marked is much faster than md-to-rich (see the FAQ) and far more widely used. Its trade-off is that sanitisation is your responsibility.

## Choose markdown-it if…

- You want fast, CommonMark-compliant HTML with **safe defaults**: dangerous links are rejected and raw HTML is escaped unless you set `html: true`.
- You need a big catalogue of **syntax plugins** (footnotes, task lists, containers, anchors and many more) or want to change the parsing rules themselves.

markdown-it is also much faster than md-to-rich and far more widely used. It's the better choice if HTML is your only output.

## Choose remark / unified if…

- You want the **largest plugin ecosystem** and full control over the pipeline: Markdown → MDAST → HTML AST (hast) → HTML, with linting, transforms, MDX and more.
- You need to **write Markdown back out** (remark-stringify) or round-trip documents.

md-to-rich is built on remark-parse and remark-gfm and accepts remark plugins, so it parses Markdown the same way remark does. What md-to-rich adds is ready-made serialisers. What you give up is the rest of the unified pipeline: it doesn't produce hast, so rehype plugins don't apply.

## Choose marked-terminal if…

- You already use marked and want terminal output with **syntax-highlighted code blocks** (via cli-highlight), emoji shortcodes and chalk-based styling.

md-to-rich's `toAnsi` covers headings, lists, tables, task lists and OSC 8 hyperlinks with a themeable style map, but it doesn't highlight code. If you adopt marked-terminal, check that its `marked` peer-dependency range covers the marked version you install.

## Choose prosemirror-markdown if…

- Your editor is **ProseMirror** (or built on it, like Tiptap) and you want Markdown **in and out**. prosemirror-markdown is maintained within the ProseMirror project and includes both a `MarkdownParser` and a `MarkdownSerializer`.

This is the standard route for ProseMirror, and md-to-rich can't replace it for saving documents, because md-to-rich doesn't serialise back to Markdown. md-to-rich is useful on the import side when you want GFM tables and task lists without writing a markdown-it-based parser spec, or when the same content also needs HTML or terminal output.

## Choose remark-slate if…

- Your editor is **Slate** and you need **Markdown ↔ Slate** in both directions. remark-slate includes a `serialize` function that turns Slate nodes back into Markdown.

remark-slate's default node names (`heading_one`, `ul_list`, …) can be changed through options. In our tests it dropped GFM tables and didn't sanitise link URLs. If you only need import and want tables, task lists and safe URLs, md-to-rich's Doc Tree plus a small adapter is an alternative.

## FAQ

### Is md-to-rich faster than marked?

No. In a quick local benchmark (Node.js 25, a 9.4 KB GFM document converted 200 times after warm-up), marked took about 1.1 ms per conversion and markdown-it about 1.8 ms. md-to-rich `toHtml` took about 17.6 ms and remark + remark-gfm + remark-html about 20.1 ms. md-to-rich runs at roughly remark speed because it uses the same parser. If raw HTML throughput matters most, use marked or markdown-it. Run your own benchmark on your own content before you decide.

### Does md-to-rich sanitise HTML like DOMPurify?

No. md-to-rich sanitises the HTML it generates: it neutralises `javascript:`, `data:` and `vbscript:` URLs and strips raw HTML by default. It isn't a general-purpose HTML sanitiser. If you enable `allowRawHtml`, run the output through a sanitiser such as DOMPurify. See [Security](/docs/security).

### Can md-to-rich convert ProseMirror or Slate content back to Markdown?

No. md-to-rich only goes from Markdown to other formats. For the reverse direction, use prosemirror-markdown's `MarkdownSerializer`, remark-slate's `serialize`, or remark-stringify on an MDAST tree.

### Can I use remark plugins with md-to-rich?

Yes, for transforms that run on the Markdown syntax tree (MDAST). Pass them in the `remarkPlugins` option and they run after parsing and before serialisation. rehype plugins don't apply because md-to-rich never builds an HTML AST. See [remark Plugins](/docs/guides/remark-plugins).

### Is md-to-rich a drop-in replacement for marked-terminal?

Not exactly. `toAnsi` returns a styled string from a Markdown string, so it can be swapped in with little effort, but the options, theme keys and output formatting are different, and it doesn't highlight code.

## Related

- [Getting Started](/docs/getting-started): install md-to-rich and convert your first document
- [Markdown to ProseMirror](/docs/guides/markdown-to-prosemirror): build ProseMirror documents from the Doc Tree
- [Markdown to Slate](/docs/guides/markdown-to-slate): build a Slate value from the Doc Tree
- [Markdown to ANSI terminal output](/docs/guides/markdown-to-ansi-terminal): render Markdown in a CLI with `toAnsi`
