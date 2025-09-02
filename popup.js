document.addEventListener('DOMContentLoaded', () => {
  const conversationsList = document.getElementById('conversations-list');
  const toggle = document.getElementById('extension-toggle');
  const storageKey = 'aIrrange_isCapturingEnabled'; // Our specific key

  // --- Toggle Logic ---
  chrome.storage.local.get({ [storageKey]: true }, (result) => {
    toggle.checked = result[storageKey];
  });

  toggle.addEventListener('change', () => {
    chrome.storage.local.set({ [storageKey]: toggle.checked });
  });

  // --- Display Logic ---
  chrome.storage.local.get({ conversations: [] }, (result) => {
    const conversations = result.conversations;
    if (conversations.length === 0) {
      conversationsList.innerHTML = '<li>Nothing captured yet. Go chat!</li>';
      return;
    }
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
