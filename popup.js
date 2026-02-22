import { db } from './src/db/database.js';
import { LLMClient, getDefaultModel } from './src/utils/llmClient.js';

document.addEventListener('DOMContentLoaded', () => {
  // --- Element References ---
  const conversationsList = document.getElementById('conversations-list');
  const toggle = document.getElementById('extension-toggle');
  const providerSelect = document.getElementById('api-provider-select');
  const apiKeyInput = document.getElementById('api-key-input');
  const modelSelector = document.getElementById('model-selector');
  const saveApiKeyButton = document.getElementById('save-api-key');
  const clearApiKeyButton = document.getElementById('clear-api-key');
  const testApiKeyButton = document.getElementById('test-api-key');
  const apiKeyStatus = document.getElementById('api-key-status');

  // Re-render when background finishes async keyword generation.
  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === 'CONVERSATION_UPDATED') {
      renderLatest();
    }
  });

  // --- Storage Keys ---
  const toggleStorageKey = 'aIrrange_isCapturingEnabled';
  const apiVaultKey = 'aIrrange_api_vault';

  const defaultVault = {
    selected: 'gemini',
    keys: { gemini: '', openai: '', anthropic: '' }
  };

  const readVault = async () => {
    const result = await chrome.storage.local.get(apiVaultKey);
    const vault = result[apiVaultKey] || defaultVault;
    vault.keys = vault.keys || {};
    return {
      selected: vault.selected || 'gemini',
      keys: {
        gemini: vault.keys.gemini || '',
        openai: vault.keys.openai || '',
        anthropic: vault.keys.anthropic || ''
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
      const llm = new LLMClient();
      const models = await llm.getAvailableModels(provider, key);
      if (!Array.isArray(models) || models.length === 0) {
        setStatus('Connected, but no models returned.', 'orange');
        modelSelector.hidden = true;
        modelSelector.disabled = true;
        return;
      }

      // Populate dropdown
      modelSelector.innerHTML = '';
      models.forEach((m) => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        modelSelector.appendChild(opt);
      });

      // Auto-select + auto-save default
      const defaultModel = getDefaultModel(provider, models) || models[0];
      modelSelector.value = defaultModel;
      await chrome.storage.local.set({ [`aIrrange_model_${provider}`]: defaultModel });

      modelSelector.hidden = false;
      modelSelector.disabled = false;
      setStatus('✅ Success! Models loaded + default selected.', 'green');
    } catch (e) {
      setStatus(`Test failed: ${String(e?.message || e)}`, 'red');
    }
  });

  // On-change saving
  modelSelector?.addEventListener('change', async () => {
    const provider = providerSelect.value;
    const v = String(modelSelector.value || '').trim();
    if (!v) return;
    await chrome.storage.local.set({ [`aIrrange_model_${provider}`]: v });
    setStatus('Model saved.', 'green');
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
