# MBSkinAPI - Configuration Options

The `MBSkinAPI` constructor accepts an options object to customize its behavior. All options are optional and have default values.

> **CSS is required separately:** include `MBSkinStyles.css` in the page. JavaScript does not inject styles; `injectStyles()` is retained as a no-op for compatibility. See [installation](installation.md).

`MBSkinAPI` creates and owns a `SkinService` internally for requests, cache, response validation, and image URL/rendering operations. Its service/cache is per instance; `MBSkinAPI` does not expose a constructor option for injecting a shared service. `SkinExplorerUI` does accept a `skinService` option.

## Constructor

```javascript
const api = new MBSkinAPI(options);
```

## Available Options

### apiUrl

**Type:** `string`  
**Default:** `'https://mineblocks.com/1/scripts/returnSkins.php'`

URL of the PHP endpoint that returns skin data.

```javascript
const api = new MBSkinAPI({
    apiUrl: 'https://api.example.com/skins.php'
});
```

### imageUrl

**Type:** `string`  
**Default:** `'https://mineblocks.com/1/skins/images/'`

Base URL for skin images. The ID is encoded segment by segment, preserving `/` path separators.

```javascript
const api = new MBSkinAPI({
    imageUrl: 'https://cdn.example.com/skins/'
});
```

### container

**Type:** `string | HTMLElement`  
**Default:** `null`

CSS selector or DOM element where the explorer will be rendered when `useModal` is `false`.

```javascript
// Using CSS selector
const api = new MBSkinAPI({
    container: '#my-container',
    useModal: false
});

// Using DOM element
const container = document.getElementById('my-container');
const api = new MBSkinAPI({
    container: container,
    useModal: false
});
```

### useModal

**Type:** `boolean`  
**Default:** `true`

Determines whether to use a modal overlay or a custom container.

```javascript
// Modal (default)
const api = new MBSkinAPI({
    useModal: true
});

// Custom container
const api = new MBSkinAPI({
    container: '#my-container',
    useModal: false
});
```

### autoSaveImages

**Type:** `boolean`  
**Default:** `false`

If `true`, automatically downloads the skin image when selected.

```javascript
const api = new MBSkinAPI({
    autoSaveImages: true
});
```

### onSkinSelect

**Type:** `function(skin)`  
**Default:** `console.log` of selected skin

Callback executed when the user selects a skin.

```javascript
const api = new MBSkinAPI({
    onSkinSelect: (skin) => {
        console.log(`Skin selected: ${skin.name} (ID: ${skin.id})`);
        // Your custom logic here
    }
});
```

### onSkinLoad

**Type:** `function(skins, state)`  
**Default:** `null`

Callback executed when new skins are loaded.

```javascript
const api = new MBSkinAPI({
    onSkinLoad: (skins, state) => {
        console.log(`Loaded ${skins.length} skins`);
        console.log('Current state:', state);
    }
});
```

### onError

**Type:** `function(error)`  
**Default:** `console.error` of error

Callback executed when an error occurs.

```javascript
const api = new MBSkinAPI({
    onError: (error) => {
        console.error('Error in MBSkinAPI:', error);
        // Your custom error handling
    }
});
```

### theme

**Type:** `string` (the `MBSkinAPI` UI currently maps `'dark'` to dark and every other value to light)
**Default:** `'dark'`

Visual theme of the interface.

```javascript
const api = new MBSkinAPI({
    theme: 'light'
});
```

### showLoadStatus

**Type:** `boolean`  
**Default:** `true`

Shows or hides load status messages.

```javascript
const api = new MBSkinAPI({
    showLoadStatus: false
});
```

### enableInfiniteScroll

**Type:** `boolean`  
**Default:** `true`

Enables or disables scroll-based pagination. When enabled, the API may automatically request at most two additional pages per explicit search to fill a short initial grid; further pages require user scrolling.

```javascript
const api = new MBSkinAPI({
    enableInfiniteScroll: false
});
```

### itemsPerPage

**Type:** `number`  
**Default:** `20`

Target number of visible items used to decide whether to fill a short initial grid. It is not a server-side page-size setting; the endpoint determines the number of records returned per page.

```javascript
const api = new MBSkinAPI({
    itemsPerPage: 30
});
```

## Complete Example

```javascript
const api = new MBSkinAPI({
    // URLs
    apiUrl: 'https://mineblocks.com/1/scripts/returnSkins.php',
    imageUrl: 'https://mineblocks.com/1/skins/images/',
    
    // UI
    container: '#my-container',
    useModal: false,
    theme: 'dark',
    
    // Functionality
    autoSaveImages: false,
    showLoadStatus: true,
    enableInfiniteScroll: true,
    itemsPerPage: 20,
    
    // Callbacks
    onSkinSelect: (skin) => console.log('Skin:', skin),
    onSkinLoad: (skins, state) => console.log('Loaded:', skins.length),
    onError: (error) => console.error('Error:', error)
});
```

## Configuration Update

To update configuration after creating the instance, use the `updateConfig()` method:

```javascript
api.updateConfig({
    theme: 'light',
    itemsPerPage: 30
});
```

See [API Reference](api-reference.md) for more details on `updateConfig()`.
