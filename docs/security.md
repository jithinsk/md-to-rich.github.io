---
id: security
title: "Security: URL Sanitisation and XSS Protection"
sidebar_label: Security
description: "How md-to-rich keeps generated HTML safe: always-on URL sanitisation, blocked javascript:, data:, and vbscript: links, and raw HTML stripping by default."
---

# Security

md-to-rich treats Markdown as untrusted input by default: dangerous link protocols are removed and raw HTML is stripped, with no configuration required.

## URL Sanitisation

URL sanitisation is **always on** in `toHtml()` and `toDocTree()`. You cannot disable it.

Any `href` (links) or `src` (images) attribute containing a dangerous protocol is replaced with `#` in HTML output, and the same replacement is applied to `url` on Doc Tree link and image nodes.

:::warning Upgrade to 2.0.1 or later

In md-to-rich 2.0.0 and earlier, `toDocTree()` returned link and image URLs exactly as written, so `[x](javascript:alert(1))` produced `url: 'javascript:alert(1)'`. Upgrade to 2.0.1 or later if you render Doc Tree output from untrusted Markdown. The [ProseMirror](/docs/guides/markdown-to-prosemirror), [Slate](/docs/guides/markdown-to-slate), and [Quill](/docs/guides/markdown-to-quill) guides also include a small `safeUrl()` check as a second layer.

:::

### Blocked Protocols

| Protocol | Example | Reason |
|---|---|---|
| `javascript:` | `javascript:alert(1)` | XSS via script execution |
| `data:` | `data:text/html,<h1>hi</h1>` | XSS via data URI |
| `vbscript:` | `vbscript:msgbox(1)` | Legacy IE script execution |

### Allowed Protocols and URL Forms

| Form | Example | Result |
|---|---|---|
| `https://` | `https://example.com` | Passed through unchanged |
| `http://` | `http://example.com` | Passed through unchanged |
| `mailto:` | `mailto:user@example.com` | Passed through unchanged |
| `#anchor` | `#section` | Passed through unchanged |
| Absolute path | `/about` | Passed through unchanged |
| Relative path | `./docs/intro.md` | Passed through unchanged |
| `javascript:` | `javascript:alert(1)` | Replaced with `#` |
| `data:` URL (link) | `data:text/html,...` | Replaced with `#` |
| `vbscript:` | `vbscript:msgbox(1)` | Replaced with `#` |
| Image `javascript:` | `![x](javascript:...)` | src replaced with `#` |
| Image `data:` | `![x](data:image/svg+xml,...)` | src replaced with `#` |

### OSC 8 Hyperlink Sanitisation

When `hyperlinks: true` is used in `toAnsi()`, the URL embedded in the OSC 8 sequence is also sanitised. Any control characters in the URL are stripped to prevent terminal escape injection.

---

## `allowRawHtml` — XSS Warning

The `allowRawHtml` option in `toHtml()` passes raw HTML nodes from the Markdown source through to the output **unchanged**.

:::danger

Setting `allowRawHtml: true` creates an XSS risk if the HTML output is injected into a browser DOM and the Markdown source contains user-supplied content.

Example of what passes through with `allowRawHtml: true`:

```markdown
Click me: <a href="javascript:alert(document.cookie)">link</a>
```

**Only enable `allowRawHtml` when the Markdown source is fully trusted** — e.g., stored in your own database, authored by trusted internal users, and never user-supplied from an untrusted source.

:::

By default (`allowRawHtml: false`), raw HTML nodes in Markdown are stripped from the output entirely.

## Reporting a Vulnerability

Report security issues privately through GitHub's [Report a vulnerability](https://github.com/jithinsk/markdown-to-richtext/security/advisories/new) form rather than a public issue. Include the md-to-rich version, the function you called, and the Markdown input that triggers the problem. See the [security policy](https://github.com/jithinsk/markdown-to-richtext/blob/main/SECURITY.md) for supported versions.

## Related

- [toHtml() API](/docs/api/to-html): the allowRawHtml option and its risks
- [toDocTree() API](/docs/api/to-doc-tree): JSON output with sanitised URLs
