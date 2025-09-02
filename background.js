console.log("Service worker with Set-based data model running");

// This function now returns a Set directly.
const extractKeywords = (query) => {
  const words = query.toLowerCase().match(/\b\w{3,}\b/g) || [];
  return new Set(words);
};

const saveSearch = (query, url) => {
  chrome.storage.local.get({ conversations: [] }, (result) => {
    let conversations = result.conversations;

    const existingConvo = conversations.find(convo => convo.url === url);
    const newKeywordsSet = extractKeywords(query);

    if (existingConvo) {
      console.log("URL exists. Merging keyword Sets.");
      
      // 1. Convert the stored array of keywords back into a Set.
      const existingKeywordsSet = new Set(existingConvo.keywords);

      // 2. Merge the new keywords into the existing Set.
      // The Set handles uniqueness automatically.
      newKeywordsSet.forEach(keyword => existingKeywordsSet.add(keyword));

      // 3. Convert the merged Set back to an Array for storage.
      existingConvo.keywords = Array.from(existingKeywordsSet).sort();
      
    } else {
      console.log("New URL. Creating new conversation entry.");
      
      // Create the new conversation object.
      const newConversation = {
        url: url,
        // Convert the new Set to an Array for storage.
        keywords: Array.from(newKeywordsSet).sort()
      };
      conversations.unshift(newConversation);
    }

    // Save the updated conversations array back to storage.
    chrome.storage.local.set({ conversations: conversations }, () => {
      console.log('Storage updated:', conversations);
    });
  });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'newSearch') {
    const { query, url } = message.payload;
    
    // Normalize the URL to the base conversation link.
    let conversationUrl = url;
    if (url.includes('/c/')) {
        const urlParts = url.split('/c/');
        const conversationId = urlParts[1].split('/')[0];
        conversationUrl = `${urlParts[0]}/c/${conversationId}`;
    }

    saveSearch(query, conversationUrl);
    return true;
  }
});
