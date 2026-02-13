/**
 * Convert a conversation DB record into a Markdown document with YAML frontmatter.
 *
 * @param {any} conversation
 * @returns {string}
 */
export function convertToMarkdown(conversation) {
  const title = conversation?.title || 'Untitled';
  const provider = conversation?.provider || 'unknown';
  const timestamp = conversation?.timestamp ? new Date(Number(conversation.timestamp)).toISOString() : '';
  const keywords = Array.isArray(conversation?.keywords) ? conversation.keywords : [];
  const summary = conversation?.summary || '';
  const url = conversation?.url || '';

  const safe = (v) => String(v ?? '').replace(/\r?\n/g, ' ').trim();
  const safeTitle = safe(title);
  const safeSummary = safe(summary);

  return `---
title: ${safeTitle}
provider: ${safe(provider)}
date: ${safe(timestamp)}
tags: [${keywords.map((k) => safe(k)).join(', ')}]
summary: ${safeSummary}
url: ${safe(url)}
---
# ${safeTitle}
> **AI Summary:** ${safeSummary}

[View Original Chat](${safe(url)})
`;
}

/**
 * Notion-friendly CSV generator.
 *
 * Headers map well to Notion property types:
 * - Title (title)
 * - URL (url)
 * - Summary (text)
 * - Keywords (multi-select via comma-separated string)
 * - Provider (select)
 * - Created Time (date)
 *
 * @param {any[]} conversations
 */
export function conversationsToNotionCsv(conversations) {
  const header = ['Title', 'URL', 'Summary', 'Keywords', 'Provider', 'Created Time'];

  const rows = (conversations || []).map((c) => {
    const title = c?.title || 'Untitled';
    const url = c?.url || '';
    const summary = c?.summary || '';
    const keywords = Array.isArray(c?.keywords) ? c.keywords.join(', ') : '';
    const provider = c?.provider || '';
    const created = c?.timestamp ? new Date(Number(c.timestamp)).toISOString() : '';
    return [title, url, summary, keywords, provider, created];
  });

  const csvBody = [header, ...rows]
    .map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');

  // UTF-8 BOM for Excel/Notion friendliness
  return `\ufeff${csvBody}`;
}
