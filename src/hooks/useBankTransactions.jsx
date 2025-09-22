import { useState, useEffect, useCallback } from 'react';
import { bankTransactionsAPI } from '@/config/api';

export function useBankTransactions(bankId) {
  
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar transacciones
  const fetchTransactions = useCallback(async (params = {}) => {
    
    if (!bankId) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await bankTransactionsAPI.getTransactions(bankId, params);
      
      // Asegurar que transactions siempre sea un array
      const transactionsData = Array.isArray(response.data?.data) ? response.data.data : [];
      
      setTransactions(transactionsData);
      setStats(response.data?.stats || null);
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al cargar transacciones');
      setTransactions([]); // Asegurar que sea un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  }, [bankId]);

  // Cargar estadísticas
  const fetchStats = useCallback(async (period = '30d') => {
    if (!bankId) return;
    
    try {
      const response = await bankTransactionsAPI.getStats(bankId, { period });
      setStats(response.data);
    } catch (err) {
    }
  }, [bankId]);

  // Crear transacción manual
  const createTransaction = useCallback(async (transactionData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await bankTransactionsAPI.createTransaction(bankId, transactionData);
      
      // Recargar transacciones
      await fetchTransactions();
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear transacción');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [bankId, fetchTransactions]);

  // Cargar transacciones cuando cambie el bankId
  useEffect(() => {
    if (bankId) {
      fetchTransactions();
    } else {
      setTransactions([]);
      setStats(null);
    }
  }, [bankId]); // Remover fetchTransactions de las dependencias para evitar loops

  return {
    transactions,
    stats,
    loading,
    error,
    fetchTransactions,
    fetchStats,
    createTransaction
  };
}
