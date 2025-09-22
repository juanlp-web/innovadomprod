import { useState, useEffect, useCallback } from 'react';
import { accountConfigsAPI } from '@/services/api';

export function useAccountConfigs() {
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await accountConfigsAPI.getAll();
      
      // Verificar si la respuesta tiene la estructura esperada
      if (response.data && response.data.success) {
        setConfigs(response.data.data || {});
      } else {
        setConfigs({});
      }
    } catch (err) {
      
      const errorMessage = err.response?.data?.message || err.message || 'Error al cargar configuraciones contables';
      setError(errorMessage);
      setConfigs({});
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchModuleConfig = useCallback(async (module) => {
    try {
      setLoading(true);
      setError(null);
      const response = await accountConfigsAPI.getByModule(module);
      return response.data.data || {};
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar configuración del módulo');
      return {};
    } finally {
      setLoading(false);
    }
  }, []);

  const updateModuleConfig = useCallback(async (module, configurations) => {
    try {
      setLoading(true);
      setError(null);
      const response = await accountConfigsAPI.updateModule(module, configurations);
      
      // Actualizar el estado local
      setConfigs(prev => ({
        ...prev,
        [module]: response.data.data
      }));
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar configuración del módulo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAllConfigs = useCallback(async (configsData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await accountConfigsAPI.updateAll(configsData);
      setConfigs(response.data.data || {});
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar configuraciones contables');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getModuleConfig = useCallback((module) => {
    return configs[module] || {};
  }, [configs]);

  const getAccountForModule = useCallback((module, field) => {
    const moduleConfig = getModuleConfig(module);
    return moduleConfig[field] || null;
  }, [getModuleConfig]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  return {
    configs,
    loading,
    error,
    fetchConfigs,
    fetchModuleConfig,
    updateModuleConfig,
    updateAllConfigs,
    getModuleConfig,
    getAccountForModule
  };
}
