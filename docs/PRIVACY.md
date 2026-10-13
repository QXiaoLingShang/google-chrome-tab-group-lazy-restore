# Privacy

The extension observes tab creation, updates, activation, and group metadata to recognize a possible native group restore. Tab and group identifiers are kept in short-lived in-memory batches. Settings, including protected group names and the settings-page language preference, are stored in `chrome.storage.local`.

The current extension contains no analytics, remote service, account, or cloud synchronization. It does not send browsing URLs or settings to a server. Chrome loads websites normally, including when a discarded tab is activated; those websites have their own privacy practices.

Permissions:

- `tabs`: inspect tab state and discard eligible background tabs.
- `tabGroups`: read group metadata and protected group names.
- `storage`: read and save local settings.

Uninstalling removes extension settings according to Chrome's behavior. Public issue reports, attached logs, and screenshots may expose browsing data; redact them before submission.
