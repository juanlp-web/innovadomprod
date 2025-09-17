import { useState, useEffect, useCallback } from 'react';
import { packagesAPI } from '@/config/api';

export const usePackages = () => {
  const [packages, setPackages] = useState([]);
  const [availablePackages, setAvailablePackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Obtener todos los paquetes
  const fetchPackages = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await packagesAPI.getAll(params);
      setPackages(response.data.packages || response.data);
    } catch (err) {
      console.error('Error al obtener paquetes:', err);
      setError(err.response?.data?.message || 'Error al obtener los paquetes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener un paquete por ID
  const fetchPackageById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await packagesAPI.getById(id);
      return response.data;
    } catch (err) {
      console.error('Error al obtener paquete:', err);
      setError(err.response?.data?.message || 'Error al obtener el paquete');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nuevo paquete
  const createPackage = useCallback(async (packageData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await packagesAPI.create(packageData);
      setPackages(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      console.error('Error al crear paquete:', err);
      setError(err.response?.data?.message || 'Error al crear el paquete');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar paquete
  const updatePackage = useCallback(async (id, packageData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await packagesAPI.update(id, packageData);
      setPackages(prev => prev.map(pkg => 
        pkg._id === id ? response.data : pkg
      ));
      return response.data;
    } catch (err) {
      console.error('Error al actualizar paquete:', err);
      setError(err.response?.data?.message || 'Error al actualizar el paquete');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar paquete
  const deletePackage = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await packagesAPI.delete(id);
      setPackages(prev => prev.filter(pkg => pkg._id !== id));
      return true;
    } catch (err) {
      console.error('Error al eliminar paquete:', err);
      setError(err.response?.data?.message || 'Error al eliminar el paquete');
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
      const response = await packagesAPI.getAll({ isActive: true });
      setAvailablePackages(response.data.packages || response.data);
      return response.data.packages || response.data;
    } catch (err) {
      console.error('Error al obtener paquetes disponibles:', err);
      setError(err.response?.data?.message || 'Error al obtener paquetes disponibles');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener estadísticas
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await packagesAPI.getStats();
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

  // Verificar disponibilidad de stock
  const checkStockAvailability = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await packagesAPI.checkStock(id);
      return response.data;
    } catch (err) {
      console.error('Error al verificar stock:', err);
      setError(err.response?.data?.message || 'Error al verificar disponibilidad de stock');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cargar paquetes al inicializar
  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  return {
    packages,
    availablePackages,
    loading,
    error,
    stats,
    fetchPackages,
    fetchPackageById,
    createPackage,
    updatePackage,
    deletePackage,
    fetchStats,
    fetchAvailablePackages,
    checkStockAvailability,
    clearError
  };
};
