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
    /**
     * Register a handler that is called whenever the prompt input changes.
     * Implementations should debounce.
     *
     * @abstract
     * @param {(promptText: string) => void} callback
     */
    onInputChanged(callback) {
      throw new Error("onInputChanged() not implemented");
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
      this._submissionIntent = false;
      this._onKeyDown = null;
      this._onClick = null;
      this._onInputCb = null;
      this._liveInputInstalled = false;
      this._delegatedInputHandler = null;
      this._delegatedPasteHandler = null;
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
      this._installSubmissionIntentListeners();
      this._ensureLiveInputListenerInstalled();
      this._maybeEmitConversationUpdate("init");
    }
    stop() {
      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }
      if (this._onKeyDown) window.removeEventListener("keydown", this._onKeyDown, true);
      if (this._onClick) window.removeEventListener("click", this._onClick, true);
      this._onKeyDown = null;
      this._onClick = null;
      if (this._delegatedInputHandler) {
        document.body?.removeEventListener?.("input", this._delegatedInputHandler, true);
        this._delegatedInputHandler = null;
      }
      if (this._delegatedPasteHandler) {
        document.body?.removeEventListener?.("paste", this._delegatedPasteHandler, true);
        this._delegatedPasteHandler = null;
      }
    }
    _installSubmissionIntentListeners() {
      if (this._onKeyDown || this._onClick) return;
      this._onKeyDown = (e) => {
        if (e.key !== "Enter" || e.shiftKey) return;
        const t = (
          /** @type {any} */
          e.target
        );
        if (t && (t.id === "prompt-textarea" || t.closest?.("#prompt-textarea"))) {
          this._submissionIntent = true;
        }
      };
      this._onClick = (e) => {
        const el = (
          /** @type {any} */
          e.target
        );
        const btn = el?.closest?.("button");
        if (!btn) return;
        const label = String(btn.getAttribute?.("aria-label") || btn.title || btn.textContent || "").toLowerCase();
        if (label.includes("send")) {
          this._submissionIntent = true;
        }
      };
      window.addEventListener("keydown", this._onKeyDown, true);
      window.addEventListener("click", this._onClick, true);
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
        const text = this.getPrompt() || "";
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => this._onInputCb(text), 500);
      };
      const isPromptTarget = (t) => t && (t.id === "prompt-textarea" || t.closest?.("#prompt-textarea"));
      this._delegatedInputHandler = (e) => {
        const t = (
          /** @type {any} */
          e.target
        );
        if (isPromptTarget(t)) schedule();
      };
      this._delegatedPasteHandler = (e) => {
        const t = (
          /** @type {any} */
          e.target
        );
        if (!isPromptTarget(t)) return;
        setTimeout(() => schedule(), 50);
      };
      document.body?.addEventListener?.("input", this._delegatedInputHandler, true);
      document.body?.addEventListener?.("paste", this._delegatedPasteHandler, true);
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
        const current = this.getPrompt();
        console.log("[aIrrange][ChatGPTAdapter] current prompt:", current);
        if (this._lastSubmittedPrompt && !current && this._submissionIntent) {
          console.log("[aIrrange][ChatGPTAdapter] detected submit:", this._lastSubmittedPrompt);
          this._emitStandardPayload({
            reason: "prompt_submitted",
            prompt: this._lastSubmittedPrompt
          });
          this._lastSubmittedPrompt = null;
          this._submissionIntent = false;
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
      this._onInputCb = null;
      this._liveInputInstalled = false;
      this._delegatedInputHandler = null;
      this._delegatedPasteHandler = null;
    }
    start(emit) {
      this._emit = emit;
      if (this._observer) this._observer.disconnect();
      this._observer = new MutationObserver(this._handleMutations);
      this._observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true });
      this._patchHistoryForUrlChanges();
      this._ensureLiveInputListenerInstalled();
      this._maybeEmitConversationUpdate("init");
    }
    stop() {
      if (this._observer) this._observer.disconnect();
      this._observer = null;
      if (this._delegatedInputHandler) {
        document.body?.removeEventListener?.("input", this._delegatedInputHandler, true);
        this._delegatedInputHandler = null;
      }
      if (this._delegatedPasteHandler) {
        document.body?.removeEventListener?.("paste", this._delegatedPasteHandler, true);
        this._delegatedPasteHandler = null;
      }
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
        const text = this.getPrompt() || "";
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => this._onInputCb(text), 500);
      };
      const isPromptTarget = (t) => t?.getAttribute?.("contenteditable") === "true" || t?.closest?.('[contenteditable="true"]');
      this._delegatedInputHandler = (e) => {
        const t = (
          /** @type {any} */
          e.target
        );
        if (isPromptTarget(t)) schedule();
      };
      this._delegatedPasteHandler = (e) => {
        const t = (
          /** @type {any} */
          e.target
        );
        if (!isPromptTarget(t)) return;
        setTimeout(() => schedule(), 50);
      };
      document.body?.addEventListener?.("input", this._delegatedInputHandler, true);
      document.body?.addEventListener?.("paste", this._delegatedPasteHandler, true);
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
  console.log("[DEVIATION DEBUG] Content script loaded. URL:", window.location.href);
  console.log("[aIrrange] Content script loaded. URL:", window.location.href);
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
  var __airrangeCurrentChatState = null;
  function updateChatStateAndLog() {
    if (!adapter) return;
    const state = isNewChatPage(adapter.provider, location.href) ? "new" : "existing";
    if (state !== __airrangeCurrentChatState) {
      __airrangeCurrentChatState = state;
      if (state === "existing") {
        console.log("[DEVIATION DEBUG] Existing chat state detected. Ready to listen for deviation.");
      }
    }
  }
  function isNewChatPage(provider, url) {
    const href = String(url || location.href);
    if (provider === "chatgpt") return !href.includes("/c/");
    if (provider === "claude") {
      return href.includes("/new") || !/\/chat\//.test(href);
    }
    return false;
  }
  function getConversationIdFromUrl(provider, url) {
    const href = String(url || location.href);
    if (provider === "chatgpt") {
      const m = href.match(/\/c\/([^/?#]+)/);
      return m ? m[1] : null;
    }
    if (provider === "claude") {
      const m = href.match(/\/chat\/([^/?#]+)/);
      return m ? m[1] : null;
    }
    return null;
  }
  function newChatUrlForProvider(provider) {
    if (provider === "chatgpt") return "https://chatgpt.com/";
    if (provider === "claude") return "https://claude.ai/new";
    return "about:blank";
  }
  function escapeHtml(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function renderDejaVuToast(matches) {
    if (!Array.isArray(matches) || matches.length === 0) {
      document.querySelectorAll(".airrange-dejavu-toast").forEach((n) => n.remove());
      return;
    }
    const existing = document.querySelector(".airrange-dejavu-toast");
    const el = existing || document.createElement("div");
    el.className = "airrange-dejavu-toast";
    if (!existing) el.dataset.dismissed = "false";
    if (el.dataset.dismissed === "true") return;
    ensureDejaVuStyles();
    el.innerHTML = `
    <div class="airrange-dejavu-row">
      <div class="airrange-dejavu-left">
        <div class="airrange-dejavu-title">\u{1F9E0} D\xE9j\xE0 Vu</div>
        <div class="airrange-dejavu-sub">
          You discussed this in
          ${matches.slice(0, 3).map((m) => {
      const title = escapeHtml(m.title || m.summary || "Conversation");
      const url = escapeHtml(m.url || "#");
      const provider = escapeHtml(String(m.provider || "unknown").toUpperCase());
      return `<a class="airrange-dejavu-link" href="${url}" target="_blank" rel="noopener noreferrer"><span class="airrange-dejavu-badge">${provider}</span> ${title}</a>`;
    }).join('<span class="airrange-dejavu-sep"> \xB7 </span>')}
        </div>
      </div>
      <button class="airrange-dejavu-close" type="button" aria-label="Dismiss">\u2715</button>
    </div>
    <div class="airrange-dejavu-branding">\u26A1 aIrrange</div>
  `;
    const closeBtn = el.querySelector(".airrange-dejavu-close");
    closeBtn?.addEventListener("click", () => {
      el.dataset.dismissed = "true";
      el.remove();
    });
    const prompt = document.getElementById("prompt-textarea") || document.querySelector('[contenteditable="true"]');
    const anchor = prompt?.closest?.("form") || prompt?.parentElement || document.body;
    const anchorEl = (
      /** @type {HTMLElement} */
      anchor
    );
    const anchorStyle = window.getComputedStyle(anchorEl);
    if (anchorStyle.position === "static") {
      anchorEl.style.position = "relative";
    }
    el.style.position = "absolute";
    el.style.left = "0";
    el.style.right = "0";
    el.style.bottom = "calc(100% + 10px)";
    el.style.zIndex = "2147483647";
    if (!existing) {
      anchorEl.appendChild(el);
    }
  }
  function ensureDejaVuStyles() {
    if (document.getElementById("airrange-dejavu-styles")) return;
    const style = document.createElement("style");
    style.id = "airrange-dejavu-styles";
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
  var __airrangeIgnoredDeviationPrompts = /* @__PURE__ */ new Set();
  function renderDeviationToast({ provider, promptText, onStartNewChat, onIgnore }) {
    document.querySelectorAll(".airrange-deviation-toast").forEach((n) => n.remove());
    ensureDejaVuStyles();
    const el = document.createElement("div");
    el.className = "airrange-deviation-toast";
    el.innerHTML = `
    <div class="airrange-dejavu-row">
      <div class="airrange-dejavu-left">
        <div class="airrange-dejavu-title">\u26A0\uFE0F Topic Deviation Detected. Starting a new chat keeps your history clean.</div>
        <div class="airrange-dejavu-sub">(AI can incorrectly flag this. Please ignore if you don't agree with the flag.)</div>
      </div>
      <button class="airrange-dejavu-close" type="button" aria-label="Dismiss">\u2715</button>
    </div>
    <div class="airrange-deviation-actions">
      <button class="airrange-deviation-primary" type="button">Start New Chat</button>
      <button class="airrange-deviation-secondary" type="button">Ignore</button>
    </div>
    <div class="airrange-dejavu-branding">\u26A1 aIrrange</div>
  `;
    el.style.position = "absolute";
    el.style.left = "0";
    el.style.right = "0";
    el.style.bottom = "calc(100% + 10px)";
    el.style.zIndex = "2147483647";
    el.style.border = "1px solid rgba(250, 204, 21, 0.35)";
    ensureDeviationStyles();
    const closeBtn = el.querySelector(".airrange-dejavu-close");
    closeBtn?.addEventListener("click", () => {
      el.remove();
    });
    el.querySelector(".airrange-deviation-primary")?.addEventListener("click", () => onStartNewChat?.());
    el.querySelector(".airrange-deviation-secondary")?.addEventListener("click", () => onIgnore?.());
    const prompt = document.getElementById("prompt-textarea") || document.querySelector('[contenteditable="true"]');
    const anchor = prompt?.closest?.("form") || prompt?.parentElement || document.body;
    const anchorEl = (
      /** @type {HTMLElement} */
      anchor
    );
    const anchorStyle = window.getComputedStyle(anchorEl);
    if (anchorStyle.position === "static") anchorEl.style.position = "relative";
    anchorEl.appendChild(el);
  }
  function ensureDeviationStyles() {
    if (document.getElementById("airrange-deviation-styles")) return;
    const style = document.createElement("style");
    style.id = "airrange-deviation-styles";
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
    console.log("[aIrrange] No adapter registered for", location.hostname);
  } else {
    console.log("[aIrrange] Adapter started:", adapter.provider, "on", location.href);
    chrome.runtime.sendMessage({
      type: "PROVIDER_ACTIVE",
      payload: { provider: adapter.provider, url: location.href, timestamp: Date.now() }
    });
    adapter.onUrlChange((url) => {
      console.log("[aIrrange] URL changed:", url);
      updateChatStateAndLog();
      chrome.runtime.sendMessage({
        type: "URL_CHANGED",
        payload: { url, provider: adapter.provider, timestamp: Date.now() }
      });
    });
    adapter.onInputChanged(async (promptText) => {
      updateChatStateAndLog();
      const q = String(promptText || "").trim();
      if (!q) {
        document.querySelectorAll(".airrange-dejavu-toast").forEach((n) => n.dataset.dismissed = "false");
        renderDejaVuToast([]);
        return;
      }
      if (!isNewChatPage(adapter.provider, location.href)) {
        renderDejaVuToast([]);
        const convoId = getConversationIdFromUrl(adapter.provider, location.href);
        if (!convoId) return;
        if (__airrangeIgnoredDeviationPrompts.has(q)) return;
        if (window.__airrangeDeviationTimer) clearTimeout(window.__airrangeDeviationTimer);
        window.__airrangeDeviationTimer = setTimeout(() => {
          console.log("[DEVIATION DEBUG] Debounce fired. URL:", window.location.href, "Prompt:", q);
          console.log("[DEVIATION DEBUG] Sending CHECK_DEVIATION for ID:", convoId);
          chrome.runtime.sendMessage(
            { type: "CHECK_DEVIATION", payload: { conversationId: convoId, currentPrompt: q } },
            async (res) => {
              console.log("[DEVIATION DEBUG] Received response:", res);
              if (!res?.ok) return;
              if (!res?.deviated) {
                document.querySelectorAll(".airrange-deviation-toast").forEach((n) => n.remove());
                return;
              }
              renderDeviationToast({
                provider: adapter.provider,
                promptText: q,
                onStartNewChat: async () => {
                  const btn = document.querySelector(".airrange-deviation-primary");
                  try {
                    await navigator.clipboard.writeText(q);
                  } catch (e) {
                    console.warn("[DEVIATION DEBUG] Clipboard write failed:", e);
                  }
                  if (btn) {
                    btn.textContent = "Copied! Redirecting...";
                    btn.disabled = true;
                  }
                  alert(
                    "Prompt copied to clipboard!\n\nStarting a new chat... just paste (Ctrl+V) and hit enter."
                  );
                  const targetUrl = newChatUrlForProvider(adapter.provider);
                  console.log("[aIrrange] Redirecting to:", targetUrl);
                  window.location.href = targetUrl;
                },
                onIgnore: () => {
                  __airrangeIgnoredDeviationPrompts.add(q);
                  document.querySelectorAll(".airrange-deviation-toast").forEach((n) => n.remove());
                }
              });
            }
          );
        }, 1e3);
        return;
      }
      chrome.runtime.sendMessage({ type: "LIVE_SEARCH", payload: { query: q } }, (res) => {
        const matches = res?.ok ? res.matches || [] : [];
        renderDejaVuToast(matches);
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
