// Script para probar la importación de clientes con debug
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

async function testClientImport() {
  console.log('🔍 Probando importación de clientes con debug...\n');

  try {
    // Crear FormData para simular archivo CSV
    const formData = new FormData();
    const csvContent = `name,email,phone,address,type,status
"Juan Pérez","juan.perez@email.com","555-0123","Calle Principal 123",individual,Activo
"Empresa ABC S.A.","contacto@empresaabc.com","555-0456","Av. Comercial 456",empresa,Activo
"María García","maria.garcia@email.com","555-0789","Calle Secundaria 789",individual,Pendiente`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    formData.append('file', blob, 'test-clients-debug.csv');
    formData.append('options', JSON.stringify({
      skipFirstRow: true,
      updateExisting: false,
      validateData: true
    }));

    console.log('📤 Enviando archivo CSV...');
    console.log('Contenido del CSV:');
    console.log(csvContent);
    console.log('\n');

    const response = await fetch(`${API_BASE_URL}/import/clients`, {
      method: 'POST',
      body: formData,
      headers: {
        'X-Tenant-ID': 'test-tenant' // Agregar tenant ID para testing
      }
    });

    console.log(`📊 Respuesta del servidor: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Importación exitosa:');
      console.log(JSON.stringify(result, null, 2));
    } else {
      const errorData = await response.text();
      console.log('❌ Error en importación:');
      console.log(errorData);
    }

  } catch (error) {
    console.log('❌ Error de conectividad:', error.message);
    console.log('\n🔧 Posibles soluciones:');
    console.log('1. Verificar que el servidor backend esté ejecutándose en el puerto 5000');
    console.log('2. Verificar que no haya problemas de CORS');
    console.log('3. Verificar que las rutas estén correctamente configuradas');
  }
}

// Ejecutar prueba
testClientImport();



