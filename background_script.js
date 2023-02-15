console.log("background script starting");

// We want to broadcast a message to this extension's content scripts in every tab when a key mapping
// changes. However, the chrome.tabs API is only available to background scripts.
chrome.runtime.onMessage.addListener(async (request) => {
  console.log("Background page received message.", request);

  const onError = (error) => {
    // The error "could not establish connection. Receiving end does not exist" happens when the tabs being
    // queried are not Google Sheets pages and do not have the SheetKeys content scripts loaded. This is
    // expected.
    console.log("Error sending message to tabs:", error);
  };

  if (request == "keyMappingChange") {
    const tabs = await chrome.tabs.query({});
    for (const tab of Array.from(tabs))
      chrome.tabs.sendMessage(tab.id, request).catch(onError);
  }
});
