# MBSkinAPI - Configuration Options

The `MBSkinAPI` constructor accepts an options object to customize its behavior. All options are optional and have default values.

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

Base URL for skin images. The skin ID is concatenated at the end.

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

**Type:** `'dark' | 'light'`  
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

Enables or disables infinite scroll to automatically load more skins.

```javascript
const api = new MBSkinAPI({
    enableInfiniteScroll: false
});
```

### itemsPerPage

**Type:** `number`  
**Default:** `20`

Number of skins to load per page when using infinite scroll.

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
