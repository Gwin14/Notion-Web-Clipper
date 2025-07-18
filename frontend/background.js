chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "store_token") {
    chrome.storage.local.set({ notion_token: message.token }, () => {
      console.log("Token salvo!");
    });
  }
});

