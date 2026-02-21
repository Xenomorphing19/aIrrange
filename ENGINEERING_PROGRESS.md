# aIrrange Universal — Engineering Progress Log

This document is a **detailed engineering record** of what has been implemented in this repository so far: architecture decisions, feature delivery (functional and non-functional), bug fixes, and known limitations.

> Scope note: This repo started as a ChatGPT-only keyword organizer and has been evolved into **aIrrange Universal**: a privacy-first MV3 extension that indexes LLM conversations locally, supports multi-provider API keys/models, and provides fast search + exports.

---

## 1) Current System Overview

### 1.1 Product goal
Provide a **universal “second brain”** for LLM conversations:

- Capture prompts/conversation metadata on supported LLM sites.
- Build a **local index** in the browser (no server).
- Add fast retrieval: dashboard search, omnibox quick search, context-menu search.
- Add portability: export to Notion / Obsidian.

### 1.2 Key architectural rules (non-negotiables)
These are implemented and/or enforced by the current codebase:

1. **Data privacy**
   - Conversation index stored in **IndexedDB** via **Dexie.js**.
   - `chrome.storage.local` used only for settings and API keys.
   - Prompt text is sanitized (emails/phone numbers) before any LLM calls.

2. **Extensibility**
   - Adapter Pattern with a `BaseAdapter`.
   - Site-specific logic lives in provider adapters.

3. **Reliability**
   - No `setTimeout` for page-change detection.
   - Use `MutationObserver` + history API patching for SPA navigation.

---

## 2) Repository Structure (Key Files)

### Core extension wiring
- `manifest.json`
  - MV3 configuration
  - background service worker (`src/background.js` as module)
  - content script (`src/content.bundle.js` as bundled IIFE)
  - omnibox keyword `air`

- `src/background.js`
  - Receives adapter events
  - Upserts conversations into Dexie
  - Sanitizes prompts
  - Calls LLM client for summary/keywords
  - Updates tags table
  - Omnibox suggestion engine + open tab navigation
  - Context menu “Search in aIrrange”

- `src/content.js`
  - Provider detection (AdapterRegistry)
  - Creates adapter and forwards events to background
  - (Bundled into `src/content.bundle.js`)

### Local data layer
- `src/db/database.js`
  - Dexie database `aIrrangeUniversal`
  - `conversations` table
  - `tags` table

### Provider adapters
- `src/adapters/BaseAdapter.js`
  - Abstract adapter contract

- `src/adapters/ChatGPTAdapter.js`
  - SPA URL change detection
  - Prompt submission heuristic
  - Emits standardized payloads

- `src/adapters/ClaudeAdapter.js`
  - Claude.ai equivalent adapter (defensive contenteditable selectors)

### UI
- `popup.html` / `popup.js`
  - API vault settings (provider + key + model)
  - Displays latest 3 conversations (reads Dexie)

- `all.html` / `all.css` / `all.js`
  - Card-based dashboard
  - Settings + exports + danger zone
  - Search (multi-field)
  - Quick Filter sidebar (tags)

### Utilities
- `src/utils/sanitizer.js`
  - Strips emails and phone numbers

- `src/utils/llmClient.js`
  - Universal provider routing
  - OpenAI-compatible calls + Anthropic special case
  - Test Connection (models list)

- `src/utils/exportUtils.js`
  - Markdown conversion (YAML frontmatter)
  - Notion-optimized CSV (BOM, standard headers)

### Vendored runtime dependencies
Because MV3/service-worker/content scripts cannot resolve bare npm module specifiers at runtime without bundling:

- `vendor/dexie.mjs`
- `vendor/jszip.min.js`

---

## 3) Data Model & Storage

### 3.1 Conversations table
Stored in IndexedDB via Dexie table: `db.conversations`

Current stored shape (effective):

```js
{
  id: string,
  url: string,
  title: string,
  provider: 'chatgpt' | 'claude' | 'openai' | 'gemini' | 'anthropic' | 'unknown',
  prompt_snippet: string,
  timestamp: number,
  summary?: string,
  keywords?: string[]
}
```

### 3.2 Tags table
Table: `db.tags`.

Important note: schema originally included `id, conv_id, label`. For *sidebar tag uniqueness*, we currently upsert using:

```js
db.tags.put({ id: label, label })
```

This treats `label` as a unique primary key.

### 3.3 Settings + API vault
Stored in `chrome.storage.local`:

```js
aIrrange_api_vault: {
  selected: 'gemini' | 'openai' | 'anthropic',
  keys: {
    gemini: string,
    openai: string,
    anthropic: string
  }
}

// Per-provider model selection stored separately:
// aIrrange_model_gemini, aIrrange_model_openai, aIrrange_model_anthropic
```

---

## 4) Functional Feature Delivery (What works today)

