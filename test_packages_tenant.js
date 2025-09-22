// Script de prueba para verificar que los paquetes usan el tenant correcto
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testPackagesTenant() {
  try {
    
    // Simular headers de un tenant específico
    const headers = {
      'X-Tenant-ID': 'tenant-test', // Cambiar por el subdomain de tu tenant
      'Content-Type': 'application/json'
    };
    
    const response = await axios.get(`${API_BASE_URL}/sales/available-packages`, { headers });
    
    
    response.data.slice(0, 3).forEach((pkg, index) => {
      if (pkg.items && pkg.items.length > 0) {
      }
    });
    
  } catch (error) {
  }
}

// Ejecutar la prueba
testPackagesTenant();
