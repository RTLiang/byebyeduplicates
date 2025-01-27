# Bye Bye Duplicates

A Chrome extension that automatically closes duplicate tabs to keep your browser organized.

## Features

- 🚀 Automatic duplicate tab detection
- ⏳ Configurable check intervals (Instant to 5 seconds)
- 🔍 Smart Google Search URL handling
- ⚙️ Customizable closing behavior:
  - Close older or newer duplicates
  - Exclude internal browser pages (chrome://, edge://, etc.)
- 🛡️ Manifest V3 compliant
- 🎚️ Global on/off toggle
- 🎯 Manual close button for immediate action

## Installation

1. Download the extension files
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" (top-right toggle)
4. Click "Load unpacked" and select the extension folder

## Usage

Click the extension icon in your toolbar to access settings:

- **Check Interval**: How quickly to detect duplicates after changes
- **Google Search Handling**: Treat different Google search URLs as duplicates
- **Closing Preference**: Choose whether to keep older or newer tabs

The extension works automatically after installation. Duplicates will be closed while preserving your preferred version of the tab.

## Permissions

- `tabs`: Required to access and manage tab information
- `storage`: Used to save user preferences
- `<all_urls>`: Needed to work across all websites
