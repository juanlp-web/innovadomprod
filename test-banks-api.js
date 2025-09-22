// Script de prueba para la API de bancos
const API_BASE_URL = 'http://localhost:5000/api';

async function testBanksAPI() {

  try {
    // 1. Probar endpoint de estadísticas
    const statsResponse = await fetch(`${API_BASE_URL}/banks/stats/summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Token de prueba
      }
    });
    
    const statsData = await statsResponse.json();
    
    // 2. Probar endpoint de listado
    const listResponse = await fetch(`${API_BASE_URL}/banks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });
    
    const listData = await listResponse.json();
    
    // 3. Probar creación de cuenta (si el token es válido)
    const createData = {
      name: 'Cuenta de Prueba',
      type: 'banco',
      accountNumber: '1234567890',
      initialBalance: 1000.00,
      currency: 'DOP',
      initialBalanceDate: new Date().toISOString().split('T')[0],
      description: 'Cuenta de prueba para testing'
    };
    
    const createResponse = await fetch(`${API_BASE_URL}/banks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(createData)
    });
    
    const createResult = await createResponse.json();
    
  } catch (error) {
  }
}

// Ejecutar pruebas
testBanksAPI();
