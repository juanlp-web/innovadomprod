import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useSessionPersistence = () => {
  const { refreshSession, isAuthenticated } = useAuth();

  useEffect(() => {
    // Función para manejar el evento beforeunload
    const handleBeforeUnload = () => {
      // Guardar timestamp de la última actividad
      localStorage.setItem('lastActivity', Date.now().toString());
    };

    // Función para verificar la sesión periódicamente
    const checkSessionInterval = setInterval(() => {
      if (isAuthenticated) {
        const lastActivity = localStorage.getItem('lastActivity');
        const now = Date.now();
        
        // Si han pasado más de 5 minutos sin actividad, refrescar la sesión
        if (lastActivity && (now - parseInt(lastActivity)) > 5 * 60 * 1000) {
          refreshSession();
        }
      }
    }, 60000); // Verificar cada minuto

    // Función para manejar cuando la página vuelve a estar visible
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        // La página está visible y el usuario está autenticado
        // Refrescar la sesión para asegurar que sigue válida
        refreshSession();
      }
    };

    // Agregar event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Limpiar event listeners y interval al desmontar
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(checkSessionInterval);
    };
  }, [refreshSession, isAuthenticated]);

  return null;
};
