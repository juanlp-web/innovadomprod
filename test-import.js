// Script de prueba para verificar la funcionalidad de importación
const fs = require('fs');
const path = require('path');

// Crear un archivo CSV de prueba para clientes
const testData = `name,email,phone,address,type,status
"Juan Pérez","juan.perez@email.com","555-0123","Calle Principal 123",persona,activo
"Empresa ABC S.A.","contacto@empresaabc.com","555-0456","Av. Comercial 456",empresa,activo
"María García","maria.garcia@email.com","555-0789","Calle Secundaria 789",persona,activo`;

// Crear directorio de prueba si no existe
const testDir = 'test-imports';
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir);
}

// Escribir archivo de prueba
const testFilePath = path.join(testDir, 'test-clients.csv');
fs.writeFileSync(testFilePath, testData);

console.log('✅ Archivo de prueba creado:', testFilePath);
console.log('📄 Contenido del archivo:');
console.log(testData);
console.log('\n🔧 Para probar la importación:');
console.log('1. Asegúrate de que el servidor esté ejecutándose');
console.log('2. Ve a la página de Clientes');
console.log('3. Haz clic en "Importar"');
console.log('4. Selecciona el archivo:', testFilePath);
console.log('5. Configura las opciones y haz clic en "Importar"');

