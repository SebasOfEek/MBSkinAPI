# MBSkinAPI - API Reference

Complete documentation of public methods of the `MBSkinAPI` class.

Skin requests, response parsing, validation, caching, and image rendering are delegated internally to a `SkinService` instance. `MBSkinAPI` creates and owns its service and keeps its own pagination and request state; it does not expose a constructor option for injecting a shared service. Its cache is therefore per instance.

> **CSS is not injected by JavaScript.** Include `MBSkinStyles.css` in your HTML; the legacy `injectStyles()` method is a no-op. See the [installation guide](installation.md).

## Public Methods

### show()

Displays the skin explorer. If it's the first time, it automatically loads skins.

```javascript
api.show();
```

**Returns:** `undefined`

**Behavior:**
- If `useModal` is `true`: shows the modal overlay
- If `useModal` is `false`: makes the custom container visible
- Automatically loads skins if the grid is empty

---

### hide()

Hides the skin explorer.

```javascript
api.hide();
```

**Returns:** `undefined`

**Behavior:**
- If `useModal` is `true`: hides the modal overlay
- If `useModal` is `false`: hides the container with `display: none`

---

### search(query)

Searches skins by text and resets search from page 1. Calls from the search input are debounced by 500ms; direct calls to `search(query)` start immediately.

```javascript
// Search for specific skins
api.search('dragon');

// Empty search (shows new skins)
api.search('');

// Programmatic search
const results = await api.search('zombie');
```

**Parameters:**
- `query` (string): Search term

**Returns:** `Promise<Array>` - Array of found skins

**Behavior:**
- Resets to page 1
- A successful current request triggers `onSkinLoad`
- If a newer search supersedes this request, its promise still resolves with its own result, but it does not update current UI/state or trigger `onSkinLoad` or `onError`
- If the current request fails, the last successful results and page are restored

---

### setFilter(filter)

Sets the filter type for searches. Only affects searches with active text.

```javascript
api.setFilter('all');     // Search in name and author
api.setFilter('name');    // Search only in names
api.setFilter('author');  // Search only in authors
```

**Parameters:**
- `filter` (string): Filter type - `'all'`, `'name'`, `'author'`

**Returns:** `Promise<Array>` - Filtered results

**Behavior:**
- If no active search, does nothing
- Re-loads results with the new filter

---

### reset()

Resets the search and shows new skins again.

```javascript
api.reset();
```

**Returns:** `Promise<Array>` - Newly loaded skins

**Behavior:**
- Clears the search field
- Resets to page 1
- Shows the most recent skins

---

### getState()

Gets the current state of the API.

```javascript
const state = api.getState();
console.log('Current page:', state.page);
console.log('Active search:', state.query);
console.log('Total skins:', state.skins.length);
```

**Returns:** `Object` - Copy of current state

**State structure:**
```javascript
{
    page: number,           // Current page
    query: string,          // Current search
    filter: string,         // Current filter ('all', 'name', 'author')
    isLoading: boolean,     // Loading state
    hasMore: boolean,       // More results available
    totalResults: number,   // Total results
    isSmallResultSet: boolean, // Small result set (< 35)
    skins: Array           // Loaded skins
}
```

---

### getConfig()

Gets the current configuration of the API.

```javascript
const config = api.getConfig();
console.log('Current theme:', config.theme);
console.log('API URL:', config.apiUrl);
```

**Returns:** `Object` - Copy of the configuration object

**Note:** Returns a copy, cannot be modified directly (use `updateConfig`)

---

### updateConfig(newConfig)

Updates the API configuration by merging with existing settings.

```javascript
// Update multiple options
api.updateConfig({
    theme: 'light',
    autoSaveImages: true,
    itemsPerPage: 30
});

// Update callback
api.updateConfig({
    onSkinSelect: (skin) => console.log('New handler:', skin)
});
```

**Parameters:**
- `newConfig` (Object): New configuration options

**Returns:** `undefined`

**Behavior:**
- Merges with existing configuration
- Changes to URLs and theme are applied to the current instance; changing `apiUrl` clears that service's cache
- Changing `useModal` or `container` does not rebuild the current DOM; create a new instance to change display mode
- Callbacks are completely replaced

---

### destroy()

Destroys the instance and cleans up the DOM.

```javascript
api.destroy();
```

**Returns:** `undefined`

**Behavior:**
- Removes this instance's modal, or removes generated nodes from a custom container and restores its saved child nodes, class, and theme
- Removes registered event listeners and clears tracked timers
- Invalidates in-flight list requests so their later responses are ignored; it does not abort the underlying network or image requests
- Releases this instance's internally owned service reference and does not remove shared CSS
- `destroy()` is suitable for component teardown in an SPA, but it cannot cancel external work started by application callbacks or guarantee immediate garbage collection

**Recommended usage:**
```javascript
// In a framework component's unmount/dispose hook
componentWillUnmount() {
    this.api?.destroy();
}

// When changing pages
window.addEventListener('beforeunload', () => {
    api.destroy();
});
```

## Accessibility

- Skin cards are focusable and expose button semantics; `Enter` and `Space` activate a card.
- The modal exposes `role="dialog"`, `aria-modal="true"`, and an accessible label. Opening it moves focus to the search input; closing it with `Escape` restores focus to the element that opened it.
- `Tab` and `Shift+Tab` are wrapped between the modal's focusable controls during normal keyboard navigation.
- Load status uses a live region.

The modal does not make the rest of the host page inert; applications with strict dialog focus requirements should test the integration with their own overlays and focus-management code.

## Method Summary

| Method | Returns | Description |
|--------|---------|-------------|
| `show()` | `undefined` | Shows the explorer |
| `hide()` | `undefined` | Hides the explorer |
| `search(query)` | `Promise<Array>` | Searches skins |
| `setFilter(filter)` | `Promise<Array>` | Sets filter |
| `reset()` | `Promise<Array>` | Resets search |
| `getState()` | `Object` | Gets state |
| `getConfig()` | `Object` | Gets configuration |
| `updateConfig(newConfig)` | `undefined` | Updates configuration |
| `destroy()` | `undefined` | Destroys instance |

## Related Documentation

- [Configuration](configuration.md) - Constructor options
- [State Management](state-management.md) - State and callbacks
- [SkinService Reference](skinservice-reference.md) - Data service
- [SkinExplorerUI Reference](skinexplorerui-reference.md) - UI component
