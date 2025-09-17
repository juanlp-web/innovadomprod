# Configuración de API

## Variable de Entorno VITE_API_URL

Para configurar la URL de la API, crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
VITE_API_URL=http://localhost:5000/api
```

### Para diferentes entornos:

#### Desarrollo
```env
VITE_API_URL=http://localhost:5000/api
```

#### Producción
```env
VITE_API_URL=https://api.tu-dominio.com/api
```

### Archivos que usan esta variable:

- `src/config/api.js` - ✅ Ya configurado
- `src/services/api.js` - ✅ Actualizado

### Cómo funciona:

1. Vite lee las variables que empiezan con `VITE_`
2. Si no encuentra la variable, usa el valor por defecto: `http://localhost:5000/api`
3. La variable está disponible en tiempo de compilación

### Verificar configuración:

Para verificar que la variable está configurada correctamente, puedes:

1. Crear el archivo `.env` con `VITE_API_URL=tu-url-aqui`
2. Reiniciar el servidor de desarrollo: `npm run dev`
3. Verificar en la consola del navegador que la URL sea la correcta
