# SkinService - Service Reference

`SkinService` is an independent module that handles all data operations related to skins: fetch, cache, filtering, and rendering.

## Constructor

```javascript
const skinService = new SkinService(options);
```

### Constructor Options

### apiUrl

**Type:** `string`  
**Default:** `'https://mineblocks.com/1/scripts/returnSkins.php'`

URL of the PHP endpoint that returns skin data.

```javascript
const skinService = new SkinService({
    apiUrl: 'https://api.example.com/skins.php'
});
```

### imageUrl

**Type:** `string`  
**Default:** `'https://mineblocks.com/1/skins/images/'`

Base URL for skin images.

```javascript
const skinService = new SkinService({
    imageUrl: 'https://cdn.example.com/skins/'
});
```

### cacheTimeout

**Type:** `number` (milliseconds)  
**Default:** `300000` (5 minutes)

Cache expiration time in milliseconds.

```javascript
const skinService = new SkinService({
    cacheTimeout: 600000 // 10 minutes
});
```

## Public Methods

### fetchSkins(params)

Fetches skins from the server with cache support.

```javascript
const skins = await skinService.fetchSkins({
    type: 'search',
    key: 'dragon',
    page: 1
});
```

**Parameters:**
- `params` (Object):
  - `type` (string): `'search'` or `'new'`
  - `page` (number): Page number (default: 1)
  - `key` (string): Search term (optional)

**Returns:** `Promise<Array>` - Array of skins

**Behavior:**
- Uses cache if response is available and not expired
- Cleans PHP response with multiple fallback methods
- Validates that response is a valid JSON array

---

### searchSkins(query, filter, page)

Searches skins by term with local filtering.

```javascript
const skins = await skinService.searchSkins('dragon', 'name', 1);
```

**Parameters:**
- `query` (string): Search term
- `filter` (string): `'all'`, `'name'`, `'author'` (default: `'all'`)
- `page` (number): Page number (default: 1)

**Returns:** `Promise<Array>` - Array of filtered skins

---

### getNewSkins(page)

Gets the most recent skins (type 'new').

```javascript
const skins = await skinService.getNewSkins(1);
```

**Parameters:**
- `page` (number): Page number (default: 1)

**Returns:** `Promise<Array>` - Array of new skins

---

### filterSkins(skins, query, filter)

Filters a skin array locally (without fetch).

```javascript
const filtered = skinService.filterSkins(skinsArray, 'dragon', 'name');
```

**Parameters:**
- `skins` (Array): Array of skins to filter
- `query` (string): Search term
- `filter` (string): `'all'`, `'name'`, `'author'` (default: `'all'`)

**Returns:** `Array` - Filtered array

---

### getSkinImageUrl(skinId)

Generates the full URL of a skin image.

```javascript
const url = skinService.getSkinImageUrl('12345');
// Returns: 'https://mineblocks.com/1/skins/images/12345.png'
```

**Parameters:**
- `skinId` (string): Skin ID

**Returns:** `string` - Full image URL

---

### drawSkin(skinId, canvas)

Draws a skin on a canvas element with background transparency.

```javascript
const canvas = document.getElementById('my-canvas');
await skinService.drawSkin('12345', canvas);
```

**Parameters:**
- `skinId` (string): Skin ID
- `canvas` (HTMLCanvasElement): Canvas element

**Returns:** `Promise<void>`

**Behavior:**
- Loads image with CORS
- Scales to 16x22 pixels
- Applies transparency to background color
- Disables image smoothing (pixelated)

---

### clearCache()

Clears the entire cache.

```javascript
skinService.clearCache();
```

**Returns:** `undefined`

---

### cleanExpiredCache()

Removes only expired cache entries.

```javascript
skinService.cleanExpiredCache();
```

**Returns:** `undefined`

---

### getSkinStats(skin)

Gets statistics of a skin.

```javascript
const stats = skinService.getSkinStats(skin);
// Returns: { id, name, author, nameLength, authorLength, imageUrl }
```

**Parameters:**
- `skin` (Object): Skin object

**Returns:** `Object` - Skin statistics

---

### isValidSkin(skin)

Validates if an object is a valid skin.

```javascript
const isValid = skinService.isValidSkin(skinObject);
```

**Parameters:**
- `skin` (Object): Object to validate

**Returns:** `boolean` - `true` if valid

**Validation criteria:**
- Has `id`, `name`, `author` properties (all strings)
- `id`, `name`, `author` are not empty

---

### getSkinsByAuthor(author, limit)

Searches skins by author with result limit.

```javascript
const authorSkins = await skinService.getSkinsByAuthor('PlayerName', 50);
```

**Parameters:**
- `author` (string): Author name
- `limit` (number): Result limit (default: 50)

**Returns:** `Promise<Array>` - Author's skins

---

### exportSkin(skin)

Exports a skin to JSON format.

```javascript
const json = skinService.exportSkin(skin);
console.log(json);
```

**Parameters:**
- `skin` (Object): Skin object

**Returns:** `string` - Formatted JSON string

## Modular Usage

SkinService can be used independently of MBSkinAPI:

```javascript
// Instantiate SkinService separately
const skinService = new SkinService({
    apiUrl: 'https://api.example.com/skins.php',
    imageUrl: 'https://cdn.example.com/skins/',
    cacheTimeout: 600000
});

// Use its methods directly
const skins = await skinService.getNewSkins(1);
const filtered = skinService.filterSkins(skins, 'dragon', 'name');
const stats = skinService.getSkinStats(skins[0]);
```

## Method Summary

| Method | Returns | Description |
|--------|---------|-------------|
| `fetchSkins(params)` | `Promise<Array>` | Fetches skins from server |
| `searchSkins(query, filter, page)` | `Promise<Array>` | Searches skins with filter |
| `getNewSkins(page)` | `Promise<Array>` | Gets new skins |
| `filterSkins(skins, query, filter)` | `Array` | Filters skins locally |
| `getSkinImageUrl(skinId)` | `string` | Generates image URL |
| `drawSkin(skinId, canvas)` | `Promise<void>` | Draws skin on canvas |
| `clearCache()` | `undefined` | Clears cache |
| `cleanExpiredCache()` | `undefined` | Clears expired cache |
| `getSkinStats(skin)` | `Object` | Gets statistics |
| `isValidSkin(skin)` | `boolean` | Validates skin |
| `getSkinsByAuthor(author, limit)` | `Promise<Array>` | Searches by author |
| `exportSkin(skin)` | `string` | Exports to JSON |

## Related Documentation

- [API Reference](api-reference.md) - MBSkinAPI reference
- [SkinExplorerUI Reference](skinexplorerui-reference.md) - UI component
- [State Management](state-management.md) - State management
