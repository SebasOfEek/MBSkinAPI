# MBSkinAPI - Styling System

MBSkinAPI uses CSS variables to allow easy theme and color customization. Styles are automatically injected when initializing the API.

## CSS Variables

### Main Variables

MBSkinAPI defines the following CSS variables that you can override:

```css
.mb-skin-api-container {
    --mb-bg: #1a1a1a;              /* Background color */
    --mb-border: #333;             /* Border color */
    --mb-text: #fff;               /* Main text color */
    --mb-text-secondary: #aaa;    /* Secondary text color */
    --mb-accent: #4CAF50;          /* Accent color */
    --mb-hover: #2d2d2d;           /* Hover color */
}
```

### Dark Theme (Default)

```css
.mb-skin-api-container {
    --mb-bg: #1a1a1a;
    --mb-border: #333;
    --mb-text: #fff;
    --mb-text-secondary: #aaa;
    --mb-accent: #4CAF50;
    --mb-hover: #2d2d2d;
}
```

### Light Theme

```css
.mb-skin-api-container {
    --mb-bg: #ffffff;
    --mb-border: #ddd;
    --mb-text: #333;
    --mb-text-secondary: #666;
    --mb-accent: #2196F3;
    --mb-hover: #f5f5f5;
}
```

## Variable Customization

You can override CSS variables in your own stylesheet:

```css
.mb-skin-api-container {
    --mb-bg: #0f0f23;
    --mb-border: #1a1a3e;
    --mb-text: #e0e0e0;
    --mb-text-secondary: #a0a0a0;
    --mb-accent: #7c4dff;
    --mb-hover: #1a1a3e;
}
```

## Main CSS Classes

### Main Container

```css
.mb-skin-api-container {
    /* Main API container */
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

### Search Container

```css
.mb-skin-search-container {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}
```

### Search Input

```css
.mb-skin-search-input {
    flex: 1;
    min-width: 200px;
    padding: 12px;
    background: var(--mb-bg);
    border: 1px solid var(--mb-border);
    color: var(--mb-text);
    border-radius: 8px;
    outline: none;
    transition: border-color 0.3s;
}

.mb-skin-search-input:focus {
    border-color: var(--mb-accent);
}
```

### Filter Select

```css
.mb-skin-filter-select {
    padding: 12px;
    background: var(--mb-bg);
    color: var(--mb-text);
    border: 1px solid var(--mb-border);
    border-radius: 8px;
    cursor: pointer;
    outline: none;
}
```

### Skin Grid

```css
.mb-skin-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
    overflow-y: auto;
    max-height: 600px;
    padding: 10px;
    align-content: start;
}
```

### Skin Item

```css
.mb-skin-item {
    background: var(--mb-hover);
    padding: 15px;
    border-radius: 12px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid transparent;
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.mb-skin-item:hover {
    border-color: var(--mb-accent);
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}
```

### Skin Canvas

```css
.mb-skin-item canvas {
    image-rendering: pixelated;
    transform: scale(2.5);
    margin-bottom: 15px;
    pointer-events: none;
}
```

### Skin Name

```css
.mb-skin-name {
    display: block;
    font-size: 13px;
    color: var(--mb-text);
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: bold;
}
```

### Skin Author

```css
.mb-skin-author {
    font-size: 11px;
    color: var(--mb-text-secondary);
    margin-top: 4px;
}
```

### Load Status

```css
.mb-skin-load-status {
    text-align: center;
    padding: 15px;
    color: var(--mb-accent);
    font-size: 13px;
    font-weight: 500;
}
```

## Modal

### Modal Container

```css
.mb-skin-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}
```

### Modal Content

```css
.mb-skin-modal-content {
    background: var(--mb-bg);
    border: 1px solid var(--mb-border);
    border-radius: 12px;
    width: 90%;
    max-width: 900px;
    height: 80%;
    max-height: 700px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
```

### Modal Header

```css
.mb-skin-modal-header {
    padding: 20px;
    border-bottom: 1px solid var(--mb-border);
    display: flex;
    align-items: center;
    gap: 15px;
}
```

### Close Button

```css
.mb-skin-close {
    cursor: pointer;
    font-size: 28px;
    color: var(--mb-text-secondary);
    margin-left: auto;
    transition: color 0.3s;
}

.mb-skin-close:hover {
    color: var(--mb-text);
}
```

## Toast Notification

```css
.mb-skin-toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--mb-accent);
    color: white;
    padding: 12px 25px;
    border-radius: 30px;
    display: none;
    z-index: 10001;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    font-size: 14px;
}
```

## Complete Customization Example

```css
/* Customize theme */
.mb-skin-api-container {
    --mb-bg: #1e1e2e;
    --mb-border: #313244;
    --mb-text: #cdd6f4;
    --mb-text-secondary: #a6adc8;
    --mb-accent: #cba6f7;
    --mb-hover: #313244;
}

/* Customize grid */
.mb-skin-grid {
    gap: 25px;
    max-height: 700px;
}

/* Customize items */
.mb-skin-item {
    border-radius: 16px;
    height: 220px;
}

.mb-skin-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.3);
}
```

## SkinExplorerUI - Additional Variables

SkinExplorerUI uses additional variables for its theme:

```css
:root {
    --mb-accent: #4caf50;
    --mb-bg: #121212;
    --mb-card: #1e1e1e;
    --mb-border: #333;
    --mb-text: #ffffff;
    --mb-text-secondary: #888;
    --mb-hover: #2d2d2d;
    --mb-success: #4caf50;
    --mb-error: #f44336;
    --mb-warning: #ff9800;
}
```

## Related Documentation

- [Configuration](configuration.md) - `theme` option
- [SkinExplorerUI Reference](skinexplorerui-reference.md) - UI component with custom styles
