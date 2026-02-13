# aIrrange — Repo Overview (What does this do?)

This repository contains **a Chrome Extension (Manifest V3)** that **captures your prompts on ChatGPT (chatgpt.com)**, generates **keywords/tags** (optionally via **Google Gemini API**), and stores a lightweight **conversation index** locally so you can **browse/search your past ChatGPT conversation links**.

> In short: it’s a *local, AI-assisted organizer for ChatGPT conversations*.

---

## 1) Project type & entry points

This is a browser extension (not a Node project). Key files:

- `manifest.json` — extension configuration (MV3)
- `background.js` — service worker; does keyword extraction + storage + AI search ranking
- `content.js` — content script injected on `https://chatgpt.com/*`; captures the user prompt when you press Enter
- `popup.html` / `popup.js` — the extension popup UI (latest items + toggle + Gemini API key settings)
- `all.html` / `all.js` / `all.css` — a “full history” page with an AI-assisted search bar
- `icons/icon.svg` — extension icon

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
All data is stored in **`chrome.storage.local`**:

- `conversations` — array of conversation objects `{ url, keywords }`
- `aIrrange_isCapturingEnabled` — boolean toggle (default `true`)
- `aIrrange_geminiApiKey` — optional user-provided Gemini API key

---

## 3) Permissions & security model

From `manifest.json`:

- `permissions: ["storage"]`
  - Needed to store conversations, toggle state, and API key locally.

- `host_permissions: ["https://generativelanguage.googleapis.com/"]`
  - Needed so the extension can call the Gemini API endpoint.

- `content_scripts.matches: ["https://chatgpt.com/*"]`
  - The prompt-capture logic runs only on ChatGPT.

Privacy posture (based on code):
- Conversation index is local to the browser profile.
- If you set an API key, **your prompt text is sent to Gemini** for keyword extraction (and candidate list is sent for AI ranking).
- If you do **not** set an API key, the extension uses a local “simple” keyword extractor.

---

## 4) How it works (data flow)

### A) Capturing a prompt on chatgpt.com (`content.js`)

1. On page load, `content.js` checks `aIrrange_isCapturingEnabled`.
2. If enabled:
   - It listens to `input` events and caches the current prompt box content (`#prompt-textarea`) via `innerText`.
   - It listens for `keydown` and when you press **Enter** (without Shift) inside the prompt box:
     - It waits **1.5 seconds** (to allow ChatGPT to generate/navigate to a conversation URL)
     - It sends a message to the background service worker:
       - `type: "newSearch"`
       - `payload: { query: <promptText>, url: window.location.href }`

### B) Keyword extraction + saving (`background.js`)

When background receives `newSearch`:

1. It **normalizes** the URL (removes query/hash; ensures ChatGPT `/c/<id>` format).
2. It generates keywords:
   - **Primary:** `getKeywordsFromGemini(query)`
     - Reads `aIrrange_geminiApiKey`
     - POSTs to Gemini model `gemini-1.5-flash-latest:generateContent`
     - Expects a comma-separated keyword list
   - **Fallback:** `extractKeywordsSimple(query)`
     - Extracts 3+ letter words, lowercases, dedupes via `Set`
3. It upserts into `chrome.storage.local.conversations`:
   - If URL already exists: merges keywords (set union) and sorts.
   - Else: creates a new entry and `unshift`s it to the front (newest first).

### C) Popup UI (latest 3) (`popup.html` / `popup.js`)

Popup shows:
- A toggle (“Are you ready for it?”) bound to `aIrrange_isCapturingEnabled`
- API key settings UI:
  - Save/remove `aIrrange_geminiApiKey`
- Latest 3 conversations from `conversations` with their keyword chips
- Link to open the full history page: `all.html`

### D) Full history + AI-assisted search (`all.html` / `all.js`)

On load:
- `all.js` requests all conversations by messaging background:
  - `type: "getAllConversations"`

AI search workflow:
1. User types a query and presses Enter.
2. The page pre-filters candidates **locally** by checking if any keyword contains any search term.
3. If candidates exist and API key is present, it asks background to rank them:
   - `type: "performAiSearch"`
   - `payload: { query, candidates }`
4. Background calls Gemini with a prompt that asks for the **single best matching URL**.
5. The UI highlights the best matching conversation in the list and scrolls it into view.

---

## 5) “Web accessible resources” (why `all.html` works)

`manifest.json` declares:

```json
"web_accessible_resources": [
  {
    "resources": ["all.html", "all.js", "all.css"],
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
| `background.js` | Extracts keywords, persists `conversations`, serves history + AI ranking |
| `popup.html` / `popup.js` | Popup UI: toggle, API key, latest 3 conversations |
| `all.html` / `all.js` / `all.css` | Full history page + AI-assisted search |
| `icons/icon.svg` | Icon |

---

## 8) Known limitations / assumptions (from code)

- **ChatGPT DOM coupling:** It assumes the prompt element id is `prompt-textarea`. If ChatGPT changes its DOM, capture may break.
- **Timing heuristic:** It waits 1.5s before reading `window.location.href` to capture the new conversation URL; slow networks or UI changes may affect correctness.
- **Gemini output format:** Keyword extraction assumes Gemini returns a comma-separated list.
- **No dedupe by content:** Conversations are deduped by normalized URL only.

---

## 9) If you want to extend it

Common next improvements:
- Store `title`/first prompt snippet for a friendlier UI than showing conversation id.
- Add delete/export/import for `conversations`.
- Improve keyword extraction prompt + parsing (handle bullet lists, newlines, etc.).
- Add a non-AI search mode in `all.html` (pure keyword search) as a fallback.
