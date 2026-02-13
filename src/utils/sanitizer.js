/**
 * Strip common PII patterns from text before sending it to any external LLM.
 * We keep this intentionally conservative.
 */
export function sanitizePrompt(text) {
  if (!text) return '';

  let out = String(text);

  // Emails
  out = out.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]');

  // Phone numbers (very heuristic, covers many common formats)
  out = out.replace(
    /(?:\+?\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)|\d{2,4})[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g,
    '[redacted-phone]'
  );

  return out;
}
