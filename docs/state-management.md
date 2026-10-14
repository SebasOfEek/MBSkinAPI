# MBSkinAPI - State Management and Callbacks

MBSkinAPI maintains an internal state that tracks the current operation and provides callbacks to react to important events.

## Internal State

MBSkinAPI's internal state contains the following properties:

```javascript
{
    page: number,           // Current results page
    query: string,          // Current search term
    filter: string,         // Current filter ('all', 'name', 'author')
    isLoading: boolean,     // Active loading state
    hasMore: boolean,       // More results available
    totalResults: number,   // Total search results
    isSmallResultSet: boolean, // Whether the first result page is short (< 35 items)
    skins: Array           // Array of loaded skins
}
```

### Accessing the State

Use the `getState()` method to get a copy of the current state:

```javascript
const state = api.getState();
console.log('Current page:', state.page);
console.log('Active search:', state.query);
console.log('Total skins:', state.skins.length);
```

### State Properties

#### page

Current page number. Automatically increments when loading more results.

```javascript
const state = api.getState();
console.log('Page:', state.page); // 1, 2, 3, ...
```

#### query

Current search term. Empty string if no active search.

```javascript
const state = api.getState();
console.log('Search:', state.query); // 'dragon', '', etc.
```

#### filter

Current search filter. Possible values: `'all'`, `'name'`, `'author'`.

```javascript
const state = api.getState();
console.log('Filter:', state.filter); // 'all', 'name', 'author'
```

#### isLoading

Indicates if there's an active loading operation.

```javascript
const state = api.getState();
if (state.isLoading) {
    console.log('Loading...');
}
```

#### hasMore

Indicates if more results are available to load.

```javascript
const state = api.getState();
if (state.hasMore) {
    console.log('More skins available');
}
```

#### totalResults

Total results of the current search.

```javascript
const state = api.getState();
console.log('Total results:', state.totalResults);
```

#### isSmallResultSet

Indicates whether the first page contained fewer than 35 skins. This state flag does not trigger an unlimited request chain. When infinite scroll is enabled, MBSkinAPI may request at most two additional pages per explicit search to fill a short initial grid; remaining pages wait for user scrolling.

```javascript
const state = api.getState();
if (state.isSmallResultSet) {
    console.log('The initial result page was short');
}
```

#### skins

Array of currently loaded skins.

```javascript
const state = api.getState();
state.skins.forEach(skin => {
    console.log(`${skin.name} by ${skin.author}`);
});
```

## Callbacks

MBSkinAPI provides three main callbacks to react to events.

### onSkinSelect

Executed when the user selects a skin.

```javascript
const api = new MBSkinAPI({
    onSkinSelect: (skin) => {
        console.log(`Skin selected: ${skin.name} (ID: ${skin.id})`);
        // Your custom logic here
    }
});
```

**Parameters:**
- `skin` (Object): Selected skin object
  - `id`: Skin ID
  - `name`: Skin name
  - `author`: Skin author

**Behavior:**
- Automatically copies ID to clipboard
- Saves image if `autoSaveImages` is active
- Shows a toast notification

---

### onSkinLoad

Executed when new skins are loaded from the server.

```javascript
const api = new MBSkinAPI({
    onSkinLoad: (skins, state) => {
        console.log(`Loaded ${skins.length} skins`);
        console.log('Current state:', state);
        // Useful for analytics or UI updates
    }
});
```

**Parameters:**
- `skins` (Array): Array of loaded skins
- `state` (Object): Current API state

**Behavior:**
- Fires after each successful load
- Includes current state for full context
- Does not fire for a request superseded by a newer search

---

### onError

Executed when an error occurs in the API.

```javascript
const api = new MBSkinAPI({
    onError: (error) => {
        console.error('Error in MBSkinAPI:', error);
        // Your custom error handling
    }
});
```

**Parameters:**
- `error` (Error): Error object

**Behavior:**
- Fires on fetch, JSON parsing, and other errors
- Useful for logging and custom error handling
- Errors from superseded searches are ignored; HTTP and parsing errors expose a `kind`, and HTTP errors include `status`

## State Update Flow

### Search

```javascript
// User initiates search
api.search('dragon');

// Internal state updates:
// - query = 'dragon'
// - page = 1
// - isLoading = true
// - skins = [] (cleared)

// After loading:
// - isLoading = false
// - skins = [results]
// - hasMore = true/false
// - onSkinLoad fires

// If the current search fails, the previous successful skins and page are restored.
// The attempted query remains in state; onError receives the failure.
// A search superseded by a newer search does not update current UI/state or fire
// onSkinLoad/onError for that stale request. Its own search promise still resolves
// with its result.
```

### Infinite Scroll

```javascript
// User scrolls to end
// If hasMore = true and enableInfiniteScroll = true:
// - page increments
// - isLoading = true
// - skins extends with new results
// - onSkinLoad fires
// A short initial grid can cause at most two automatic extra-page requests per
// explicit search; later pages are loaded after user scrolling.
```

### Reset

```javascript
// User calls reset()
api.reset();

// State resets:
// - query = ''
// - page = 1
// - skins = []
// - Loads new skins
```

## Complete State Management Example

```javascript
const api = new MBSkinAPI({
    onSkinSelect: (skin) => {
        console.log('Selected:', skin.name);
        // Update your application UI
    },
    onSkinLoad: (skins, state) => {
        console.log(`Loaded ${skins.length} skins`);
        console.log(`Page ${state.page}, Total: ${state.totalResults}`);
        // Update counters, analytics, etc.
    },
    onError: (error) => {
        console.error('Error:', error.message);
        // Show error message to user
    }
});

// Monitor state periodically
setInterval(() => {
    const state = api.getState();
    if (state.isLoading) {
        console.log('Loading...');
    }
}, 1000);
```

## Related Documentation

- [API Reference](api-reference.md) - getState() and getConfig() methods
- [Configuration](configuration.md) - Callback configuration
- [SkinService Reference](skinservice-reference.md) - Data service
