import { db } from './db/database.js';
import { sanitizePrompt } from './utils/sanitizer.js';
import { LLMClient } from './utils/llmClient.js';

console.log('aIrrange Universal background service worker initialized');

// --- Omnibox quick search ---
chrome.omnibox.onInputChanged.addListener(async (text, suggest) => {
  const query = String(text || '').trim();
  if (!query) {
    suggest([]);
    return;
  }

  const matches = await searchConversations(query, 5);
  suggest(
    matches.map((c) => {
      const provider = (c.provider || 'unknown').toUpperCase();
      const title = c.title || c.summary || c.url;
      return {
        content: c.url,
        description: `<dim>[${escapeXml(provider)}]</dim> <match>${escapeXml(title)}</match>`
      };
    })
  );
});

chrome.omnibox.onInputEntered.addListener((text) => {
  const url = String(text || '').trim();
  if (!url) return;
  chrome.tabs.create({ url });
});

// --- Context menu: search selected ---
if (chrome.contextMenus?.create) {
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'airrange_search_selection',
      title: 'Search in aIrrange',
      contexts: ['selection']
    });
  });

  // Some Chrome builds expose onClicked only after permission + install lifecycle.
  chrome.contextMenus.onClicked?.addListener((info) => {
    if (info.menuItemId !== 'airrange_search_selection') return;
    const q = String(info.selectionText || '').trim();
    if (!q) return;
    const url = chrome.runtime.getURL(`all.html?q=${encodeURIComponent(q)}`);
    chrome.tabs.create({ url });
  });
} else {
  console.warn('[aIrrange] contextMenus API unavailable; skipping context menu setup');
}

/**
 * Background message handler.
 *
 * Receives standardized adapter events and upserts them into IndexedDB (Dexie).
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[aIrrange][bg] message', message?.type, message);
  // Accept both the wrapped format (type=ADAPTER_EVENT) and direct event types
  // (PROMPT_SUBMITTED / CONVERSATION_UPDATE) from content scripts.
  if (message?.type === 'ADAPTER_EVENT') {
    handleAdapterEvent(message, sender).then(
      () => sendResponse({ ok: true }),
      (err) => sendResponse({ ok: false, error: String(err?.message || err) })
    );
    return true;
  }

  if (message?.type === 'PROMPT_SUBMITTED' || message?.type === 'CONVERSATION_UPDATE') {
    handleAdapterEvent(message, sender).then(
      () => sendResponse({ ok: true }),
      (err) => sendResponse({ ok: false, error: String(err?.message || err) })
    );
    return true;
  }

  if (message?.type === 'PROVIDER_ACTIVE') {
    console.log('PROVIDER_ACTIVE', message.payload);
  }

  // Keep as no-op for now; useful for debugging.
  if (message?.type === 'URL_CHANGED') {
    console.log('URL_CHANGED', message.payload);
  }
});

/**
 * @param {any} message
 * @param {chrome.runtime.MessageSender} sender
 */
async function handleAdapterEvent(message, sender) {
  const { type, payload } = message;
  if (!payload) return;

  if (type === 'CONVERSATION_UPDATE') {
    await upsertConversationBase(payload, message);
    return;
  }

  if (type === 'PROMPT_SUBMITTED') {
    // 1) Always upsert base record (prompt snippet + title/url/provider)
    const base = await upsertConversationBase(payload, message);

    // 2) Sanitize before any external call
    const sanitized = sanitizePrompt(payload.prompt_snippet || '');

    // 3) Try LLM metadata generation
    const llm = new LLMClient();
    let summary = '';
    let keywords = [];
    try {
      const meta = await llm.generateKeywords(sanitized);
      summary = meta.summary || '';
      keywords = meta.keywords || [];
    } catch (e) {
      // 4) Fallback: local extraction
      const local = extractKeywordsSimple(sanitized);
      keywords = Array.from(local).slice(0, 8);
      summary = base?.title || '';
      console.warn('LLM metadata unavailable, using local fallback:', e);
    }

    // 5) Update record with intelligence
    await db.conversations.update(base.id, { summary, keywords });
    await upsertTagsFromKeywords(keywords);
    console.log('Updated conversation with metadata', { id: base.id, summary, keywords });
  }
}

async function upsertConversationBase(payload, message) {
  // Ignore ChatGPT landing page / no conversation id.
  if (payload?.provider === 'chatgpt' && (!payload?.url || !String(payload.url).includes('/c/'))) {
    return { id: payload.id, ignored: true };
  }

  const record = {
    id: payload.id,
    url: payload.url,
    title: payload.title || '',
    provider: payload.provider || message.provider || 'unknown',
    prompt_snippet: payload.prompt_snippet || '',
    timestamp: payload.timestamp || Date.now()
  };

  // Merge with existing to prevent CONVERSATION_UPDATE from wiping keywords/summary.
  const existing = await db.conversations.get(record.id);
  const merged = {
    ...existing,
    ...record,
    // preserve if new update doesn't include them
    summary: record.summary ?? existing?.summary,
    keywords: record.keywords ?? existing?.keywords
  };

  await db.conversations.put(merged);
  return record;
}

// Local regex-based keyword extractor fallback.
function extractKeywordsSimple(query) {
  const words = String(query || '').toLowerCase().match(/\b\w{3,}\b/g) || [];
  return new Set(words);
}

async function searchConversations(query, limit) {
  const q = String(query || '').toLowerCase();
  const all = await db.conversations.orderBy('timestamp').reverse().toArray();
  const filtered = all.filter((c) => {
    const title = String(c.title || '').toLowerCase();
    const summary = String(c.summary || '').toLowerCase();
    const keywords = Array.isArray(c.keywords) ? c.keywords.map((k) => String(k).toLowerCase()) : [];
    return title.includes(q) || summary.includes(q) || keywords.some((k) => k.includes(q));
  });
  return filtered.slice(0, limit);
}

function escapeXml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function upsertTagsFromKeywords(keywords) {
  if (!Array.isArray(keywords) || keywords.length === 0) return;
  // Table schema uses `id` as primary key, so use label as id for uniqueness.
  await Promise.all(
    keywords
      .map((k) => String(k || '').trim())
      .filter(Boolean)
      .map((label) => db.tags.put({ id: label, label }))
  );
}
