document.addEventListener('DOMContentLoaded', init);

function init() {
  chrome.storage.sync.get({
    interval: 0.3,
    groupGoogleSearches: false,
    enabled: true
  }, function(data) {
    document.getElementById('interval').value = data.interval;
    document.getElementById('groupGoogleSearches').checked = data.groupGoogleSearches;
    document.getElementById('extensionEnabled').checked = data.enabled;
  });

  document.getElementById('interval').addEventListener('change', (e) => {
    const interval = parseFloat(e.target.value);
    chrome.storage.sync.set({ interval });
  });

  document.getElementById('groupGoogleSearches').addEventListener('change', (e) => {
    chrome.storage.sync.set({ groupGoogleSearches: e.target.checked });
  });

  document.getElementById('extensionEnabled').addEventListener('change', (e) => {
    chrome.storage.sync.set({ enabled: e.target.checked });
  });

  document.getElementById('manualClose').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'manualClose' });
  });
} 