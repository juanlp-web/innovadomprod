import { useState, useEffect } from 'react'
import { 
  BarChart3, TrendingUp, Download, Calendar, RefreshCw, Eye,
  DollarSign, Package, Users, ShoppingCart, Factory, Package2, BookOpen,
  PieChart, Activity, Target, Filter, Settings, Share2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMobile } from '@/hooks/useMobile'
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
const TabButton = ({ tab, isActive, onClick, isMobile }) => (
  <button
    onClick={() => onClick(tab.id)}
    className={`
      relative flex items-center rounded-xl font-medium transition-all duration-300
      ${isMobile 
        ? `px-3 py-3 space-x-2 ${isActive ? `bg-${tab.color}-500 text-white shadow-lg` : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`
        : `px-6 py-4 space-x-3 ${isActive ? `bg-${tab.color}-500 text-white shadow-lg transform scale-105` : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'}`
      }
    `}
  >
    <tab.icon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} ${isActive ? 'text-white' : `text-${tab.color}-500`}`} />
    <div className="text-left">
      <div className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>{tab.label}</div>
      {!isMobile && (
        <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
          {tab.description}
        </div>
      )}
    </div>
    {isActive && !isMobile && (
      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
    )}
  </button>
)

// Componente de Métrica
const MetricCard = ({ title, value, change, icon: Icon, color = 'blue', trend = 'up', isMobile }) => (
  <div className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 ${isMobile ? 'p-4' : 'p-6'}`}>
    <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-4'}`}>
      <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-${color}-100 rounded-xl flex items-center justify-center`}>
        <Icon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-${color}-600`} />
      </div>
      {change && (
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full font-medium
          ${isMobile ? 'text-xs' : 'text-xs'}
          ${trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
        `}>
          <TrendingUp className={`${isMobile ? 'w-3 h-3' : 'w-3 h-3'} ${trend === 'down' ? 'rotate-180' : ''}`} />
          <span>{change}</span>
        </div>
      )}
    </div>
    <div className="space-y-1">
      <h3 className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{value}</h3>
      <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>{title}</p>
    </div>
  </div>
)

// Componente principal
export function ReporteriaPage() {
  const { isMobile } = useMobile()
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
    }

    // Vista visual (por defecto)
    switch (activeTab) {
      case 'overview':
        return <OverviewContent dashboardStats={dashboardStats} isMobile={isMobile} />
      case 'sales':
        return <SalesContent sales={sales} isMobile={isMobile} />
      case 'inventory':
        return <InventoryContent products={products} isMobile={isMobile} />
      case 'customers':
        return <CustomersContent clients={clients} isMobile={isMobile} />
      case 'suppliers':
        return <SuppliersContent suppliers={suppliers} isMobile={isMobile} />
      case 'trends':
        return <TrendsContent sales={sales} products={products} isMobile={isMobile} />
      default:
        return <div className="text-center py-20 text-gray-500">Contenido no disponible</div>
    }
  }

  // Renderizar vista de tabla
  const renderTableView = (tab, data) => {
    const renderTable = (title, items, columns) => (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className={`border-b border-gray-100 ${isMobile ? 'px-4 py-3' : 'px-6 py-4'}`}>
          <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}>{title}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col, index) => (
                  <th key={index} className={`text-left font-medium text-gray-500 uppercase tracking-wider ${isMobile ? 'px-3 py-2 text-xs' : 'px-6 py-3 text-xs'}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items?.length > 0 ? items.slice(0, 10).map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={`whitespace-nowrap text-gray-900 ${isMobile ? 'px-3 py-3 text-xs' : 'px-6 py-4 text-sm'}`}>
                      {col.accessor(item, index)}
                    </td>
                  ))}
                </tr>
              )) : (
                <tr>
                  <td colSpan={columns.length} className={`text-center text-gray-500 ${isMobile ? 'px-3 py-3 text-xs' : 'px-6 py-4 text-sm'}`}>
                    No hay datos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {items?.length > 10 && (
          <div className={`bg-gray-50 text-gray-500 text-center ${isMobile ? 'px-4 py-2 text-xs' : 'px-6 py-3 text-sm'}`}>
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


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className={`w-full ${isMobile ? 'px-4 py-4' : 'px-4 py-6'}`}>
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
        <div>
              <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}>Centro de Reportes</h1>
              <p className={`text-gray-600 ${isMobile ? 'text-sm mt-1' : 'mt-2'}`}>Análisis y métricas del sistema ProductOneX</p>
            </div>
            <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'items-center space-x-4'}`}>
              {/* Selector de período */}
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className={`border border-gray-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isMobile ? 'px-4 py-3 text-base w-full' : 'px-4 py-2 text-sm'}`}
              >
                {TIME_PERIODS.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>

              {/* Selector de vista */}
              <div className={`flex items-center bg-gray-100 rounded-lg p-1 ${isMobile ? 'w-full' : ''}`}>
                {[
                  { id: 'visual', icon: BarChart3, label: 'Visual' },
                  { id: 'table', icon: Eye, label: 'Tabla' }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`flex items-center space-x-2 rounded-md font-medium transition-all duration-200 ${
                      isMobile 
                        ? `px-3 py-2 text-sm flex-1 justify-center ${viewMode === mode.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`
                        : `px-3 py-2 text-sm ${viewMode === mode.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`
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
                className={`bg-blue-600 hover:bg-blue-700 text-white ${isMobile ? 'w-full py-3' : ''}`}
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
        <div className={`w-full ${isMobile ? 'px-2' : 'px-4'}`}>
          <div className={`flex ${isMobile ? 'space-x-1 py-2 overflow-x-auto' : 'space-x-2 py-4 overflow-x-auto'}`}>
            {REPORT_TABS.map(tab => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onClick={setActiveTab}
                isMobile={isMobile}
              />
        ))}
      </div>
        </div>
      </div>

      {/* Content Area */}
      <div className={`w-full ${isMobile ? 'px-2 py-4' : 'px-4 py-8'}`}>
        {renderTabContent()}
            </div>
          </div>
  )
}

