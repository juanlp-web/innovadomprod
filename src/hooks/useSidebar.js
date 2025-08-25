import { useState, useCallback } from 'react';

export const useSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

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
