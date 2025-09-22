import { useState, useEffect, useCallback } from 'react';
import { configAPI } from '@/services/api';

export const useConfig = () => {
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener todas las configuraciones
  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await configAPI.getAll();
      const configObject = {};
      response.data.forEach(config => {
        configObject[config.key] = config.value;
      });
      setConfigs(configObject);
      return configObject;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener configuraciones');
      return {};
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener una configuración específica
  const getConfig = useCallback((key, defaultValue = null) => {
    return configs[key] !== undefined ? configs[key] : defaultValue;
  }, [configs]);

  // Actualizar una configuración
  const updateConfig = useCallback(async (key, value, type = 'string', description = '') => {
    try {
      setLoading(true);
      setError(null);
      const response = await configAPI.update(key, value, type, description);
      
      // Actualizar el estado local
      setConfigs(prev => ({
        ...prev,
        [key]: value
      }));
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar configuración');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear una nueva configuración
  const createConfig = useCallback(async (key, value, type = 'string', description = '') => {
    try {
      setLoading(true);
      setError(null);
      const response = await configAPI.create(key, value, type, description);
      
      // Actualizar el estado local
      setConfigs(prev => ({
        ...prev,
        [key]: value
      }));
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear configuración');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar configuraciones al montar el componente
  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  return {
    configs,
    loading,
    error,
    fetchConfigs,
    getConfig,
    updateConfig,
    createConfig
  };
};
