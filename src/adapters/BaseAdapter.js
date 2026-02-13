/**
 * BaseAdapter
 *
 * Site-specific adapters (ChatGPT, Claude, etc.) must extend this class.
 * Adapters run in the content-script context.
 */
export class BaseAdapter {
  /** @param {{ provider: string }} opts */
  constructor(opts) {
    if (!opts?.provider) throw new Error('BaseAdapter requires opts.provider');
    this.provider = opts.provider;

    if (new.target === BaseAdapter) {
      throw new Error('BaseAdapter is abstract and cannot be instantiated directly.');
    }
  }

  /**
   * Return the current prompt text (the user’s input) if available.
   * @abstract
   * @returns {string | null}
   */
  getPrompt() {
    throw new Error('getPrompt() not implemented');
  }

  /**
   * Return the current conversation title if available.
   * @abstract
   * @returns {string | null}
   */
  getConversationTitle() {
    throw new Error('getConversationTitle() not implemented');
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
    throw new Error('onUrlChange() not implemented');
  }
}
