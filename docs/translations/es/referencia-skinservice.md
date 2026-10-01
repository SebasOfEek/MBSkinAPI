# SkinService - Referencia del Servicio

`SkinService` es un módulo independiente que maneja todas las operaciones de datos relacionadas con skins: fetch, caché, filtrado y renderizado.

## Constructor

```javascript
const skinService = new SkinService(options);
```

### Opciones del Constructor

### apiUrl

**Tipo:** `string`  
**Default:** `'https://mineblocks.com/1/scripts/returnSkins.php'`

URL del endpoint PHP que devuelve los datos de las skins.

```javascript
const skinService = new SkinService({
    apiUrl: 'https://api.example.com/skins.php'
});
```

### imageUrl

**Tipo:** `string`  
**Default:** `'https://mineblocks.com/1/skins/images/'`

URL base para las imágenes de las skins.

```javascript
const skinService = new SkinService({
    imageUrl: 'https://cdn.example.com/skins/'
});
```

### cacheTimeout

**Tipo:** `number` (milisegundos)  
**Default:** `300000` (5 minutos)

Tiempo de expiración del caché en milisegundos.

```javascript
const skinService = new SkinService({
    cacheTimeout: 600000 // 10 minutos
});
```

## Métodos Públicos

### fetchSkins(params)

Obtiene skins del servidor con soporte de caché.

```javascript
const skins = await skinService.fetchSkins({
    type: 'search',
    key: 'dragon',
    page: 1
});
```

**Parámetros:**
- `params` (Object):
  - `type` (string): `'search'` o `'new'`
  - `page` (number): Número de página (default: 1)
  - `key` (string): Término de búsqueda (opcional)

**Retorna:** `Promise<Array>` - Array de skins

**Comportamiento:**
- Usa caché si la respuesta está disponible y no ha expirado
- Limpia la respuesta PHP con múltiples métodos de fallback
- Valida que la respuesta sea un JSON array válido

---

### searchSkins(query, filter, page)

Busca skins por término con filtrado local.

```javascript
const skins = await skinService.searchSkins('dragon', 'name', 1);
```

**Parámetros:**
- `query` (string): Término de búsqueda
- `filter` (string): `'all'`, `'name'`, `'author'` (default: `'all'`)
- `page` (number): Número de página (default: 1)

**Retorna:** `Promise<Array>` - Array de skins filtradas

---

### getNewSkins(page)

Obtiene las skins más recientes (tipo 'new').

```javascript
const skins = await skinService.getNewSkins(1);
```

**Parámetros:**
- `page` (number): Número de página (default: 1)

**Retorna:** `Promise<Array>` - Array de skins nuevas

---

### filterSkins(skins, query, filter)

Filtra un array de skins localmente (sin hacer fetch).

```javascript
const filtered = skinService.filterSkins(skinsArray, 'dragon', 'name');
```

**Parámetros:**
- `skins` (Array): Array de skins a filtrar
- `query` (string): Término de búsqueda
- `filter` (string): `'all'`, `'name'`, `'author'` (default: `'all'`)

**Retorna:** `Array` - Array filtrado

---

### getSkinImageUrl(skinId)

Genera la URL completa de la imagen de una skin.

```javascript
const url = skinService.getSkinImageUrl('12345');
// Retorna: 'https://mineblocks.com/1/skins/images/12345.png'
```

**Parámetros:**
- `skinId` (string): ID de la skin

**Retorna:** `string` - URL completa de la imagen

---

### drawSkin(skinId, canvas)

Dibuja una skin en un elemento canvas con transparencia de fondo.

```javascript
const canvas = document.getElementById('my-canvas');
await skinService.drawSkin('12345', canvas);
```

**Parámetros:**
- `skinId` (string): ID de la skin
- `canvas` (HTMLCanvasElement): Elemento canvas

**Retorna:** `Promise<void>`

**Comportamiento:**
- Carga la imagen con CORS
- Escala a 16x22 píxeles
- Aplica transparencia al color de fondo
- Desactiva suavizado de imagen (pixelated)

---

### clearCache()

Limpia todo el caché.

```javascript
skinService.clearCache();
```

**Retorna:** `undefined`

---

### cleanExpiredCache()

Elimina solo las entradas de caché expiradas.

```javascript
skinService.cleanExpiredCache();
```

**Retorna:** `undefined`

---

### getSkinStats(skin)

Obtiene estadísticas de una skin.

```javascript
const stats = skinService.getSkinStats(skin);
// Retorna: { id, name, author, nameLength, authorLength, imageUrl }
```

**Parámetros:**
- `skin` (Object): Objeto de skin

**Retorna:** `Object` - Estadísticas de la skin

---

### isValidSkin(skin)

Valida si un objeto es una skin válida.

```javascript
const isValid = skinService.isValidSkin(skinObject);
```

**Parámetros:**
- `skin` (Object): Objeto a validar

**Retorna:** `boolean` - `true` si es válido

**Criterios de validación:**
- Tiene propiedades `id`, `name`, `author` (todas strings)
- `id`, `name`, `author` no están vacíos

---

### getSkinsByAuthor(author, limit)

Busca skins por autor con límite de resultados.

```javascript
const authorSkins = await skinService.getSkinsByAuthor('PlayerName', 50);
```

**Parámetros:**
- `author` (string): Nombre del autor
- `limit` (number): Límite de resultados (default: 50)

**Retorna:** `Promise<Array>` - Skins del autor

---

### exportSkin(skin)

Exporta una skin a formato JSON.

```javascript
const json = skinService.exportSkin(skin);
console.log(json);
```

**Parámetros:**
- `skin` (Object): Objeto de skin

**Retorna:** `string` - JSON string formateado

## Uso Modular

SkinService puede usarse independientemente de MBSkinAPI:

```javascript
// Instanciar SkinService por separado
const skinService = new SkinService({
    apiUrl: 'https://api.example.com/skins.php',
    imageUrl: 'https://cdn.example.com/skins/',
    cacheTimeout: 600000
});

// Usar sus métodos directamente
const skins = await skinService.getNewSkins(1);
const filtered = skinService.filterSkins(skins, 'dragon', 'name');
const stats = skinService.getSkinStats(skins[0]);
```

## Resumen de Métodos

| Método | Retorna | Descripción |
|--------|---------|-------------|
| `fetchSkins(params)` | `Promise<Array>` | Obtiene skins del servidor |
| `searchSkins(query, filter, page)` | `Promise<Array>` | Busca skins con filtro |
| `getNewSkins(page)` | `Promise<Array>` | Obtiene skins nuevas |
| `filterSkins(skins, query, filter)` | `Array` | Filtra skins localmente |
| `getSkinImageUrl(skinId)` | `string` | Genera URL de imagen |
| `drawSkin(skinId, canvas)` | `Promise<void>` | Dibuja skin en canvas |
| `clearCache()` | `undefined` | Limpia caché |
| `cleanExpiredCache()` | `undefined` | Limpia caché expirado |
| `getSkinStats(skin)` | `Object` | Obtiene estadísticas |
| `isValidSkin(skin)` | `boolean` | Valida skin |
| `getSkinsByAuthor(author, limit)` | `Promise<Array>` | Busca por autor |
| `exportSkin(skin)` | `string` | Exporta a JSON |

## Documentación Relacionada

- [API Reference](api-reference.md) - Referencia de MBSkinAPI
- [SkinExplorerUI Reference](skinexplorerui-reference.md) - Componente UI
- [State Management](state-management.md) - Gestión de estado
