import { db } from './src/db/database.js';

document.addEventListener('DOMContentLoaded', () => {
  // --- Element References ---
  const conversationsList = document.getElementById('conversations-list');
  const toggle = document.getElementById('extension-toggle');
  const providerSelect = document.getElementById('api-provider-select');
  const apiKeyInput = document.getElementById('api-key-input');
  const modelSelect = document.getElementById('model-select');
  const saveApiKeyButton = document.getElementById('save-api-key');
  const clearApiKeyButton = document.getElementById('clear-api-key');
  const testApiKeyButton = document.getElementById('test-api-key');
  const apiKeyStatus = document.getElementById('api-key-status');

  // --- Storage Keys ---
  const toggleStorageKey = 'aIrrange_isCapturingEnabled';
  const apiVaultKey = 'aIrrange_api_vault';

  const defaultVault = {
    selected: 'gemini',
    keys: { gemini: '', openai: '', anthropic: '', openrouter: '' },
    models: { gemini: 'gpt-4o-mini', openai: 'gpt-4o-mini', anthropic: 'gpt-4o-mini', openrouter: 'gpt-4o-mini' }
  };

  const readVault = async () => {
    const result = await chrome.storage.local.get(apiVaultKey);
    const vault = result[apiVaultKey] || defaultVault;
    vault.keys = vault.keys || {};
    vault.models = vault.models || {};
    return {
      selected: vault.selected || 'gemini',
      keys: {
        gemini: vault.keys.gemini || '',
        openai: vault.keys.openai || '',
        anthropic: vault.keys.anthropic || '',
        openrouter: vault.keys.openrouter || ''
      },
      models: {
        gemini: vault.models.gemini || 'gpt-4o-mini',
        openai: vault.models.openai || 'gpt-4o-mini',
        anthropic: vault.models.anthropic || 'gpt-4o-mini',
        openrouter: vault.models.openrouter || 'gpt-4o-mini'
      }
    };
  };

  const writeVault = async (vault) => {
    await chrome.storage.local.set({ [apiVaultKey]: vault });
  };

  const setStatus = (text, color) => {
    apiKeyStatus.textContent = text;
    apiKeyStatus.style.color = color;
  };

  // --- API Vault Logic ---
  const refreshVaultUi = async () => {
    const vault = await readVault();
    providerSelect.value = vault.selected;
    apiKeyInput.value = vault.keys[vault.selected] || '';
    modelSelect.value = vault.models[vault.selected] || 'gpt-4o-mini';

    if (apiKeyInput.value.trim()) {
      setStatus('API key is stored for this provider.', 'green');
    } else {
      setStatus('No API key set for this provider.', 'orange');
    }
  };

  providerSelect.addEventListener('change', async () => {
    const vault = await readVault();
    vault.selected = providerSelect.value;
    await writeVault(vault);
    await refreshVaultUi();
  });

  modelSelect.addEventListener('change', async () => {
    const provider = providerSelect.value;
    const vault = await readVault();
    vault.models[provider] = modelSelect.value;
    await writeVault(vault);
    setStatus('Model saved.', 'green');
  });

  saveApiKeyButton.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();
    const provider = providerSelect.value;
    const vault = await readVault();
    vault.selected = provider;
    vault.keys[provider] = key;
    await writeVault(vault);
    apiKeyInput.value = '';
    setStatus('Saved!', 'green');
    await refreshVaultUi();
  });

  clearApiKeyButton.addEventListener('click', async () => {
    const provider = providerSelect.value;
    const vault = await readVault();
    vault.keys[provider] = '';
    await writeVault(vault);
    apiKeyInput.value = '';
    setStatus('Cleared key for this provider.', 'orange');
  });

  testApiKeyButton.addEventListener('click', async () => {
    const provider = providerSelect.value;
    const key = apiKeyInput.value.trim();
    if (!key) {
      setStatus('Paste an API key first.', 'orange');
      return;
    }
    setStatus('Testing...', '#3D5A80');
    try {
      const endpointMap = {
        gemini: 'https://generativelanguage.googleapis.com/v1beta/openai/models',
        openai: 'https://api.openai.com/v1/models',
        anthropic: 'https://api.anthropic.com/v1/models',
        openrouter: 'https://openrouter.ai/api/v1/models'
      };
      const url = endpointMap[provider];

      const headers = { Authorization: `Bearer ${key}` };
      if (provider === 'anthropic') {
        // Anthropic uses x-api-key + version header.
        delete headers.Authorization;
        headers['x-api-key'] = key;
        headers['anthropic-version'] = '2023-06-01';
      }

      const res = await fetch(url, { method: 'GET', headers });
      if (!res.ok) {
        const body = await res.text();
        setStatus(`Invalid key: ${res.status}`, 'red');
        console.warn(body);
        return;
      }
      setStatus('Success! Key looks valid.', 'green');
    } catch (e) {
      setStatus(`Test failed: ${String(e?.message || e)}`, 'red');
    }
  });

  // Initial paint
  refreshVaultUi();

  // --- Toggle Logic ---
  // Set the toggle's state based on the saved value.
  chrome.storage.local.get({ [toggleStorageKey]: true }, (result) => {
    toggle.checked = result[toggleStorageKey];
  });
  // Save the new state when the toggle is changed.
  toggle.addEventListener('change', () => {
    chrome.storage.local.set({ [toggleStorageKey]: toggle.checked });
  });

  // --- Display Latest Conversations Logic (Dexie / IndexedDB) ---
  const renderLatest = async () => {
    const latest = await db.conversations.orderBy('timestamp').reverse().limit(3).toArray();
    if (latest.length === 0) {
      conversationsList.innerHTML = '<li>Nothing captured yet. Go chat!</li>';
      return;
    }

    conversationsList.innerHTML = '';
    latest.forEach((convo) => {
      const listItem = document.createElement('li');

      const link = document.createElement('a');
      link.href = String(convo.url || '').includes('/c/') ? convo.url : 'https://chatgpt.com/';
      link.target = '_blank';
      link.textContent = convo.title || (convo.url?.split('/c/')?.[1] || 'Conversation');

      const keywordsContainer = document.createElement('div');
      keywordsContainer.className = 'keywords-container';

      const keywords = Array.isArray(convo.keywords) ? convo.keywords : [];
      keywords.slice(0, 8).forEach((keyword) => {
        const keywordSpan = document.createElement('span');
        keywordSpan.className = 'keyword';
        keywordSpan.textContent = keyword;
        keywordsContainer.appendChild(keywordSpan);
      });

      listItem.appendChild(link);
      listItem.appendChild(keywordsContainer);
      conversationsList.appendChild(listItem);
    });
  };

  renderLatest();
});
