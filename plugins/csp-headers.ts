import { createHash } from 'node:crypto'
import { appendFileSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from '@docusaurus/types'

// Ship the policy as Report-Only first; switch to false once the live site
// shows no violations in the browser console.
const REPORT_ONLY = true

const INLINE_SCRIPT = /<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g

// Docusaurus injects a few inline scripts (colour-mode bootstrap, base-URL
// banner) whose contents change between versions. Hash whatever this build
// produced so the policy never needs 'unsafe-inline' for scripts.
function inlineScriptHashes(outDir: string): string[] {
  const hashes = new Set<string>()
  for (const file of readdirSync(outDir, { recursive: true, encoding: 'utf8' })) {
    if (!file.endsWith('.html')) continue
    const html = readFileSync(join(outDir, file), 'utf8')
    for (const [, body] of html.matchAll(INLINE_SCRIPT)) {
      if (!body.trim()) continue
      hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`)
    }
  }
  return [...hashes].sort()
}

export default function cspHeaders(): Plugin {
  return {
    name: 'csp-headers',
    async postBuild({ outDir }) {
      const policy = [
        "default-src 'self'",
        // Cloudflare Web Analytics injects its beacon at the edge.
        `script-src 'self' ${inlineScriptHashes(outDir).join(' ')} https://static.cloudflareinsights.com`,
        // Inline style attributes come from Docusaurus and Prism.
        "style-src 'self' 'unsafe-inline'",
        // The playground preview shows images from whatever URL the user types.
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://cloudflareinsights.com",
        "frame-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
      ].join('; ')

      const header = REPORT_ONLY ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy'
      appendFileSync(join(outDir, '_headers'), `\n/*\n  ${header}: ${policy}\n`)
    },
  }
}
