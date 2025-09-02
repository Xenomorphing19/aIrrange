const storageKey = 'aIrrange_isCapturingEnabled';

// First, check storage to see if the extension is enabled.
chrome.storage.local.get({ [storageKey]: true }, (result) => {
  // Only run the capture logic if the toggle is on.
  if (result[storageKey]) {
    
    console.log("aIrrange: Capturing is ENABLED. Ready for it!");
    
    // --- All of your working code is placed inside this 'if' block ---

    // This function sends the captured prompt to the background script.
    const sendQueryToBackground = (query) => {
      // Wait 1.5 seconds to give ChatGPT time to generate the new conversation URL.
      setTimeout(() => {
        chrome.runtime.sendMessage({
          type: 'newSearch',
          payload: {
            query: query,
            url: window.location.href
          }
        });
      }, 1500);
    };

    console.log("ChatGPT Search Organizer: Corrected Caching script loaded.");

    // Our cache variable.
    let cachedPromptText = '';

    // This function finds the contenteditable div and updates our cache using .innerText.
    const updateCache = () => {
      const promptDiv = document.getElementById('prompt-textarea');
      // Make sure the element exists before trying to read from it.
      if (promptDiv) {
        // Use .innerText because it's a contenteditable div, not a textarea.
        cachedPromptText = promptDiv.innerText;
      }
      console.log("Cache updated:", cachedPromptText);
    };

    // Listen for any input changes to trigger a cache update.
    document.body.addEventListener('input', updateCache);

    // Listen for the "Enter" key to send the cached data.
    document.addEventListener('keydown', (event) => {
        const active = document.activeElement;
        if (
          active &&
          active.id === 'prompt-textarea' &&
          event.key === 'Enter' &&
          !event.shiftKey
        ) {
          console.log("Enter detected in prompt textarea", cachedPromptText);
          if (cachedPromptText && cachedPromptText.trim() !== "") {
            sendQueryToBackground(cachedPromptText);
          }
        }
      });

  } else {
    // If the toggle is off, do nothing.
    console.log("aIrrange: Capturing is DISABLED. Taking a nap.");
  }
});