// Componentes de contenido para cada tab
const OverviewContent = ({ dashboardStats, isMobile }) => (
  <div className={`space-y-8 ${isMobile ? 'space-y-6' : ''}`}>
    <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
      <MetricCard
        title="Total Ventas"
        value={dashboardStats?.totalSales || 0}
        change="+12%"
        icon={DollarSign}
        color="green"
        isMobile={isMobile}
      />
      <MetricCard
        title="Total Compras"
        value={dashboardStats?.totalPurchases || 0}
        change="+8%"
        icon={ShoppingCart}
        color="orange"
        isMobile={isMobile}
      />
      <MetricCard
        title="Productos"
        value={dashboardStats?.totalProducts || 0}
        change="+5%"
        icon={Package}
        color="purple"
        isMobile={isMobile}
      />
      <MetricCard
        title="Clientes"
        value={dashboardStats?.totalClients || 0}
        change="+15%"
        icon={Users}
        color="blue"
        isMobile={isMobile}
      />
        </div>

    <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
      <div className={`bg-white rounded-xl border border-gray-100 ${isMobile ? 'p-4' : 'p-6'}`}>
        <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-base mb-3' : 'text-lg mb-4'}`}>Resumen del Período</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>Ventas Totales</span>
            <span className={`font-semibold ${isMobile ? 'text-sm' : ''}`}>{dashboardStats?.totalSales || 0}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>Compras Totales</span>
            <span className={`font-semibold ${isMobile ? 'text-sm' : ''}`}>{dashboardStats?.totalPurchases || 0}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>Productos Activos</span>
            <span className={`font-semibold ${isMobile ? 'text-sm' : ''}`}>{dashboardStats?.totalProducts || 0}</span>
              </div>
          <div className="flex justify-between items-center py-2">
            <span className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>Clientes Activos</span>
            <span className={`font-semibold ${isMobile ? 'text-sm' : ''}`}>{dashboardStats?.totalClients || 0}</span>
              </div>
            </div>
          </div>

      <div className={`bg-white rounded-xl border border-gray-100 ${isMobile ? 'p-4' : 'p-6'}`}>
        <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-base mb-3' : 'text-lg mb-4'}`}>Estado del Sistema</h3>
              <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-sm'}`}>Sistema Operativo</span>
                  </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-sm'}`}>Base de Datos Conectada</span>
                </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-sm'}`}>Backup Programado</span>
                </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-sm'}`}>Reportes Actualizados</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
)

