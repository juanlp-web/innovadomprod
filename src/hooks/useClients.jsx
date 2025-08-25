import { useState, useEffect, useCallback } from 'react';
import { clientsAPI } from '@/config/api';

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10
  });

  const fetchClients = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await clientsAPI.getAll(params);
      
      if (response.data.success) {
        setClients(response.data.data);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.data.message || 'Error al cargar clientes');
      }
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      setError(err.message || 'Error al cargar clientes');
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getClientById = useCallback(async (id) => {
    try {
      const response = await clientsAPI.getById(id);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Error al obtener cliente');
      }
    } catch (err) {
      console.error('Error al obtener cliente:', err);
      throw err;
    }
  }, []);

  const createClient = useCallback(async (clientData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await clientsAPI.create(clientData);
      
      if (response.data.success) {
        // Agregar el nuevo cliente al estado local
        setClients(prev => [response.data.data, ...prev]);
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Error al crear cliente');
      }
    } catch (err) {
      console.error('Error al crear cliente:', err);
      setError(err.message || 'Error al crear cliente');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateClient = useCallback(async (id, clientData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await clientsAPI.update(id, clientData);
      
      if (response.data.success) {
        // Actualizar el cliente en el estado local
        setClients(prev => 
          prev.map(client => 
            client._id === id ? response.data.data : client
          )
        );
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Error al actualizar cliente');
      }
    } catch (err) {
      console.error('Error al actualizar cliente:', err);
      setError(err.message || 'Error al actualizar cliente');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteClient = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await clientsAPI.delete(id);
      
      if (response.data.success) {
        // Remover el cliente del estado local
        setClients(prev => prev.filter(client => client._id !== id));
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Error al eliminar cliente');
      }
    } catch (err) {
      console.error('Error al eliminar cliente:', err);
      setError(err.message || 'Error al eliminar cliente');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Cambiar estado del cliente
  const changeClientStatus = useCallback(async (id, isActive) => {
    try {
      setError(null);
      
      const response = await clientsAPI.update(id, { isActive });
      
      if (response.data.success) {
        // Actualizar el cliente en la lista local
        setClients(prev => 
          prev.map(client => 
            client._id === id ? { ...client, isActive } : client
          )
        );
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Error al cambiar estado');
      }
    } catch (err) {
      console.error('Error al cambiar estado del cliente:', err);
      setError(err.message || 'Error al cambiar estado');
      return { success: false, error: err.message };
    }
  }, []);

  const searchClients = useCallback(async (searchTerm, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        search: searchTerm,
        ...filters
      };
      
      const response = await clientsAPI.getAll(params);
      
      if (response.data.success) {
        setClients(response.data.data);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.data.message || 'Error en la búsqueda');
      }
    } catch (err) {
      console.error('Error en la búsqueda:', err);
      setError(err.message || 'Error en la búsqueda');
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const changePage = useCallback(async (page) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await clientsAPI.getAll({ 
        page, 
        limit: pagination.limit 
      });
      
      if (response.data.success) {
        setClients(response.data.data);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.data.message || 'Error al cambiar página');
      }
    } catch (err) {
      console.error('Error al cambiar página:', err);
      setError(err.message || 'Error al cambiar página');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    error,
    pagination,
    fetchClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
    changeClientStatus,
    searchClients,
    changePage,
    clearError
  };
};
