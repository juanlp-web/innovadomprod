const fs = require('fs');

// Leer el archivo
let content = fs.readFileSync('backend/routes/purchases.js', 'utf8');

// Patrones de error comunes que necesitan ser arreglados
const fixes = [
  // Arreglar líneas que terminan con coma pero no están en un objeto
  {
    pattern: /^\s*([a-zA-Z_][a-zA-Z0-9_]*):\s*([^,}]+),\s*$/gm,
    replacement: (match, key, value) => {
      // Si la línea anterior no termina con { o , entonces es un error
      return `      ${key}: ${value.trim()}`;
    }
  },
  // Arreglar líneas que están sueltas sin contexto
  {
    pattern: /^\s*([a-zA-Z_][a-zA-Z0-9_]*):\s*([^,}]+),\s*$/gm,
    replacement: (match, key, value) => {
      return `        ${key}: ${value.trim()}`;
    }
  }
];

// Aplicar las correcciones
let fixed = content;
fixes.forEach(fix => {
  fixed = fixed.replace(fix.pattern, fix.replacement);
});

// Escribir el archivo corregido
fs.writeFileSync('backend/routes/purchases.js', fixed);

console.log('Archivo purchases.js corregido');

