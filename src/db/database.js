import Dexie from '../../vendor/dexie.mjs';

/**
 * aIrrange Universal local database (IndexedDB via Dexie).
 *
 * Privacy rule:
 * - Conversation index lives here (IndexedDB).
 * - chrome.storage.local is reserved for settings and API keys.
 */
export const db = new Dexie('aIrrangeUniversal');

// Schema requirements (from spec):
// conversations: (id, url, title, provider, prompt_snippet, timestamp)
// tags: (id, conv_id, label)
db.version(1).stores({
  conversations: 'id, url, provider, timestamp, title',
  tags: 'id, conv_id, label'
});

// v2: add summary + keywords to conversations
db.version(2).stores({
  conversations: 'id, url, provider, timestamp, title',
  tags: 'id, conv_id, label'
});

/**
 * @typedef {Object} Conversation
 * @property {string} id
 * @property {string} url
 * @property {string} title
 * @property {string} provider
 * @property {string} prompt_snippet
 * @property {string=} summary
 * @property {string[]=} keywords
 * @property {number} timestamp
 */

/**
 * @typedef {Object} Tag
 * @property {string} id
 * @property {string} conv_id
 * @property {string} label
 */
