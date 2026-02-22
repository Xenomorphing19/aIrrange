# aIrrange Universal — Repo Overview (What does this do?)

This repository contains **a Chrome Extension (Manifest V3)** that indexes your conversations on **ChatGPT (chatgpt.com)** and **Claude (claude.ai)** into a **local searchable database** (Dexie/IndexedDB). It adds:

- lightweight prompt/conversation metadata capture via provider **adapters**
- optional LLM-based summaries/keywords (Gemini/OpenAI/Anthropic)
- fuzzy search primitives (stemming + trigrams) for typo tolerance
- dashboard + popup UIs
- exports (Markdown ZIP / Notion CSV)

---

## 1) Project type & entry points

This is a browser extension (not a Node project). Key files:

- `manifest.json` — extension configuration (MV3)
- `src/background.bundle.js` — bundled background service worker (ESM)
- `src/content.bundle.js` — bundled content script (IIFE)
- `popup.html` / `popup.bundle.js` — the extension popup UI
- `all.html` / `all.bundle.js` / `all.css` — full history dashboard UI
- `icons/icon.svg` — extension icon

### Bundling note (important)
MV3 extension contexts do not reliably support **bare npm imports** (e.g. `import { stemmer } from 'stemmer'`) unless bundled.

We bundle these entrypoints with **esbuild**:
- `src/content.js` → `src/content.bundle.js` (IIFE)
- `src/background.js` → `src/background.bundle.js` (ESM)
- `popup.js` → `popup.bundle.js` (ESM)
- `all.js` → `all.bundle.js` (ESM)

---

## 2) What data is captured and where it is stored

### Captured data
For each prompt you send on ChatGPT, the extension stores an entry:

```jsonc
{
  "url": "https://chatgpt.com/c/<conversationId>",
  "keywords": ["tag1", "tag2", "tag3"]
}
```

Notes:
- It stores the **conversation URL** (normalized) and **keywords**.
- It does **not** store the full conversation transcript.

### Storage
Conversation index is stored in **IndexedDB** via **Dexie** (`src/db/database.js`).

`chrome.storage.local` stores only **settings + API keys/models**.

---

## 3) Permissions & security model

From `manifest.json`:

- `permissions: ["storage"]`
  - Needed to store conversations, toggle state, and API key locally.

- `host_permissions`: includes Gemini/OpenAI/Anthropic endpoints for optional metadata calls.

- `content_scripts.matches: ["https://chatgpt.com/*"]`
  - The prompt-capture logic runs only on ChatGPT.

Privacy posture (based on code):
- Conversation index is local to the browser profile.
- If you set an API key, **your prompt text is sent to Gemini** for keyword extraction (and candidate list is sent for AI ranking).
- If you do **not** set an API key, the extension uses a local “simple” keyword extractor.

---

## 4) How it works (data flow)

### A) Capturing a prompt on chatgpt.com / claude.ai (`src/content.js` + adapters)

The provider adapter emits standardized events like:
- `PROMPT_SUBMITTED`
- `CONVERSATION_UPDATE`

The content script forwards these to the background service worker.

### B) Keyword extraction + saving (`src/background.js`)

When background receives `PROMPT_SUBMITTED`:

1. It **normalizes** the URL (removes query/hash; ensures ChatGPT `/c/<id>` format).
2. It generates keywords:
   - **Primary:** `getKeywordsFromGemini(query)`
     - Reads `aIrrange_geminiApiKey`
     - POSTs to Gemini model `gemini-1.5-flash-latest:generateContent`
     - Expects a comma-separated keyword list
   - **Fallback:** `extractKeywordsSimple(query)`
     - Extracts 3+ letter words, lowercases, dedupes via `Set`
3. It upserts into Dexie `db.conversations`.
4. It generates/stores:
   - `summary` + `keywords` (raw tags)
   - `stemmed_tags` (Porter stems)
   - `trigrams` (3-char grams for fuzzy matching)

### C) Popup UI (latest 3) (`popup.html` / `popup.js`)

Popup shows:
- A toggle (“Are you ready for it?”) bound to `aIrrange_isCapturingEnabled`
- API key settings UI:
  - Save/remove `aIrrange_geminiApiKey`
- Latest 3 conversations from `conversations` with their keyword chips
- Link to open the full history page: `all.html`

### D) Full history dashboard (`all.html` / `all.js`)

On load:
- `all.js` requests all conversations by messaging background:
  - `type: "getAllConversations"`

Search is multi-field and (in background LIVE_SEARCH) uses a hybrid scoring:
- **Exact substring baseline** (never misses exact matches)
- **Trigram query-overlap similarity** (typo-tolerant bonus)

---

## 5) “Web accessible resources” (why `all.html` works)

`manifest.json` declares:

```json
"web_accessible_resources": [
  {
    "resources": ["all.html", "all.bundle.js", "all.css"],
    "matches": ["<all_urls>"]
  }
]
```

This allows the extension to open `all.html` (and load its JS/CSS) as an internal extension page.

---

## 6) How to install & use (developer mode)

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this repo folder (`aIrrange`)
5. Open `https://chatgpt.com/` and chat normally
6. Click the extension icon:
   - Toggle capture on/off
   - (Optional) Add Gemini API key
   - View latest captured conversations
7. Click **See All Your History** to open the full list and AI search.

---

## 7) Repo quick map

| File | Role |
|------|------|
| `manifest.json` | Declares permissions, content script, popup, background service worker |
| `content.js` | Captures prompts on ChatGPT and sends them to background |
| `src/background.js` | Background logic (bundled to `src/background.bundle.js`) |
| `popup.html` / `popup.js` | Popup UI (bundled to `popup.bundle.js`) |
| `all.html` / `all.js` / `all.css` | Dashboard UI (bundled to `all.bundle.js`) |
| `icons/icon.svg` | Icon |

---

## 8) Known limitations / assumptions (from code)

- **ChatGPT DOM coupling:** It assumes the prompt element id is `prompt-textarea`. If ChatGPT changes its DOM, capture may break.
- **Omnibox search** still uses simple `includes()` search today (LIVE_SEARCH is fuzzy-scored).
- **JSZip warning during build**: bundling `vendor/jszip.min.js` can emit an esbuild warning due to CommonJS patterns in an ESM project; build still succeeds.
- **No dedupe by content:** Conversations are deduped by normalized URL only.

---

## 9) If you want to extend it

Common next improvements:
- Store `title`/first prompt snippet for a friendlier UI than showing conversation id.
- Add delete/export/import for `conversations`.
- Improve keyword extraction prompt + parsing (handle bullet lists, newlines, etc.).
- Add a non-AI search mode in `all.html` (pure keyword search) as a fallback.
