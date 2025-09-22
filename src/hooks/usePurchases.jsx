import { useState, useEffect, useCallback } from 'react';
import { purchasesAPI } from '@/services/api';

export function usePurchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Obtener todas las compras
  const fetchPurchases = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await purchasesAPI.getAll(params);
      
      if (response.data.success) {
        setPurchases(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError('Error al obtener las compras');
      }
    } catch (err) {
      // Manejar errores específicos sin redirigir
      if (err.response?.status === 401) {
        setError('Error de autenticación. Por favor, verifica tu sesión.');
      } else if (err.response?.status === 403) {
        setError('No tienes permisos para acceder a las compras.');
      } else {
        setError(err.response?.data?.message || 'Error al obtener las compras');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener compra por ID
  const fetchPurchaseById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await purchasesAPI.getById(id);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        setError('Error al obtener la compra');
        return null;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener la compra');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nueva compra
  const createPurchase = useCallback(async (purchaseData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await purchasesAPI.create(purchaseData);
      
      if (response.data.success) {
        // Actualizar la lista de compras
        await fetchPurchases();
        return { success: true, data: response.data.data };
      } else {
        setError('Error al crear la compra');
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al crear la compra';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchPurchases]);

  // Actualizar compra
  const updatePurchase = useCallback(async (id, purchaseData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await purchasesAPI.update(id, purchaseData);
      
      if (response.data.success) {
        // Actualizar la lista de compras
        await fetchPurchases();
        return { success: true, data: response.data.data };
      } else {
        setError('Error al actualizar la compra');
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar la compra';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchPurchases]);

  // Cambiar estado de compra
  const changePurchaseStatus = useCallback(async (id, status) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await purchasesAPI.changeStatus(id, status);
      
      if (response.data.success) {
        // Actualizar la lista de compras
        await fetchPurchases();
        return { success: true, data: response.data.data };
      } else {
        setError('Error al cambiar el estado de la compra');
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cambiar el estado de la compra';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchPurchases]);

  // Eliminar compra
  const deletePurchase = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await purchasesAPI.delete(id);
      
      if (response.data.success) {
        // Actualizar la lista de compras
        await fetchPurchases();
        return { success: true };
      } else {
        setError('Error al eliminar la compra');
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar la compra';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchPurchases]);

  // Obtener estadísticas
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await purchasesAPI.getStats();
      
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setError('Error al obtener las estadísticas');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener las estadísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener compras por proveedor
  const fetchPurchasesBySupplier = useCallback(async (supplierId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await purchasesAPI.getBySupplier(supplierId);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        setError('Error al obtener las compras del proveedor');
        return [];
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener las compras del proveedor');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Agregar pago parcial
  const addPayment = useCallback(async (purchaseId, paymentData) => {
    try {
      
      setLoading(true);
      setError(null);
      
      const response = await purchasesAPI.addPayment(purchaseId, paymentData);
      
      if (response.data.success) {
        // Recargar todas las compras para actualizar la UI
        await fetchPurchases();
        return response.data.data;
      } else {
        setError('Error al agregar el pago');
        return null;
      }
    } catch (err) {
      
      setError(err.response?.data?.message || 'Error al agregar el pago');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchPurchases]);

  // Obtener pagos de una compra
  const getPayments = useCallback(async (purchaseId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await purchasesAPI.getPayments(purchaseId);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        setError('Error al obtener los pagos');
        return null;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener los pagos');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar pago parcial
  const deletePayment = useCallback(async (purchaseId, paymentId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await purchasesAPI.deletePayment(purchaseId, paymentId);
      
      if (response.data.success) {
        // Recargar todas las compras para actualizar la UI
        await fetchPurchases();
        return response.data.data;
      } else {
        setError('Error al eliminar el pago');
        return null;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar el pago');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchPurchases]);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cargar compras al montar el componente
  useEffect(() => {
    fetchPurchases();
  }, []); // Remover fetchPurchases de las dependencias para evitar re-renders

  return {
    // Estado
    purchases,
    loading,
    error,
    stats,
    pagination,
    
    // Acciones
    fetchPurchases,
    fetchPurchaseById,
    createPurchase,
    updatePurchase,
    changePurchaseStatus,
    deletePurchase,
    fetchStats,
    fetchPurchasesBySupplier,
    addPayment,
    getPayments,
    deletePayment,
    clearError
  };
}

// Exportación por defecto también
export default usePurchases;
