import { ChatGPTAdapter } from './adapters/ChatGPTAdapter.js';
import { ClaudeAdapter } from './adapters/ClaudeAdapter.js';

console.log('[DEVIATION DEBUG] Content script loaded. URL:', window.location.href);
console.log('[aIrrange] Content script loaded. URL:', window.location.href);

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

let __airrangeCurrentChatState = null; // 'new' | 'existing' | null

function updateChatStateAndLog() {
  if (!adapter) return;
  const state = isNewChatPage(adapter.provider, location.href) ? 'new' : 'existing';
  if (state !== __airrangeCurrentChatState) {
    __airrangeCurrentChatState = state;
    if (state === 'existing') {
      console.log('[DEVIATION DEBUG] Existing chat state detected. Ready to listen for deviation.');
    }
  }
}

function isNewChatPage(provider, url) {
  const href = String(url || location.href);
  if (provider === 'chatgpt') return !href.includes('/c/');
  if (provider === 'claude') {
    // Heuristic: Claude new chat pages often include /new or lack /chat/<id>
    return href.includes('/new') || !/\/chat\//.test(href);
  }
  return false;
}

function getConversationIdFromUrl(provider, url) {
  const href = String(url || location.href);
  if (provider === 'chatgpt') {
    const m = href.match(/\/c\/([^/?#]+)/);
    return m ? m[1] : null;
  }
  if (provider === 'claude') {
    const m = href.match(/\/chat\/([^/?#]+)/);
    return m ? m[1] : null;
  }
  return null;
}

function newChatUrlForProvider(provider) {
  if (provider === 'chatgpt') return 'https://chatgpt.com/';
  if (provider === 'claude') return 'https://claude.ai/new';
  return 'about:blank';
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderDejaVuToast(matches) {
  // Remove if empty
  if (!Array.isArray(matches) || matches.length === 0) {
    document.querySelectorAll('.airrange-dejavu-toast').forEach((n) => n.remove());
    return;
  }

  const existing = document.querySelector('.airrange-dejavu-toast');
  const el = existing || document.createElement('div');
  el.className = 'airrange-dejavu-toast';

  // Allow user dismissal until they clear input.
  if (!existing) el.dataset.dismissed = 'false';
  if (el.dataset.dismissed === 'true') return;

  // Ensure we have our stylesheet once.
  ensureDejaVuStyles();

  el.innerHTML = `
    <div class="airrange-dejavu-row">
      <div class="airrange-dejavu-left">
        <div class="airrange-dejavu-title">🧠 Déjà Vu</div>
        <div class="airrange-dejavu-sub">
          You discussed this in
          ${matches
            .slice(0, 3)
            .map((m) => {
              const title = escapeHtml(m.title || m.summary || 'Conversation');
              const url = escapeHtml(m.url || '#');
              const provider = escapeHtml(String(m.provider || 'unknown').toUpperCase());
              return `<a class="airrange-dejavu-link" href="${url}" target="_blank" rel="noopener noreferrer"><span class="airrange-dejavu-badge">${provider}</span> ${title}</a>`;
            })
            .join('<span class="airrange-dejavu-sep"> · </span>')}
        </div>
      </div>
      <button class="airrange-dejavu-close" type="button" aria-label="Dismiss">✕</button>
    </div>
    <div class="airrange-dejavu-branding">⚡ aIrrange</div>
  `;

  // Dismiss button
  const closeBtn = el.querySelector('.airrange-dejavu-close');
  closeBtn?.addEventListener('click', () => {
    el.dataset.dismissed = 'true';
    el.remove();
  });

  // Insert above prompt container if possible, else at end of body.
  const prompt = document.getElementById('prompt-textarea') || document.querySelector('[contenteditable="true"]');

  // Prefer absolute positioning relative to a stable anchor container.
  const anchor = prompt?.closest?.('form') || prompt?.parentElement || document.body;
  const anchorEl = /** @type {HTMLElement} */ (anchor);

  // Ensure anchor is positionable.
  const anchorStyle = window.getComputedStyle(anchorEl);
  if (anchorStyle.position === 'static') {
    anchorEl.style.position = 'relative';
  }

  // Position toast just above anchor.
  el.style.position = 'absolute';
  el.style.left = '0';
  el.style.right = '0';
  el.style.bottom = 'calc(100% + 10px)';
  el.style.zIndex = '2147483647';

  if (!existing) {
    anchorEl.appendChild(el);
  }
}

function ensureDejaVuStyles() {
  if (document.getElementById('airrange-dejavu-styles')) return;
  const style = document.createElement('style');
  style.id = 'airrange-dejavu-styles';
  style.textContent = `
    @keyframes airrangeFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

    .airrange-dejavu-toast {
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
      font-size: 12px;
      line-height: 1.35;
      color: rgba(255,255,255,0.92);
      background: rgba(0,0,0,0.68);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 8px;
      padding: 10px 12px;
      max-width: 760px;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 12px 30px rgba(0,0,0,0.28);
      animation: airrangeFadeIn 0.3s ease-in-out;
    }

    .airrange-dejavu-row { display: flex; gap: 10px; align-items: flex-start; justify-content: space-between; }
    .airrange-dejavu-title { font-weight: 800; letter-spacing: 0.2px; margin-bottom: 4px; }
    .airrange-dejavu-sub { color: rgba(255,255,255,0.82); }
    .airrange-dejavu-link { color: rgba(147,197,253,0.95); text-decoration: none; white-space: nowrap; }
    .airrange-dejavu-link:hover { text-decoration: underline; }
    .airrange-dejavu-sep { color: rgba(255,255,255,0.35); margin: 0 6px; }

    .airrange-dejavu-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 999px;
      margin-right: 6px;
      background: rgba(255,255,255,0.10);
      border: 1px solid rgba(255,255,255,0.12);
      color: rgba(255,255,255,0.9);
      vertical-align: middle;
    }

    .airrange-dejavu-close {
      border: none;
      background: transparent;
      color: rgba(255,255,255,0.75);
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
      padding: 2px 4px;
    }
    .airrange-dejavu-close:hover { color: rgba(255,255,255,0.98); }

    .airrange-dejavu-branding {
      font-size: 10px;
      opacity: 0.55;
      color: rgba(255,255,255,0.55);
      text-align: right;
      margin-top: 6px;
      user-select: none;
      pointer-events: none;
    }
  `;
  document.documentElement.appendChild(style);
}

let __airrangeIgnoredDeviationPrompts = new Set();


function renderDeviationToast({ provider, promptText, onStartNewChat, onIgnore }) {
  // Remove existing deviation toast if any.
  document.querySelectorAll('.airrange-deviation-toast').forEach((n) => n.remove());
  ensureDejaVuStyles();

  const el = document.createElement('div');
  el.className = 'airrange-deviation-toast';
  el.innerHTML = `
    <div class="airrange-dejavu-row">
      <div class="airrange-dejavu-left">
        <div class="airrange-dejavu-title">⚠️ Topic Deviation Detected. Starting a new chat keeps your history clean.</div>
        <div class="airrange-dejavu-sub">(AI can incorrectly flag this. Please ignore if you don't agree with the flag.)</div>
      </div>
      <button class="airrange-dejavu-close" type="button" aria-label="Dismiss">✕</button>
    </div>
    <div class="airrange-deviation-actions">
      <button class="airrange-deviation-primary" type="button">Start New Chat</button>
      <button class="airrange-deviation-secondary" type="button">Ignore</button>
    </div>
    <div class="airrange-dejavu-branding">⚡ aIrrange</div>
  `;

  // Styles: reuse glass base but with warning border
  el.style.position = 'absolute';
  el.style.left = '0';
  el.style.right = '0';
  el.style.bottom = 'calc(100% + 10px)';
  el.style.zIndex = '2147483647';
  el.style.border = '1px solid rgba(250, 204, 21, 0.35)';

  // Add action styles once
  ensureDeviationStyles();

  const closeBtn = el.querySelector('.airrange-dejavu-close');
  closeBtn?.addEventListener('click', () => {
    el.remove();
  });

  el.querySelector('.airrange-deviation-primary')?.addEventListener('click', () => onStartNewChat?.());
  el.querySelector('.airrange-deviation-secondary')?.addEventListener('click', () => onIgnore?.());

  const prompt = document.getElementById('prompt-textarea') || document.querySelector('[contenteditable="true"]');
  const anchor = prompt?.closest?.('form') || prompt?.parentElement || document.body;
  const anchorEl = /** @type {HTMLElement} */ (anchor);
  const anchorStyle = window.getComputedStyle(anchorEl);
  if (anchorStyle.position === 'static') anchorEl.style.position = 'relative';
  anchorEl.appendChild(el);
}

function ensureDeviationStyles() {
  if (document.getElementById('airrange-deviation-styles')) return;
  const style = document.createElement('style');
  style.id = 'airrange-deviation-styles';
  style.textContent = `
    .airrange-deviation-toast {
      background: rgba(0,0,0,0.68);
      border-radius: 8px;
      padding: 10px 12px;
      max-width: 760px;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 12px 30px rgba(0,0,0,0.28);
      animation: airrangeFadeIn 0.3s ease-in-out;
      color: rgba(255,255,255,0.92);
    }
    .airrange-deviation-actions { display: flex; gap: 8px; margin-top: 10px; }
    .airrange-deviation-actions button {
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
      font-size: 12px;
      border-radius: 8px;
      padding: 8px 10px;
      border: 1px solid rgba(255,255,255,0.14);
      cursor: pointer;
    }
    .airrange-deviation-primary {
      background: rgba(250, 204, 21, 0.18);
      border-color: rgba(250, 204, 21, 0.35);
      color: rgba(255,255,255,0.95);
    }
    .airrange-deviation-secondary {
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.9);
    }
  `;
  document.documentElement.appendChild(style);
}

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
    updateChatStateAndLog();
    chrome.runtime.sendMessage({
      type: 'URL_CHANGED',
      payload: { url, provider: adapter.provider, timestamp: Date.now() }
    });
  });

  adapter.onInputChanged(async (promptText) => {
    updateChatStateAndLog();
    const q = String(promptText || '').trim();
    if (!q) {
      // Reset dismissal when input is cleared.
      document.querySelectorAll('.airrange-dejavu-toast').forEach((n) => (n.dataset.dismissed = 'false'));
      renderDejaVuToast([]);
      return;
    }

    if (!isNewChatPage(adapter.provider, location.href)) {
      // Existing conversation: run topic deviation check (debounced in adapter is 500ms;
      // we debounce again here for 1000ms to reduce API cost).
      renderDejaVuToast([]);

      const convoId = getConversationIdFromUrl(adapter.provider, location.href);
      if (!convoId) return;
      if (__airrangeIgnoredDeviationPrompts.has(q)) return;

      // Debounce deviation checks
      if (window.__airrangeDeviationTimer) clearTimeout(window.__airrangeDeviationTimer);
      window.__airrangeDeviationTimer = setTimeout(() => {
        console.log('[DEVIATION DEBUG] Debounce fired. URL:', window.location.href, 'Prompt:', q);
        console.log('[DEVIATION DEBUG] Sending CHECK_DEVIATION for ID:', convoId);
        chrome.runtime.sendMessage(
          { type: 'CHECK_DEVIATION', payload: { conversationId: convoId, currentPrompt: q } },
          async (res) => {
            console.log('[DEVIATION DEBUG] Received response:', res);
            if (!res?.ok) return;
            if (!res?.deviated) {
              document.querySelectorAll('.airrange-deviation-toast').forEach((n) => n.remove());
              return;
            }

            renderDeviationToast({
              provider: adapter.provider,
              promptText: q,
              onStartNewChat: async () => {
                const btn = document.querySelector('.airrange-deviation-primary');
                try {
                  await navigator.clipboard.writeText(q);
                } catch (e) {
                  console.warn('[DEVIATION DEBUG] Clipboard write failed:', e);
                }

                if (btn) {
                  btn.textContent = 'Copied! Redirecting...';
                  btn.disabled = true;
                }

                // Alert & Redirect fork flow (no URL params/hashes; 100% reliable).
                alert(
                  'Prompt copied to clipboard!\n\nStarting a new chat... just paste (Ctrl+V) and hit enter.'
                );

                const targetUrl = newChatUrlForProvider(adapter.provider);
                console.log('[aIrrange] Redirecting to:', targetUrl);
                window.location.href = targetUrl;
              },
              onIgnore: () => {
                __airrangeIgnoredDeviationPrompts.add(q);
                document.querySelectorAll('.airrange-deviation-toast').forEach((n) => n.remove());
              }
            });
          }
        );
      }, 1000);
      return;
    }

    chrome.runtime.sendMessage({ type: 'LIVE_SEARCH', payload: { query: q } }, (res) => {
      const matches = res?.ok ? (res.matches || []) : [];
      renderDejaVuToast(matches);
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
