const VAULT_KEY = 'aIrrange_api_vault';

import { generateTrigrams, normalizeAndStem } from './searchUtils.js';

/**
 * Big-3 providers only.
 * @typedef {'gemini'|'openai'|'anthropic'} Provider
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
      keys: {}
    }
  );
}

function defaultModelForProvider(provider) {
  // Intentionally not user-configurable to reduce UI confusion.
  switch (provider) {
    case 'gemini':
      return 'gemini-1.5-flash';
    case 'openai':
      return 'gpt-4o-mini';
    case 'anthropic':
      return 'claude-3-haiku-20240307';
    default:
      return 'gpt-4o-mini';
  }
}

export class LLMClient {
  /** @returns {Promise<{provider: Provider, apiKey: string | null, model: string}>} */
  async getActiveProviderAndKey() {
    const vault = await readVault();
    const provider = vault.selected || 'gemini';
    const apiKey = (vault.keys && vault.keys[provider]) ? String(vault.keys[provider]).trim() : '';
    const model = defaultModelForProvider(provider);
    return { provider, apiKey: apiKey || null, model };
  }

  /**
   * Fetch available model IDs for a provider.
   * @param {Provider} provider
   * @param {string} apiKey
   * @returns {Promise<string[]>}
   */
  async getAvailableModels(provider, apiKey) {
    if (!apiKey) return [];

    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) throw new Error(`gemini models failed: ${res.status} ${await res.text()}`);
      const data = await res.json();
      const models = Array.isArray(data?.models) ? data.models : [];
      // Keep only text/chat style models that support generateContent.
      return models
        .map((m) => String(m?.name || '').replace(/^models\//, '').trim())
        .filter(Boolean)
        .filter((name) => !/\b(veo|imagen)\b/i.test(name));
    }

    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      if (!res.ok) throw new Error(`openai models failed: ${res.status} ${await res.text()}`);
      const data = await res.json();
      const models = Array.isArray(data?.data) ? data.data : [];
      return models
        .map((m) => String(m?.id || '').trim())
        .filter(Boolean)
        // crude filter: keep GPT chat models
        .filter((id) => /^gpt-/i.test(id));
    }

    if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/models', {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerously-allow-browser': 'true'
        }
      });
      if (!res.ok) throw new Error(`anthropic models failed: ${res.status} ${await res.text()}`);
      const data = await res.json();
      const models = Array.isArray(data?.data) ? data.data : Array.isArray(data?.models) ? data.models : [];
      return models
        .map((m) => String(m?.id || m?.name || '').trim())
        .filter(Boolean);
    }

    return [];
  }

  /**
   * Reads the saved model for the given provider from chrome.storage.local.
   * @param {Provider} provider
   * @returns {Promise<string | null>}
   */
  async getSavedModel(provider) {
    const key = `aIrrange_model_${provider}`;
    const result = await chrome.storage.local.get(key);
    const v = String(result?.[key] || '').trim();
    return v || null;
  }

  /**
   * @param {string} promptText
   * @returns {Promise<{summary: string, keywords: string[], stemmed_tags: string[], trigrams: string[]}>}
   */
  async generateKeywords(promptText) {
    const { provider, apiKey } = await this.getActiveProviderAndKey();
    if (!apiKey) throw new Error('No API key available');

    const savedModel = await this.getSavedModel(provider);

    const system =
      'You are a metadata assistant. Summarize the following user intent in one short sentence and extract 3-5 keywords. Return ONLY a JSON object: {"summary": "...", "keywords": ["...", "..."]}';

    const content = await callProvider({ provider, apiKey, model: savedModel, system, user: promptText });
    const parsed = parseJsonOnly(content);

    // Bulletproof stemming/trigram generation: LLMs can return malformed JSON types.
    let stemmed_tags = [];
    let trigrams = [];
    try {
      const keywords = parsed?.keywords;
      const safeKeywords = Array.isArray(keywords) ? keywords : [];
      stemmed_tags = [...new Set(safeKeywords.map((k) => normalizeAndStem(k)).flat())];
      trigrams = [...new Set(stemmed_tags.map((t) => generateTrigrams(t)).flat())];
    } catch (error) {
      console.error('[aIrrange] Failed to generate stems/trigrams:', error);
    }

    return { ...parsed, stemmed_tags, trigrams };
  }

  /**
   * Connection test for the currently selected provider.
   * @returns {Promise<{ok: true} | {ok:false, error:string}>}
   */
  async testConnection() {
    const { provider, apiKey } = await this.getActiveProviderAndKey();
    if (!apiKey) return { ok: false, error: 'No API key set for selected provider' };

    try {
      // Minimal provider-specific auth check
      if (provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: { Authorization: `Bearer ${apiKey}` }
        });
        if (!res.ok) return { ok: false, error: `openai auth failed: ${res.status} ${await res.text()}` };
        return { ok: true };
      }

      if (provider === 'anthropic') {
        const res = await fetch('https://api.anthropic.com/v1/models', {
          method: 'GET',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerously-allow-browser': 'true'
          }
        });
        if (!res.ok) return { ok: false, error: `anthropic auth failed: ${res.status} ${await res.text()}` };
        return { ok: true };
      }

      if (provider === 'gemini') {
        // Gemini doesn't have a lightweight unauthenticated models endpoint; do a 1-token noop.
        await callGeminiNative({ apiKey, system: 'Return only the word OK.', user: '' });
        return { ok: true };
      }

      return { ok: false, error: `Unknown provider: ${provider}` };
    } catch (e) {
      return { ok: false, error: String(e?.message || e) };
    }
  }

  /**
   * Cheap structured check to decide if a prompt deviates from a conversation summary.
   * Returns ONLY: { deviated: boolean }
   *
   * @param {{ summary: string, currentPrompt: string }} args
   * @returns {Promise<{deviated: boolean}>}
   */
  async checkDeviation({ summary, currentPrompt }) {
    const { provider, apiKey } = await this.getActiveProviderAndKey();
    if (!apiKey) throw new Error('No API key available');

    const savedModel = await this.getSavedModel(provider);

    const system =
      `You are a context guardrail. The current conversation summary is: '${String(summary || '')}'. ` +
      `The user is typing a new prompt: '${String(currentPrompt || '')}'. ` +
      'Does this new prompt represent a completely unrelated topic (e.g., jumping from cars to ice cream)? ' +
      'Respond strictly with JSON: {"deviated": true/false }.';

    const content = await callProvider({ provider, apiKey, model: savedModel, system, user: currentPrompt });

    const raw = String(content || '').trim();
    const cleaned = raw
      // Strip fenced code blocks like ```json ... ```
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/i, '')
      .trim();

    // Also try to extract the first JSON object if extra text exists.
    const jsonCandidate = (cleaned.match(/\{[\s\S]*\}/) || [])[0] || cleaned;
    try {
      const obj = JSON.parse(jsonCandidate);
      return { deviated: Boolean(obj?.deviated) };
    } catch (e) {
      console.error('[DEVIATION DEBUG] Failed to parse LLM JSON. Raw:', raw);
      console.error('[DEVIATION DEBUG] Failed to parse LLM JSON. Cleaned:', cleaned);
      console.error('[DEVIATION DEBUG] Failed to parse LLM JSON. Candidate:', jsonCandidate);
      throw e;
    }
  }
}

