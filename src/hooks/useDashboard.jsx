import { useState, useEffect, useCallback } from 'react';
import { dashboardAPI } from '@/config/api';

export const useDashboard = () => {
  const [stats, setStats] = useState({
    products: { total: 0, byCategory: {} },
    clients: { total: 0, active: 0 },
    suppliers: { total: 0, active: 0 },
    sales: { total: 0, monthly: 0, profit: 0 },
    purchases: { total: 0, monthly: 0 },
    inventory: { totalValue: 0, lowStock: 0 },
    batches: { total: 0, expiringSoon: 0 }
  });
  
  const [topProducts, setTopProducts] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener estadísticas generales
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Obtener estadísticas generales
      const statsResponse = await dashboardAPI.getStats();
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      // Obtener top productos
      const topProductsResponse = await dashboardAPI.getTopProducts();
      if (topProductsResponse.data.success) {
        setTopProducts(topProductsResponse.data.data);
      }

      // Obtener datos mensuales del año actual
      const currentYear = new Date().getFullYear();
      const monthlyResponse = await dashboardAPI.getMonthlyData(currentYear);
      if (monthlyResponse.data.success) {
        setMonthlyData(monthlyResponse.data.data);
      }

      setError(null);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      setError('Error al cargar las estadísticas del dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener datos mensuales para un año específico
  const fetchMonthlyData = useCallback(async (year) => {
    try {
      const response = await dashboardAPI.getMonthlyData(year);
      if (response.data.success) {
        setMonthlyData(response.data.data);
      }
    } catch (err) {
      console.error('Error al cargar datos mensuales:', err);
    }
  }, []);

  // Actualizar todos los datos
  const refreshData = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    topProducts,
    monthlyData,
    loading,
    error,
    refreshData,
    fetchMonthlyData
  };
};
