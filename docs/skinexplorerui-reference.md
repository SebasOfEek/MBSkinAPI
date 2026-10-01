# SkinExplorerUI - UI Component Reference

`SkinExplorerUI` is an independent UI component for exploring skins. It can be used separately or integrated with `MBSkinAPI`.

## Constructor

```javascript
const explorerUI = new SkinExplorerUI(options);
```

### Constructor Options

### container

**Type:** `HTMLElement`  
**Default:** `document.body`

DOM element where the explorer will be rendered.

```javascript
const container = document.getElementById('my-container');
const explorerUI = new SkinExplorerUI({
    container: container
});
```

### skinService

**Type:** `SkinService`  
**Default:** `undefined`

SkinService instance for data operations.

```javascript
const skinService = new SkinService();
const explorerUI = new SkinExplorerUI({
    skinService: skinService
});
```

### onSkinSelect

**Type:** `function(skin)`  
**Default:** `() => {}`

Callback executed when a skin is selected.

```javascript
const explorerUI = new SkinExplorerUI({
    onSkinSelect: (skin) => {
        console.log('Skin selected:', skin.name);
    }
});
```

### theme

**Type:** `string`  
**Default:** `'dark'`

Visual theme of the component.

```javascript
const explorerUI = new SkinExplorerUI({
    theme: 'light'
});
```

### customStyles

**Type:** `Object`  
**Default:** `{}`

Object with custom CSS styles.

```javascript
const explorerUI = new SkinExplorerUI({
    customStyles: {
        '.mb-explorer': 'background: #f0f0f0;',
        '.mb-btn': 'background: #ff5722;'
    }
});
```

## Public Methods

### setSkinService(skinService)

Sets or updates the SkinService instance.

```javascript
const skinService = new SkinService();
explorerUI.setSkinService(skinService);
```

**Parameters:**
- `skinService` (SkinService): SkinService instance

**Returns:** `undefined`

---

### setOnSkinSelect(callback)

Updates the skin selection callback.

```javascript
explorerUI.setOnSkinSelect((skin) => {
    console.log('New callback:', skin.name);
});
```

**Parameters:**
- `callback` (function): New callback function

**Returns:** `undefined`

---

### search(query)

Executes a programmatic search.

```javascript
explorerUI.search('dragon');
```

**Parameters:**
- `query` (string): Search term

**Returns:** `undefined`

---

### getSelectedSkin()

Gets the currently selected skin.

```javascript
const selectedSkin = explorerUI.getSelectedSkin();
if (selectedSkin) {
    console.log('Selected skin:', selectedSkin.name);
}
```

**Returns:** `Object | undefined` - Skin object or `undefined` if no selection

---

### destroy()

Destroys the component and removes it from the DOM.

```javascript
explorerUI.destroy();
```

**Returns:** `undefined`

**Behavior:**
- Removes element from DOM
- Clears internal references

## Internal State

The component maintains an internal state with the following properties:

```javascript
{
    skins: [],              // Loaded skins
    filteredSkins: [],      // Filtered skins
    isLoading: false,       // Loading state
    hasMore: true,          // More results available
    currentPage: 1,         // Current page
    query: '',              // Current search
    filter: 'all',          // Current filter
    selectedSkin: null      // Selected skin
}
```

## Independent Modular Usage

SkinExplorerUI can be used without MBSkinAPI:

```javascript
// Create SkinService
const skinService = new SkinService({
    apiUrl: 'https://api.example.com/skins.php',
    imageUrl: 'https://cdn.example.com/skins/'
});

// Create container
const container = document.getElementById('my-explorer');

// Initialize SkinExplorerUI
const explorerUI = new SkinExplorerUI({
    container: container,
    skinService: skinService,
    onSkinSelect: (skin) => {
        console.log('Selected:', skin.name);
    },
    theme: 'light'
});

// Perform search
explorerUI.search('dragon');
```

## Integration with MBSkinAPI

MBSkinAPI uses SkinExplorerUI internally when configured with custom container:

```javascript
const api = new MBSkinAPI({
    container: '#my-container',
    useModal: false
});
```

## Method Summary

| Method | Returns | Description |
|--------|---------|-------------|
| `setSkinService(skinService)` | `undefined` | Sets SkinService |
| `setOnSkinSelect(callback)` | `undefined` | Updates callback |
| `search(query)` | `undefined` | Executes search |
| `getSelectedSkin()` | `Object \| undefined` | Gets selected skin |
| `destroy()` | `undefined` | Destroys component |

## Related Documentation

- [SkinService Reference](skinservice-reference.md) - Data service
- [API Reference](api-reference.md) - MBSkinAPI reference
- [Styling](styling.md) - Theme system and CSS variables
