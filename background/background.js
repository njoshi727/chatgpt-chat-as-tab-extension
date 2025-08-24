// background.js
// Background service worker for the extension.


// Only enable extension action on https://chatgpt.com/c/ URLs
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!chrome.action || typeof tabId === 'undefined') return;
  try {
    if (tab && tab.url && tab.url.startsWith('https://chatgpt.com/c/')) {
      chrome.action.enable(tabId);
    } else {
      chrome.action.disable(tabId);
    }
  } catch (e) {
    // Silently ignore errors
  }
});

chrome.runtime.onInstalled.addListener(() => {
  if (chrome.action && chrome.tabs) {
    chrome.tabs.query({}, function(tabs) {
      for (const tab of tabs) {
        if (typeof tab.id !== 'undefined') {
          try {
            chrome.action.disable(tab.id);
          } catch (e) {}
        }
      }
    });
  }
});
