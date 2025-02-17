function closeDuplicateTabs() {
    chrome.tabs.query({}, (tabs) => {
        chrome.storage.sync.get({ 
            enabled: true,
            groupGoogleSearches: false,
            keepMediaTabs: true
        }, (data) => {
            if (!data.enabled) return;
            const urlMap = new Map();

            // First pass: identify duplicates
            tabs.forEach(tab => {
                // Skip internal URLs
                if (tab.url?.startsWith('chrome://') ||
                    tab.url?.startsWith('edge://') ||
                    tab.url?.startsWith('about:') ||
                    tab.url?.startsWith('opera://') ||
                    !tab.url) {
                    return;
                }

                // Skip tabs playing media if option enabled
                if (data.keepMediaTabs && (tab.audible || tab.mutedInfo.muted)) {
                    return;
                }

                let processedUrl = tab.url;
                
                // Process Google URLs synchronously
                if (data.groupGoogleSearches && isGoogleSearchUrl(tab.url)) {
                    processedUrl = normalizeGoogleUrl(tab.url);
                }

                if (urlMap.has(processedUrl)) {
                    urlMap.get(processedUrl).push(tab.id);
                } else {
                    urlMap.set(processedUrl, [tab.id]);
                }
            });

            // Second pass: close duplicates
            urlMap.forEach((ids, url) => {
                if (ids.length > 1) {
                    // Get all tabs for this URL and sort by lastAccessed time
                    const sortedTabs = tabs
                        .filter(t => ids.includes(t.id))
                        .sort((a, b) => b.lastAccessed - a.lastAccessed);
                    
                    // Keep only the most recently accessed tab
                    const tabsToClose = sortedTabs.slice(1).map(t => t.id);
                    chrome.tabs.remove(tabsToClose);
                }
            });
        });
    });
}

// Debounce function to prevent multiple rapid calls
function debounce(func) {
    let timer;
    return (...args) => {
        chrome.storage.sync.get({ interval: 0.3 }, (data) => {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), data.interval * 1000);
        });
    };
}

let debouncedClose = debounce(closeDuplicateTabs);

// Listeners
chrome.tabs.onCreated.addListener(debouncedClose);
chrome.tabs.onUpdated.addListener(debouncedClose);
chrome.runtime.onStartup.addListener(closeDuplicateTabs);
chrome.runtime.onInstalled.addListener(closeDuplicateTabs);

// Add at the bottom
chrome.storage.onChanged.addListener((changes) => {
    if (changes.interval) {
        // Recreate debounced function with new interval
        debouncedClose = debounce(closeDuplicateTabs);
    }
});

// Add these helper functions
function isGoogleSearchUrl(url) {
    try {
        const parsed = new URL(url);
        return parsed.hostname.includes('google.') &&
            parsed.pathname.includes('/search') &&
            parsed.searchParams.has('q');
    } catch {
        return false;
    }
}

function normalizeGoogleUrl(url) {
    try {
        const parsed = new URL(url);
        // Keep only essential search parameters
        const params = new URLSearchParams();
        params.set('q', parsed.searchParams.get('q') || '');
        if (parsed.searchParams.has('tbm')) params.set('tbm', parsed.searchParams.get('tbm'));
        return `${parsed.origin}${parsed.pathname}?${params.toString()}`;
    } catch {
        return url;
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'manualClose') {
    // Get the active tab first
    chrome.tabs.query({active: true, currentWindow: true}, (activeTabs) => {
      if (activeTabs.length === 0) return;

      // Retrieve user settings
      chrome.storage.sync.get({ keepMediaTabs: true }, (data) => {
        // Now query all tabs
        chrome.tabs.query({}, (tabs) => {
          const urlMap = new Map();
          
          // Process all tabs synchronously
          tabs.forEach(tab => {
            if (tab.url?.startsWith('chrome://') ||
                tab.url?.startsWith('edge://') ||
                tab.url?.startsWith('about:') ||
                tab.url?.startsWith('opera://') ||
                !tab.url) {
              return;
            }

            // Skip tabs playing media if option enabled
            if (data.keepMediaTabs && (tab.audible || tab.mutedInfo.muted)) {
              return;
            }

            let processedUrl = tab.url;
            if (urlMap.has(processedUrl)) {
              urlMap.get(processedUrl).push(tab.id);
            } else {
              urlMap.set(processedUrl, [tab.id]);
            }
          });

          // Close duplicates immediately
          urlMap.forEach((ids, url) => {
            if (ids.length > 1) {
              // Get all tabs for this URL and sort by lastAccessed time
              const sortedTabs = tabs
                  .filter(t => ids.includes(t.id))
                  .sort((a, b) => b.lastAccessed - a.lastAccessed);
              
              // Keep only the most recently accessed tab
              const tabsToClose = sortedTabs.slice(1).map(t => t.id);
              chrome.tabs.remove(tabsToClose);
            }
          });
        });
      });
    });
  }
  return true; // Keep message channel open for async response
});

