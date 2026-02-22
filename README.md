# aIrrange Universal

**Your Universal LLM Second Brain: Local, Private, and AI-Powered.**

aIrrange Universal is a **Chrome Extension (MV3)** that indexes your LLM conversations (currently **ChatGPT** + **Claude**) into a **local searchable database**. It adds fast retrieval (dashboard + omnibox), privacy controls, and exports designed for tools like **Notion** and **Obsidian**.

---

## Key Features

- **100% Local Index (Dexie.js / IndexedDB):** Your conversation index lives in IndexedDB for scale and speed.
- **Privacy Sanitizer:** Prompts are sanitized (emails + phone numbers redacted) before any optional external LLM call.
- **Universal Provider Support via Adapters:** Site-specific capture logic is implemented using an **Adapter Pattern**.
- **Omnibox Quick Search:** Type `air <query>` in Chrome’s address bar to search your history.
- **Context Menu Search:** Select text anywhere → right click → **“Search in aIrrange”**.
- **Dashboard Search:** Professional multi-field search over **title, summary, tags** with debounce for large histories.
- **Fuzzy Search Foundations:** Keywords are normalized via **stemming** and indexed via **trigrams** to enable typo-tolerant matching and better pluralization handling.
- **Notion/Obsidian Export:**
  - **CSV (Notion-friendly)** with BOM + standard property headers.
  - **Markdown ZIP** with YAML frontmatter (Obsidian-friendly).

---

## Setup (Developer Mode)

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this repository folder

### Build (required)
This project uses **esbuild** to bundle MV3 entrypoints so the extension can use npm deps like `stemmer`.

```bash
npm install
npm run build
```

Bundled outputs:
- `src/content.bundle.js` (content script)
- `src/background.bundle.js` (service worker)
- `popup.bundle.js` (popup UI)
- `all.bundle.js` (dashboard UI)

---

## Adding API Keys (Optional)

API keys are stored **locally** in `chrome.storage.local` in an “API Vault” structure.

1. Open the extension popup → **Settings**
2. Choose a provider (Gemini / OpenAI / Anthropic / OpenRouter)
3. Paste your key and click **Save**
4. (Optional) choose a **Model** (e.g. `gpt-4o-mini` vs `gpt-4o`)
5. Click **Test** to validate the key

No key? The extension still works and falls back to local keyword extraction.

---

## How to Use

### 1) Capture
- Visit `https://chatgpt.com/` or `https://claude.ai/` and chat normally.
- Prompts are captured via MutationObserver-based adapters (no `setTimeout` heuristics).

### 2) Search
- **Dashboard:** open “See All Your History” from the popup.
- **Omnibox:** type `air` in the address bar, press Tab/Space, then type your query.
- **Right-click:** select any text → **Search in aIrrange**.

Search scoring behavior:
- Exact substring matches are always included (baseline score).
- Trigram query-overlap similarity provides typo tolerance and better partial matching.

### 3) Export
In the dashboard settings:
- **Export as Markdown (ZIP)**
- **Export as CSV** (optimized for Notion import)

---

## Architecture (for contributors)

- **Dexie.js (IndexedDB)** for the local conversation index: `src/db/database.js`
- **Adapter Pattern** for provider support:
  - `src/adapters/BaseAdapter.js`
  - `src/adapters/ChatGPTAdapter.js`
  - `src/adapters/ClaudeAdapter.js`
- **Background Service Worker** orchestrates:
  - prompt sanitization
  - LLM keyword generation (optional)
  - omnibox + context menu integration

### MV3 module resolution (why bundling is required)
Chrome extension pages/service workers cannot resolve bare npm module specifiers at runtime. We bundle all entrypoints (background/popup/dashboard/content) so imports like `import { stemmer } from 'stemmer'` work.

See also: `memory-bank/` and `WHAT_IT_DOES.md`.

---

## License (MIT)

MIT License

Copyright (c) 2025 Anirudh Arora

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
