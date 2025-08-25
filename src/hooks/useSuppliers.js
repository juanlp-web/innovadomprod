import { useState, useEffect, useCallback } from 'react';
import { suppliersAPI } from '@/services/api';

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
    blocked: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [filters, setFilters] = useState({
    search: '',
    category: 'Todas las categorías',
    status: 'Todos los estados',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Cargar proveedores
  const fetchSuppliers = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await suppliersAPI.getAll({
        ...filters,
        ...params,
        page: params.page || filters.page || 1,
        limit: params.limit || filters.limit || 10
      });

      if (response.data.success) {
        setSuppliers(response.data.data);
        setPagination(response.data.pagination);
        setStats(response.data.stats);
      } else {
        throw new Error(response.data.message || 'Error al cargar proveedores');
      }
    } catch (err) {
      console.error('Error al cargar proveedores:', err);
      setError(err.message || 'Error al cargar proveedores');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Cargar estadísticas
  const fetchStats = useCallback(async () => {
    try {
      const response = await suppliersAPI.getStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  }, []);

  // Crear proveedor
  const createSupplier = useCallback(async (supplierData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await suppliersAPI.create(supplierData);
      
      if (response.data.success) {
        // Recargar la lista y estadísticas
        await fetchSuppliers();
        await fetchStats();
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Error al crear proveedor');
      }
    } catch (err) {
      console.error('Error al crear proveedor:', err);
      setError(err.message || 'Error al crear proveedor');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchSuppliers, fetchStats]);

  // Actualizar proveedor
  const updateSupplier = useCallback(async (id, supplierData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await suppliersAPI.update(id, supplierData);
      
      if (response.data.success) {
        // Actualizar el proveedor en la lista local
        setSuppliers(prev => 
          prev.map(supplier => 
            supplier._id === id ? response.data.data : supplier
          )
        );
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Error al actualizar proveedor');
      }
    } catch (err) {
      console.error('Error al actualizar proveedor:', err);
      setError(err.message || 'Error al actualizar proveedor');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar proveedor
  const deleteSupplier = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await suppliersAPI.delete(id);
      
      if (response.data.success) {
        // Remover el proveedor de la lista local
        setSuppliers(prev => prev.filter(supplier => supplier._id !== id));
        // Recargar estadísticas
        await fetchStats();
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Error al eliminar proveedor');
      }
    } catch (err) {
      console.error('Error al eliminar proveedor:', err);
      setError(err.message || 'Error al eliminar proveedor');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  // Cambiar estado del proveedor
  const changeSupplierStatus = useCallback(async (id, status) => {
    try {
      setError(null);
      
      const response = await suppliersAPI.changeStatus(id, status);
      
      if (response.data.success) {
        // Actualizar el proveedor en la lista local
        setSuppliers(prev => 
          prev.map(supplier => 
            supplier._id === id ? response.data.data : supplier
          )
        );
        // Recargar estadísticas
        await fetchStats();
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Error al cambiar estado');
      }
    } catch (err) {
      console.error('Error al cambiar estado del proveedor:', err);
      setError(err.message || 'Error al cambiar estado');
      return { success: false, error: err.message };
    }
  }, [fetchStats]);

  // Buscar proveedores
  const searchSuppliers = useCallback(async (searchQuery, searchFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await suppliersAPI.search(searchQuery, searchFilters);
      
      if (response.data.success) {
        setSuppliers(response.data.data);
        setPagination(response.data.pagination);
        setStats(response.data.stats);
      } else {
        throw new Error(response.data.message || 'Error en la búsqueda');
      }
    } catch (err) {
      console.error('Error en la búsqueda:', err);
      setError(err.message || 'Error en la búsqueda');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar filtros
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Cambiar página
  const changePage = useCallback((page) => {
    fetchSuppliers({ page });
  }, [fetchSuppliers]);

  // Cambiar límite de items por página
  const changeLimit = useCallback((limit) => {
    fetchSuppliers({ page: 1, limit });
  }, [fetchSuppliers]);

  // Ordenar
  const sortBy = useCallback((field, order = 'asc') => {
    const newFilters = { ...filters, sortBy: field, sortOrder: order };
    setFilters(newFilters);
    fetchSuppliers(newFilters);
  }, [filters, fetchSuppliers]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchSuppliers();
    fetchStats();
  }, [fetchSuppliers, fetchStats]);

  return {
    // Estado
    suppliers,
    loading,
    error,
    stats,
    pagination,
    filters,
    
    // Acciones
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    changeSupplierStatus,
    searchSuppliers,
    updateFilters,
    changePage,
    changeLimit,
    sortBy,
    
    // Utilidades
    clearError: () => setError(null),
    refresh: () => fetchSuppliers()
  };
};
