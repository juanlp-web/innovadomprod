import { useState, useEffect, useCallback } from 'react';
import { salesAPI } from '@/services/api';

export const useSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [availablePackages, setAvailablePackages] = useState([]);

  // Obtener todas las ventas
  const fetchSales = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await salesAPI.getAll(params);
      setSales(response.data.sales || response.data);
    } catch (err) {
      console.error('Error al obtener ventas:', err);
      setError(err.response?.data?.message || 'Error al obtener las ventas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener una venta por ID
  const fetchSaleById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await salesAPI.getById(id);
      return response.data;
    } catch (err) {
      console.error('Error al obtener venta:', err);
      setError(err.response?.data?.message || 'Error al obtener la venta');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nueva venta
  const createSale = useCallback(async (saleData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await salesAPI.create(saleData);
      setSales(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      console.error('Error al crear venta:', err);
      setError(err.response?.data?.message || 'Error al crear la venta');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar estado de pago
  const updatePaymentStatus = useCallback(async (id, status) => {
    try {
      setLoading(true);
      setError(null);
      const response = await salesAPI.updatePaymentStatus(id, status);
      setSales(prev => prev.map(sale => 
        sale._id === id ? { ...sale, paymentStatus: status } : sale
      ));
      return response.data;
    } catch (err) {
      console.error('Error al actualizar estado de pago:', err);
      setError(err.response?.data?.message || 'Error al actualizar el estado de pago');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener estadísticas
  const fetchStats = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await salesAPI.getStats(params);
      setStats(response.data);
      return response.data;
    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
      setError(err.response?.data?.message || 'Error al obtener las estadísticas');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar venta (marcar como inactiva)
  const deleteSale = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      // Nota: El backend actual no tiene endpoint de eliminación
      // Por ahora solo removemos del estado local
      setSales(prev => prev.filter(sale => sale._id !== id));
      return true;
    } catch (err) {
      console.error('Error al eliminar venta:', err);
      setError(err.response?.data?.message || 'Error al eliminar la venta');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener paquetes disponibles para ventas
  const fetchAvailablePackages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching available packages...');
      console.log('salesAPI:', salesAPI);
      console.log('getAvailablePackages function:', salesAPI.getAvailablePackages);
      
      if (typeof salesAPI.getAvailablePackages !== 'function') {
        throw new Error('getAvailablePackages is not a function');
      }
      
      const response = await salesAPI.getAvailablePackages();
      console.log('Available packages response:', response.data);
      setAvailablePackages(response.data);
      return response.data;
    } catch (err) {
      console.error('Error al obtener paquetes disponibles:', err);
      setError(err.response?.data?.message || 'Error al obtener paquetes disponibles');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cargar ventas al inicializar
  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return {
    sales,
    loading,
    error,
    stats,
    availablePackages,
    fetchSales,
    fetchSaleById,
    createSale,
    updatePaymentStatus,
    fetchStats,
    deleteSale,
    fetchAvailablePackages,
    clearError
  };
};
