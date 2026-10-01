# MBSkinAPI - Installation Guide

This guide describes the different ways to install and configure MBSkinAPI in your project.

## Option 1: CDN (Recommended for Production)

The quickest way to use MBSkinAPI is via CDN.

### Bundle Version

```html
<script src="https://cdn.jsdelivr.net/gh/SebasOfEek/MBSkinAPI@latest/dist/MBSkinAPI.bundle.js"></script>
```

### Minified Version

```html
<script src="https://cdn.jsdelivr.net/gh/SebasOfEek/MBSkinAPI@latest/dist/MBSkinAPI.bundle.min.js"></script>
```

## Option 2: Local Download

### 1. Download the files

```bash
git clone https://github.com/SebasOfEek/MBSkinAPI.git
cd MBSkinAPI
```

### 2. Include the bundle in your project

```html
<script src="dist/MBSkinAPI.bundle.js"></script>
```

## Option 3: Modular Development

For development or if you need to use components separately, include individual modules in the correct order:

```html
<script src="src/services/SkinService.js"></script>
<script src="src/ui/SkinExplorerUI.js"></script>
<script src="src/core/MBSkinAPI.js"></script>
```

## Installation Verification

After including the script, verify that MBSkinAPI is available:

```javascript
if (typeof MBSkinAPI !== 'undefined') {
    console.log('MBSkinAPI loaded successfully');
} else {
    console.error('MBSkinAPI could not be loaded');
}
```

## Basic Initialization

### Modal (Default)

```javascript
const api = new MBSkinAPI();
api.show();
```

### Custom Container

```javascript
const api = new MBSkinAPI({
    container: '#my-container',
    useModal: false
});
api.show();
```

## Next Steps

- Review available [configuration options](configuration.md)
- Consult the complete [API reference](api-reference.md) for all methods
- Explore examples in `examples/quickstart.html`