const SalesContent = ({ sales, isMobile }) => (
  <div className={`space-y-8 ${isMobile ? 'space-y-6' : ''}`}>
    <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
      <MetricCard
        title="Ventas Totales"
        value={sales?.length || 0}
        change="+12%"
        icon={BarChart3}
        color="green"
        isMobile={isMobile}
      />
      <MetricCard
        title="Ingresos"
        value={`$${sales?.reduce((sum, sale) => sum + (sale.total || 0), 0).toFixed(2) || '0.00'}`}
        change="+18%"
        icon={DollarSign}
        color="blue"
        isMobile={isMobile}
      />
      <MetricCard
        title="Promedio por Venta"
        value={`$${sales?.length ? (sales.reduce((sum, sale) => sum + (sale.total || 0), 0) / sales.length).toFixed(2) : '0.00'}`}
        change="+5%"
        icon={TrendingUp}
        color="purple"
        isMobile={isMobile}
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

const InventoryContent = ({ products, isMobile }) => (
  <div className={`space-y-8 ${isMobile ? 'space-y-6' : ''}`}>
    <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
      <MetricCard
        title="Total Productos"
        value={products?.length || 0}
        change="+3%"
        icon={Package}
        color="purple"
        isMobile={isMobile}
      />
      <MetricCard
        title="Stock Bajo"
        value={products?.filter(p => p.stock < 10).length || 0}
        change="-5%"
        icon={Activity}
        color="red"
        trend="down"
        isMobile={isMobile}
      />
      <MetricCard
        title="Productos Activos"
        value={products?.filter(p => p.isActive).length || 0}
        change="+8%"
        icon={Target}
        color="green"
        isMobile={isMobile}
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

const CustomersContent = ({ clients, isMobile }) => (
  <div className={`space-y-8 ${isMobile ? 'space-y-6' : ''}`}>
    <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
      <MetricCard
        title="Total Clientes"
        value={clients?.length || 0}
        change="+15%"
        icon={Users}
        color="blue"
        isMobile={isMobile}
      />
      <MetricCard
        title="Clientes Activos"
        value={clients?.filter(c => c.isActive).length || 0}
        change="+20%"
        icon={Activity}
        color="green"
        isMobile={isMobile}
      />
      <MetricCard
        title="Tasa de Actividad"
        value={`${clients?.length ? ((clients.filter(c => c.isActive).length / clients.length) * 100).toFixed(1) : '0'}%`}
        change="+2%"
        icon={Target}
        color="purple"
        isMobile={isMobile}
      />
    </div>
            </div>
)

const SuppliersContent = ({ suppliers, isMobile }) => (
  <div className={`space-y-8 ${isMobile ? 'space-y-6' : ''}`}>
    <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
      <MetricCard
        title="Total Proveedores"
        value={suppliers?.length || 0}
        change="+5%"
        icon={Factory}
        color="red"
        isMobile={isMobile}
      />
      <MetricCard
        title="Proveedores Activos"
        value={suppliers?.filter(s => s.isActive).length || 0}
        change="+8%"
        icon={Activity}
        color="green"
        isMobile={isMobile}
      />
      <MetricCard
        title="Tasa de Actividad"
        value={`${suppliers?.length ? ((suppliers.filter(s => s.isActive).length / suppliers.length) * 100).toFixed(1) : '0'}%`}
        change="+3%"
        icon={Target}
        color="orange"
        isMobile={isMobile}
      />
            </div>
  </div>
)

const TrendsContent = ({ sales, products, isMobile }) => (
  <div className={`space-y-8 ${isMobile ? 'space-y-6' : ''}`}>
    <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
      <MetricCard
        title="Tendencia de Ventas"
        value="↗️ Creciendo"
        change="+12%"
        icon={TrendingUp}
        color="green"
        isMobile={isMobile}
      />
      <MetricCard
        title="Rotación de Inventario"
        value="↘️ Estable"
        change="+2%"
        icon={Package}
        color="blue"
        isMobile={isMobile}
      />
          </div>
          
    <div className={`bg-white rounded-xl border border-gray-100 ${isMobile ? 'p-4' : 'p-6'}`}>
      <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-base mb-3' : 'text-lg mb-4'}`}>Análisis de Tendencias</h3>
      <div className="space-y-4">
        <div className={`bg-green-50 rounded-lg border border-green-200 ${isMobile ? 'p-3' : 'p-4'}`}>
          <h4 className={`font-semibold text-green-800 ${isMobile ? 'text-sm' : ''}`}>Ventas en Crecimiento</h4>
          <p className={`text-green-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>Las ventas han aumentado un 12% en el período seleccionado</p>
        </div>
        <div className={`bg-blue-50 rounded-lg border border-blue-200 ${isMobile ? 'p-3' : 'p-4'}`}>
          <h4 className={`font-semibold text-blue-800 ${isMobile ? 'text-sm' : ''}`}>Inventario Optimizado</h4>
          <p className={`text-blue-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>Los niveles de stock se mantienen estables</p>
        </div>
        <div className={`bg-yellow-50 rounded-lg border border-yellow-200 ${isMobile ? 'p-3' : 'p-4'}`}>
          <h4 className={`font-semibold text-yellow-800 ${isMobile ? 'text-sm' : ''}`}>Oportunidad de Mejora</h4>
          <p className={`text-yellow-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>Se recomienda revisar productos con bajo stock</p>
          </div>
        </div>
      </div>
    </div>
  )
