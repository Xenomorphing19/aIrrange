document.addEventListener('DOMContentLoaded', () => {
  // --- Element References ---
  const conversationsList = document.getElementById('conversations-list');
  const toggle = document.getElementById('extension-toggle');
  const apiKeyInput = document.getElementById('api-key-input');
  const saveApiKeyButton = document.getElementById('save-api-key');
  const apiKeyStatus = document.getElementById('api-key-status');
  
  // --- Storage Keys ---
  const toggleStorageKey = 'aIrrange_isCapturingEnabled';
  const apiKeyStorageKey = 'aIrrange_geminiApiKey';

  // --- API Key Logic ---
  // Check for a saved key on load and show a status message.
  chrome.storage.local.get(apiKeyStorageKey, (result) => {
    if (result[apiKeyStorageKey]) {
      apiKeyStatus.textContent = "Your API Key is safely stored!";
    } else {
      apiKeyStatus.textContent = "No API Key found. Using simple keywords.";
      apiKeyStatus.style.color = "orange";
    }
  });

  // Save the new key when the user clicks "Save".
  saveApiKeyButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      chrome.storage.local.set({ [apiKeyStorageKey]: apiKey }, () => {
        apiKeyStatus.textContent = "Hooray! Your key has been saved.";
        apiKeyStatus.style.color = "green";
        apiKeyInput.value = ''; // Clear the input
      });
    } else {
      // Allow user to clear the key
      chrome.storage.local.remove(apiKeyStorageKey, () => {
        apiKeyStatus.textContent = "API Key removed. AI features are disabled.";
        apiKeyStatus.style.color = "orange";
      });
    }
  });

  // --- Toggle Logic ---
  chrome.storage.local.get({ [toggleStorageKey]: true }, (result) => {
    toggle.checked = result[toggleStorageKey];
  });
  toggle.addEventListener('change', () => {
    chrome.storage.local.set({ [toggleStorageKey]: toggle.checked });
  });

  // --- THIS IS THE MISSING PIECE: Display Conversation List Logic ---
  chrome.storage.local.get({ conversations: [] }, (result) => {
    const conversations = result.conversations;
    if (conversations.length === 0) {
      conversationsList.innerHTML = '<li>Nothing captured yet. Go chat!</li>';
      return;
    }

    conversationsList.innerHTML = ''; // Clear the list before rendering

    conversations.forEach(convo => {
      const listItem = document.createElement('li');
      const link = document.createElement('a');
      link.href = convo.url;
      link.target = '_blank';
      link.textContent = convo.url.split('/c/')[1] || 'New Chat';
      
      const keywordsContainer = document.createElement('div');
      keywordsContainer.className = 'keywords-container';
      
      convo.keywords.forEach(keyword => {
        const keywordSpan = document.createElement('span');
        keywordSpan.className = 'keyword';
        keywordSpan.textContent = keyword;
        keywordsContainer.appendChild(keywordSpan);
      });
      
      listItem.appendChild(link);
      listItem.appendChild(keywordsContainer);
      conversationsList.appendChild(listItem);
    });
  });
});
