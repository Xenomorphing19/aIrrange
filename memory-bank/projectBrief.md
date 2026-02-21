# Project Brief — aIrrange Universal

## Goal
Build **aIrrange Universal**, a **Chrome Extension (Manifest V3)** that indexes a user’s conversations with LLM/chat products (ChatGPT, Claude, etc.) into a **local searchable index**.

The extension should:
- Capture a minimal, user-valuable representation of each conversation (e.g., URL/id, title, timestamps, extracted keywords).
- Enable fast local search and browsing.
- Be extensible to multiple providers via a clean adapter architecture.

## Non‑Negotiables (Core Architecture Rules)

### 1) Data Privacy
- **100% local storage** for the conversation index.
- Use **Dexie.js (IndexedDB)** for the index database.
- Use **`chrome.storage.local` only** for:
  - API keys (if any)
  - user settings / feature toggles
  - non-sensitive configuration

### 2) Extensibility
- Use an **Adapter Pattern**.
- All site-specific scraping/capture logic must inherit from a shared **`BaseAdapter`**.
- Each adapter is responsible for:
  - determining if it supports the current site/page
  - extracting conversation metadata
  - observing page changes reliably
  - emitting normalized records for storage

### 3) Reliability
- Strictly forbid using **`setTimeout`** to detect page changes/navigation.
- Use one of:
  - **MutationObserver** (DOM-driven apps)
  - **`chrome.webNavigation`** events (navigation-driven detection)

## Key Deliverables
- A working MV3 extension skeleton.
- Dexie-backed IndexedDB schema for conversation index.
- Adapter framework + at least one adapter (ChatGPT) demonstrating the pattern.
- UI for browsing/searching local history.

## Current Status (Implemented)
- MV3 extension with background service worker, omnibox keyword `air`, and context menu integration.
- Dexie (IndexedDB) data layer with conversations + tags.
- Adapters:
  - ChatGPT adapter
  - Claude adapter
- UI:
  - Popup (latest 3 conversations, provider/key/model vault)
  - Dashboard (card UI, multi-field search, exports, safe delete)
- Injected in-product UX nudges:
  - **Déjà Vu** toast on *new chat pages* (shows top 3 similar prior conversations)
  - **Topic Deviation** toast on *existing chats* (warns when draft prompt diverges from conversation context)
- Export:
  - Notion-friendly CSV (UTF-8 BOM)
  - Markdown ZIP with YAML frontmatter

## LLM integration (Big 3)
The extension supports **native API calls** to:
- **Gemini** (Google Generative Language API, native `generateContent`)
- **OpenAI** (`/v1/chat/completions`)
- **Anthropic** (`/v1/messages` with `anthropic-dangerously-allow-browser: true`)

The extension also supports **dynamic model discovery + per-provider model selection**:
- On “Test Connection”, models are fetched from the provider and a smart default is auto-selected and saved.
- Stored per provider in `chrome.storage.local` (see Tech Context).

## Success Criteria
- Captures and updates conversation index entries without leaking data remotely.
- Robust against SPA navigation (no time-based heuristics).
- Adding a new provider is straightforward: implement a new adapter class and register it.
