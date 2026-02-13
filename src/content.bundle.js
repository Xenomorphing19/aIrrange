(() => {
  // src/adapters/BaseAdapter.js
  var BaseAdapter = class _BaseAdapter {
    /** @param {{ provider: string }} opts */
    constructor(opts) {
      if (!opts?.provider) throw new Error("BaseAdapter requires opts.provider");
      this.provider = opts.provider;
      if (new.target === _BaseAdapter) {
        throw new Error("BaseAdapter is abstract and cannot be instantiated directly.");
      }
    }
    /**
     * Return the current prompt text (the user’s input) if available.
     * @abstract
     * @returns {string | null}
     */
    getPrompt() {
      throw new Error("getPrompt() not implemented");
    }
    /**
     * Return the current conversation title if available.
     * @abstract
     * @returns {string | null}
     */
    getConversationTitle() {
      throw new Error("getConversationTitle() not implemented");
    }
    /**
     * Register a handler that is called whenever the URL changes (SPA navigation).
     * The adapter must implement a reliable detection method (MutationObserver and/or
     * history API patching). No setTimeout.
     *
     * @abstract
     * @param {(url: string) => void} callback
     */
    onUrlChange(callback) {
      throw new Error("onUrlChange() not implemented");
    }
  };

  // src/adapters/ChatGPTAdapter.js
  var ChatGPTAdapter = class extends BaseAdapter {
    constructor() {
      super({ provider: "chatgpt" });
      this._observer = null;
      this._emit = null;
      this._onUrlChangeCb = null;
      this._lastUrl = location.href;
      this._lastTitle = null;
      this._lastSubmittedPrompt = null;
      this._handleMutations = this._handleMutations.bind(this);
    }
    /**
     * Start observing the page.
     * @param {(payload: any) => void} emit
     */
    start(emit) {
      this._emit = emit;
      console.log("[aIrrange][ChatGPTAdapter] start");
      if (this._observer) this._observer.disconnect();
      this._observer = new MutationObserver(this._handleMutations);
      this._observer.observe(document.documentElement, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true
      });
      this._patchHistoryForUrlChanges();
      this._maybeEmitConversationUpdate("init");
    }
    stop() {
      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }
    }
    getPrompt() {
      const promptDiv = document.getElementById("prompt-textarea");
      if (promptDiv && typeof promptDiv.innerText === "string") {
        const text = promptDiv.innerText.trim();
        return text ? text : null;
      }
      return null;
    }
    getConversationTitle() {
      const title = (document.title || "").trim();
      return title ? title : null;
    }
    onUrlChange(callback) {
      this._onUrlChangeCb = callback;
    }
    _patchHistoryForUrlChanges() {
      if (window.__aIrrange_historyPatched) return;
      window.__aIrrange_historyPatched = true;
      const notify = () => {
        if (location.href !== this._lastUrl) {
          this._lastUrl = location.href;
          if (this._onUrlChangeCb) this._onUrlChangeCb(this._lastUrl);
          this._maybeEmitConversationUpdate("url_change");
        }
      };
      const origPush = history.pushState;
      history.pushState = function(...args) {
        const res = origPush.apply(this, args);
        notify();
        return res;
      };
      const origReplace = history.replaceState;
      history.replaceState = function(...args) {
        const res = origReplace.apply(this, args);
        notify();
        return res;
      };
      window.addEventListener("popstate", notify);
    }
    _handleMutations(mutations) {
      let sawPromptAreaMutation = false;
      if (location.href !== this._lastUrl) {
        this._lastUrl = location.href;
        if (this._onUrlChangeCb) this._onUrlChangeCb(this._lastUrl);
        this._maybeEmitConversationUpdate("url_change_dom");
      }
      for (const m of mutations) {
        const target = (
          /** @type {any} */
          m.target
        );
        if (target && (target.id === "prompt-textarea" || target.closest?.("#prompt-textarea"))) {
          sawPromptAreaMutation = true;
          break;
        }
      }
      if (sawPromptAreaMutation) {
        console.log("[aIrrange][ChatGPTAdapter] prompt area mutated");
        const current = this.getPrompt();
        console.log("[aIrrange][ChatGPTAdapter] current prompt:", current);
        if (this._lastSubmittedPrompt && !current) {
          console.log("[aIrrange][ChatGPTAdapter] detected submit:", this._lastSubmittedPrompt);
          this._emitStandardPayload({
            reason: "prompt_submitted",
            prompt: this._lastSubmittedPrompt
          });
          this._lastSubmittedPrompt = null;
          this._maybeEmitConversationUpdate("after_submit");
        }
        if (current) this._lastSubmittedPrompt = current;
      }
      const title = this.getConversationTitle();
      if (title && title !== this._lastTitle) {
        this._lastTitle = title;
        this._maybeEmitConversationUpdate("title_change");
      }
    }
    _conversationIdFromUrl(url) {
      const match = url.match(/\/c\/([^/?#]+)/);
      return match ? match[1] : null;
    }
    _maybeEmitConversationUpdate(reason) {
      const url = location.href;
      const id = this._conversationIdFromUrl(url) || url;
      const title = this.getConversationTitle() || "";
      if (!this._emit) return;
      this._emit({
        type: "CONVERSATION_UPDATE",
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
      const title = this.getConversationTitle() || "";
      this._emit({
        type: "PROMPT_SUBMITTED",
        payload: {
          id,
          url,
          title,
          provider: this.provider,
          prompt_snippet: (prompt || "").slice(0, 280),
          timestamp: Date.now()
        },
        meta: { reason }
      });
    }
  };

  // src/adapters/ClaudeAdapter.js
  var ClaudeAdapter = class extends BaseAdapter {
    constructor() {
      super({ provider: "claude" });
      this._observer = null;
      this._emit = null;
      this._onUrlChangeCb = null;
      this._lastUrl = location.href;
      this._lastTitle = null;
      this._lastSubmittedPrompt = null;
      this._handleMutations = this._handleMutations.bind(this);
    }
    start(emit) {
      this._emit = emit;
      if (this._observer) this._observer.disconnect();
      this._observer = new MutationObserver(this._handleMutations);
      this._observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true });
      this._patchHistoryForUrlChanges();
      this._maybeEmitConversationUpdate("init");
    }
    stop() {
      if (this._observer) this._observer.disconnect();
      this._observer = null;
    }
    getPrompt() {
      const active = document.activeElement;
      if (active && active.getAttribute?.("contenteditable") === "true") {
        const t = active.innerText?.trim?.();
        return t ? t : null;
      }
      const candidates = Array.from(document.querySelectorAll('[contenteditable="true"]'));
      for (let i = candidates.length - 1; i >= 0; i--) {
        const el = candidates[i];
        const t = el.innerText?.trim?.();
        if (t) return t;
      }
      return null;
    }
    getConversationTitle() {
      const title = (document.title || "").trim();
      return title ? title : null;
    }
    onUrlChange(cb) {
      this._onUrlChangeCb = cb;
    }
    _patchHistoryForUrlChanges() {
      if (window.__aIrrange_claudeHistoryPatched) return;
      window.__aIrrange_claudeHistoryPatched = true;
      const notify = () => {
        if (location.href !== this._lastUrl) {
          this._lastUrl = location.href;
          if (this._onUrlChangeCb) this._onUrlChangeCb(this._lastUrl);
          this._maybeEmitConversationUpdate("url_change");
        }
      };
      const origPush = history.pushState;
      history.pushState = function(...args) {
        const res = origPush.apply(this, args);
        notify();
        return res;
      };
      const origReplace = history.replaceState;
      history.replaceState = function(...args) {
        const res = origReplace.apply(this, args);
        notify();
        return res;
      };
      window.addEventListener("popstate", notify);
    }
    _handleMutations(mutations) {
      if (location.href !== this._lastUrl) {
        this._lastUrl = location.href;
        if (this._onUrlChangeCb) this._onUrlChangeCb(this._lastUrl);
        this._maybeEmitConversationUpdate("url_change_dom");
      }
      let sawEditable = false;
      for (const m of mutations) {
        const t = (
          /** @type {any} */
          m.target
        );
        if (t?.getAttribute?.("contenteditable") === "true" || t?.closest?.('[contenteditable="true"]')) {
          sawEditable = true;
          break;
        }
      }
      if (sawEditable) {
        const current = this.getPrompt();
        if (this._lastSubmittedPrompt && !current) {
          this._emitPrompt(this._lastSubmittedPrompt);
          this._lastSubmittedPrompt = null;
          this._maybeEmitConversationUpdate("after_submit");
        }
        if (current) this._lastSubmittedPrompt = current;
      }
      const title = this.getConversationTitle();
      if (title && title !== this._lastTitle) {
        this._lastTitle = title;
        this._maybeEmitConversationUpdate("title_change");
      }
    }
    _conversationIdFromUrl(url) {
      const match = url.match(/\/chat\/([^/?#]+)/);
      return match ? match[1] : null;
    }
    _maybeEmitConversationUpdate(reason) {
      if (!this._emit) return;
      const url = location.href;
      const id = this._conversationIdFromUrl(url) || url;
      const title = this.getConversationTitle() || "";
      this._emit({
        type: "CONVERSATION_UPDATE",
        payload: { id, url, title, provider: this.provider, timestamp: Date.now() },
        meta: { reason }
      });
    }
    _emitPrompt(prompt) {
      if (!this._emit) return;
      const url = location.href;
      const id = this._conversationIdFromUrl(url) || url;
      const title = this.getConversationTitle() || "";
      this._emit({
        type: "PROMPT_SUBMITTED",
        payload: {
          id,
          url,
          title,
          provider: this.provider,
          prompt_snippet: String(prompt || "").slice(0, 280),
          timestamp: Date.now()
        },
        meta: { reason: "prompt_submitted" }
      });
    }
  };

  // src/content.js
  var AdapterRegistry = class {
    /** @returns {import('./adapters/BaseAdapter.js').BaseAdapter | null} */
    static createForCurrentSite() {
      const host = location.hostname;
      if (host === "chatgpt.com") return new ChatGPTAdapter();
      if (host === "claude.ai") return new ClaudeAdapter();
      return null;
    }
  };
  var adapter = AdapterRegistry.createForCurrentSite();
  if (!adapter) {
    console.log("[aIrrange] No adapter registered for", location.hostname);
  } else {
    console.log("[aIrrange] Adapter started:", adapter.provider, "on", location.href);
    chrome.runtime.sendMessage({
      type: "PROVIDER_ACTIVE",
      payload: { provider: adapter.provider, url: location.href, timestamp: Date.now() }
    });
    adapter.onUrlChange((url) => {
      console.log("[aIrrange] URL changed:", url);
      chrome.runtime.sendMessage({
        type: "URL_CHANGED",
        payload: { url, provider: adapter.provider, timestamp: Date.now() }
      });
    });
    adapter.start((message) => {
      console.log("[aIrrange] Adapter event:", message);
      chrome.runtime.sendMessage({
        type: "ADAPTER_EVENT",
        provider: adapter.provider,
        ...message
      });
    });
  }
})();
