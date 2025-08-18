# Configuración de Shadcn/ui en InnovadomProd

## ✅ Configuración Completada

Shadcn/ui ha sido configurado exitosamente en tu proyecto React + Vite con **Tailwind CSS v4**. Aquí está lo que se ha instalado y configurado:

### Dependencias Instaladas

- `tailwindcss@^4.1.11` - Framework CSS utility-first (versión 4)
- `@tailwindcss/postcss` - Plugin PostCSS para Tailwind CSS v4
- `postcss` - Procesador CSS
- `autoprefixer` - Agregar prefijos de navegador automáticamente
- `class-variance-authority` - Para variantes de componentes
- `clsx` - Para combinar clases CSS condicionalmente
- `tailwind-merge` - Para fusionar clases Tailwind sin conflictos
- `lucide-react` - Iconos SVG (opcional, para futuros componentes)

### Archivos de Configuración

- `tailwind.config.js` - Configuración simplificada para Tailwind CSS v4
- `postcss.config.js` - Configuración de PostCSS con plugin de Tailwind
- `src/index.css` - Variables CSS y directiva `@import "tailwindcss"`
- `src/lib/utils.js` - Función utilitaria `cn()` para combinar clases

### Componentes Disponibles

- `src/components/ui/button.jsx` - Componente Button con todas las variantes

## 🚀 Cómo Usar

### 1. Importar Componentes

```jsx
import { Button } from './components/ui/button'

function MyComponent() {
  return (
    <Button variant="outline" size="lg">
      Click me
    </Button>
  )
}
```

### 2. Usar la Función `cn()`

```jsx
import { cn } from '../lib/utils'

function MyComponent({ className, ...props }) {
  return (
    <div className={cn("base-classes", className)} {...props}>
      Contenido
    </div>
  )
}
```

### 3. Agregar Nuevos Componentes

Para agregar más componentes de Shadcn/ui:

1. Copia el código del componente desde [shadcn/ui](https://ui.shadcn.com/)
2. Colócalo en `src/components/ui/`
3. Asegúrate de que las importaciones apunten correctamente a `../../lib/utils`

## 🎨 Variantes Disponibles

### Button Component

- **Variants**: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- **Sizes**: `sm`, `default`, `lg`, `icon`

### Colores del Sistema

El proyecto incluye un sistema de colores completo con soporte para modo oscuro:

- `primary` - Color principal
- `secondary` - Color secundario
- `accent` - Color de acento
- `destructive` - Color para acciones destructivas
- `muted` - Color para texto secundario
- `border` - Color para bordes
- `input` - Color para campos de entrada

## 🌙 Modo Oscuro

El proyecto está preparado para modo oscuro. Para implementarlo, puedes:

1. Agregar un toggle de tema
2. Usar la clase `dark` en el elemento `html`
3. Los colores cambiarán automáticamente

## 📁 Estructura del Proyecto

```
src/
├── components/
│   └── ui/
│       └── button.jsx
├── lib/
│   └── utils.js
├── App.jsx
├── index.css
└── main.jsx
```

## 🔧 Comandos Útiles

```bash
# Instalar nuevas dependencias
npm install package-name

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

## ⚠️ Notas Importantes - Tailwind CSS v4

Este proyecto usa **Tailwind CSS v4**, que tiene algunas diferencias importantes:

- **Configuración simplificada**: `tailwind.config.js` es más simple
- **Directiva CSS**: Usa `@import "tailwindcss"` en lugar de `@tailwind`
- **Plugin PostCSS**: Requiere `@tailwindcss/postcss` en lugar del plugin estándar
- **Variables CSS**: Las variables personalizadas se definen en CSS, no en la configuración

## 📚 Recursos Adicionales

- [Documentación de Shadcn/ui](https://ui.shadcn.com/)
- [Documentación de Tailwind CSS v4](https://tailwindcss.com/docs/installation)
- [Componentes disponibles](https://ui.shadcn.com/docs/components)

¡Tu proyecto está listo para usar Shadcn/ui con Tailwind CSS v4!
