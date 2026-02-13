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

## Vendored runtime libraries
To avoid bare module specifier resolution issues at runtime (MV3), we vendor:
- `vendor/dexie.mjs`
- `vendor/jszip.min.js`

## Browser APIs used / expected
- `chrome.runtime.sendMessage` / `chrome.runtime.onMessage`
- `chrome.storage.local`
- `MutationObserver` (content script reliability)
- (Optional future) `chrome.webNavigation` for navigation awareness

## Extension packaging constraints
- MV3 service workers do not have DOM access.
- UI pages (popup/history) can import Dexie and access IndexedDB.
- Content scripts can also use Dexie, but it’s generally cleaner to keep DB writes in extension contexts; if content scripts write, be careful about initialization and versioning.

## Build system
- None yet (no bundler). Keep source in `src/` and reference it directly from `manifest.json`.
