# MBSkinAPI - Mine Blocks Skin Explorer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vanilla JS](https://img.shields.io/badge/Language-Vanilla%20JS-f7df1e.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-brightgreen.svg)](https://github.com/)

**MBSkinAPI** is a lightweight and modular solution designed for exploring, searching, and selecting Mine Blocks skins. Ideal for developers looking for quick character customization integration in web projects.

## Key Features

* **📦 Modular Architecture:** Decoupled components (Service, UI, API) for maximum flexibility.
* **🚀 Zero Dependencies:** Built with pure Vanilla JavaScript. No frameworks, no overhead.
* **🔍 Powerful Search:** Dynamic filters by name, author, or tags.
* **📱 Responsive Design:** Optimized for desktop, tablet, and mobile devices.
* **⚡ Performance:** Smart caching system to reduce server requests.

## Project Structure

```bash
MBSkinAPI/
│
├── 📁 dist
│   ├── 📄 MBSkinAPI.bundle.js
│   ├── 📄 MBSkinAPI.bundle.min.js
│   └── 🎨 MBSkinStyles.css
│
├── 📁 examples
│   └── 🌐 example.html
│
├── 📁 src
│   ├── 📁 core
│   │   └── 📄 MBSkinAPI.js
│   ├── 📁 services
│   │   └── 📄 SkinService.js
│   ├── 📁 style
│   │   └── 🎨 MBSkinStyles.css
│   └── 📁 ui
│       └── 📄 SkinExplorerUI.js
│
└── 📝 README.md
```

> 📦 `dist/` contains the production-ready version (bundled and optimized for CDN usage).

## Installation & Setup

### 1. CDN (Recommended)

Add the following resources to your `<head>` or before closing `</body>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/SebasOfEek/MBSkinAPI@main/dist/MBSkinStyles.css">
<script src="https://cdn.jsdelivr.net/gh/SebasOfEek/MBSkinAPI@main/dist/MBSkinAPI.bundle.min.js"></script>
```

### 2. Direct Download

Download files from GitHub and include them in your project:

#### Production

```html
<link rel="stylesheet" href="dist/MBSkinStyles.css">
<script src="dist/MBSkinAPI.bundle.min.js"></script>
```

#### Development

```html
<link rel="stylesheet" href="src/style/MBSkinStyles.css">
<script src="src/services/SkinService.js"></script>
<script src="src/ui/SkinExplorerUI.js"></script>
<script src="src/core/MBSkinAPI.js"></script>
```

## Basic Usage

### HTML

```html
<button id="btn-selector">Search Skins</button>
```

### JavaScript

```javascript
const skinAPI = new MBSkinAPI({
    onSkinSelect: (skin) => {
        console.log(`Selected: ${skin.name} (ID: ${skin.id})`);
        // Add your logic to apply the skin here
    }
});

document.getElementById('btn-selector').onclick = () => skinAPI.show();
```

## Technical Documentation

### Configuration Options

```javascript
const config = {
    apiUrl: 'https://api.example.com/skins',
    autoLoad: false,
    container: document.body,
    theme: 'dark' // 'light', 'dark', 'purple'
};

const api = new MBSkinAPI(config);
```

## Public Methods

| Method                | Description                                     |
| :-------------------- | :---------------------------------------------- |
| `api.show()`          | Displays the explorer modal                     |
| `api.hide()`          | Hides the modal                                 |
| `api.search(query)`   | Performs a programmatic search                  |
| `api.setFilter(type)` | Changes active filter (`all`, `name`, `author`) |

## Credits

* Main Developer:
SebasOfEek

* Mine Blocks - Created by Zanzlanz
https://zanzlanz.com/MineBlocks

## License

This project is licensed under the MIT License.
See the `LICENSE` file for more details.
