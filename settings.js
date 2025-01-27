document.addEventListener('DOMContentLoaded', init);

function init() {
  // Apply translations
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = chrome.i18n.getMessage(key);
  });
  
  chrome.storage.sync.get({
    interval: 0.3,
    groupGoogleSearches: false,
    enabled: true,
    keepMediaTabs: true
  }, function(data) {
    document.getElementById('interval').value = data.interval;
    document.getElementById('groupGoogleSearches').checked = data.groupGoogleSearches;
    document.getElementById('extensionEnabled').checked = data.enabled;
    document.getElementById('keepMediaTabs').checked = data.keepMediaTabs;
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

  document.getElementById('keepMediaTabs').addEventListener('change', (e) => {
    chrome.storage.sync.set({ keepMediaTabs: e.target.checked });
  });

  document.getElementById('manualClose').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'manualClose' });
  });
} 