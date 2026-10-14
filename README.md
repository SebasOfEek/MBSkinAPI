# MBSkinAPI - Mine Blocks Skin Explorer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vanilla JS](https://img.shields.io/badge/Language-Vanilla%20JS-f7df1e.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Version](https://img.shields.io/badge/Version-3.0.0-blue.svg)](https://github.com/SebasOfEek/MBSkinAPI)
[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-brightgreen.svg)](https://github.com/)

**MBSkinAPI** is a lightweight and modular solution designed for exploring, searching, and selecting Mine Blocks skins. Ideal for developers looking for quick character customization integration in web projects.

## Key Features

* **📦 Modular Architecture:** Decoupled components (Service, UI, API) for maximum flexibility. Use them together or separately.
* **🚀 Zero Dependencies:** Built with pure Vanilla JavaScript. No frameworks, no overhead.
* **🔍 Powerful Search:** Dynamic filters by name, author, or both with debounced input.
* **📱 Responsive Design:** Optimized for desktop, tablet, and mobile devices with adaptive layouts.
* **⚡ Performance:** Smart caching system (5-minute default) to reduce server requests.
* **🎨 Theme System:** Built-in dark/light themes with CSS variables for easy customization.
* **🔄 Infinite Scroll:** Scroll-based pagination, with at most two automatic extra-page requests per explicit search to fill a short initial grid.
* **🖼️ Canvas Rendering:** Pixel-perfect skin rendering with background transparency.
* **🎯 Multiple Deployment Modes:** Modal overlay or custom container integration.
* **♿ Keyboard Accessibility:** Keyboard-operable skin cards, modal focus handling, and ARIA semantics.
* **🧹 Lifecycle Cleanup:** `destroy()` removes an instance's listeners, tracked timers, and owned DOM.

## Project Structure

```bash
MBSkinAPI/
│
├── 📁 dist
│   ├── 📄 MBSkinAPI.bundle.js
│   ├── 📄 MBSkinAPI.bundle.min.js
│   └── 🎨 MBSkinStyles.css
│
├── 📁 docs
│   ├── 📄 README.md
│   ├── 📄 installation.md
│   ├── 📄 configuration.md
│   ├── 📄 api-reference.md
│   ├── 📄 skinservice-reference.md
│   ├── 📄 skinexplorerui-reference.md
│   ├── 📄 state-management.md
│   ├── 📄 styling.md
│   └── 📁 translations
│       └── 📁 es
│
├── 📁 examples
│   └── 🌐 example.html
│
├── 📁 src
│   ├── 📁 core
│   │   └── 📄 MBSkinAPI.js          # Main API class (v3.0.0)
│   ├── 📁 services
│   │   └── 📄 SkinService.js        # Data service with caching (v2.0.0)
│   ├── 📁 style
│   │   └── 🎨 MBSkinStyles.css      # Complete styling system (v2.0.0)
│   └── 📁 ui
│       └── 📄 SkinExplorerUI.js     # Independent UI component (v2.0.0)
│
└── 📝 README.md
```

> 📦 `dist/` contains the production-ready version (bundled and optimized for CDN usage).
>
> **Required CSS:** include `MBSkinStyles.css` manually with a `<link>` tag. JavaScript no longer injects styles; the legacy `injectStyles()` and `loadStyles()` methods are no-ops.
> 📚 `docs/` contains comprehensive documentation for all components and features.

## Installation & Setup

### 1. CDN (Recommended)

Add the following resources to your `<head>` or before closing `</body>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/SebasOfEek/MBSkinAPI@main/dist/MBSkinStyles.css">
<script src="https://cdn.jsdelivr.net/gh/SebasOfEek/MBSkinAPI@main/dist/MBSkinAPI.bundle.min.js"></script>
```

### 2. Direct Download

Download files from GitHub and include them in your project:

#### Production (Bundled)

```html
<link rel="stylesheet" href="path/to/your/project/dist/MBSkinStyles.css">
<script src="path/to/your/project/dist/MBSkinAPI.bundle.min.js"></script>
```

#### Development (Modular)

For development or if you need to use components separately:

```html
<link rel="stylesheet" href="path/to/your/project/src/style/MBSkinStyles.css">
<script src="path/to/your/project/src/services/SkinService.js"></script>
<script src="path/to/your/project/src/ui/SkinExplorerUI.js"></script>
<script src="path/to/your/project/src/core/MBSkinAPI.js"></script>
```

> 📖 For detailed installation instructions, see the [Installation Guide](docs/installation.md).

## Basic Usage

### Quick Start (Modal Mode)

```html
<button id="btn-selector">Search Skins</button>
```

```javascript
const skinAPI = new MBSkinAPI({
    onSkinSelect: (skin) => {
        console.log(`Selected: ${skin.name} (ID: ${skin.id})`);
        // Add your logic to apply the skin here
    }
});

document.getElementById('btn-selector').onclick = () => skinAPI.show();
```

### Custom Container Mode

```html
<div id="skin-explorer"></div>
```

```javascript
const skinAPI = new MBSkinAPI({
    container: '#skin-explorer',
    useModal: false,
    theme: 'light',
    onSkinSelect: (skin) => {
        console.log(`Selected: ${skin.name} (ID: ${skin.id})`);
    }
});

skinAPI.show();
```

### Programmatic Search

```javascript
const api = new MBSkinAPI();

// Search for specific skins
api.search('dragon');

// Filter by author
api.setFilter('author');
api.search('PlayerName');

// Reset to show all skins
api.reset();
```

## Documentation

MBSkinAPI includes comprehensive modular documentation to help you get started and master all features:

### Available Documentation

| Document | Description |
|-----------|-------------|
| **[Installation Guide](docs/installation.md)** | Complete setup guide for all environments (CDN, local, modular) |
| **[Configuration Options](docs/configuration.md)** | Detailed configuration options, themes, and callbacks |
| **[API Reference](docs/api-reference.md)** | Complete reference of MBSkinAPI public methods |
| **[SkinService Reference](docs/skinservice-reference.md)** | Data service with caching, filtering, and image handling |
| **[SkinExplorerUI Reference](docs/skinexplorerui-reference.md)** | Independent UI component for skin exploration |
| **[State Management](docs/state-management.md)** | Internal state structure and callback system |
| **[Styling System](docs/styling.md)** | Theme system, CSS variables, and customization |

### Quick Start

1. **Installation**: Follow the [Installation Guide](docs/installation.md)
2. **Configuration**: Explore [Configuration Options](docs/configuration.md)
3. **API Reference**: Check the complete [API Reference](docs/api-reference.md)
4. **Modular Components**: Learn about [SkinService](docs/skinservice-reference.md) and [SkinExplorerUI](docs/skinexplorerui-reference.md)

### Key Features Documentation

- **Flexible UI**: Modal overlay or custom container integration
- **Advanced Search**: Multiple filters (name, author, all); MBSkinAPI input uses a 500ms debounce and SkinExplorerUI input uses 300ms. Programmatic searches start immediately.
- **Theme System**: Dark/light themes with CSS variables for easy customization
- **Error Handling**: Robust PHP warnings management with multiple fallback methods
- **Performance**: Per-service caching (5-minute default) and scroll-based pagination with bounded initial auto-fill
- **Mobile Support**: Responsive design with adaptive layouts for all devices

## Technical Documentation

### Configuration Options

The MBSkinAPI constructor accepts a comprehensive options object:

```javascript
const config = {
    // API Endpoints
    apiUrl: 'https://mineblocks.com/1/scripts/returnSkins.php',
    imageUrl: 'https://mineblocks.com/1/skins/images/',
    
    // UI Configuration
    container: null,              // CSS selector or DOM element
    useModal: true,               // Use modal overlay (true) or custom container (false)
    theme: 'dark',                // 'dark' or 'light'
    
    // Functionality
    autoSaveImages: false,        // Auto-download skin images on selection
    showLoadStatus: true,         // Show loading status messages
    enableInfiniteScroll: true,   // Enable scroll-based pagination
    itemsPerPage: 20,             // Target for filling a short initial grid (not server page size)
    
    // Callbacks
    onSkinSelect: (skin) => {},   // Called when skin is selected
    onSkinLoad: (skins, state) => {}, // Called when skins are loaded
    onError: (error) => {}        // Called on errors
};

const api = new MBSkinAPI(config);
```

> 📖 See [Configuration Options](docs/configuration.md) for detailed documentation of all options.

### API Endpoints

MBSkinAPI communicates with the Mine Blocks skin API:

**Skin Data Endpoint**
- **URL**: `https://mineblocks.com/1/scripts/returnSkins.php`
- **Method**: POST
- **Parameters**:
  - `type`: `'search'` or `'new'`
  - `page`: Page number (default: 1)
  - `key`: Search term (for type='search')

**Image Endpoint**
- **Base URL**: `https://mineblocks.com/1/skins/images/`
- **Format**: `{skinId}.png`
- **Example**: `https://mineblocks.com/1/skins/images/12345.png`

The API includes robust error handling with multiple fallback methods to clean PHP warnings and extract valid JSON from responses.

`MBSkinAPI` and `SkinExplorerUI` delegate data access to `SkinService`, which validates response structure and requires non-empty string `id`, `name`, and `author` fields. Remote skin text is rendered as text, not HTML. `MBSkinAPI` owns a service/cache per instance. `SkinExplorerUI` creates its own by default and accepts a `skinService` option when explicit cache/configuration sharing is needed.

## Public Methods

### MBSkinAPI Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `api.show()` | `undefined` | Displays the explorer (modal or container) |
| `api.hide()` | `undefined` | Hides the explorer |
| `api.search(query)` | `Promise<Array>` | Searches skins immediately; only input typing is debounced |
| `api.setFilter(filter)` | `Promise<Array>` | Sets filter type (`all`, `name`, `author`) |
| `api.reset()` | `Promise<Array>` | Resets search and shows new skins |
| `api.getState()` | `Object` | Gets current API state |
| `api.getConfig()` | `Object` | Gets current configuration |
| `api.updateConfig(newConfig)` | `undefined` | Updates configuration |
| `api.destroy()` | `undefined` | Destroys instance and cleans up DOM |

> 📖 See [API Reference](docs/api-reference.md) for detailed method documentation with examples.

Searches superseded by newer searches are ignored for current UI/state and do not call `onSkinLoad` or `onError`. Call `destroy()` during SPA teardown to remove that instance's listeners, tracked timers, and owned DOM. It invalidates pending list responses but does not abort already-started network/image requests or remove shared CSS.

### State Management

MBSkinAPI maintains an internal state that tracks the current operation:

```javascript
{
    page: number,           // Current results page
    query: string,          // Current search term
    filter: string,         // Current filter ('all', 'name', 'author')
    isLoading: boolean,     // Active loading state
    hasMore: boolean,       // More results available
    totalResults: number,   // Total search results
    isSmallResultSet: boolean, // Small result set (< 35 items)
    skins: Array           // Array of loaded skins
}
```

Access the state using `api.getState()`.

> 📖 See [State Management](docs/state-management.md) for detailed state documentation and callback system.

## Modular Architecture

MBSkinAPI is designed with a modular architecture that allows using its components independently:

### Components

**MBSkinAPI** (v3.0.0)
- Main orchestrator class
- Integrates all components
- Provides high-level API
- Manages state and callbacks

**SkinService** (v2.0.0)
- Independent data service
- Handles API communication
- Implements caching system (5-minute default)
- Provides filtering and image rendering
- Can be used standalone

**SkinExplorerUI** (v2.0.0)
- Independent UI component
- Custom styling support
- Debounced search
- Infinite scroll
- Can be used standalone

### Using Components Separately

```javascript
// Use SkinService independently
const skinService = new SkinService({
    apiUrl: 'https://mineblocks.com/1/scripts/returnSkins.php',
    imageUrl: 'https://mineblocks.com/1/skins/images/',
    cacheTimeout: 600000 // 10 minutes
});

const skins = await skinService.getNewSkins(1);
const filtered = skinService.filterSkins(skins, 'dragon', 'name');

// Use SkinExplorerUI independently
const explorerUI = new SkinExplorerUI({
    container: document.getElementById('my-explorer'),
    skinService: skinService,
    onSkinSelect: (skin) => console.log('Selected:', skin.name),
    theme: 'light'
});
```

> 📖 See [SkinService Reference](docs/skinservice-reference.md) and [SkinExplorerUI Reference](docs/skinexplorerui-reference.md) for detailed component documentation.

## Styling & Theming

MBSkinAPI uses CSS variables for easy theme customization. Styles are **not** injected automatically: manually link `dist/MBSkinStyles.css` in the host HTML. The legacy JavaScript methods `injectStyles()` and `loadStyles()` are no-ops.

### Built-in Themes

**Dark Theme** (Default)
```css
--mb-bg: #1a1a1a;
--mb-border: #333;
--mb-text: #fff;
--mb-text-secondary: #aaa;
--mb-accent: #4CAF50;
--mb-hover: #2d2d2d;
```

**Light Theme**
```css
--mb-bg: #ffffff;
--mb-border: #ddd;
--mb-text: #333;
--mb-text-secondary: #666;
--mb-accent: #2196F3;
--mb-hover: #f5f5f5;
```

### Custom Styling

Override CSS variables in your stylesheet:

```css
.mb-skin-api-container {
    --mb-bg: #0f0f23;
    --mb-border: #1a1a3e;
    --mb-text: #e0e0e0;
    --mb-accent: #7c4dff;
}
```

### Additional Theme Colors

The styling system also supports additional color themes:
- **Blue**: `#2196f3`
- **Purple**: `#9c27b0`
- **Red**: `#f44336`
- **Orange**: `#ff9800`

> 📖 See [Styling System](docs/styling.md) for complete CSS variable reference and customization examples.

## Advanced Features

### Caching System

SkinService implements a smart caching system to reduce server requests:

- **Default timeout**: 5 minutes (300,000ms)
- **Cache key**: Generated from request parameters
- **Methods**: `clearCache()`, `cleanExpiredCache()`

```javascript
const skinService = new SkinService({
    cacheTimeout: 600000 // 10 minutes
});

// Clear all cache
skinService.clearCache();

// Clear only expired entries
skinService.cleanExpiredCache();
```

### Infinite Scroll

Scroll-based loading of additional pages. When the initial grid is short, MBSkinAPI may request at most two extra pages per explicit search; remaining pages wait for user scrolling.

```javascript
const api = new MBSkinAPI({
    enableInfiniteScroll: true,
    itemsPerPage: 20
});
```

### SPA Lifecycle and Accessibility

Call `destroy()` from the owning component's unmount/dispose hook. It removes that instance's registered listeners, tracked timers, and owned DOM and invalidates its pending list responses. It does not remove shared styles, destroy a caller-owned/shared `SkinService`, abort requests already in progress, or guarantee immediate garbage collection.

Skin cards activate with `Enter` or `Space`. The modal exposes dialog ARIA attributes, moves focus to its search input when opened, wraps normal Tab navigation, closes with `Escape`, and restores focus to the opener.

MBSkinAPI delegates request, response validation, cache, and image operations to its own `SkinService` by default. A newer search supersedes older requests: stale responses do not update current UI/state or invoke `onSkinLoad`/`onError`. SkinExplorerUI also ignores stale responses for its UI, but does not expose those MBSkinAPI callbacks.

### Canvas Rendering

Skins are rendered on HTML5 canvas with:
- Pixel-perfect scaling (16x22 pixels)
- Background transparency (auto-removes background color)
- CORS support for cross-origin images

### Error Handling

Robust error handling with multiple fallback methods:
- PHP warnings removal
- HTML tag stripping
- JSON extraction with regex
- Multiple parsing strategies

### Responsive Design

Adaptive layouts for different screen sizes:
- Desktop: Full grid layout
- Tablet: Optimized grid spacing
- Mobile: Compact layout with adjusted sizing

## Credits

* Main Developer:
SebasOfEek

* Mine Blocks - Created by Zanzlanz
https://zanzlanz.com/MineBlocks

## License

This project is licensed under the MIT License.
See the `LICENSE` file for more details.
