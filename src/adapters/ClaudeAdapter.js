import { BaseAdapter } from './BaseAdapter.js';

/**
 * ClaudeAdapter (claude.ai)
 *
 * Claude is also SPA-like. This adapter is intentionally defensive because DOM
 * can change. We use MutationObserver and basic heuristics:
 * - Prompt: first focused/primary contenteditable region.
 * - Title: document.title as a safe fallback.
 */
export class ClaudeAdapter extends BaseAdapter {
  constructor() {
    super({ provider: 'claude' });

    /** @type {MutationObserver | null} */
    this._observer = null;
    /** @type {((payload: any) => void) | null} */
    this._emit = null;
    /** @type {((url: string) => void) | null} */
    this._onUrlChangeCb = null;

    this._lastUrl = location.href;
    this._lastTitle = null;
    this._lastSubmittedPrompt = null;
    this._handleMutations = this._handleMutations.bind(this);

    /** @type {((promptText: string) => void) | null} */
    this._onInputCb = null;
    /** @type {boolean} */
    this._liveInputInstalled = false;

    /** @type {((e: Event) => void) | null} */
    this._delegatedInputHandler = null;

    /** @type {((e: ClipboardEvent) => void) | null} */
    this._delegatedPasteHandler = null;
  }

  start(emit) {
    this._emit = emit;
    if (this._observer) this._observer.disconnect();
    this._observer = new MutationObserver(this._handleMutations);
    this._observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true });
    this._patchHistoryForUrlChanges();
    this._ensureLiveInputListenerInstalled();

    this._maybeEmitConversationUpdate('init');
  }

  stop() {
    if (this._observer) this._observer.disconnect();
    this._observer = null;

    if (this._delegatedInputHandler) {
      document.body?.removeEventListener?.('input', this._delegatedInputHandler, true);
      this._delegatedInputHandler = null;
    }

    if (this._delegatedPasteHandler) {
      document.body?.removeEventListener?.('paste', this._delegatedPasteHandler, true);
      this._delegatedPasteHandler = null;
    }
  }

  getPrompt() {
    // Claude commonly uses contenteditable=true prompt area.
    const active = document.activeElement;
    if (active && active.getAttribute?.('contenteditable') === 'true') {
      const t = active.innerText?.trim?.();
      return t ? t : null;
    }

    const candidates = Array.from(document.querySelectorAll('[contenteditable="true"]'));
    // Heuristic: choose the last contenteditable (often the input) with some text or placeholder.
    for (let i = candidates.length - 1; i >= 0; i--) {
      const el = candidates[i];
      const t = el.innerText?.trim?.();
      if (t) return t;
    }
    return null;
  }

  getConversationTitle() {
    const title = (document.title || '').trim();
    return title ? title : null;
  }

  onUrlChange(cb) {
    this._onUrlChangeCb = cb;
  }

  /**
   * Debounced prompt-input listener for live search.
   * @param {(promptText: string) => void} callback
   */
  onInputChanged(callback) {
    if (this._onInputCb) return;
    this._onInputCb = callback;
  }

  _ensureLiveInputListenerInstalled() {
    if (this._liveInputInstalled) return;
    this._liveInputInstalled = true;

    let timer = null;
    const schedule = () => {
      if (!this._onInputCb) return;
      const text = this.getPrompt() || '';
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => this._onInputCb(text), 500);
    };

    const isPromptTarget = (t) => t?.getAttribute?.('contenteditable') === 'true' || t?.closest?.('[contenteditable="true"]');

    this._delegatedInputHandler = (e) => {
      const t = /** @type {any} */ (e.target);
      if (isPromptTarget(t)) schedule();
    };

    this._delegatedPasteHandler = (e) => {
      const t = /** @type {any} */ (e.target);
      if (!isPromptTarget(t)) return;
      setTimeout(() => schedule(), 50);
    };

    document.body?.addEventListener?.('input', this._delegatedInputHandler, true);
    document.body?.addEventListener?.('paste', this._delegatedPasteHandler, true);
  }

  _patchHistoryForUrlChanges() {
    if (window.__aIrrange_claudeHistoryPatched) return;
    window.__aIrrange_claudeHistoryPatched = true;

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
    if (location.href !== this._lastUrl) {
      this._lastUrl = location.href;
      if (this._onUrlChangeCb) this._onUrlChangeCb(this._lastUrl);
      this._maybeEmitConversationUpdate('url_change_dom');
    }

    // prompt submission heuristic: prompt becomes empty after being non-empty
    let sawEditable = false;
    for (const m of mutations) {
      const t = /** @type {any} */ (m.target);
      if (t?.getAttribute?.('contenteditable') === 'true' || t?.closest?.('[contenteditable="true"]')) {
        sawEditable = true;
        break;
      }
    }
    if (sawEditable) {
      const current = this.getPrompt();
      if (this._lastSubmittedPrompt && !current) {
        this._emitPrompt(this._lastSubmittedPrompt);
        this._lastSubmittedPrompt = null;
        this._maybeEmitConversationUpdate('after_submit');
      }
      if (current) this._lastSubmittedPrompt = current;
    }

    const title = this.getConversationTitle();
    if (title && title !== this._lastTitle) {
      this._lastTitle = title;
      this._maybeEmitConversationUpdate('title_change');
    }
  }

  _conversationIdFromUrl(url) {
    // Claude URLs often include /chat/<id> or /new; fallback to full URL.
    const match = url.match(/\/chat\/([^/?#]+)/);
    return match ? match[1] : null;
  }

  _maybeEmitConversationUpdate(reason) {
    if (!this._emit) return;
    const url = location.href;
    const id = this._conversationIdFromUrl(url) || url;
    const title = this.getConversationTitle() || '';
    this._emit({
      type: 'CONVERSATION_UPDATE',
      payload: { id, url, title, provider: this.provider, timestamp: Date.now() },
      meta: { reason }
    });
  }

  _emitPrompt(prompt) {
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
        prompt_snippet: String(prompt || '').slice(0, 280),
        timestamp: Date.now()
      },
      meta: { reason: 'prompt_submitted' }
    });
  }
}
