import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'
import { QuickNav } from '@/components/QuickNav'
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
  Box
} from 'lucide-react'

export function DashboardPage() {
  const [selectedYear, setSelectedYear] = useState(2024)
  const [selectedMonth, setSelectedMonth] = useState(12)

  // Datos para Top Productos Vendidos
  const topProducts = [
    { name: 'Crema Hidratante', ventas: 156, color: '#3B82F6' },
    { name: 'Mascarilla Facial', ventas: 134, color: '#10B981' },
    { name: 'Serum Vitamina C', ventas: 98, color: '#8B5CF6' },
    { name: 'Protector Solar', ventas: 87, color: '#F59E0B' },
    { name: 'Exfoliante', ventas: 76, color: '#EF4444' },
    { name: 'Tónico Facial', ventas: 65, color: '#06B6D4' }
  ]

  // Datos para Producción por Períodos
  const productionData = [
    { mes: 'Ene', produccion: 120, meta: 150 },
    { mes: 'Feb', produccion: 135, meta: 150 },
    { mes: 'Mar', produccion: 142, meta: 150 },
    { mes: 'Abr', produccion: 128, meta: 150 },
    { mes: 'May', produccion: 155, meta: 150 },
    { mes: 'Jun', produccion: 148, meta: 150 },
    { mes: 'Jul', produccion: 162, meta: 150 },
    { mes: 'Ago', produccion: 138, meta: 150 },
    { mes: 'Sep', produccion: 145, meta: 150 },
    { mes: 'Oct', produccion: 158, meta: 150 },
    { mes: 'Nov', produccion: 167, meta: 150 },
    { mes: 'Dic', produccion: 175, meta: 150 }
  ]

  // Datos para Distribución de Inversión
  const investmentData = [
    { name: 'Materia Prima', value: 45, color: '#10B981', icon: Leaf },
    { name: 'Envases y Embalaje', value: 25, color: '#3B82F6', icon: Package },
    { name: 'Reventa', value: 20, color: '#8B5CF6', icon: ShoppingCart },
    { name: 'Gastos Generales', value: 10, color: '#F59E0B', icon: Settings }
  ]

  const years = [2022, 2023, 2024]
  const months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Vista general del rendimiento del negocio</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm text-gray-500">Última actualización</p>
            <p className="text-sm font-medium text-gray-900">Hace 5 minutos</p>
          </div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Navegación Rápida */}
      <QuickNav />
      
      {/* Cards de Cantidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Productos */}
        <div className="stats-card card-hover border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Productos</p>
              <p className="text-3xl font-bold text-gray-900">156</p>
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
              <p className="text-3xl font-bold text-gray-900">89</p>
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
              <p className="text-3xl font-bold text-gray-900">67</p>
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
              <p className="text-3xl font-bold text-gray-900">234</p>
            </div>
            <div className="p-4 bg-orange-100 rounded-2xl">
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Proveedores y Total */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Proveedores */}
        <div className="stats-card card-hover border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Proveedores</p>
              <p className="text-3xl font-bold text-gray-900">45</p>
            </div>
            <div className="p-4 bg-indigo-100 rounded-2xl">
              <Factory className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Total General */}
        <div className="stats-card card-hover border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total General</p>
              <p className="text-3xl font-bold text-gray-900">591</p>
            </div>
            <div className="p-4 bg-red-100 rounded-2xl">
              <BarChart3 className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Ventas y Ganancia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ventas del Mes */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-medium p-8 text-white card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100 mb-1">Ventas del Mes</p>
              <p className="text-4xl font-bold">$24,580</p>
            </div>
            <div className="p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Ganancia del Mes */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-medium p-8 text-white card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100 mb-1">Ganancia del Mes</p>
              <p className="text-4xl font-bold">$8,420</p>
            </div>
            <div className="p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Productos Vendidos - Gráfico de Barras */}
        <div className="chart-container card-hover">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Top Productos Vendidos</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span>Ventas</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
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
              <Bar dataKey="ventas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Producción por Períodos - Gráfico de Línea/Área */}
        <div className="chart-container card-hover">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Producción por Períodos</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-gray-500">Producción</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="text-gray-500">Meta</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={productionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="mes" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="produccion" 
                stackId="1" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.3} 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="meta" 
                stroke="#EF4444" 
                strokeWidth={3} 
                strokeDasharray="5 5" 
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Distribución de Inversión - Pastel/Dona */}
      <div className="chart-container card-hover">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Distribución de Inversión</h3>
          
          {/* Filtros de Año y Mes */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Año:</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Mes:</label>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico de Pastel */}
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={investmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {investmentData.map((entry, index) => {
                    const IconComponent = entry.icon;
                    return (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    );
                  })}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Leyenda y Detalles */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Desglose de Inversión</h4>
            {investmentData.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <IconComponent className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">{item.value}%</span>
                    <p className="text-sm text-gray-500">del total</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
