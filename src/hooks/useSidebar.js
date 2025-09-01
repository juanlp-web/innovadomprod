import { useState, useCallback, useEffect } from 'react';

export const useSidebar = () => {
  // Estado inicial basado en el tamaño de pantalla
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Verificar si estamos en el navegador
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  // Detectar tamaño de pantalla y colapsar en móviles/tablets
  useEffect(() => {
    const checkScreenSize = () => {
      const shouldBeCollapsed = window.innerWidth < 1024;
      setIsCollapsed(shouldBeCollapsed);
    };

    // Verificar al cargar
    checkScreenSize();

    // Agregar listener para cambios de tamaño
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const setCollapsed = useCallback((collapsed) => {
    setIsCollapsed(collapsed);
  }, []);

  // Calcular el margen izquierdo basado en el estado del sidebar
  const getSidebarMargin = useCallback(() => {
    return isCollapsed ? 'ml-20' : 'ml-72';
  }, [isCollapsed]);

  // Calcular el ancho del sidebar
  const getSidebarWidth = useCallback(() => {
    return isCollapsed ? 'w-20' : 'w-72';
  }, [isCollapsed]);

  return {
    isCollapsed,
    toggleCollapse,
    setCollapsed,
    getSidebarMargin,
    getSidebarWidth
  };
};
