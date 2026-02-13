import { BaseAdapter } from './BaseAdapter.js';

/**
 * ChatGPTAdapter
 *
 * Goals:
 * - Observe prompt submissions and title changes without setTimeout.
 * - Emit standardized payloads to the caller.
 *
 * Notes:
 * - ChatGPT is a SPA; URL changes via history API.
 * - DOM is subject to change; keep logic defensive.
 */
export class ChatGPTAdapter extends BaseAdapter {
  constructor() {
    super({ provider: 'chatgpt' });

    /** @type {MutationObserver | null} */
    this._observer = null;

    /** @type {((payload: any) => void) | null} */
    this._emit = null;

    /** @type {((url: string) => void) | null} */
    this._onUrlChangeCb = null;

    this._lastUrl = location.href;
    this._lastTitle = null;
    this._lastSubmittedPrompt = null;

    // Bindings
    this._handleMutations = this._handleMutations.bind(this);
  }

  /**
   * Start observing the page.
   * @param {(payload: any) => void} emit
   */
  start(emit) {
    this._emit = emit;

    console.log('[aIrrange][ChatGPTAdapter] start');

    if (this._observer) this._observer.disconnect();

    // Observe entire document; ideally we can scope later once stable containers are identified.
    this._observer = new MutationObserver(this._handleMutations);
    this._observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true
    });

    // Also patch history methods to reliably detect SPA URL changes.
    this._patchHistoryForUrlChanges();

    // Emit initial state if possible.
    this._maybeEmitConversationUpdate('init');
  }

  stop() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }

  getPrompt() {
    // Current known selector (may change): prompt-textarea contenteditable
    const promptDiv = document.getElementById('prompt-textarea');
    if (promptDiv && typeof promptDiv.innerText === 'string') {
      const text = promptDiv.innerText.trim();
      return text ? text : null;
    }
    return null;
  }

  getConversationTitle() {
    // Heuristic: prefer document.title. ChatGPT typically uses "ChatGPT" plus chat title.
    const title = (document.title || '').trim();
    return title ? title : null;
  }

  onUrlChange(callback) {
    this._onUrlChangeCb = callback;
  }

  _patchHistoryForUrlChanges() {
    // Avoid patching multiple times.
    if (window.__aIrrange_historyPatched) return;
    window.__aIrrange_historyPatched = true;

    const notify = () => {
      if (location.href !== this._lastUrl) {
        this._lastUrl = location.href;
        if (this._onUrlChangeCb) this._onUrlChangeCb(this._lastUrl);
        this._maybeEmitConversationUpdate('url_change');
      }
    };

    const origPush = history.pushState;
    history.pushState = function (...args) {
      // @ts-ignore
      const res = origPush.apply(this, args);
      notify();
      return res;
    };

    const origReplace = history.replaceState;
    history.replaceState = function (...args) {
      // @ts-ignore
      const res = origReplace.apply(this, args);
      notify();
      return res;
    };

    window.addEventListener('popstate', notify);
  }

  _handleMutations(mutations) {
    // Debug: summarize mutation targets occasionally
    // (keep lightweight to avoid spamming too hard)
    let sawPromptAreaMutation = false;

    // 1) Detect URL changes even if history patch misses something.
    if (location.href !== this._lastUrl) {
      this._lastUrl = location.href;
      if (this._onUrlChangeCb) this._onUrlChangeCb(this._lastUrl);
      this._maybeEmitConversationUpdate('url_change_dom');
    }

    // 2) Detect prompt submission.
    // We can’t rely on click selectors; detect when prompt box becomes empty after being non-empty
    // while focus is/was in prompt area.
    // This is heuristic but avoids timeouts.
    for (const m of mutations) {
      const target = /** @type {any} */ (m.target);
      if (target && (target.id === 'prompt-textarea' || target.closest?.('#prompt-textarea'))) {
        sawPromptAreaMutation = true;
        break;
      }
    }

    if (sawPromptAreaMutation) {
      console.log('[aIrrange][ChatGPTAdapter] prompt area mutated');
      const current = this.getPrompt();
      console.log('[aIrrange][ChatGPTAdapter] current prompt:', current);
      // If previously there was text and now it’s empty, treat as submit.
      if (this._lastSubmittedPrompt && !current) {
        console.log('[aIrrange][ChatGPTAdapter] detected submit:', this._lastSubmittedPrompt);
        this._emitStandardPayload({
          reason: 'prompt_submitted',
          prompt: this._lastSubmittedPrompt
        });
        this._lastSubmittedPrompt = null;
        // Also emit conversation update because URL/title may have changed.
        this._maybeEmitConversationUpdate('after_submit');
      }

      // Update last prompt cache if user is typing.
      if (current) this._lastSubmittedPrompt = current;
    }

    // 3) Detect title change (document.title changes via mutation or other).
    const title = this.getConversationTitle();
    if (title && title !== this._lastTitle) {
      this._lastTitle = title;
      this._maybeEmitConversationUpdate('title_change');
    }
  }

  _conversationIdFromUrl(url) {
    // Normalize ChatGPT URL to conversation id if present.
    const match = url.match(/\/c\/([^/?#]+)/);
    return match ? match[1] : null;
  }

  _maybeEmitConversationUpdate(reason) {
    const url = location.href;
    const id = this._conversationIdFromUrl(url) || url;
    const title = this.getConversationTitle() || '';

    if (!this._emit) return;

    this._emit({
      type: 'CONVERSATION_UPDATE',
      payload: {
        id,
        url,
        title,
        provider: this.provider,
        timestamp: Date.now()
      },
      meta: { reason }
    });
  }

  _emitStandardPayload({ reason, prompt }) {
    if (!this._emit) return;
    const url = location.href;
    const id = this._conversationIdFromUrl(url) || url;
    const title = this.getConversationTitle() || '';
    this._emit({
      type: 'PROMPT_SUBMITTED',
      payload: {
        id,
        url,
        title,
        provider: this.provider,
        prompt_snippet: (prompt || '').slice(0, 280),
        timestamp: Date.now()
      },
      meta: { reason }
    });
  }
}
