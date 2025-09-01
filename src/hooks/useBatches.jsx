import { useState, useEffect, useCallback } from 'react';
import { batchesAPI } from '@/config/api';

export const useBatches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Obtener todos los lotes
  const fetchBatches = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await batchesAPI.getAll({
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || '',
        product: params.product || '',
        status: params.status || '',
        recipe: params.recipe || '',
        ...params
      });
      
      setBatches(response.data.batches);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
      setTotal(response.data.total);
    } catch (err) {
      console.error('Error al obtener lotes:', err);
      setError(err.response?.data?.message || 'Error al obtener lotes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener lote por ID
  const fetchBatchById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await batchesAPI.getById(id);
      return response.data;
    } catch (err) {
      console.error('Error al obtener lote:', err);
      setError(err.response?.data?.message || 'Error al obtener lote');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nuevo lote
  const createBatch = useCallback(async (batchData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await batchesAPI.create(batchData);
      setBatches(prev => [response.data, ...prev]);
      setTotal(prev => prev + 1);
      return response.data;
    } catch (err) {
      console.error('Error al crear lote:', err);
      setError(err.response?.data?.message || 'Error al crear lote');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar lote
  const updateBatch = useCallback(async (id, batchData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await batchesAPI.update(id, batchData);
      setBatches(prev => prev.map(batch => 
        batch._id === id ? response.data : batch
      ));
      return response.data;
    } catch (err) {
      console.error('Error al actualizar lote:', err);
      setError(err.response?.data?.message || 'Error al actualizar lote');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar lote
  const deleteBatch = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await batchesAPI.delete(id);
      setBatches(prev => prev.filter(batch => batch._id !== id));
      setTotal(prev => prev - 1);
      return true;
    } catch (err) {
      console.error('Error al eliminar lote:', err);
      setError(err.response?.data?.message || 'Error al eliminar lote');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Consumir stock del lote
  const consumeBatchStock = useCallback(async (id, quantity) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await batchesAPI.consumeStock(id, quantity);
      
      // Actualizar el lote en la lista
      setBatches(prev => prev.map(batch => 
        batch._id === id ? response.data.batch : batch
      ));
      
      return response.data;
    } catch (err) {
      console.error('Error al consumir stock del lote:', err);
      setError(err.response?.data?.message || 'Error al consumir stock del lote');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Restaurar stock del lote
  const restoreBatchStock = useCallback(async (id, quantity) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await batchesAPI.restoreStock(id, quantity);
      
      // Actualizar el lote en la lista
      setBatches(prev => prev.map(batch => 
        batch._id === id ? response.data.batch : batch
      ));
      
      return response.data;
    } catch (err) {
      console.error('Error al restaurar stock del lote:', err);
      setError(err.response?.data?.message || 'Error al restaurar stock del lote');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener lotes activos de un producto
  const getActiveBatchesByProduct = useCallback(async (productId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await batchesAPI.getActiveByProduct(productId);
      return response.data;
    } catch (err) {
      console.error('Error al obtener lotes activos del producto:', err);
      setError(err.response?.data?.message || 'Error al obtener lotes activos del producto');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener estadísticas de lotes
  const getBatchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await batchesAPI.getStats();
      return response.data;
    } catch (err) {
      console.error('Error al obtener estadísticas de lotes:', err);
      setError(err.response?.data?.message || 'Error al obtener estadísticas de lotes');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener lotes próximos a vencer
  const getExpiringBatches = useCallback(async (days = 30) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await batchesAPI.getExpiringSoon(days);
      return response.data;
    } catch (err) {
      console.error('Error al obtener lotes próximos a vencer:', err);
      setError(err.response?.data?.message || 'Error al obtener lotes próximos a vencer');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    batches,
    loading,
    error,
    totalPages,
    currentPage,
    total,
    fetchBatches,
    fetchBatchById,
    createBatch,
    updateBatch,
    deleteBatch,
    consumeBatchStock,
    restoreBatchStock,
    getActiveBatchesByProduct,
    getBatchStats,
    getExpiringBatches,
    clearError
  };
};