async function callProvider({ provider, apiKey, model, system, user }) {
  /** @type {Provider} */
  const p = provider;
  switch (p) {
    case 'gemini':
      return callGeminiNative({ apiKey, model, system, user });
    case 'openai':
      return callOpenAI({ apiKey, model, system, user });
    case 'anthropic':
      return callAnthropic({ apiKey, model, system, user });
    default:
      throw new Error(`Unsupported provider: ${String(provider)}`);
  }
}

/**
 * Pick a smart default model from a fetched list.
 * @param {Provider} provider
 * @param {string[]} models
 */
export function getDefaultModel(provider, models) {
  const list = Array.isArray(models) ? models.filter(Boolean) : [];
  if (list.length === 0) return null;

  const lower = list.map((m) => String(m).toLowerCase());

  if (provider === 'gemini') {
    // Prefer newer flash models
    const preferred = ['2.5-flash', '2.0-flash', 'flash'];
    for (const key of preferred) {
      const idx = lower.findIndex((m) => m.includes(key));
      if (idx >= 0) return list[idx];
    }
  }

  if (provider === 'openai') {
    const idx = lower.findIndex((m) => m.includes('mini'));
    if (idx >= 0) return list[idx];
  }

  if (provider === 'anthropic') {
    const idx = lower.findIndex((m) => m.includes('haiku'));
    if (idx >= 0) return list[idx];
  }

  return list[0];
}

async function callGeminiNative({ apiKey, model, system, user }) {
  const modelId = String(model || '').trim() || defaultModelForProvider('gemini');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelId)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: `${String(system || '')}\n\n${String(user || '')}`.trim() }]
        }
      ]
    })
  });
  if (!res.ok) {
    throw new Error(`gemini request failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return String(data?.candidates?.[0]?.content?.parts?.[0]?.text || '');
}

async function callAnthropic({ apiKey, model, system, user }) {
  const modelId = String(model || '').trim() || defaultModelForProvider('anthropic');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerously-allow-browser': 'true'
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: 1024,
      system: String(system || ''),
      messages: [{ role: 'user', content: String(user || '') }]
    })
  });
  if (!res.ok) {
    throw new Error(`anthropic request failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return String(data?.content?.[0]?.text || '');
}

async function callOpenAI({ apiKey, model, system, user }) {
  const modelId = String(model || '').trim() || defaultModelForProvider('openai');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: 'system', content: String(system || '') },
        { role: 'user', content: String(user || '') }
      ]
    })
  });
  if (!res.ok) {
    throw new Error(`openai request failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return String(data?.choices?.[0]?.message?.content || '');
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
