# MBSkinAPI - Referencia de la API

Documentación completa de los métodos públicos de la clase `MBSkinAPI`.

Las solicitudes de skins, el parseo y la validación de respuestas, la caché y el renderizado de imágenes se delegan internamente a `SkinService`. `MBSkinAPI` crea y posee su servicio, y conserva su estado de paginación y solicitudes; no expone una opción de constructor para inyectar un servicio compartido. Su caché es por instancia.

> **El CSS no se inyecta desde JavaScript.** Incluye manualmente `MBSkinStyles.css` en el HTML; `injectStyles()` se conserva como método no-op por compatibilidad. Consulta la [guía de instalación](instalación.md).

## Métodos Públicos

### show()

Muestra el explorador de skins. Si es la primera vez, carga automáticamente las skins.

```javascript
api.show();
```

**Retorna:** `undefined`

**Comportamiento:**
- Si `useModal` es `true`: muestra el modal overlay
- Si `useModal` es `false`: hace visible el contenedor personalizado
- Carga skins automáticamente si el grid está vacío

---

### hide()

Oculta el explorador de skins.

```javascript
api.hide();
```

**Retorna:** `undefined`

**Comportamiento:**
- Si `useModal` es `true`: oculta el modal overlay
- Si `useModal` es `false`: oculta el contenedor con `display: none`

---

### search(query)

Busca skins por texto y reinicia la búsqueda desde la página 1. Las llamadas del campo de búsqueda usan debounce de 500ms; las llamadas directas a `search(query)` empiezan inmediatamente.

```javascript
// Buscar skins específicas
api.search('dragon');

// Búsqueda vacía (muestra skins nuevas)
api.search('');

// Búsqueda programática
const results = await api.search('zombie');
```

**Parámetros:**
- `query` (string): Término de búsqueda

**Retorna:** `Promise<Array>` - Array de skins encontradas

**Comportamiento:**
- Reinicia a página 1
- Una carga actual exitosa dispara `onSkinLoad`
- Una petición reemplazada aún resuelve su propia promesa, pero no actualiza UI/estado ni dispara `onSkinLoad` o `onError`
- Si falla la petición vigente, se restauran los resultados y la página del último éxito
- La escritura en el campo usa debounce de 500 ms; las llamadas directas a `search(query)` empiezan inmediatamente

---

### setFilter(filter)

Establece el tipo de filtro para las búsquedas. Solo afecta búsquedas con texto activo.

```javascript
api.setFilter('all');     // Buscar en nombre y autor
api.setFilter('name');    // Buscar solo en nombres
api.setFilter('author');  // Buscar solo en autores
```

**Parámetros:**
- `filter` (string): Tipo de filtro - `'all'`, `'name'`, `'author'`

**Retorna:** `Promise<Array>` - Resultados filtrados

**Comportamiento:**
- Si no hay búsqueda activa, no hace nada
- Re-carga los resultados con el nuevo filtro

---

### reset()

Restablece la búsqueda y vuelve a mostrar skins nuevas.

```javascript
api.reset();
```

**Retorna:** `Promise<Array>` - Skins nuevas cargadas

**Comportamiento:**
- Limpia el campo de búsqueda
- Reinicia a página 1
- Muestra las skins más recientes

---

### getState()

Obtiene el estado actual de la API.

```javascript
const state = api.getState();
console.log('Página actual:', state.page);
console.log('Búsqueda activa:', state.query);
console.log('Total de skins:', state.skins.length);
```

**Retorna:** `Object` - Copia del estado actual

**Estructura del estado:**
```javascript
{
    page: number,           // Página actual
    query: string,          // Búsqueda actual
    filter: string,         // Filtro actual ('all', 'name', 'author')
    isLoading: boolean,     // Estado de carga
    hasMore: boolean,       // Hay más resultados disponibles
    totalResults: number,   // Total de resultados
    isSmallResultSet: boolean, // Resultados pequeños (< 35)
    skins: Array           // Skins cargadas
}
```

---

### getConfig()

Obtiene la configuración actual de la API.

```javascript
const config = api.getConfig();
console.log('Tema actual:', config.theme);
console.log('URL de API:', config.apiUrl);
```

**Retorna:** `Object` - Copia del objeto de configuración

**Nota:** Retorna una copia, no se puede modificar directamente (usa `updateConfig`)

---

### updateConfig(newConfig)

Actualiza la configuración de la API fusionando con la existente.

```javascript
// Actualizar múltiples opciones
api.updateConfig({
    theme: 'light',
    autoSaveImages: true,
    itemsPerPage: 30
});

// Actualizar callback
api.updateConfig({
    onSkinSelect: (skin) => console.log('Nuevo handler:', skin)
});
```

**Parámetros:**
- `newConfig` (Object): Nuevas opciones de configuración

**Retorna:** `undefined`

**Comportamiento:**
- Fusiona con la configuración existente
- Algunos cambios requieren reiniciar la API
- Los callbacks se reemplazan completamente

---

### destroy()

Destruye la instancia y limpia el DOM.

```javascript
api.destroy();
```

**Retorna:** `undefined`

**Comportamiento:**
- Elimina el modal de esta instancia o los nodos generados en su contenedor personalizado y restaura el contenido previo guardado
- Remueve los listeners registrados y limpia los temporizadores rastreados
- Invalida respuestas pendientes de listas, pero no aborta las solicitudes de red o imágenes ya iniciadas
- Libera la referencia al servicio interno de esta instancia y no elimina CSS compartido

`destroy()` es apropiado para desmontar componentes SPA; no garantiza recolección inmediata ni cancela trabajo externo iniciado por callbacks.

**Uso recomendado:**
```javascript
// En componentes React/Vue/Angular
componentWillUnmount() {
    this.api?.destroy();
}

// Al cambiar de página
window.addEventListener('beforeunload', () => {
    api.destroy();
});
```

## Accesibilidad

- Las tarjetas pueden enfocarse y exponen semántica de botón; `Enter` y `Espacio` las activan.
- El modal expone `role="dialog"`, `aria-modal="true"` y una etiqueta accesible. Al abrirse, el foco pasa al campo de búsqueda; `Escape` lo cierra y restaura el foco al elemento que lo abrió.
- `Tab` y `Shift+Tab` recorren cíclicamente los controles enfocables del modal durante la navegación normal.
- El estado de carga usa una región viva. El resto de la página anfitriona no se vuelve inerte.

## Resumen de Métodos

| Método | Retorna | Descripción |
|--------|---------|-------------|
| `show()` | `undefined` | Muestra el explorador |
| `hide()` | `undefined` | Oculta el explorador |
| `search(query)` | `Promise<Array>` | Busca skins |
| `setFilter(filter)` | `Promise<Array>` | Establece filtro |
| `reset()` | `Promise<Array>` | Restablece búsqueda |
| `getState()` | `Object` | Obtiene estado |
| `getConfig()` | `Object` | Obtiene configuración |
| `updateConfig(newConfig)` | `undefined` | Actualiza configuración |
| `destroy()` | `undefined` | Destruye instancia |

## Documentación Relacionada

- [Configuración](configuración.md) - Opciones del constructor
- [Gestión de estado](gestión-estados.md) - Gestión de estado y callbacks
- [Referencia de SkinService](referencia-skinservice.md) - Servicio de datos
- [Referencia de SkinExplorerUI](referencia-skinexplorerui.md) - Componente UI
