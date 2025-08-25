import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { inventoryAPI, productsAPI } from '@/config/api';

export function TestConnection() {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testBackendConnection = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: Conexión básica
      const response = await fetch('http://localhost:5000/');
      results.basicConnection = response.ok ? '✅ Conectado' : '❌ Error de conexión';
    } catch (error) {
      results.basicConnection = `❌ Error: ${error.message}`;
    }

    try {
      // Test 2: API de productos
      const response = await productsAPI.getAll();
      results.productsAPI = response.status === 200 ? '✅ Funcionando' : '❌ Error';
    } catch (error) {
      results.productsAPI = `❌ Error: ${error.response?.data?.message || error.message}`;
    }

    try {
      // Test 3: API de inventario
      const response = await inventoryAPI.getSummary();
      results.inventoryAPI = response.status === 200 ? '✅ Funcionando' : '❌ Error';
    } catch (error) {
      results.inventoryAPI = `❌ Error: ${error.response?.data?.message || error.message}`;
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Prueba de Conexión Backend</h2>
      
      <Button 
        onClick={testBackendConnection} 
        disabled={loading}
        className="mb-4"
      >
        {loading ? 'Probando...' : 'Probar Conexión'}
      </Button>

      {Object.keys(testResults).length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Resultados:</h3>
          <div className="space-y-1">
            <div><strong>Conexión básica:</strong> {testResults.basicConnection}</div>
            <div><strong>API de productos:</strong> {testResults.productsAPI}</div>
            <div><strong>API de inventario:</strong> {testResults.inventoryAPI}</div>
          </div>
        </div>
      )}

      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h4 className="font-semibold mb-2">Información de configuración:</h4>
        <div className="text-sm space-y-1">
          <div><strong>URL de la API:</strong> {import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}</div>
          <div><strong>Backend esperado:</strong> http://localhost:5001</div>
        </div>
      </div>
    </div>
  );
}
