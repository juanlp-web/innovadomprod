import { useState, useEffect } from 'react'
import { 
  BarChart3, TrendingUp, Download, Calendar, RefreshCw, FileText, Eye,
  DollarSign, Package, Users, ShoppingCart, Factory, Package2, BookOpen,
  PieChart, Activity, Target, Filter, Settings, Share2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDashboard } from '@/hooks/useDashboard'
import { useProducts } from '@/hooks/useProducts'
import { useSales } from '@/hooks/useSales'
import { usePurchases } from '@/hooks/usePurchases'
import { useClients } from '@/hooks/useClients'
import { useSuppliers } from '@/hooks/useSuppliers'
import { ReportChart } from '@/components/ReportChart'

// Configuración de tabs de reportes
const REPORT_TABS = [
  {
    id: 'overview',
    label: 'Vista General',
      icon: BarChart3, 
    color: 'blue',
    description: 'Resumen ejecutivo y métricas principales'
    },
    { 
    id: 'sales',
      label: 'Ventas', 
      icon: DollarSign, 
    color: 'green',
    description: 'Análisis detallado de ventas e ingresos'
  },
  {
    id: 'inventory',
    label: 'Inventario',
      icon: Package, 
    color: 'purple',
    description: 'Control de stock y productos'
    },
    { 
    id: 'customers',
      label: 'Clientes', 
      icon: Users, 
    color: 'indigo',
    description: 'Gestión y análisis de clientes'
    },
    { 
    id: 'suppliers',
      label: 'Proveedores', 
      icon: Factory, 
    color: 'red',
    description: 'Análisis de proveedores y compras'
  },
  {
    id: 'trends',
    label: 'Tendencias',
    icon: TrendingUp,
    color: 'orange',
    description: 'Análisis de tendencias y predicciones'
  }
]

const TIME_PERIODS = [
  { value: '7d', label: 'Últimos 7 días', days: 7 },
  { value: '30d', label: 'Últimos 30 días', days: 30 },
  { value: '90d', label: 'Últimos 90 días', days: 90 },
  { value: '1y', label: 'Último año', days: 365 },
  { value: 'custom', label: 'Personalizado', days: null }
]

// Componente de Tab
const TabButton = ({ tab, isActive, onClick }) => (
  <button
    onClick={() => onClick(tab.id)}
    className={`
      relative flex items-center space-x-3 px-6 py-4 rounded-xl font-medium transition-all duration-300
      ${isActive 
        ? `bg-${tab.color}-500 text-white shadow-lg transform scale-105` 
        : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'
      }
    `}
  >
    <tab.icon className={`w-5 h-5 ${isActive ? 'text-white' : `text-${tab.color}-500`}`} />
    <div className="text-left">
      <div className="text-sm font-semibold">{tab.label}</div>
      <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
        {tab.description}
      </div>
    </div>
    {isActive && (
      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
    )}
  </button>
)

