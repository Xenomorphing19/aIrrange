# Tech Context — aIrrange Universal

## Runtime / Platform
- **Chrome Extension**
- **Manifest Version:** MV3
- **Background:** service worker (ES module)
- **Content scripts:** run on supported LLM chat sites (starting with `https://chatgpt.com/*`)

## Languages
- JavaScript (ES2020+)

## Local Data Layer
- **Dexie.js** for IndexedDB access.
- IndexedDB is used for the conversation index to ensure **privacy** and **scalability**.
- `chrome.storage.local` is reserved for settings + API keys only.

## Dependencies
- `dexie`

## Build / Bundling
- Content scripts cannot be ES modules, so we bundle `src/content.js` → `src/content.bundle.js`.
- Bundler: `esbuild` (dev dependency)
- Command:
  - `npm run build`

## LLM Provider API Routing (Big 3, native)
LLM calls are made from the background service worker (and settings UI for testing) using provider-native endpoints.

### Gemini (native REST)
- Models list:
  - `GET https://generativelanguage.googleapis.com/v1beta/models?key=...`
- Text generation:
  - `POST https://generativelanguage.googleapis.com/v1beta/models/{modelId}:generateContent?key=...`
- Notes:
  - API key is passed in the **URL query string**.
  - Payload uses `contents[].parts[].text`.

### OpenAI
- Models list:
  - `GET https://api.openai.com/v1/models` (Bearer token)
- Chat completions:
  - `POST https://api.openai.com/v1/chat/completions`

### Anthropic
- Models list:
  - `GET https://api.anthropic.com/v1/models`
- Messages:
  - `POST https://api.anthropic.com/v1/messages`
- Required header for browser/extension calls:
  - `anthropic-dangerously-allow-browser: true`

## Model discovery + selection (per provider)
On successful “Test Connection”, the UI fetches models from the provider and auto-selects a smart default.

Storage keys in `chrome.storage.local`:
- API vault:
  - `aIrrange_api_vault: { selected, keys: { gemini, openai, anthropic } }`
- Per-provider model selection:
  - `aIrrange_model_gemini`
  - `aIrrange_model_openai`
  - `aIrrange_model_anthropic`

Default model heuristic:
- Gemini: prefer `*2.5-flash*` then `*2.0-flash*` then `*flash*`
- OpenAI: prefer models containing `mini`
- Anthropic: prefer models containing `haiku`

## Vendored runtime libraries
To avoid bare module specifier resolution issues at runtime (MV3), we vendor:
- `vendor/dexie.mjs`
- `vendor/jszip.min.js`

## Browser APIs used / expected
- `chrome.runtime.sendMessage` / `chrome.runtime.onMessage`
- `chrome.storage.local`
- `MutationObserver` (content script reliability)
- (Optional future) `chrome.webNavigation` for navigation awareness

## Fork redirect + landing nudge
The “Start New Chat” action uses a URL-flag handshake:
- Redirect target includes `?airrange_fork=true`
- On landing, the content script shows a short “Paste (Ctrl+V)” toast and immediately strips the flag via `history.replaceState`.

## Extension packaging constraints
- MV3 service workers do not have DOM access.
- UI pages (popup/history) can import Dexie and access IndexedDB.
- Content scripts can also use Dexie, but it’s generally cleaner to keep DB writes in extension contexts; if content scripts write, be careful about initialization and versioning.

## Build system
- Content script is bundled (esbuild) into `src/content.bundle.js`.
- Background and UI pages run as ES modules.
