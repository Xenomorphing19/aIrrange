document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('all-conversations-list');
  
  // Send a message to the background script asking for the data.
  chrome.runtime.sendMessage({ type: 'getAllConversations' }, (response) => {
    // This function runs when the background script sends a response.
    if (!response || !response.data) {
      console.error("Failed to get a valid response from the background script.");
      list.innerHTML = '<li>Oops! Something went wrong trying to load your history.</li>';
      return;
    }

    const convos = response.data;
    if (convos.length === 0) {
      list.innerHTML = '<li>Nothing to see here... yet! Go have some chats.</li>';
      return;
    }

    // Use the data from the response to build the list.
    convos.forEach(convo => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = convo.url;
      link.target = '_blank';
      link.textContent = convo.url.split('/c/')[1] || 'A New Chat';
      
      const keywordsDiv = document.createElement('div');
      keywordsDiv.className = 'keywords-container';
      convo.keywords.forEach(kw => {
        const span = document.createElement('span');
        span.className = 'keyword';
        span.textContent = kw;
        keywordsDiv.appendChild(span);
      });
      
      item.appendChild(link);
      item.appendChild(keywordsDiv);
      list.appendChild(item);
    });
  });
});
