import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useSessionPersistence = () => {
  const { refreshSession, isAuthenticated } = useAuth();
  const lastRefreshAttempt = useRef(0);
  const isRefreshing = useRef(false);

  useEffect(() => {
    // Función para manejar el evento beforeunload
    const handleBeforeUnload = () => {
      // Guardar timestamp de la última actividad
      localStorage.setItem('lastActivity', Date.now().toString());
    };

    // Función para verificar la sesión periódicamente (menos agresivo)
    const checkSessionInterval = setInterval(() => {
      if (isAuthenticated && !isRefreshing.current) {
        const lastActivity = localStorage.getItem('lastActivity');
        const now = Date.now();
        
        // Solo refrescar si han pasado más de 30 minutos sin actividad
        // Y si la última tentativa de refresh fue hace más de 5 minutos
        if (lastActivity && 
            (now - parseInt(lastActivity)) > 30 * 60 * 1000 &&
            (now - lastRefreshAttempt.current) > 5 * 60 * 1000) {
          
          isRefreshing.current = true;
          lastRefreshAttempt.current = now;
          
          refreshSession().finally(() => {
            isRefreshing.current = false;
          });
        }
      }
    }, 5 * 60 * 1000); // Verificar cada 5 minutos (menos frecuente)

    // Función para manejar cuando la página vuelve a estar visible
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && !isRefreshing.current) {
        const now = Date.now();
        const lastActivity = localStorage.getItem('lastActivity');
        
        // Solo refrescar si ha estado oculta por más de 15 minutos
        // Y si la última tentativa fue hace más de 2 minutos
        if (lastActivity && 
            (now - parseInt(lastActivity)) > 15 * 60 * 1000 &&
            (now - lastRefreshAttempt.current) > 2 * 60 * 1000) {
          
          isRefreshing.current = true;
          lastRefreshAttempt.current = now;
          
          refreshSession().finally(() => {
            isRefreshing.current = false;
          });
        }
      }
    };

    // Función para actualizar la actividad del usuario
    const updateActivity = () => {
      localStorage.setItem('lastActivity', Date.now().toString());
    };

    // Event listeners para detectar actividad del usuario
    const activityEvents = ['click', 'keydown', 'mousemove', 'scroll'];
    
    // Agregar event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Agregar listeners de actividad con throttle
    let activityTimeout;
    const throttledUpdateActivity = () => {
      if (activityTimeout) clearTimeout(activityTimeout);
      activityTimeout = setTimeout(updateActivity, 30000); // Actualizar cada 30 segundos máximo
    };
    
    activityEvents.forEach(event => {
      document.addEventListener(event, throttledUpdateActivity, { passive: true });
    });

    // Limpiar event listeners y interval al desmontar
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(checkSessionInterval);
      
      activityEvents.forEach(event => {
        document.removeEventListener(event, throttledUpdateActivity);
      });
      
      if (activityTimeout) clearTimeout(activityTimeout);
    };
  }, [refreshSession, isAuthenticated]);

  return null;
};