// Componente de Métrica
const MetricCard = ({ title, value, change, icon: Icon, color = 'blue', trend = 'up' }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
      {change && (
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
          ${trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
        `}>
          <TrendingUp className={`w-3 h-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
          <span>{change}</span>
        </div>
      )}
    </div>
    <div className="space-y-1">
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  </div>
)

// Componente principal
export function ReporteriaPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [timePeriod, setTimePeriod] = useState('30d')
  const [isExporting, setIsExporting] = useState(false)
  const [viewMode, setViewMode] = useState('visual') // 'visual' | 'table' | 'raw'

  // Hooks para datos
  const { stats: dashboardStats } = useDashboard()
  const { products } = useProducts()
  const { sales } = useSales()
  const { purchases } = usePurchases()
  const { clients } = useClients()
  const { suppliers } = useSuppliers()

  // Estado de carga
  const isLoading = !dashboardStats && !products && !sales && !purchases && !clients && !suppliers

  // Función para exportar reportes
  const handleExport = async () => {
    setIsExporting(true)
    try {
      const reportData = generateReportData(activeTab)
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
      a.download = `reporte-${activeTab}-${timePeriod}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error al exportar:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // Generar datos para el reporte
  const generateReportData = (tab) => {
    const baseData = {
      tab,
      period: timePeriod,
      generatedAt: new Date().toISOString(),
      system: 'ProductOneX'
    }

    switch (tab) {
      case 'overview':
        return {
          ...baseData,
          summary: {
            totalSales: dashboardStats?.totalSales || 0,
            totalPurchases: dashboardStats?.totalPurchases || 0,
            totalProducts: dashboardStats?.totalProducts || 0,
            totalClients: dashboardStats?.totalClients || 0,
            totalSuppliers: dashboardStats?.totalSuppliers || 0
          }
        }
      case 'sales':
        return {
          ...baseData,
          sales: sales || [],
          metrics: {
            total: sales?.length || 0,
            revenue: sales?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0
          }
        }
      case 'inventory':
        return {
          ...baseData,
          products: products || [],
          metrics: {
            total: products?.length || 0,
            lowStock: products?.filter(p => p.stock < 10).length || 0
          }
        }
      default:
        return baseData
    }
  }

  // Renderizar contenido del tab activo
  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
            <p className="text-gray-600">Cargando datos del reporte...</p>
          </div>
        </div>
      )
    }

    // Obtener datos según el tab activo
    const getTabData = () => {
      switch (activeTab) {
        case 'overview':
          return { dashboardStats }
        case 'sales':
          return { sales }
        case 'inventory':
          return { products }
        case 'customers':
          return { clients }
        case 'suppliers':
          return { suppliers }
        case 'trends':
          return { sales, products }
        default:
          return {}
      }
    }

    const tabData = getTabData()

    // Renderizar según el modo de vista
    if (viewMode === 'table') {
      return renderTableView(activeTab, tabData)
    } else if (viewMode === 'raw') {
      return renderRawView(activeTab, tabData)
    }

    // Vista visual (por defecto)
    switch (activeTab) {
      case 'overview':
        return <OverviewContent dashboardStats={dashboardStats} />
      case 'sales':
        return <SalesContent sales={sales} />
      case 'inventory':
        return <InventoryContent products={products} />
      case 'customers':
        return <CustomersContent clients={clients} />
      case 'suppliers':
        return <SuppliersContent suppliers={suppliers} />
      case 'trends':
        return <TrendsContent sales={sales} products={products} />
      default:
        return <div className="text-center py-20 text-gray-500">Contenido no disponible</div>
    }
  }

  // Renderizar vista de tabla
  const renderTableView = (tab, data) => {
    const renderTable = (title, items, columns) => (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col, index) => (
                  <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items?.length > 0 ? items.slice(0, 10).map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {col.accessor(item, index)}
                    </td>
                  ))}
                </tr>
              )) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                    No hay datos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {items?.length > 10 && (
          <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500 text-center">
            Mostrando 10 de {items.length} registros
          </div>
        )}
    </div>
  )

    switch (tab) {
      case 'overview':
        const overviewData = [
          { metric: 'Total Ventas', value: data.dashboardStats?.totalSales || 0, trend: '+12%' },
          { metric: 'Total Compras', value: data.dashboardStats?.totalPurchases || 0, trend: '+8%' },
          { metric: 'Total Productos', value: data.dashboardStats?.totalProducts || 0, trend: '+5%' },
          { metric: 'Total Clientes', value: data.dashboardStats?.totalClients || 0, trend: '+15%' },
          { metric: 'Total Proveedores', value: data.dashboardStats?.totalSuppliers || 0, trend: '+3%' }
        ]
        return renderTable('Resumen General', overviewData, [
          { header: 'Métrica', accessor: (item) => item.metric },
          { header: 'Valor', accessor: (item) => item.value },
          { header: 'Tendencia', accessor: (item) => item.trend }
        ])

      case 'sales':
        return renderTable('Ventas', data.sales, [
          { header: '#', accessor: (item, index) => index + 1 },
          { header: 'ID', accessor: (item) => item._id?.slice(-6) || 'N/A' },
          { header: 'Cliente', accessor: (item) => item.clientName || 'N/A' },
          { header: 'Total', accessor: (item) => `$${(item.total || 0).toFixed(2)}` },
          { header: 'Fecha', accessor: (item) => item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A' },
          { header: 'Estado', accessor: (item) => item.status || 'Completada' }
        ])

      case 'inventory':
        return renderTable('Productos', data.products, [
          { header: '#', accessor: (item, index) => index + 1 },
          { header: 'Nombre', accessor: (item) => item.name || 'N/A' },
          { header: 'SKU', accessor: (item) => item.sku || 'N/A' },
          { header: 'Stock', accessor: (item) => item.stock || 0 },
          { header: 'Precio', accessor: (item) => `$${(item.price || 0).toFixed(2)}` },
          { header: 'Categoría', accessor: (item) => item.category || 'N/A' },
          { header: 'Estado', accessor: (item) => item.isActive ? 'Activo' : 'Inactivo' }
        ])

      case 'customers':
        return renderTable('Clientes', data.clients, [
          { header: '#', accessor: (item, index) => index + 1 },
          { header: 'Nombre', accessor: (item) => item.name || 'N/A' },
          { header: 'Email', accessor: (item) => item.email || 'N/A' },
          { header: 'Teléfono', accessor: (item) => item.phone || 'N/A' },
          { header: 'Ciudad', accessor: (item) => item.city || 'N/A' },
          { header: 'Estado', accessor: (item) => item.isActive ? 'Activo' : 'Inactivo' }
        ])

      case 'suppliers':
        return renderTable('Proveedores', data.suppliers, [
          { header: '#', accessor: (item, index) => index + 1 },
          { header: 'Nombre', accessor: (item) => item.name || 'N/A' },
          { header: 'Empresa', accessor: (item) => item.company || 'N/A' },
          { header: 'Email', accessor: (item) => item.email || 'N/A' },
          { header: 'Teléfono', accessor: (item) => item.phone || 'N/A' },
          { header: 'Estado', accessor: (item) => item.isActive ? 'Activo' : 'Inactivo' }
        ])

      case 'trends':
        const trendsData = [
          { indicator: 'Crecimiento de Ventas', value: '+12%', status: 'Positivo' },
          { indicator: 'Rotación de Inventario', value: '+2%', status: 'Estable' },
          { indicator: 'Satisfacción de Clientes', value: '85%', status: 'Bueno' },
          { indicator: 'Eficiencia Operativa', value: '+5%', status: 'Mejorando' }
        ]
        return renderTable('Indicadores de Tendencias', trendsData, [
          { header: 'Indicador', accessor: (item) => item.indicator },
          { header: 'Valor', accessor: (item) => item.value },
          { header: 'Estado', accessor: (item) => item.status }
        ])

      default:
        return <div className="text-center py-20 text-gray-500">Vista de tabla no disponible</div>
    }
  }

  // Renderizar vista raw
  const renderRawView = (tab, data) => (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Datos Raw - {REPORT_TABS.find(t => t.id === tab)?.label}</h3>
      </div>
      <div className="p-6">
        <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm text-gray-700">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
              <h1 className="text-3xl font-bold text-gray-900">Centro de Reportes</h1>
              <p className="text-gray-600 mt-2">Análisis y métricas del sistema ProductOneX</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Selector de período */}
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {TIME_PERIODS.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>

              {/* Selector de vista */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'visual', icon: BarChart3, label: 'Visual' },
                  { id: 'table', icon: Eye, label: 'Tabla' },
                  { id: 'raw', icon: FileText, label: 'Raw' }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      viewMode === mode.id 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <mode.icon className="w-4 h-4" />
                    <span>{mode.label}</span>
                  </button>
                ))}
        </div>

              {/* Botón de exportar */}
        <Button
                onClick={handleExport}
                disabled={isExporting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Exportando...
            </>
          ) : (
            <>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
            </>
          )}
        </Button>
      </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-4">
          <div className="flex space-x-2 py-4 overflow-x-auto">
            {REPORT_TABS.map(tab => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onClick={setActiveTab}
              />
        ))}
      </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full px-4 py-8">
        {renderTabContent()}
            </div>
          </div>
  )
}

// Componentes de contenido para cada tab
const OverviewContent = ({ dashboardStats }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Ventas"
        value={dashboardStats?.totalSales || 0}
        change="+12%"
        icon={DollarSign}
        color="green"
      />
      <MetricCard
        title="Total Compras"
        value={dashboardStats?.totalPurchases || 0}
        change="+8%"
        icon={ShoppingCart}
        color="orange"
      />
      <MetricCard
        title="Productos"
        value={dashboardStats?.totalProducts || 0}
        change="+5%"
        icon={Package}
        color="purple"
      />
      <MetricCard
        title="Clientes"
        value={dashboardStats?.totalClients || 0}
        change="+15%"
        icon={Users}
        color="blue"
      />
        </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Período</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Ventas Totales</span>
            <span className="font-semibold">{dashboardStats?.totalSales || 0}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Compras Totales</span>
            <span className="font-semibold">{dashboardStats?.totalPurchases || 0}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Productos Activos</span>
            <span className="font-semibold">{dashboardStats?.totalProducts || 0}</span>
              </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Clientes Activos</span>
            <span className="font-semibold">{dashboardStats?.totalClients || 0}</span>
              </div>
            </div>
          </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Sistema</h3>
              <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Sistema Operativo</span>
                  </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Base de Datos Conectada</span>
                </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Backup Programado</span>
                </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Reportes Actualizados</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
)

const SalesContent = ({ sales }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        title="Ventas Totales"
        value={sales?.length || 0}
        change="+12%"
        icon={BarChart3}
        color="green"
      />
      <MetricCard
        title="Ingresos"
        value={`$${sales?.reduce((sum, sale) => sum + (sale.total || 0), 0).toFixed(2) || '0.00'}`}
        change="+18%"
        icon={DollarSign}
        color="blue"
      />
      <MetricCard
        title="Promedio por Venta"
        value={`$${sales?.length ? (sales.reduce((sum, sale) => sum + (sale.total || 0), 0) / sales.length).toFixed(2) : '0.00'}`}
        change="+5%"
        icon={TrendingUp}
        color="purple"
      />
    </div>

    {sales?.length > 0 && (
      <ReportChart
        title="Evolución de Ventas"
        data={sales.slice(0, 10).map((sale, index) => ({
          label: `Venta ${index + 1}`,
          value: sale.total || 0
        }))}
        type="line"
        height={300}
      />
    )}
  </div>
)

const InventoryContent = ({ products }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        title="Total Productos"
        value={products?.length || 0}
        change="+3%"
        icon={Package}
        color="purple"
      />
      <MetricCard
        title="Stock Bajo"
        value={products?.filter(p => p.stock < 10).length || 0}
        change="-5%"
        icon={Activity}
        color="red"
        trend="down"
      />
      <MetricCard
        title="Productos Activos"
        value={products?.filter(p => p.isActive).length || 0}
        change="+8%"
        icon={Target}
        color="green"
      />
        </div>

    {products?.length > 0 && (
      <ReportChart
        title="Niveles de Stock"
        data={[
          { label: 'Stock Alto (>50)', value: products.filter(p => p.stock > 50).length },
          { label: 'Stock Medio (10-50)', value: products.filter(p => p.stock >= 10 && p.stock <= 50).length },
          { label: 'Stock Bajo (<10)', value: products.filter(p => p.stock < 10).length },
          { label: 'Sin Stock', value: products.filter(p => p.stock === 0).length }
        ]}
        type="pie"
        height={300}
      />
    )}
  </div>
)

const CustomersContent = ({ clients }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        title="Total Clientes"
        value={clients?.length || 0}
        change="+15%"
        icon={Users}
        color="blue"
      />
      <MetricCard
        title="Clientes Activos"
        value={clients?.filter(c => c.isActive).length || 0}
        change="+20%"
        icon={Activity}
        color="green"
      />
      <MetricCard
        title="Tasa de Actividad"
        value={`${clients?.length ? ((clients.filter(c => c.isActive).length / clients.length) * 100).toFixed(1) : '0'}%`}
        change="+2%"
        icon={Target}
        color="purple"
      />
    </div>
            </div>
)

const SuppliersContent = ({ suppliers }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        title="Total Proveedores"
        value={suppliers?.length || 0}
        change="+5%"
        icon={Factory}
        color="red"
      />
      <MetricCard
        title="Proveedores Activos"
        value={suppliers?.filter(s => s.isActive).length || 0}
        change="+8%"
        icon={Activity}
        color="green"
      />
      <MetricCard
        title="Tasa de Actividad"
        value={`${suppliers?.length ? ((suppliers.filter(s => s.isActive).length / suppliers.length) * 100).toFixed(1) : '0'}%`}
        change="+3%"
        icon={Target}
        color="orange"
      />
            </div>
  </div>
)

const TrendsContent = ({ sales, products }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <MetricCard
        title="Tendencia de Ventas"
        value="↗️ Creciendo"
        change="+12%"
        icon={TrendingUp}
        color="green"
      />
      <MetricCard
        title="Rotación de Inventario"
        value="↘️ Estable"
        change="+2%"
        icon={Package}
        color="blue"
      />
          </div>
          
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Tendencias</h3>
      <div className="space-y-4">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800">Ventas en Crecimiento</h4>
          <p className="text-sm text-green-700">Las ventas han aumentado un 12% en el período seleccionado</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800">Inventario Optimizado</h4>
          <p className="text-sm text-blue-700">Los niveles de stock se mantienen estables</p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="font-semibold text-yellow-800">Oportunidad de Mejora</h4>
          <p className="text-sm text-yellow-700">Se recomienda revisar productos con bajo stock</p>
          </div>
        </div>
      </div>
    </div>
  )
