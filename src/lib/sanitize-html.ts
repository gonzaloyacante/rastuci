/**
 * Lightweight HTML sanitizer for server-side rendering.
 *
 * Strips all HTML tags and attributes except those in the safe allowlist.
 * Used instead of dangerouslySetInnerHTML with unsanitized DB content.
 *
 * NOTE: For richer sanitization, add `sanitize-html` or `dompurify` package.
 * This is a conservative server-safe implementation that allows common prose tags.
 */

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "hr",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "del",
  "blockquote",
  "pre",
  "code",
  "a",
  "span",
  "div",
  "section",
  "article",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
]);

// Only allow these attributes (and only on safe tags)
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  img: new Set(["src", "alt", "width", "height"]),
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan", "scope"]),
};

/**
 * Sanitizes an HTML string, allowing only a safe allowlist of tags/attributes.
 * Strips event handlers (onclick, onload, etc.) and javascript: URLs.
 *
 * @param dirty - Raw HTML string (potentially from DB / admin CMS)
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return "";

  // Remove script and style blocks entirely
  let clean = dirty
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");

  // Strip all event handlers and javascript: URLs from attributes
  clean = clean
    .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\s+on\w+\s*=\s*[^\s>]*/gi, "")
    .replace(/javascript\s*:/gi, "about:blank#");

  // Remove disallowed tags by replacing them with empty string
  // while preserving allowed tags
  clean = clean.replace(
    /<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g,
    (match, tagName: string, attrs: string) => {
      const lowerTag = tagName.toLowerCase();

      if (!ALLOWED_TAGS.has(lowerTag)) {
        // Disallowed tag — strip it
        return "";
      }

      // Allowed tag — sanitize its attributes
      const allowedAttrs = ALLOWED_ATTRS[lowerTag];
      if (!allowedAttrs || allowedAttrs.size === 0) {
        // Tag is allowed but no attributes permitted
        return `<${tagName}>`;
      }

      // Filter attributes to only allow the safe set
      const cleanAttrs = attrs.replace(
        /\s*([a-zA-Z-]+)\s*=\s*(?:"([^"]*?)"|'([^']*?)'|([^\s>]*))/g,
        (attrMatch, attrName: string, dq: string, sq: string, nq: string) => {
          if (!allowedAttrs.has(attrName.toLowerCase())) return "";
          const val = dq ?? sq ?? nq ?? "";
          // Block javascript: in href
          if (
            attrName.toLowerCase() === "href" &&
            /javascript\s*:/i.test(val)
          ) {
            return "";
          }
          return ` ${attrName}="${val}"`;
        }
      );

      return `<${tagName}${cleanAttrs}>`;
    }
  );

  return clean;
}
