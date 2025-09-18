import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts'
import { useDashboard } from '@/hooks/useDashboard'
import { useMobile } from '@/hooks/useMobile'
import {
  Package,
  Leaf,
  Sparkles,
  Users,
  Factory,
  BarChart3,
  DollarSign,
  TrendingUp,
  Activity,
  Target,
  ShoppingCart,
  User,
  Settings,
  Database,
  FileText,
  Box,
  RefreshCw,
  AlertCircle
} from 'lucide-react'

export function DashboardPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const { isMobile } = useMobile()
  
  const { 
    stats, 
    topProducts, 
    monthlyData, 
    loading, 
    error, 
    refreshData, 
    fetchMonthlyData
  } = useDashboard()

  // Actualizar datos mensuales cuando cambie el año
  useEffect(() => {
    fetchMonthlyData(selectedYear)
  }, [selectedYear, fetchMonthlyData])

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount || 0)
  }

  // Formatear fecha de última actualización
  const formatLastUpdate = () => {
    const now = new Date()
    const diff = Math.floor((now - new Date(now.getTime() - 5 * 60 * 1000)) / 1000)
    if (diff < 60) return 'Hace unos segundos'
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`
    return `Hace ${Math.floor(diff / 3600)} horas`
  }

  // Mostrar error si existe
  if (error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="card card-hover p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error de conexión</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button 
              onClick={refreshData}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reintentar</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className={`flex items-center justify-between ${isMobile ? 'flex-col space-y-4' : ''}`}>
        <div>
          <h1 className={`font-bold text-gray-900 mb-2 ${isMobile ? 'text-2xl' : 'text-4xl'}`}>Dashboard</h1>
          <p className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>Vista general del rendimiento del negocio</p>
        </div>
        <div className={`flex items-center space-x-3 ${isMobile ? 'w-full justify-between' : ''}`}>
          {!isMobile && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Última actualización</p>
              <p className="text-sm font-medium text-gray-900">{formatLastUpdate()}</p>
            </div>
          )}
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <button 
            onClick={refreshData}
            disabled={loading}
            className={`text-gray-500 hover:text-gray-700 transition-colors duration-200 ${isMobile ? 'p-3' : 'p-2'}`}
            title="Actualizar datos"
          >
            <RefreshCw className={`${isMobile ? 'w-6 h-6' : 'w-5 h-5'} ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navegación Rápida */}
      
      {/* Cards de Cantidades */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'}`}>
        {/* Productos */}
        <div className="stats-card card-hover border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Productos</p>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? '...' : stats.products.total}
              </p>
            </div>
            <div className="p-4 bg-blue-100 rounded-2xl">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Materia Prima */}
        <div className="stats-card card-hover border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Materia Prima</p>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? '...' : (stats.products.byCategory?.materia_prima || 0)}
              </p>
            </div>
            <div className="p-4 bg-green-100 rounded-2xl">
              <Leaf className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Productos Terminados */}
        <div className="stats-card card-hover border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Productos Terminados</p>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? '...' : (stats.products.byCategory?.producto_terminado || 0)}
              </p>
            </div>
            <div className="p-4 bg-purple-100 rounded-2xl">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Clientes */}
        <div className="stats-card card-hover border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Clientes</p>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? '...' : stats.clients.total}
              </p>
            </div>
            <div className="p-4 bg-orange-100 rounded-2xl">
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Proveedores y Total */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 gap-6'}`}>
        {/* Proveedores */}
        <div className="stats-card card-hover border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Proveedores</p>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? '...' : stats.suppliers.total}
              </p>
            </div>
            <div className="p-4 bg-indigo-100 rounded-2xl">
              <Factory className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Lotes */}
        <div className="stats-card card-hover border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Lotes Activos</p>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? '...' : stats.batches.total}
              </p>
            </div>
            <div className="p-4 bg-red-100 rounded-2xl">
              <Box className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Ventas y Ganancia */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 gap-6'}`}>
        {/* Ventas del Mes */}
        <div className={`bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-medium text-white card-hover ${isMobile ? 'p-6' : 'p-8'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100 mb-1">Ventas del Mes</p>
              <p className={`font-bold ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
                {loading ? '...' : formatCurrency(stats.sales.monthly)}
              </p>
            </div>
            <div className="p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Ganancia del Mes */}
        <div className={`bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-medium text-white card-hover ${isMobile ? 'p-6' : 'p-8'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100 mb-1">Ganancia del Mes</p>
              <p className={`font-bold ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
                {loading ? '...' : formatCurrency(stats.sales.profit)}
              </p>
            </div>
            <div className="p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2 gap-8'}`}>
        {/* Top Productos Vendidos - Gráfico de Barras */}
        <div className="chart-container card-hover">
          <div className="flex items-center justify-between mb-6">
            <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>Top Productos Vendidos</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span>Ventas</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="quantity" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ventas Mensuales - Gráfico de Línea/Área */}
        <div className="chart-container card-hover">
          <div className="flex items-center justify-between mb-6">
            <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>Ventas Mensuales</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-gray-500">Ventas</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [formatCurrency(value), 'Ventas']}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stackId="1" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.3} 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
