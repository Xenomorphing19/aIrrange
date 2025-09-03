console.log("aIrrange service worker initialized. Ready to receive messages.");

async function getKeywordsFromGemini(query) {
  console.log("Step 1: Attempting to get keywords from Gemini.");
  
  // Fetch the user's saved API key from storage.
  const data = await chrome.storage.local.get('aIrrange_geminiApiKey');
  const apiKey = data.aIrrange_geminiApiKey;

  // If no key is found, log a warning and return empty to trigger the fallback.
  if (!apiKey) {
    console.warn("  -> Warning: No Gemini API key found in storage. Aborting API call.");
    return [];
  }

  console.log("  -> API key found. Preparing API call.");

  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
  const prompt = `From the following user prompt, extract up to 10 of the most important and relevant keywords that summarize the core topic. Return them as a comma-separated list.\n\nUser Prompt: "${query}"\n\nKeywords:`;

  try {
    console.log("  -> Sending request to Gemini API...");
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) {
      // Log the error response from the server for better debugging
      const errorBody = await response.text();
      throw new Error(`API call failed with status: ${response.status}. Body: ${errorBody}`);
    }

    const responseData = await response.json();
    // It's good practice to log the entire response object to inspect its structure
    // console.log("  -> Full Gemini API response:", JSON.stringify(responseData, null, 2));

    const keywordsText = responseData.candidates[0].content.parts[0].text;
    console.log("  -> Success! Gemini returned keywords:", keywordsText);
    
    return keywordsText.split(',').map(kw => kw.trim()).filter(Boolean);

  } catch (error) {
    console.error("  -> Error calling Gemini API:", error);
    return []; // Return empty on API failure to trigger fallback
  }
}

// The simple extractor fallback.
const extractKeywordsSimple = (query) => {
  console.log("Step 1b: Falling back to simple keyword extraction.");
  const words = query.toLowerCase().match(/\b\w{3,}\b/g) || [];
  return new Set(words);
};

// The main function to save the data.
async function saveSearch(query, url) {
  console.log("\n--- New Save Operation ---");
  console.log(`Received query: "${query}" for URL: ${url}`);
  
  let finalKeywords = await getKeywordsFromGemini(query);

  if (finalKeywords.length === 0) {
    console.log("  -> AI extraction failed or was skipped. Using simple extractor as fallback.");
    finalKeywords = Array.from(extractKeywordsSimple(query));
  }
  
  console.log("Step 2: Preparing to save final keywords:", finalKeywords);

  chrome.storage.local.get({ conversations: [] }, (result) => {
    let conversations = result.conversations;
    const existingConvo = conversations.find(convo => convo.url === url);

    if (existingConvo) {
      console.log("  -> Found existing conversation. Merging keywords.");
      const existingKeywordsSet = new Set(existingConvo.keywords);
      finalKeywords.forEach(keyword => existingKeywordsSet.add(keyword));
      existingConvo.keywords = Array.from(existingKeywordsSet).sort();
    } else {
      console.log("  -> This is a new conversation. Creating new entry.");
      const newConversation = { url: url, keywords: Array.from(new Set(finalKeywords)).sort() };
      conversations.unshift(newConversation);
    }
    
    // Save the updated array back to storage.
    chrome.storage.local.set({ conversations: conversations }, () => {
      console.log("Step 3: Save complete! Current storage state:", conversations);
      console.log("--- End Save Operation ---\n");
    });
  });
};

// The message listener that kicks everything off.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'newSearch') {
    const { query, url } = message.payload;
    // Normalize the URL to remove query parameters and fragments.
    let conversationUrl = url.split('?')[0].split('#')[0];
    // Further normalize for specific ChatGPT URL structure.
    if (url.includes('/c/')) {
        const urlParts = url.split('/c/');
        const conversationId = urlParts[1].split('/')[0];
        conversationUrl = `${urlParts[0]}/c/${conversationId}`;
    }
    saveSearch(query, conversationUrl);
    return true; // Indicates you will send a response asynchronously.
  }

  if (message.type === 'getAllConversations') {
    console.log("Request received from all.html to get all conversations.");
    chrome.storage.local.get({ conversations: [] }, (result) => {
      console.log("Sending conversations back to all.html:", result.conversations);
      sendResponse({ data: result.conversations });
    });
    // *** THIS IS THE CRUCIAL FIX ***
    // You MUST return true here as well to signal that you will be
    // sending a response asynchronously.
    return true;
  }
});
