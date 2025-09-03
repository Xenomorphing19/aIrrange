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
      apiKeyStatus.style.color = "green";
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
      // Allow user to clear the key by saving an empty string
      chrome.storage.local.remove(apiKeyStorageKey, () => {
        apiKeyStatus.textContent = "API Key removed. Using simple keywords.";
        apiKeyStatus.style.color = "orange";
      });
    }
  });

  // --- Toggle Logic ---
  // Set the toggle's state based on the saved value.
  chrome.storage.local.get({ [toggleStorageKey]: true }, (result) => {
    toggle.checked = result[toggleStorageKey];
  });
  // Save the new state when the toggle is changed.
  toggle.addEventListener('change', () => {
    chrome.storage.local.set({ [toggleStorageKey]: toggle.checked });
  });

  // --- Display Latest Conversations Logic ---
  // Fetch all conversations from storage.
  chrome.storage.local.get({ conversations: [] }, (result) => {
    const allConversations = result.conversations;
    
    // Get only the first 3 items from the array.
    const latestConversations = allConversations.slice(0, 3);

    // If there are no conversations, show a message.
    if (latestConversations.length === 0) {
      conversationsList.innerHTML = '<li>Nothing captured yet. Go chat!</li>';
      return;
    }

    // Clear the list before rendering to avoid duplicates.
    conversationsList.innerHTML = '';

    // Loop through the latest 3 conversations and create the HTML for each.
    latestConversations.forEach(convo => {
      const listItem = document.createElement('li');
      
      const link = document.createElement('a');
      link.href = convo.url;
      link.target = '_blank';
      link.textContent = convo.url.split('/c/')[1] || 'A New Chat';
      
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
