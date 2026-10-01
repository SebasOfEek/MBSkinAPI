# MBSkinAPI - Opciones de Configuración

El constructor de `MBSkinAPI` acepta un objeto de opciones para personalizar su comportamiento. Todas las opciones son opcionales y tienen valores por defecto.

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

URL base para las imágenes de las skins. El ID de la skin se concatena al final.

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

**Tipo:** `'dark' | 'light'`  
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

Activa o desactiva el scroll infinito para cargar automáticamente más skins.

```javascript
const api = new MBSkinAPI({
    enableInfiniteScroll: false
});
```

### itemsPerPage

**Tipo:** `number`  
**Default:** `20`

Número de skins a cargar por página cuando se usa scroll infinito.

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

Consulta [API Reference](api-reference.md) para más detalles sobre `updateConfig()`.
