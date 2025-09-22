import { useState, useEffect, useCallback } from 'react';
import { profileAPI } from '@/config/api';
import { toast } from 'react-hot-toast';

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);

  // Obtener perfil del usuario
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getProfile();
      
      if (response.data.success) {
        setProfile(response.data.data);
        setError(null);
      } else {
        setError('Error al cargar el perfil');
      }
    } catch (err) {
      setError('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar perfil
  const updateProfile = useCallback(async (profileData) => {
    try {
      setLoading(true);
      const response = await profileAPI.updateProfile(profileData);
      
      if (response.data.success) {
        setProfile(response.data.data);
        toast.success('Perfil actualizado correctamente');
        return { success: true };
      } else {
        toast.error('Error al actualizar el perfil');
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      toast.error('Error al actualizar el perfil');
      return { success: false, message: err.response?.data?.message || 'Error desconocido' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Cambiar contraseña
  const changePassword = useCallback(async (passwordData) => {
    try {
      setLoading(true);
      const response = await profileAPI.changePassword(passwordData);
      
      if (response.data.success) {
        toast.success('Contraseña cambiada correctamente');
        return { success: true };
      } else {
        toast.error('Error al cambiar la contraseña');
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cambiar la contraseña';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener historial de accesos
  const fetchLoginHistory = useCallback(async () => {
    try {
      const response = await profileAPI.getLoginHistory();
      
      if (response.data.success) {
        setLoginHistory(response.data.data);
      }
    } catch (err) {
    }
  }, []);

  // Actualizar notificaciones
  const updateNotifications = useCallback(async (notificationData) => {
    try {
      const response = await profileAPI.updateNotifications(notificationData);
      
      if (response.data.success) {
        setProfile(response.data.data);
        toast.success('Configuración de notificaciones actualizada');
        return { success: true };
      } else {
        toast.error('Error al actualizar notificaciones');
        return { success: false };
      }
    } catch (err) {
      toast.error('Error al actualizar notificaciones');
      return { success: false };
    }
  }, []);

  // Actualizar tema
  const updateTheme = useCallback(async (themeData) => {
    try {
      const response = await profileAPI.updateTheme(themeData);
      
      if (response.data.success) {
        setProfile(response.data.data);
        toast.success('Preferencia de tema actualizada');
        return { success: true };
      } else {
        toast.error('Error al actualizar tema');
        return { success: false };
      }
    } catch (err) {
      toast.error('Error al actualizar tema');
      return { success: false };
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    fetchProfile();
    fetchLoginHistory();
  }, [fetchProfile, fetchLoginHistory]);

  return {
    profile,
    loginHistory,
    loading,
    error,
    fetchProfile,
    updateProfile,
    changePassword,
    fetchLoginHistory,
    updateNotifications,
    updateTheme
  };
};
