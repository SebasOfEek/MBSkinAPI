# MBSkinAPI - API Reference

Complete documentation of public methods of the `MBSkinAPI` class.

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

Searches skins by text with 500ms debouncing. Resets search from page 1.

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
- Applies 500ms debouncing
- Resets to page 1
- Triggers the `onSkinLoad` callback

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
- Some changes require restarting the API
- Callbacks are completely replaced

---

### destroy()

Destroys the instance and cleans up the DOM.

```javascript
api.destroy();
```

**Returns:** `undefined`

**Behavior:**
- Removes modal/container from DOM
- Removes injected styles
- Clears internal references
- Cancels pending operations

**Recommended usage:**
```javascript
// In React/Vue/Angular components
componentWillUnmount() {
    this.api?.destroy();
}

// When changing pages
window.addEventListener('beforeunload', () => {
    api.destroy();
});
```

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
