/**
 * Shared text helpers.
 *
 * The server stores user text HTML-escaped (stored-XSS defence), so entities
 * like `&lt;`, `&amp;` come back over the wire. React re-escapes on render, so
 * to show the real characters the entities must be folded back first.
 */

// Server stores text HTML-escaped (stored-XSS defence); React re-escapes on
// render, so display needs the entities folded back to characters.
export function unescapeHtml(value) {
  if (!value) return value;
  return String(value)
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&amp;', '&');
}

export default unescapeHtml;
