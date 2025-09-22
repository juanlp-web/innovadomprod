// Script para probar la API de bancos del backend
const API_BASE_URL = 'http://localhost:5000/api';

async function testBanksAPI() {

  try {
    // 1. Probar endpoint de salud
    const healthResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    const healthData = await healthResponse.json();

    // 2. Probar endpoint de bancos (sin autenticación)
    try {
      const banksResponse = await fetch(`${API_BASE_URL}/banks`);
      const banksData = await banksResponse.json();
    } catch (error) {
    }

    // 3. Probar endpoint raíz
    const rootResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/`);
    const rootData = await rootResponse.json();

  } catch (error) {
  }
}

// Ejecutar prueba
testBanksAPI();
