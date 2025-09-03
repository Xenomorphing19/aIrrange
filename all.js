document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('all-conversations-list');
  const searchBar = document.getElementById('search-bar');
  let allConversations = [];

  // Function to render the list of conversations
  const renderList = (conversations) => {
    list.innerHTML = '';
    if (!conversations || conversations.length === 0) {
      list.innerHTML = '<li>Nothing to see here... yet!</li>';
      return;
    }
    conversations.forEach(convo => {
      const item = document.createElement('li');
      item.id = convo.url;
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
  };

  // Function to reset the search bar to its default state
  const resetSearchBar = () => {
    searchBar.disabled = false;
    searchBar.value = '';
    searchBar.placeholder = "Let the AI find your conversation...";
  };

  // Initial load of all conversations
  chrome.runtime.sendMessage({ type: 'getAllConversations' }, (response) => {
    if (response && response.data) {
      allConversations = response.data;
      renderList(allConversations);
    }
  });

  // Listen for the user clearing the search bar manually
  searchBar.addEventListener('input', () => {
    if (searchBar.value.trim() === '') {
      renderList(allConversations);
      document.querySelectorAll('.highlighted').forEach(el => el.classList.remove('highlighted'));
      resetSearchBar();
    }
  });

  // The main AI search function
  const performAiSearch = () => {
    const searchQuery = searchBar.value.trim().toLowerCase();
    if (!searchQuery) return;

    // Immediately update the UI to show the "thinking" state
    searchBar.placeholder = "AI is thinking...";
    searchBar.disabled = true;

    // ** THE FIX IS HERE: Use setTimeout to force a UI repaint **
    setTimeout(() => {
      // STEP 1: LOCAL PRE-FILTERING
      const searchTerms = searchQuery.split(/\s+/);
      const candidates = allConversations.filter(convo => 
        searchTerms.some(term => convo.keywords.some(kw => kw.includes(term)))
      );

      if (candidates.length === 0) {
        searchBar.disabled = false;
        searchBar.placeholder = "No matches found. Try another search!";
        // We don't clear the value so the user sees what they searched for
        return;
      }
      
      // STEP 2: SEND CANDIDATES TO AI FOR RANKING
      chrome.runtime.sendMessage(
        { type: 'performAiSearch', payload: { query: searchQuery, candidates: candidates } }, 
        (response) => {
          resetSearchBar();
          document.querySelectorAll('.highlighted').forEach(el => el.classList.remove('highlighted'));

          if (response && response.bestMatchUrl) {
            const bestMatchElement = document.getElementById(response.bestMatchUrl);
            if (bestMatchElement) {
              bestMatchElement.classList.add('highlighted');
              bestMatchElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          } else {
            alert("The AI couldn't determine a single best match. Please try a more specific query.");
          }
        }
      );
    }, 0); // The delay of 0 is the key
  };
  
  // Trigger the search on "Enter" key
  searchBar.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      performAiSearch();
    }
  });
});
