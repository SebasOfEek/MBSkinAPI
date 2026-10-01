# MBSkinAPI - Documentation

Welcome to the official MBSkinAPI documentation. This guide will help you integrate and use the Mine Blocks skin exploration API in your projects.

## Documentation Index

### Main Guides

| Document | Description |
|-----------|-------------|
| **[Installation](installation.md)** | Complete installation guide (CDN, local, development) |
| **[Configuration](configuration.md)** | Constructor configuration options |
| **[API Reference](api-reference.md)** | Complete reference of MBSkinAPI public methods |

### Modular Component Reference

| Document | Description |
|-----------|-------------|
| **[SkinService Reference](skinservice-reference.md)** | Skin operations service (search, cache, filtering) |
| **[SkinExplorerUI Reference](skinexplorerui-reference.md)** | UI component for skin exploration |

### Advanced Topics

| Document | Description |
|-----------|-------------|
| **[State Management](state-management.md)** | State management and callbacks |
| **[Styling](styling.md)** | Theme system and CSS variables |

## Quick Start

To get started quickly:

1. **Install MBSkinAPI** following the [installation guide](installation.md)
2. **Configure the API** with the [available options](configuration.md)
3. **Review examples** in `examples/quickstart.html` for practical implementations

## Internationalization

This documentation is available in multiple languages:

- **English** (default): Files in `docs/`
- **Spanish**: Files in `docs/i18n/es/`

## Project Structure

```
MBSkinAPI/
├── docs/                    # Documentation (English)
│   ├── README.md
│   ├── installation.md
│   ├── configuration.md
│   ├── api-reference.md
│   ├── skinservice-reference.md
│   ├── skinexplorerui-reference.md
│   ├── state-management.md
│   ├── styling.md
│   └── i18n/
│       ├── en/             # English documentation
│       └── es/             # Spanish documentation
├── examples/                # Usage examples
│   └── quickstart.html
├── src/                     # Source code
│   ├── core/
│   │   └── MBSkinAPI.js
│   ├── services/
│   │   └── SkinService.js
│   └── ui/
│       └── SkinExplorerUI.js
└── dist/                    # Production versions
```

## Modular Architecture

MBSkinAPI is designed with a modular architecture that allows using its components independently:

- **MBSkinAPI**: Main class that orchestrates all components
- **SkinService**: Service for data operations (fetch, cache, filtering)
- **SkinExplorerUI**: Independent user interface component

You can use MBSkinAPI as an integrated whole, or use SkinService and SkinExplorerUI separately for more flexibility.