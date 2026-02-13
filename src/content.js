import { ChatGPTAdapter } from './adapters/ChatGPTAdapter.js';
import { ClaudeAdapter } from './adapters/ClaudeAdapter.js';

/**
 * Content script entry.
 *
 * Uses an AdapterRegistry to choose the right provider adapter based on hostname,
 * then forwards standardized adapter events to the background service worker.
 */

class AdapterRegistry {
  /** @returns {import('./adapters/BaseAdapter.js').BaseAdapter | null} */
  static createForCurrentSite() {
    const host = location.hostname;
    if (host === 'chatgpt.com') return new ChatGPTAdapter();
    if (host === 'claude.ai') return new ClaudeAdapter();
    return null;
  }
}

const adapter = AdapterRegistry.createForCurrentSite();

if (!adapter) {
  // Content script may be injected on additional sites in the future.
  console.log('[aIrrange] No adapter registered for', location.hostname);
} else {
  console.log('[aIrrange] Adapter started:', adapter.provider, 'on', location.href);
  // Notify background which provider is active on this tab.
  chrome.runtime.sendMessage({
    type: 'PROVIDER_ACTIVE',
    payload: { provider: adapter.provider, url: location.href, timestamp: Date.now() }
  });

  adapter.onUrlChange((url) => {
    console.log('[aIrrange] URL changed:', url);
    chrome.runtime.sendMessage({
      type: 'URL_CHANGED',
      payload: { url, provider: adapter.provider, timestamp: Date.now() }
    });
  });

  adapter.start((message) => {
    console.log('[aIrrange] Adapter event:', message);
    // Standardized adapter event -> background
    // Ensure provider is always present.
    chrome.runtime.sendMessage({
      type: 'ADAPTER_EVENT',
      provider: adapter.provider,
      ...message
    });
  });
}
