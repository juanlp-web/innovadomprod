#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Lista de archivos de rutas que necesitan actualización
const routeFiles = [
  'backend/routes/sales.js',
  'backend/routes/clients.js',
  'backend/routes/suppliers.js',
  'backend/routes/recipes.js',
  'backend/routes/batches.js',
  'backend/routes/purchases.js',
  'backend/routes/inventory.js',
  'backend/routes/packages.js',
  'backend/routes/banks.js'
];

// Función para actualizar un archivo de rutas
function updateRouteFile(filePath) {
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Agregar import de identifyTenant si no existe
  if (!content.includes("import { identifyTenant }")) {
    const importMatch = content.match(/import { protect[^}]+} from '\.\.\/middleware\/auth\.js';/);
    if (importMatch) {
      const newImport = importMatch[0] + "\nimport { identifyTenant } from '../middleware/tenant.js';";
      content = content.replace(importMatch[0], newImport);
    }
  }
  
  // 2. Agregar identifyTenant a todas las rutas que no lo tengan
  const routePattern = /router\.(get|post|put|delete|patch)\('([^']+)',\s*(protect[^,]*),\s*async/g;
  content = content.replace(routePattern, (match, method, path, middleware) => {
    if (!match.includes('identifyTenant')) {
      return `router.${method}('${path}', ${middleware}, identifyTenant, async`;
    }
    return match;
  });
  
  // 3. Agregar identifyTenant a rutas con manager
  const managerPattern = /router\.(get|post|put|delete|patch)\('([^']+)',\s*(protect[^,]*),\s*(manager[^,]*),\s*async/g;
  content = content.replace(managerPattern, (match, method, path, protect, manager) => {
    if (!match.includes('identifyTenant')) {
      return `router.${method}('${path}', ${protect}, identifyTenant, ${manager}, async`;
    }
    return match;
  });
  
  fs.writeFileSync(filePath, content);
}

// Actualizar todos los archivos
routeFiles.forEach(updateRouteFile);

