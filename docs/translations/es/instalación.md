# MBSkinAPI - Guía de Instalación

Esta guía describe las diferentes formas de instalar y configurar MBSkinAPI en tu proyecto.

## Opción 1: CDN (Recomendado para Producción)

La forma más rápida de usar MBSkinAPI es mediante CDN.

### Versión Bundle

```html
<script src="https://cdn.jsdelivr.net/gh/SebasOfEek/MBSkinAPI@latest/dist/MBSkinAPI.bundle.js"></script>
```

### Versión Minificada

```html
<script src="https://cdn.jsdelivr.net/gh/SebasOfEek/MBSkinAPI@latest/dist/MBSkinAPI.bundle.min.js"></script>
```

## Opción 2: Descarga Local

### 1. Descargar los archivos

```bash
git clone https://github.com/SebasOfEek/MBSkinAPI.git
cd MBSkinAPI
```

### 2. Incluir el bundle en tu proyecto

```html
<script src="dist/MBSkinAPI.bundle.js"></script>
```

## Opción 3: Desarrollo Modular

Para desarrollo o si necesitas usar los componentes por separado, incluye los módulos individuales en el orden correcto:

```html
<script src="src/services/SkinService.js"></script>
<script src="src/ui/SkinExplorerUI.js"></script>
<script src="src/core/MBSkinAPI.js"></script>
```

## Verificación de Instalación

Después de incluir el script, verifica que MBSkinAPI esté disponible:

```javascript
if (typeof MBSkinAPI !== 'undefined') {
    console.log('MBSkinAPI cargada correctamente');
} else {
    console.error('MBSkinAPI no se pudo cargar');
}
```

## Inicialización Básica

### Modal (Por Defecto)

```javascript
const api = new MBSkinAPI();
api.show();
```

### Contenedor Personalizado

```javascript
const api = new MBSkinAPI({
    container: '#my-container',
    useModal: false
});
api.show();
```

## Siguientes Pasos

- Revisa las [opciones de configuración](configuration.md) disponibles
- Consulta la [referencia de la API](api-reference.md) para todos los métodos
- Explora los ejemplos en `examples/quickstart.html`
