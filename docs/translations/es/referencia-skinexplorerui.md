# SkinExplorerUI - Referencia del Componente UI

`SkinExplorerUI` es un componente de interfaz de usuario independiente para explorar skins. Puede usarse por separado o integrado con `MBSkinAPI`.

Delega acceso de red, parseo/validación, caché y renderizado de imágenes a `SkinService`. Si no se proporciona un servicio, crea uno propio; la caché solo se comparte cuando varias consumidoras reciben la misma instancia.

> **El CSS no se inyecta:** enlaza `MBSkinStyles.css` en la página. El método heredado `loadStyles()` no hace nada. Consulta [instalación](instalación.md).

## Constructor

```javascript
const explorerUI = new SkinExplorerUI(options);
```

### Opciones del Constructor

### container

**Tipo:** `HTMLElement`  
**Default:** `document.body`

Elemento DOM donde se renderizará el explorador.

```javascript
const container = document.getElementById('my-container');
const explorerUI = new SkinExplorerUI({
    container: container
});
```

### skinService

**Tipo:** `SkinService`  
**Default:** Una nueva instancia de `SkinService`

Instancia de SkinService para operaciones de datos. Si se omite, el componente crea una instancia independiente. Se puede proporcionar una instancia existente para compartir su configuración o caché.

```javascript
const skinService = new SkinService();
const explorerUI = new SkinExplorerUI({
    skinService: skinService
});
```

### onSkinSelect

**Tipo:** `function(skin)`  
**Default:** `() => {}`

Callback que se ejecuta cuando se selecciona una skin.

```javascript
const explorerUI = new SkinExplorerUI({
    onSkinSelect: (skin) => {
        console.log('Skin seleccionada:', skin.name);
    }
});
```

### theme

**Tipo:** `string`  
**Default:** `'dark'`

Tema visual del componente.

```javascript
const explorerUI = new SkinExplorerUI({
    theme: 'light'
});
```

### customStyles

**Tipo:** `Object`  
**Default:** `{}`

Objeto con estilos CSS personalizados.

```javascript
const explorerUI = new SkinExplorerUI({
    customStyles: {
        '.mb-explorer': 'background: #f0f0f0;',
        '.mb-btn': 'background: #ff5722;'
    }
});
```

## Métodos Públicos

### setSkinService(skinService)

Establece o actualiza la instancia de SkinService.

```javascript
const skinService = new SkinService();
explorerUI.setSkinService(skinService);
```

**Parámetros:**
- `skinService` (SkinService): Instancia de SkinService

**Retorna:** `undefined`

---

### setOnSkinSelect(callback)

Actualiza el callback de selección de skin.

```javascript
explorerUI.setOnSkinSelect((skin) => {
    console.log('Nuevo callback:', skin.name);
});
```

**Parámetros:**
- `callback` (function): Nueva función callback

**Retorna:** `undefined`

---

### search(query)

Ejecuta una búsqueda programática.

```javascript
explorerUI.search('dragon');
```

**Parámetros:**
- `query` (string): Término de búsqueda

**Retorna:** `undefined`

**Comportamiento:**
- Una búsqueda más reciente reemplaza los resultados de búsquedas anteriores en la interfaz
- La escritura en el campo usa debounce de 300 ms; las llamadas directas a `search(query)` empiezan inmediatamente
- El método público `search(query)` no retorna la promesa de la solicitud subyacente
- Si una búsqueda falla, se restauran las skins, la página y la selección del último éxito
- Si falla la carga de otra página, se conserva la página actual para poder reintentarla

---

### getSelectedSkin()

Obtiene la skin actualmente seleccionada.

```javascript
const selectedSkin = explorerUI.getSelectedSkin();
if (selectedSkin) {
    console.log('Skin seleccionada:', selectedSkin.name);
}
```

**Retorna:** `Object | undefined` - Objeto de skin o `undefined` si no hay selección

---

### destroy()

Destruye el componente y lo elimina del DOM.

```javascript
explorerUI.destroy();
```

**Retorna:** `undefined`

**Comportamiento:**
- Elimina del DOM el nodo del explorador de esta instancia
- Remueve listeners registrados, limpia temporizadores/toasts rastreados y libera referencias DOM
- Invalida respuestas pendientes de listas, pero no aborta solicitudes de red o imágenes ya iniciadas
- Libera su referencia a `SkinService`, sin destruir un servicio compartido ni eliminar CSS compartido

`destroy()` sirve para desmontar componentes SPA, pero no garantiza recolección inmediata ni cancela trabajo iniciado externamente.

## Accesibilidad

- La raíz del componente es una región etiquetada (`role="region"`).
- Los controles de búsqueda/filtro tienen etiquetas accesibles; carga/estado usa regiones vivas y errores usan `role="alert"`.
- Las tarjetas se enfocan, exponen semántica de botón, se activan con `Enter` o `Espacio` y comunican selección mediante `aria-pressed`.
- Los botones nativos conservan su comportamiento de teclado habitual.

## Estado Interno

El componente mantiene un estado interno con las siguientes propiedades:

```javascript
{
    skins: [],              // Skins cargadas
    filteredSkins: [],      // Skins filtradas
    isLoading: false,       // Estado de carga
    hasMore: true,          // Hay más resultados
    currentPage: 1,         // Página actual
    query: '',              // Búsqueda actual
    filter: 'all',          // Filtro actual
    selectedSkin: null      // Skin seleccionada
}
```

## Uso Modular Independiente

SkinExplorerUI puede usarse sin MBSkinAPI:

```javascript
// Crear SkinService
const skinService = new SkinService({
    apiUrl: 'https://api.example.com/skins.php',
    imageUrl: 'https://cdn.example.com/skins/'
});

// Crear contenedor
const container = document.getElementById('my-explorer');

// Inicializar SkinExplorerUI
const explorerUI = new SkinExplorerUI({
    container: container,
    skinService: skinService,
    onSkinSelect: (skin) => {
        console.log('Seleccionada:', skin.name);
    },
    theme: 'light'
});

// Realizar búsqueda
explorerUI.search('dragon');
```

## Integración con MBSkinAPI

MBSkinAPI usa SkinExplorerUI internamente cuando se configura con contenedor personalizado:

```javascript
const api = new MBSkinAPI({
    container: '#my-container',
    useModal: false
});
```

## Resumen de Métodos

| Método | Retorna | Descripción |
|--------|---------|-------------|
| `setSkinService(skinService)` | `undefined` | Establece SkinService |
| `setOnSkinSelect(callback)` | `undefined` | Actualiza callback |
| `search(query)` | `undefined` | Ejecuta búsqueda |
| `getSelectedSkin()` | `Object \| undefined` | Obtiene skin seleccionada |
| `destroy()` | `undefined` | Destruye componente |

## Documentación Relacionada

- [Referencia de SkinService](referencia-skinservice.md) - Servicio de datos
- [Referencia de la API](referencia-api.md) - Referencia de MBSkinAPI
- [Estilos](estilos.md) - Sistema de temas y variables CSS
