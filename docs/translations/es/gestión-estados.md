# MBSkinAPI - Gestión de Estado y Callbacks

MBSkinAPI mantiene un estado interno que rastrea la operación actual y proporciona callbacks para reaccionar a eventos importantes.

## Estado Interno

El estado interno de MBSkinAPI contiene las siguientes propiedades:

```javascript
{
    page: number,           // Página actual de resultados
    query: string,          // Término de búsqueda actual
    filter: string,         // Filtro actual ('all', 'name', 'author')
    isLoading: boolean,     // Estado de carga activa
    hasMore: boolean,       // Hay más resultados disponibles
    totalResults: number,   // Total de resultados de búsqueda
    isSmallResultSet: boolean, // Resultados pequeños (< 35 items)
    skins: Array           // Array de skins cargadas
}
```

### Acceder al Estado

Usa el método `getState()` para obtener una copia del estado actual:

```javascript
const state = api.getState();
console.log('Página actual:', state.page);
console.log('Búsqueda activa:', state.query);
console.log('Total de skins:', state.skins.length);
```

### Propiedades del Estado

#### page

Número de página actual. Se incrementa automáticamente al cargar más resultados.

```javascript
const state = api.getState();
console.log('Página:', state.page); // 1, 2, 3, ...
```

#### query

Término de búsqueda actual. String vacío si no hay búsqueda activa.

```javascript
const state = api.getState();
console.log('Búsqueda:', state.query); // 'dragon', '', etc.
```

#### filter

Filtro de búsqueda actual. Valores posibles: `'all'`, `'name'`, `'author'`.

```javascript
const state = api.getState();
console.log('Filtro:', state.filter); // 'all', 'name', 'author'
```

#### isLoading

Indica si hay una operación de carga en progreso.

```javascript
const state = api.getState();
if (state.isLoading) {
    console.log('Cargando...');
}
```

#### hasMore

Indica si hay más resultados disponibles para cargar.

```javascript
const state = api.getState();
if (state.hasMore) {
    console.log('Hay más skins disponibles');
}
```

#### totalResults

Total de resultados de la búsqueda actual.

```javascript
const state = api.getState();
console.log('Total resultados:', state.totalResults);
```

#### isSmallResultSet

Indica si la primera página contenía menos de 35 skins. Esta bandera no produce una cadena ilimitada de peticiones: con el scroll infinito activo, MBSkinAPI puede solicitar como máximo dos páginas adicionales por búsqueda explícita para completar un grid inicial corto. Las demás páginas esperan el scroll del usuario.

```javascript
const state = api.getState();
if (state.isSmallResultSet) {
    console.log('La página inicial tuvo pocos resultados');
}
```

#### skins

Array de skins cargadas actualmente.

```javascript
const state = api.getState();
state.skins.forEach(skin => {
    console.log(`${skin.name} por ${skin.author}`);
});
```

## Callbacks

MBSkinAPI proporciona tres callbacks principales para reaccionar a eventos.

### onSkinSelect

Se ejecuta cuando el usuario selecciona una skin.

```javascript
const api = new MBSkinAPI({
    onSkinSelect: (skin) => {
        console.log(`Skin seleccionada: ${skin.name} (ID: ${skin.id})`);
        // Tu lógica personalizada aquí
    }
});
```

**Parámetros:**
- `skin` (Object): Objeto de skin seleccionada
  - `id`: ID de la skin
  - `name`: Nombre de la skin
  - `author`: Autor de la skin

**Comportamiento:**
- Copia el ID al clipboard automáticamente
- Guarda la imagen si `autoSaveImages` está activo
- Muestra un toast notification

---

### onSkinLoad

Se ejecuta cuando se cargan nuevas skins del servidor.

```javascript
const api = new MBSkinAPI({
    onSkinLoad: (skins, state) => {
        console.log(`Se cargaron ${skins.length} skins`);
        console.log('Estado actual:', state);
        // Útil para analytics o actualizaciones de UI
    }
});
```

**Parámetros:**
- `skins` (Array): Array de skins cargadas
- `state` (Object): Estado actual de la API

**Comportamiento:**
- Se dispara después de cada carga exitosa
- Incluye el estado actual para contexto completo
- No se dispara para una petición reemplazada por una búsqueda más reciente

---

### onError

Se ejecuta cuando ocurre un error en la API.

```javascript
const api = new MBSkinAPI({
    onError: (error) => {
        console.error('Error en MBSkinAPI:', error);
        // Tu manejo de errores personalizado
    }
});
```

**Parámetros:**
- `error` (Error): Objeto de error

**Comportamiento:**
- Se dispara en errores de fetch, parseo JSON, etc.
- Útil para logging y manejo de errores personalizado
- Se ignoran errores de búsquedas reemplazadas; los errores HTTP y de parseo incluyen `kind`, y los HTTP incluyen `status`

## Flujo de Actualización de Estado

### Búsqueda

```javascript
// Usuario inicia búsqueda
api.search('dragon');

// Estado interno se actualiza:
// - query = 'dragon'
// - page = 1
// - isLoading = true
// - skins = [] (se limpian)

// Después de cargar:
// - isLoading = false
// - skins = [resultados]
// - hasMore = true/false
// - onSkinLoad se dispara

// Si falla la búsqueda vigente, se restauran las skins y la página del último éxito.
// La consulta intentada permanece en el estado; onError recibe el fallo.
// Una respuesta reemplazada por una búsqueda más reciente no modifica el estado/UI
// actual ni dispara onSkinLoad/onError. Su promesa individual aún resuelve con su resultado.
```

### Scroll Infinito

```javascript
// Usuario hace scroll al final
// Si hasMore = true y enableInfiniteScroll = true:
// - page se incrementa
// - isLoading = true
// - skins se extiende con nuevos resultados
// - onSkinLoad se dispara
// Un grid inicial corto puede provocar como máximo dos solicitudes automáticas
// de páginas adicionales por búsqueda explícita; después se espera el scroll.
```

### Reset

```javascript
// Usuario llama a reset()
api.reset();

// Estado se reinicia:
// - query = ''
// - page = 1
// - skins = []
// - Se cargan skins nuevas
```

## Ejemplo Completo de Gestión de Estado

```javascript
const api = new MBSkinAPI({
    onSkinSelect: (skin) => {
        console.log('Seleccionada:', skin.name);
        // Actualizar UI de tu aplicación
    },
    onSkinLoad: (skins, state) => {
        console.log(`Cargadas ${skins.length} skins`);
        console.log(`Página ${state.page}, Total: ${state.totalResults}`);
        // Actualizar contadores, analytics, etc.
    },
    onError: (error) => {
        console.error('Error:', error.message);
        // Mostrar mensaje de error al usuario
    }
});

// Monitorear estado periódicamente
setInterval(() => {
    const state = api.getState();
    if (state.isLoading) {
        console.log('Cargando...');
    }
}, 1000);
```

## Documentación Relacionada

- [Referencia de la API](referencia-api.md) - Métodos getState() y getConfig()
- [Configuración](configuración.md) - Configuración de callbacks
- [Referencia de SkinService](referencia-skinservice.md) - Servicio de datos
