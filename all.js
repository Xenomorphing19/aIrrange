import { db } from './src/db/database.js';
import './vendor/jszip.min.js';
import { convertToMarkdown, conversationsToNotionCsv } from './src/utils/exportUtils.js';
import { LLMClient, getDefaultModel } from './src/utils/llmClient.js';

document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('all-conversations-list');
  const searchBar = document.getElementById('search-bar');
  const providerSelect = document.getElementById('api-provider-select');
  const apiKeyInput = document.getElementById('api-key-input');
  const modelSelector = document.getElementById('model-selector');
  const saveApiKeyButton = document.getElementById('save-api-key');
  const testApiKeyButton = document.getElementById('test-api-key');
  const apiKeyStatus = document.getElementById('api-key-status');
  const exportMdZipBtn = document.getElementById('export-md-zip');
  const exportCsvBtn = document.getElementById('export-csv');
  const tagSidebar = document.getElementById('tag-sidebar');
  const clearHistoryBtn = document.getElementById('clear-history');

  // Re-render when background finishes async keyword generation.
  // (all.html is an extension page, so chrome.runtime messaging is available.)
  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === 'CONVERSATION_UPDATED') {
      // Re-fetch the chats from Dexie and re-render the UI.
      loadConversations().then(loadTagsSidebar);
    }
  });

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

  const refreshVaultUi = async () => {
    const vault = await readVault();
    providerSelect.value = vault.selected;
    apiKeyInput.value = vault.keys[vault.selected] || '';
    setStatus(apiKeyInput.value.trim() ? 'Key stored for this provider.' : 'No key for this provider.', apiKeyInput.value.trim() ? 'green' : 'orange');
  };
  /** @type {any[]} */
  let allConversations = [];
  let filtered = [];
  let debounceTimer = null;

  // --- Settings UI ---
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
    setStatus('Saved!', 'green');
    await refreshVaultUi();
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

      modelSelector.innerHTML = '';
      models.forEach((m) => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        modelSelector.appendChild(opt);
      });

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

  modelSelector?.addEventListener('change', async () => {
    const provider = providerSelect.value;
    const v = String(modelSelector.value || '').trim();
    if (!v) return;
    await chrome.storage.local.set({ [`aIrrange_model_${provider}`]: v });
    setStatus('Model saved.', 'green');
  });

  refreshVaultUi();

  const providerLabel = (provider) => {
    if (!provider) return { label: 'Unknown', cls: 'unknown' };
    if (provider === 'chatgpt') return { label: 'ChatGPT', cls: 'chatgpt' };
    if (provider === 'claude') return { label: 'Claude', cls: 'claude' };
    if (provider === 'openai') return { label: 'OpenAI', cls: 'openai' };
    return { label: provider, cls: 'unknown' };
  };

  const escapeHtml = (s) =>
    String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const formatRelativeTime = (ts) => {
    const t = Number(ts || 0);
    if (!t) return '';
    const diff = Date.now() - t;
    const sec = Math.floor(diff / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    if (sec < 60) return `${sec}s ago`;
    if (min < 60) return `${min}m ago`;
    if (hr < 24) return `${hr}h ago`;
    if (day < 7) return `${day}d ago`;
    return new Date(t).toLocaleString();
  };

  // Card renderer
  const renderList = (conversations) => {
    list.innerHTML = '';
    if (!conversations || conversations.length === 0) {
      list.innerHTML = '<li class="empty">No conversations yet.</li>';
      return;
    }

    const fragment = document.createDocumentFragment();
    conversations.forEach((convo) => {
      const { label, cls } = providerLabel(convo.provider);
      const title = convo.title || convo.url || 'Untitled';
      const summary = convo.summary || '';
      const keywords = Array.isArray(convo.keywords) ? convo.keywords : [];

      const li = document.createElement('li');
      li.className = 'card';
      li.id = convo.id;
      li.innerHTML = `
        <div class="cardHeader">
          <h3 class="cardTitle"><a href="${escapeHtml(convo.url)}" target="_blank" rel="noreferrer">${escapeHtml(title)}</a></h3>
          <div class="cardActions">
            <span class="badge ${escapeHtml(cls)}">${escapeHtml(label)}</span>
            <button class="iconBtn danger" data-action="delete" data-id="${escapeHtml(convo.id)}" title="Delete">Delete</button>
          </div>
        </div>
        <p class="summary">${escapeHtml(summary || 'No summary yet.')}</p>
        <div class="chips">
          ${keywords.slice(0, 10).map((k) => `<span class="chip">${escapeHtml(k)}</span>`).join('')}
        </div>
        <div class="meta">
          <span>${escapeHtml(formatRelativeTime(convo.timestamp))}</span>
          <span>${escapeHtml(convo.provider || '')}</span>
        </div>
      `;
      fragment.appendChild(li);
    });
    list.appendChild(fragment);
  };

  // Handle per-card delete with confirmation
  list.addEventListener('click', async (e) => {
    const btn = e.target?.closest?.('button[data-action="delete"]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    if (!id) return;

    const confirmText = prompt('Type DELETE to permanently remove this conversation.');
    if (confirmText !== 'DELETE') return;

    await db.conversations.delete(id);
    await cleanupOrphanTags();
    await loadConversations();
    await loadTagsSidebar();
  });

  // Function to reset the search bar to its default state
  const resetSearchBar = () => {
    searchBar.disabled = false;
    searchBar.value = '';
    searchBar.placeholder = "Let the AI find your conversation...";
  };

  const loadConversations = async () => {
    // Dexie fetch sorted by timestamp desc
    allConversations = await db.conversations.orderBy('timestamp').reverse().toArray();
    filtered = allConversations;
    renderList(filtered);
  };

  loadConversations();

  const loadTagsSidebar = async () => {
    if (!tagSidebar) return;
    tagSidebar.innerHTML = '';
    const tags = await db.tags.toArray();
    const labels = Array.from(new Set(tags.map((t) => String(t.label || '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
    if (labels.length === 0) {
      tagSidebar.innerHTML = '<div style="color: rgba(255,255,255,0.65); font-size: 12px;">No tags yet.</div>';
      return;
    }
    const frag = document.createDocumentFragment();
    labels.forEach((label) => {
      const btn = document.createElement('button');
      btn.className = 'tagChip';
      btn.type = 'button';
      btn.textContent = label;
      btn.addEventListener('click', () => {
        searchBar.value = label;
        filtered = filterHistory(label);
        renderList(filtered);
      });
      frag.appendChild(btn);
    });
    tagSidebar.appendChild(frag);
  };

  loadTagsSidebar();

  // One-time migration: if tags table is empty, backfill from existing conversations.
  const migrateTagsIfEmpty = async () => {
    const tagCount = await db.tags.count();
    if (tagCount > 0) return;

    const records = await db.conversations.toArray();
    const labels = new Set();
    records.forEach((c) => {
      const kws = Array.isArray(c.keywords) ? c.keywords : [];
      kws.forEach((k) => {
        const label = String(k || '').trim();
        if (label) labels.add(label);
      });
    });
    if (labels.size === 0) return;
    await db.tags.bulkPut(Array.from(labels).map((label) => ({ id: label.toLowerCase(), label })));
  };

  migrateTagsIfEmpty().then(loadTagsSidebar);

  // Multi-field search
  const filterHistory = (query) => {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return allConversations;
    return allConversations.filter((c) => {
      const title = String(c.title || '').toLowerCase();
      const summary = String(c.summary || '').toLowerCase();
      const keywords = Array.isArray(c.keywords) ? c.keywords.map((k) => String(k).toLowerCase()) : [];
      return title.includes(q) || summary.includes(q) || keywords.some((k) => k.includes(q));
    });
  };

  // Debounced input for large histories
  searchBar.addEventListener('input', () => {
    const doFilter = () => {
      filtered = filterHistory(searchBar.value);
      renderList(filtered);
    };

    if (allConversations.length > 500) {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(doFilter, 300);
    } else {
      doFilter();
    }
  });

  // Enter key just prevents form submits; filtering is live.
  searchBar.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') event.preventDefault();
  });

  // Support q=... query param (context menu)
  const params = new URLSearchParams(location.search);
  const qParam = params.get('q');
  if (qParam) {
    searchBar.value = qParam;
    // ensure DB is loaded first
    Promise.resolve(loadConversations()).then(() => {
      filtered = filterHistory(qParam);
      renderList(filtered);
    });
  }

  // --- Export handlers ---
  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const safeFileName = (s) => String(s || 'Untitled').replace(/[\\/:*?"<>|]+/g, '_').slice(0, 80).trim() || 'Untitled';

  exportMdZipBtn?.addEventListener('click', async () => {
    const records = await db.conversations.orderBy('timestamp').reverse().toArray();
    if (records.length === 0) {
      setStatus('Nothing to export yet.', 'orange');
      return;
    }
    setStatus('Building ZIP…', '#3D5A80');
    // jszip.min.js attaches JSZip to global scope
    const zip = new window.JSZip();
    records.forEach((c) => {
      const md = convertToMarkdown(c);
      const ts = c.timestamp ? new Date(Number(c.timestamp)).toISOString().slice(0, 10) : 'unknown-date';
      const fname = `${ts}__${safeFileName(c.title)}__${safeFileName(c.provider)}.md`;
      zip.file(fname, md);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, 'airrange-export-markdown.zip');
    setStatus('ZIP downloaded.', 'green');
  });

  exportCsvBtn?.addEventListener('click', async () => {
    const records = await db.conversations.orderBy('timestamp').reverse().toArray();
    if (records.length === 0) {
      setStatus('Nothing to export yet.', 'orange');
      return;
    }
    const csv = conversationsToNotionCsv(records);
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'airrange-export-notion.csv');
    setStatus('CSV downloaded.', 'green');
  });

  // Clear all history with typed confirmation
  clearHistoryBtn?.addEventListener('click', async () => {
    const confirmText = prompt('This will delete ALL history. Type DELETE ALL to confirm.');
    if (confirmText !== 'DELETE ALL') return;
    await db.transaction('rw', db.conversations, db.tags, async () => {
      await db.conversations.clear();
      await db.tags.clear();
    });
    await loadConversations();
    await loadTagsSidebar();
    setStatus('History cleared.', 'orange');
  });

  async function cleanupOrphanTags() {
    // Recompute tag universe from conversations (simple + safe)
    const records = await db.conversations.toArray();
    const labels = new Set();
    records.forEach((c) => {
      const kws = Array.isArray(c.keywords) ? c.keywords : [];
      kws.forEach((k) => {
        const label = String(k || '').trim();
        if (label) labels.add(label);
      });
    });

    await db.tags.clear();
    if (labels.size > 0) {
      await db.tags.bulkPut(Array.from(labels).map((label) => ({ id: label.toLowerCase(), label })));
    }
  }
});
