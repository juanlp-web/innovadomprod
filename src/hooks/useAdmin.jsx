import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/services/api';

export function useAdmin() {
  const [tenants, setTenants] = useState([]);
  const [usersWithoutTenant, setUsersWithoutTenant] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Gestión de tenants
  const fetchTenants = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getTenants(params);
      setTenants(response.data.data.tenants || []);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar tenants');
      setTenants([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTenant = useCallback(async (tenantData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.createTenant(tenantData);
      await fetchTenants(); // Recargar lista
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear tenant');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTenants]);

  const updateTenant = useCallback(async (id, tenantData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.updateTenant(id, tenantData);
      await fetchTenants(); // Recargar lista
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar tenant');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTenants]);

  const deleteTenant = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await adminAPI.deleteTenant(id);
      await fetchTenants(); // Recargar lista
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar tenant');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTenants]);

  // Gestión de usuarios
  const fetchUsersWithoutTenant = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getUsersWithoutTenant();
      setUsersWithoutTenant(response.data.data || []);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar usuarios sin tenant');
      setUsersWithoutTenant([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const assignTenantToUser = useCallback(async (userId, tenantId, tenantRole = 'user') => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.assignTenantToUser(userId, tenantId, tenantRole);
      await fetchUsersWithoutTenant(); // Recargar lista
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al asignar tenant a usuario');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsersWithoutTenant]);

  const removeTenantFromUser = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      await adminAPI.removeTenantFromUser(userId);
      await fetchUsersWithoutTenant(); // Recargar lista
    } catch (err) {
      setError(err.response?.data?.message || 'Error al remover tenant de usuario');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsersWithoutTenant]);

  // Estadísticas
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getStats();
      setStats(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar estadísticas');
      setStats(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Tenants
    tenants,
    fetchTenants,
    createTenant,
    updateTenant,
    deleteTenant,
    
    // Usuarios
    usersWithoutTenant,
    fetchUsersWithoutTenant,
    assignTenantToUser,
    removeTenantFromUser,
    
    // Estadísticas
    stats,
    fetchStats,
    
    // Estado general
    loading,
    error
  };
}
