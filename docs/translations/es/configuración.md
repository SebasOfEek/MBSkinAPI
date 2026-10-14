# MBSkinAPI - Opciones de Configuración

El constructor de `MBSkinAPI` acepta un objeto de opciones para personalizar su comportamiento. Todas las opciones son opcionales y tienen valores por defecto.

> **CSS requerido por separado:** incluye manualmente `MBSkinStyles.css`. JavaScript no inyecta estilos; `injectStyles()` es un no-op conservado por compatibilidad. Consulta [instalación](instalación.md).

`MBSkinAPI` crea y posee internamente un `SkinService` para solicitudes, caché, validación de respuestas y operaciones de URL/renderizado de imágenes. El servicio y la caché son por instancia; `MBSkinAPI` no ofrece una opción de constructor para inyectar un servicio compartido. `SkinExplorerUI` sí acepta la opción `skinService`.

## Constructor

```javascript
const api = new MBSkinAPI(options);
```

## Opciones Disponibles

### apiUrl

**Tipo:** `string`  
**Default:** `'https://mineblocks.com/1/scripts/returnSkins.php'`

URL del endpoint PHP que devuelve los datos de las skins.

```javascript
const api = new MBSkinAPI({
    apiUrl: 'https://api.example.com/skins.php'
});
```

### imageUrl

**Tipo:** `string`  
**Default:** `'https://mineblocks.com/1/skins/images/'`

URL base para las imágenes de las skins. El ID se codifica por segmentos, preservando los separadores `/`.

```javascript
const api = new MBSkinAPI({
    imageUrl: 'https://cdn.example.com/skins/'
});
```

### container

**Tipo:** `string | HTMLElement`  
**Default:** `null`

Selector CSS o elemento DOM donde se renderizará el explorador cuando `useModal` es `false`.

```javascript
// Usando selector CSS
const api = new MBSkinAPI({
    container: '#my-container',
    useModal: false
});

// Usando elemento DOM
const container = document.getElementById('my-container');
const api = new MBSkinAPI({
    container: container,
    useModal: false
});
```

### useModal

**Tipo:** `boolean`  
**Default:** `true`

Determina si se usa un modal overlay o un contenedor personalizado.

```javascript
// Modal (por defecto)
const api = new MBSkinAPI({
    useModal: true
});

// Contenedor personalizado
const api = new MBSkinAPI({
    container: '#my-container',
    useModal: false
});
```

### autoSaveImages

**Tipo:** `boolean`  
**Default:** `false`

Si es `true`, descarga automáticamente la imagen de la skin cuando se selecciona.

```javascript
const api = new MBSkinAPI({
    autoSaveImages: true
});
```

### onSkinSelect

**Tipo:** `function(skin)`  
**Default:** `console.log` del skin seleccionado

Callback que se ejecuta cuando el usuario selecciona una skin.

```javascript
const api = new MBSkinAPI({
    onSkinSelect: (skin) => {
        console.log(`Skin seleccionada: ${skin.name} (ID: ${skin.id})`);
        // Tu lógica personalizada aquí
    }
});
```

### onSkinLoad

**Tipo:** `function(skins, state)`  
**Default:** `null`

Callback que se ejecuta cuando se cargan nuevas skins.

```javascript
const api = new MBSkinAPI({
    onSkinLoad: (skins, state) => {
        console.log(`Se cargaron ${skins.length} skins`);
        console.log('Estado actual:', state);
    }
});
```

### onError

**Tipo:** `function(error)`  
**Default:** `console.error` del error

Callback que se ejecuta cuando ocurre un error.

```javascript
const api = new MBSkinAPI({
    onError: (error) => {
        console.error('Error en MBSkinAPI:', error);
        // Tu manejo de errores personalizado
    }
});
```

### theme

**Tipo:** `string` (`'dark'` selecciona el tema oscuro; cualquier otro valor selecciona el tema claro en `MBSkinAPI`)
**Default:** `'dark'`

Tema visual de la interfaz.

```javascript
const api = new MBSkinAPI({
    theme: 'light'
});
```

### showLoadStatus

**Tipo:** `boolean`  
**Default:** `true`

Muestra u oculta los mensajes de estado de carga.

```javascript
const api = new MBSkinAPI({
    showLoadStatus: false
});
```

### enableInfiniteScroll

**Tipo:** `boolean`  
**Default:** `true`

Activa o desactiva la paginación mediante scroll. Si el grid inicial queda corto, la API puede pedir como máximo dos páginas adicionales automáticas por búsqueda explícita; las siguientes requieren scroll del usuario.

```javascript
const api = new MBSkinAPI({
    enableInfiniteScroll: false
});
```

### itemsPerPage

**Tipo:** `number`  
**Default:** `20`

Cantidad objetivo para decidir si se completa un grid inicial corto. No configura el tamaño de página del servidor, que lo determina el endpoint.

```javascript
const api = new MBSkinAPI({
    itemsPerPage: 30
});
```

## Ejemplo Completo

```javascript
const api = new MBSkinAPI({
    // URLs
    apiUrl: 'https://mineblocks.com/1/scripts/returnSkins.php',
    imageUrl: 'https://mineblocks.com/1/skins/images/',
    
    // UI
    container: '#my-container',
    useModal: false,
    theme: 'dark',
    
    // Funcionalidad
    autoSaveImages: false,
    showLoadStatus: true,
    enableInfiniteScroll: true,
    itemsPerPage: 20,
    
    // Callbacks
    onSkinSelect: (skin) => console.log('Skin:', skin),
    onSkinLoad: (skins, state) => console.log('Cargadas:', skins.length),
    onError: (error) => console.error('Error:', error)
});
```

## Actualización de Configuración

Para actualizar la configuración después de crear la instancia, usa el método `updateConfig()`:

```javascript
api.updateConfig({
    theme: 'light',
    itemsPerPage: 30
});
```

Los cambios en URLs y tema se aplican a la instancia actual; cambiar `apiUrl` limpia la caché de su servicio. Cambiar `useModal` o `container` no reconstruye el DOM actual; crea otra instancia para cambiar el modo de visualización. Los callbacks se reemplazan completamente.

Consulta [Referencia de la API](referencia-api.md) para más detalles sobre `updateConfig()`.
