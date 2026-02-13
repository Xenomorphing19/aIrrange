const VAULT_KEY = 'aIrrange_api_vault';

/**
 * @typedef {'gemini'|'openai'|'anthropic'|'openrouter'} Provider
 */

/**
 * Reads the API vault from chrome.storage.local.
 * @returns {Promise<{selected: Provider, keys: Record<string,string>, models?: Record<string,string>}>}
 */
async function readVault() {
  const result = await chrome.storage.local.get(VAULT_KEY);
  const vault = result[VAULT_KEY];
  return (
    vault ?? {
      selected: 'gemini',
      keys: {},
      models: {}
    }
  );
}

export class LLMClient {
  /** @returns {Promise<{provider: Provider, apiKey: string | null, model: string}>} */
  async getActiveProviderAndKey() {
    const vault = await readVault();
    const provider = vault.selected || 'gemini';
    const apiKey = (vault.keys && vault.keys[provider]) ? String(vault.keys[provider]).trim() : '';
    const model = (vault.models && vault.models[provider]) ? String(vault.models[provider]).trim() : 'gpt-4o-mini';
    return { provider, apiKey: apiKey || null, model: model || 'gpt-4o-mini' };
  }

  /**
   * @param {string} promptText
   * @returns {Promise<{summary: string, keywords: string[]}>}
   */
  async generateKeywords(promptText) {
    const { provider, apiKey, model } = await this.getActiveProviderAndKey();
    if (!apiKey) throw new Error('No API key available');

    const system =
      'You are a metadata assistant. Summarize the following user intent in one short sentence and extract 3-5 keywords. Return ONLY a JSON object: {"summary": "...", "keywords": ["...", "..."]}';

    const endpoint = endpointForProvider(provider);
    const { content } = await callOpenAICompatibleAPI({ endpoint, provider, apiKey, model, system, user: promptText });
    return parseJsonOnly(content);
  }

  /**
   * Gemini-only connection test.
   * @returns {Promise<{ok: true} | {ok:false, error:string}>}
   */
  async testConnection() {
    const { provider, apiKey } = await this.getActiveProviderAndKey();
    if (!apiKey) return { ok: false, error: 'No API key set for selected provider' };

    const url = modelsListEndpointForProvider(provider);
    const headers = headersForProvider(provider, apiKey);
    const res = await fetch(url, { method: 'GET', headers });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `${provider} auth failed: ${res.status} ${body}` };
    }
    return { ok: true };
  }
}

function endpointForProvider(provider) {
  switch (provider) {
    case 'gemini':
      return 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
    case 'openai':
      return 'https://api.openai.com/v1/chat/completions';
    case 'anthropic':
      // Not truly OpenAI compatible; we still route through our helper with Anthropic headers.
      // We’ll use their Messages API instead.
      return 'https://api.anthropic.com/v1/messages';
    case 'openrouter':
      return 'https://openrouter.ai/api/v1/chat/completions';
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

function modelsListEndpointForProvider(provider) {
  switch (provider) {
    case 'gemini':
      return 'https://generativelanguage.googleapis.com/v1beta/openai/models';
    case 'openai':
      return 'https://api.openai.com/v1/models';
    case 'anthropic':
      return 'https://api.anthropic.com/v1/models';
    case 'openrouter':
      return 'https://openrouter.ai/api/v1/models';
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

function headersForProvider(provider, apiKey) {
  /** @type {Record<string,string>} */
  const headers = { 'Content-Type': 'application/json' };
  if (provider === 'anthropic') {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
    return headers;
  }
  headers.Authorization = `Bearer ${apiKey}`;
  return headers;
}

/**
 * Unified helper for providers that *mostly* speak OpenAI chat-completions.
 * Anthropic is handled as a special case.
 */
async function callOpenAICompatibleAPI({ endpoint, provider, apiKey, model, system, user }) {
  if (provider === 'anthropic') {
    // Anthropic Messages API
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: headersForProvider(provider, apiKey),
      body: JSON.stringify({
        model,
        max_tokens: 300,
        system,
        messages: [{ role: 'user', content: user }]
      })
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Anthropic request failed: ${res.status} ${body}`);
    }
    const data = await res.json();
    const content = data?.content?.[0]?.text;
    return { content };
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: headersForProvider(provider, apiKey),
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature: 0.2
    })
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${provider} request failed: ${res.status} ${body}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  return { content };
}

function parseJsonOnly(text) {
  const raw = String(text || '').trim();
  // Try direct parse first
  try {
    const obj = JSON.parse(raw);
    return normalizeKeywordResult(obj);
  } catch {
    // Try to extract first JSON object substring
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('LLM did not return JSON');
    const obj = JSON.parse(match[0]);
    return normalizeKeywordResult(obj);
  }
}

function normalizeKeywordResult(obj) {
  const summary = typeof obj?.summary === 'string' ? obj.summary.trim() : '';
  const keywordsRaw = Array.isArray(obj?.keywords) ? obj.keywords : [];
  const keywords = keywordsRaw
    .map((k) => String(k).trim())
    .filter(Boolean)
    .slice(0, 8);
  if (!summary && keywords.length === 0) {
    throw new Error('LLM returned empty metadata');
  }
  return { summary, keywords };
}
