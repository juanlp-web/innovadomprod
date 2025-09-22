import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';
import { banksAPI } from '@/config/api';

export function useBanks() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalBalance: 0,
    activeAccounts: 0,
    accountTypes: 0,
    totalAccounts: 0
  });
  const { success: showSuccess, error: showError } = useToast();


  // Obtener todas las cuentas bancarias
  const fetchBanks = async (params = {}) => {
    setLoading(true);
    try {
      const response = await banksAPI.getAll(params);
      const data = response.data;

      if (data.success) {
        setBanks(data.data);
        setSummary(data.summary);
        return data;
      } else {
        throw new Error(data.message || 'Error al obtener cuentas bancarias');
      }
    } catch (error) {
      showError(error.response?.data?.message || error.message || 'Error al cargar cuentas bancarias');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Obtener una cuenta bancaria por ID
  const fetchBankById = async (id) => {
    try {
      const response = await banksAPI.getById(id);
      const data = response.data;

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error al obtener cuenta bancaria');
      }
    } catch (error) {
      showError(error.response?.data?.message || error.message || 'Error al cargar cuenta bancaria');
      throw error;
    }
  };

  // Crear nueva cuenta bancaria
  const createBank = async (bankData) => {
    setLoading(true);
    try {
      const response = await banksAPI.create(bankData);
      const data = response.data;

      if (data.success) {
        setBanks(prev => [data.data, ...prev]);
        showSuccess(data.message || 'Cuenta bancaria creada correctamente');
        return data.data;
      } else {
        throw new Error(data.message || 'Error al crear cuenta bancaria');
      }
    } catch (error) {
      showError(error.response?.data?.message || error.message || 'Error al crear cuenta bancaria');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar cuenta bancaria
  const updateBank = async (id, bankData) => {
    setLoading(true);
    try {
      const response = await banksAPI.update(id, bankData);
      const data = response.data;

      if (data.success) {
        setBanks(prev => prev.map(bank => 
          bank._id === id ? data.data : bank
        ));
        showSuccess(data.message || 'Cuenta bancaria actualizada correctamente');
        return data.data;
      } else {
        throw new Error(data.message || 'Error al actualizar cuenta bancaria');
      }
    } catch (error) {
      showError(error.response?.data?.message || error.message || 'Error al actualizar cuenta bancaria');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar cuenta bancaria
  const deleteBank = async (id) => {
    setLoading(true);
    try {
      const response = await banksAPI.delete(id);
      const data = response.data;

      if (data.success) {
        setBanks(prev => prev.filter(bank => bank._id !== id));
        showSuccess(data.message || 'Cuenta bancaria eliminada correctamente');
        return true;
      } else {
        throw new Error(data.message || 'Error al eliminar cuenta bancaria');
      }
    } catch (error) {
      showError(error.response?.data?.message || error.message || 'Error al eliminar cuenta bancaria');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar saldo de cuenta bancaria
  const updateBalance = async (id, balanceData) => {
    setLoading(true);
    try {
      const response = await banksAPI.updateBalance(id, balanceData);
      const data = response.data;

      if (data.success) {
        setBanks(prev => prev.map(bank => 
          bank._id === id ? data.data : bank
        ));
        showSuccess(data.message || 'Saldo actualizado correctamente');
        return data.data;
      } else {
        throw new Error(data.message || 'Error al actualizar saldo');
      }
    } catch (error) {
      showError(error.response?.data?.message || error.message || 'Error al actualizar saldo');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Obtener estadísticas
  const fetchStats = async () => {
    try {
      const response = await banksAPI.getStats();
      const data = response.data;

      if (data.success) {
        setSummary(data.data);
        return data.data;
      } else {
        throw new Error(data.message || 'Error al obtener estadísticas');
      }
    } catch (error) {
      showError(error.response?.data?.message || error.message || 'Error al cargar estadísticas');
      throw error;
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchBanks();
  }, []);

  return {
    banks,
    loading,
    summary,
    fetchBanks,
    fetchBankById,
    createBank,
    updateBank,
    deleteBank,
    updateBalance,
    fetchStats
  };
}
