# System Patterns — aIrrange Universal

This document captures the architecture patterns and “rules of the road” for implementation.

---

## 1) High-level architecture

**MV3 Chrome Extension** with three primary execution contexts:

1. **Content Scripts**
   - Run on supported provider domains (chatgpt.com, claude.ai, etc.)
   - Host the *Adapter runtime* that observes the page and extracts conversation metadata.

2. **Background Service Worker**
   - Coordinates extension-wide events and messaging.
   - May listen to `chrome.webNavigation` (where appropriate) to trigger adapter activation.
   - Never stores the conversation index in `chrome.storage.local` (index belongs in IndexedDB via Dexie).

3. **Extension UI (popup / history page)**
   - Reads from Dexie for history/search.
   - Writes settings + API keys to `chrome.storage.local`.

---

## 2) Storage pattern (privacy-first)

### IndexedDB via Dexie.js (conversation index)
Use Dexie tables for:
- conversations
- keywords/tags (optional normalization)
- provider metadata (optional)

Data model should be provider-agnostic, e.g.:

```ts
type ConversationRecord = {
  id: string;                 // provider-scoped id (or computed)
  provider: 'chatgpt' | 'claude' | string;
  url: string;
  title?: string;
  createdAt?: number;
  updatedAt?: number;
  keywords?: string[];
  // optional: snippet, model, folder, etc.
};
```

### chrome.storage.local (settings only)
Only store:
- API keys (if needed)
- capture enable/disable toggle
- per-provider enable flags
- UI preferences

### Practical note: MV3 module resolution
MV3 and extension pages do **not** resolve npm bare module imports (e.g. `import 'dexie'`) at runtime without bundling.

Current approach:
- Vendor runtime libs under `vendor/` (e.g. `vendor/dexie.mjs`, `vendor/jszip.min.js`).
- Bundle the content script using esbuild into an IIFE (`src/content.bundle.js`).

---

## 3) Adapter Pattern (extensibility)

### BaseAdapter
All providers must extend `BaseAdapter`.

Required responsibilities:
- `supports(location: URL): boolean`
- `start(): void` — begin observing page/navigation changes
- `stop(): void` — clean up observers/listeners
- `extractConversation(): ConversationRecord | null`
- `onConversationChanged(cb): void` — emit normalized record when new conversation is detected

### Provider adapters
Each provider adapter:
- Encapsulates DOM selectors and extraction logic.
- Uses **MutationObserver** to detect SPA route changes or conversation changes.
- Avoids time-based heuristics.

### Adapter registry
Central place that:
- chooses the correct adapter for a page
- starts/stops adapters when navigation changes

---

## 4) Reliability pattern (no setTimeout)

### Preferred: MutationObserver
Use a MutationObserver to watch for:
- conversation container changes
- title updates
- URL changes reflected by history API (SPAs often update `location.href`)

Implementation guidance:
- Observe the smallest stable container rather than `document.body` if possible.
- Debounce using microtasks or requestAnimationFrame if needed, but **no arbitrary delays**.

### Alternative/additional: chrome.webNavigation
In the background service worker:
- Listen for completed navigations or history state updates.
- Notify content script to re-evaluate adapter state if needed.

---

## 5) Messaging pattern

Use `chrome.runtime.sendMessage` / `onMessage` with typed messages:

```ts
type Msg =
  | { type: 'UPSERT_CONVERSATION'; payload: ConversationRecord }
  | { type: 'GET_SETTINGS' }
  | { type: 'SET_SETTINGS'; payload: Settings };
```

UI → Background → Dexie operations can live in:
- UI page directly (Dexie runs in extension page), or
- Background (Dexie in service worker) if you want a single writer.

Choose one pattern and keep it consistent.

### Implementation note (current)
Content scripts may send either:
- wrapped message: `{ type: 'ADAPTER_EVENT', ... }`, or
- direct event type: `{ type: 'PROMPT_SUBMITTED', payload: ... }`

Background must accept both to avoid dropped persistence.
