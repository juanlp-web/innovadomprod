// Script para probar la conectividad con la API de importación
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

async function testImportAPI() {
  console.log('🔍 Probando conectividad con la API de importación...\n');

  try {
    // Probar ruta de test
    console.log('1. Probando ruta de test...');
    const testResponse = await fetch(`${API_BASE_URL}/import/test`);
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ Ruta de test funcionando:', testData.message);
    } else {
      console.log('❌ Error en ruta de test:', testResponse.status, testResponse.statusText);
    }

    // Probar ruta de importación con datos de prueba
    console.log('\n2. Probando ruta de importación...');
    
    // Crear FormData para simular archivo CSV
    const formData = new FormData();
    const csvContent = `name,email,phone,address,type,status
"Test User","test@email.com","555-0000","Test Address",individual,Activo`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    formData.append('file', blob, 'test-clients.csv');
    formData.append('options', JSON.stringify({
      skipFirstRow: true,
      updateExisting: false,
      validateData: true
    }));

    const importResponse = await fetch(`${API_BASE_URL}/import/clients`, {
      method: 'POST',
      body: formData,
      headers: {
        'X-Tenant-ID': 'test-tenant' // Agregar tenant ID para testing
      }
    });

    if (importResponse.ok) {
      const importData = await importResponse.json();
      console.log('✅ Importación funcionando:', importData.message);
      console.log('📊 Datos procesados:', importData.count, 'registros');
    } else {
      const errorData = await importResponse.text();
      console.log('❌ Error en importación:', importResponse.status, importResponse.statusText);
      console.log('📄 Detalles del error:', errorData);
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
testImportAPI();