### 4.1 Capture & indexing
#### ChatGPT
- Content script starts on `https://chatgpt.com/*`.
- Adapter uses DOM mutation + prompt-empty heuristic to detect prompt submit.
- Background upserts the conversation record.
- URL is normalized by ignoring landing pages and retaining `/c/<id>` URLs.

#### Claude
- Content script starts on `https://claude.ai/*`.
- Adapter uses contenteditable heuristics.
- Emits the same standardized events as ChatGPT.

### 4.2 Keyword extraction + summarization
- Background receives `PROMPT_SUBMITTED`.
- Sanitizes prompt snippet using `sanitizePrompt()`.
- Attempts metadata generation via `LLMClient.generateKeywords()`.
- If API key is missing or provider call fails:
  - falls back to local regex-based keyword extraction.

### 4.3 Dashboard search
- Dashboard fetches from Dexie sorted by timestamp.
- Search is multi-field:
  - title
  - summary
  - keywords array
- Performance: if >500 items, input is debounced by 300ms.

### 4.4 Omnibox quick search
- Keyword: `air`
- Suggestions: top 5 matches using markup:
  - `<dim>[PROVIDER]</dim> <match>Title</match>`
- Selecting suggestion opens conversation URL.

### 4.5 Context menu search
- Right click selected text → “Search in aIrrange”
- Opens `all.html?q=...` and auto-filters.

### 4.6 Export
#### Markdown ZIP
- Each conversation becomes an `.md` file.
- Includes YAML frontmatter (Obsidian-friendly).

#### Notion CSV
- UTF-8 BOM + Notion-friendly column names.
- Keywords is comma-separated to map to Notion multi-select.

### 4.7 Deletion controls (safety)
- Per-card delete requires typing `DELETE`.
- Clear-all requires typing `DELETE ALL`.

---

## 5) Non-Functional Feature Delivery

### 5.1 Privacy
- Conversation index stays local.
- PII sanitizer redacts emails and phone numbers before any LLM call.

### 5.2 Reliability
- SPA navigation detection via history patch + MutationObserver.
- Avoids setTimeout-based heuristics.

### 5.3 Performance
- IndexedDB storage via Dexie.
- Search debounced for large history sizes.

### 5.4 Maintainability
- Adapter separation allows incremental provider support.
- Utility modules for sanitizer/LLM/export.

---

## 6) Bug Fixes & Lessons Learned (High Signal)

### 6.1 MV3 runtime module resolution
**Symptom:**
- Service worker registration failed (Status code: 15)
- Errors like:
  - `Failed to resolve module specifier "dexie"`

**Cause:**
- MV3 does not resolve npm bare module specifiers without bundling or vendoring.

**Fix:**
- Vendored:
  - `vendor/dexie.mjs`
  - `vendor/jszip.min.js`
- Updated imports to relative paths.

### 6.2 Content scripts are not ESM modules
**Symptom:** `Cannot use import statement outside a module (at content.js:1)`

**Fix:**
- Bundled content script with esbuild:
  - `npm run build` → `src/content.bundle.js`
- Manifest now points to bundled file.

### 6.3 Background message routing
**Symptom:** events logged but nothing persisted, popup/dashboard empty.

**Cause:** background only processed `type === 'ADAPTER_EVENT'`.

**Fix:** handle direct event messages (`PROMPT_SUBMITTED` / `CONVERSATION_UPDATE`).

### 6.4 Keywords disappearing
**Symptom:** keywords appeared, then vanished as new updates arrived.

**Cause:** `CONVERSATION_UPDATE` upserts overwrote previous record.

**Fix:** merge upserts in `upsertConversationBase()`.

### 6.5 “Phantom card” from landing page
**Fix:** ignore ChatGPT records without `/c/` URL.

---

## 7) Known Limitations / TODO

1. **Tags schema** could be normalized further:
   - right now tags are unique labels; `conv_id` isn’t used.
2. **Conversation title extraction** is still heuristic (`document.title`).
3. **Claude DOM detection** is defensive and may need tuning as their UI changes.
4. **UI auto-refresh**
   - popup/dashboard render on open; live updates require refresh.

---

## 8) How to Build / Develop

### Build content script
```bash
npm run build
```

### Load extension
Chrome → `chrome://extensions` → Developer mode → Load unpacked.

---

## 9) Checklist of Delivered Capabilities

- [x] MV3 extension with background service worker
- [x] Dexie local index (conversations + tags)
- [x] Adapter Pattern with ChatGPT + Claude adapters
- [x] Multi-provider API vault + model selection
- [x] Prompt sanitizer
- [x] Dashboard card UI + multi-field search + debounce
- [x] Omnibox quick search (`air`)
- [x] Context menu search to dashboard
- [x] Markdown ZIP export
- [x] Notion CSV export (BOM)
- [x] Safe delete flows (typed confirmation)
