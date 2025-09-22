import { useState, useEffect, useCallback } from 'react';
import { accountPaymentAPI } from '@/config/api';

export function useAccountPayments() {
  const [accountPayments, setAccountPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 0,
    total: 0
  });
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalCount: 0,
    avgAmount: 0
  });

  // Cargar pagos contables
  const fetchAccountPayments = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await accountPaymentAPI.getAccountPayments(params);
      
      if (response.data.success) {
        setAccountPayments(response.data.data);
        setPagination(response.data.pagination);
        setStats(response.data.stats);
      } else {
        throw new Error(response.data.message || 'Error al cargar pagos contables');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al cargar pagos contables');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar pagos contables al montar el componente
  useEffect(() => {
    fetchAccountPayments();
  }, [fetchAccountPayments]);

  return {
    accountPayments,
    loading,
    error,
    pagination,
    stats,
    fetchAccountPayments
  };
}
