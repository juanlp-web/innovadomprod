import { useState, useEffect, useCallback } from 'react';
import { accountsAPI } from '@/services/api';

export function useAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [flatAccounts, setFlatAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAccounts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await accountsAPI.getAll(params);
      
      // Verificar estructura de respuesta
      if (response.data && response.data.success) {
        setAccounts(response.data.data || []);
        setFlatAccounts(response.data.flat || []);
      } else {
        setAccounts([]);
        setFlatAccounts([]);
      }
    } catch (err) {
      
      const errorMessage = err.response?.data?.message || err.message || 'Error al cargar cuentas contables';
      setError(errorMessage);
      setAccounts([]);
      setFlatAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFlatAccounts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await accountsAPI.getFlat(params);
      setFlatAccounts(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar cuentas contables');
      setFlatAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAccount = useCallback(async (accountData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await accountsAPI.create(accountData);
      await fetchAccounts(); // Recargar lista
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear cuenta contable');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAccounts]);

  const updateAccount = useCallback(async (id, accountData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await accountsAPI.update(id, accountData);
      await fetchAccounts(); // Recargar lista
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar cuenta contable');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAccounts]);

  const deleteAccount = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await accountsAPI.delete(id);
      await fetchAccounts(); // Recargar lista
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar cuenta contable');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAccounts]);

  const getAccountById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await accountsAPI.getById(id);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener cuenta contable');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    flatAccounts,
    loading,
    error,
    fetchAccounts,
    fetchFlatAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccountById
  };
}
