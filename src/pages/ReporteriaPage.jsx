import { useState, useEffect } from 'react'
import { 
  BarChart3, TrendingUp, Download, Calendar, RefreshCw, Eye,
  DollarSign, Package, Users, ShoppingCart, Factory, Package2, BookOpen,
  PieChart, Activity, Target, Filter, Settings, Share2, Calculator,
  FileText, Scale, Receipt, BookOpenCheck
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/button'
import { useMobile } from '@/hooks/useMobile'
import { useDashboard } from '@/hooks/useDashboard'
import { useProducts } from '@/hooks/useProducts'
import { useSales } from '@/hooks/useSales'
import { usePurchases } from '@/hooks/usePurchases'
import { useClients } from '@/hooks/useClients'
import { useSuppliers } from '@/hooks/useSuppliers'
import { useBanks } from '@/hooks/useBanks'
import { useBankTransactions } from '@/hooks/useBankTransactions'
import { ReportChart } from '@/components/ReportChart'

// Configuración de tabs de reportes
const REPORT_TABS = [
  {
    id: 'accounting',
    label: 'Contabilidad',
    icon: Calculator,
    color: 'emerald',
    description: 'Reportes contables y financieros'
  },
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
    id: 'purchases',
    label: 'Compras',
    icon: ShoppingCart,
    color: 'orange',
    description: 'Análisis detallado de compras y gastos'
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
    id: 'banks',
    label: 'Bancos',
    icon: Receipt,
    color: 'cyan',
    description: 'Análisis de cuentas bancarias y saldos'
  },
]

const TIME_PERIODS = [
  { value: '7d', label: 'Últimos 7 días', days: 7 },
  { value: '30d', label: 'Últimos 30 días', days: 30 },
  { value: '90d', label: 'Últimos 90 días', days: 90 },
  { value: '1y', label: 'Último año', days: 365 },
  { value: 'custom', label: 'Personalizado', days: null }
]

// Funciones auxiliares para generar datos contables
const generateIncomeStatement = (sales, purchases) => {
  const totalRevenue = sales?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0
  const totalCostOfGoodsSold = purchases?.reduce((sum, purchase) => sum + (purchase.total || 0), 0) || 0
  const grossProfit = totalRevenue - totalCostOfGoodsSold
  const operatingExpenses = totalCostOfGoodsSold * 0.1 // 10% de los costos como gastos operativos
  const netIncome = grossProfit - operatingExpenses

  return {
    revenue: totalRevenue,
    costOfGoodsSold: totalCostOfGoodsSold,
    grossProfit,
    operatingExpenses,
    netIncome
  }
}

const generateBalanceSheet = (products, sales, purchases, banks) => {
  const totalInventory = products?.reduce((sum, product) => sum + ((product.stock || 0) * (product.price || 0)), 0) || 0
  const totalSales = sales?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0
  const totalPurchases = purchases?.reduce((sum, purchase) => sum + (purchase.total || 0), 0) || 0
  
  // Calcular saldos por tipo de cuenta
  const bankAccounts = banks?.filter(bank => bank.type === 'banco') || []
  const cashAccounts = banks?.filter(bank => bank.type === 'efectivo') || []
  const cardAccounts = banks?.filter(bank => bank.type === 'tarjeta') || []
  
  const totalBankBalance = bankAccounts.reduce((sum, bank) => sum + (bank.currentBalance || 0), 0)
  const totalCashBalance = cashAccounts.reduce((sum, bank) => sum + (bank.currentBalance || 0), 0)
  const totalCardBalance = cardAccounts.reduce((sum, bank) => sum + (bank.currentBalance || 0), 0)
  const totalAllBalances = totalBankBalance + totalCashBalance + totalCardBalance
  
  // Calcular cuentas por cobrar y pagar basándose en datos reales
  const accountsReceivable = sales?.reduce((sum, sale) => sum + (sale.remainingAmount || 0), 0) || 0
  const accountsPayable = purchases?.reduce((sum, purchase) => sum + (purchase.remainingAmount || 0), 0) || 0

  return {
    assets: {
      cash: totalCashBalance, // Solo efectivo real
      bankAccounts: totalBankBalance, // Solo cuentas bancarias
      cardAccounts: totalCardBalance, // Solo tarjetas
      accountsReceivable,
      inventory: totalInventory,
      totalAssets: totalAllBalances + accountsReceivable + totalInventory
    },
    liabilities: {
      accountsPayable,
      totalLiabilities: accountsPayable
    },
    equity: {
      retainedEarnings: totalSales - totalPurchases,
      totalEquity: totalSales - totalPurchases
    }
  }
}

const generateGeneralLedger = (sales, purchases) => {
  const ledger = []
  
  // Agregar entradas de ventas
  sales?.forEach((sale, index) => {
    ledger.push({
      date: sale.createdAt || new Date().toISOString(),
      account: 'Ventas',
      description: `Venta #${index + 1}`,
      debit: 0,
      credit: sale.total || 0
    })
    ledger.push({
      date: sale.createdAt || new Date().toISOString(),
      account: 'Caja',
      description: `Venta #${index + 1}`,
      debit: sale.total || 0,
      credit: 0
    })
  })

  // Agregar entradas de compras
  purchases?.forEach((purchase, index) => {
    ledger.push({
      date: purchase.createdAt || new Date().toISOString(),
      account: 'Inventario',
      description: `Compra #${index + 1}`,
      debit: purchase.total || 0,
      credit: 0
    })
    ledger.push({
      date: purchase.createdAt || new Date().toISOString(),
      account: 'Caja',
      description: `Compra #${index + 1}`,
      debit: 0,
      credit: purchase.total || 0
    })
  })

  return ledger.sort((a, b) => new Date(a.date) - new Date(b.date))
}

const generateTrialBalance = (sales, purchases) => {
  const accounts = {}
  
  // Procesar ventas
  sales?.forEach(sale => {
    if (!accounts['Ventas']) accounts['Ventas'] = { debit: 0, credit: 0 }
    accounts['Ventas'].credit += sale.total || 0
    
    if (!accounts['Caja']) accounts['Caja'] = { debit: 0, credit: 0 }
    accounts['Caja'].debit += sale.total || 0
  })

  // Procesar compras
  purchases?.forEach(purchase => {
    if (!accounts['Inventario']) accounts['Inventario'] = { debit: 0, credit: 0 }
    accounts['Inventario'].debit += purchase.total || 0
    
    if (!accounts['Caja']) accounts['Caja'] = { debit: 0, credit: 0 }
    accounts['Caja'].credit += purchase.total || 0
  })

  return Object.entries(accounts).map(([account, balances]) => ({
    account,
    debit: balances.debit,
    credit: balances.credit,
    balance: balances.debit - balances.credit
  }))
}

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
  const [activeTab, setActiveTab] = useState('accounting')
  const [timePeriod, setTimePeriod] = useState('30d')
  const [isExporting, setIsExporting] = useState(false)
  const [viewMode, setViewMode] = useState('visual') // 'visual' | 'table' | 'raw'
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Hooks para datos
  const { stats: dashboardStats } = useDashboard()
  const { products } = useProducts()
  const { sales } = useSales()
  const { purchases } = usePurchases()
  const { clients } = useClients()
  const { suppliers } = useSuppliers()
  const { banks, summary: banksSummary } = useBanks()
  const { transactions: bankTransactions, stats: transactionStats } = useBankTransactions()

  // Estado de carga
  const isLoading = !dashboardStats && !products && !sales && !purchases && !clients && !suppliers

  // Cerrar menú de exportar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportMenu && !event.target.closest('.relative')) {
        setShowExportMenu(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportMenu])

  // Función para convertir datos a CSV
  const convertToCSV = (data, columns) => {
    if (!data || data.length === 0) return ''
    
    // Crear encabezados
    const headers = columns.map(col => col.header).join(',')
    
    // Crear filas de datos
    const rows = data.map(item => 
      columns.map(col => {
        const value = col.accessor(item, data.indexOf(item))
        // Escapar comillas y envolver en comillas si contiene comas
        const stringValue = String(value || '')
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }).join(',')
    )
    
    return [headers, ...rows].join('\n')
  }

  // Función para convertir datos a Excel
  const convertToExcel = (data, columns, sheetName) => {
    if (!data || data.length === 0) return null
    
    // Crear encabezados
    const headers = columns.map(col => col.header)
    
    // Crear filas de datos
    const rows = data.map(item => 
      columns.map(col => col.accessor(item, data.indexOf(item)))
    )
    
    // Crear hoja de trabajo
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    
    // Crear libro de trabajo
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    
    return wb
  }

  // Función para exportar reportes
  const handleExport = async (format = 'excel') => {
    setIsExporting(true)
    try {
      const fileName = `reporte-${activeTab}-${timePeriod}-${new Date().toISOString().split('T')[0]}`
      
      // Obtener columnas según el tab activo
      let columns = []
      let data = []
      let sheetName = ''
      
      switch (activeTab) {
        case 'sales':
          columns = [
            { header: '#', accessor: (item, index) => index + 1 },
            { header: 'ID', accessor: (item) => item._id?.slice(-6) || 'N/A' },
            { header: 'Cliente', accessor: (item) => item.client?.name || 'N/A' },
            { header: 'Total', accessor: (item) => `$${(item.total || 0).toFixed(2)}` },
            { header: 'Fecha', accessor: (item) => item.saleDate ? new Date(item.saleDate).toLocaleDateString() : 'N/A' },
            { header: 'Estado', accessor: (item) => item.paymentStatus || 'Completada' }
          ]
          data = sales || []
          sheetName = 'Ventas'
          break
        case 'purchases':
          columns = [
            { header: '#', accessor: (item, index) => index + 1 },
            { header: 'ID', accessor: (item) => item._id?.slice(-6) || 'N/A' },
            { header: 'Proveedor', accessor: (item) => item.supplierName || 'N/A' },
            { header: 'Total', accessor: (item) => `$${(item.total || 0).toFixed(2)}` },
            { header: 'Fecha', accessor: (item) => item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A' },
            { header: 'Estado', accessor: (item) => item.status || 'Pendiente' }
          ]
          data = purchases || []
          sheetName = 'Compras'
          break
        case 'inventory':
          columns = [
            { header: '#', accessor: (item, index) => index + 1 },
            { header: 'Nombre', accessor: (item) => item.name || 'N/A' },
            { header: 'SKU', accessor: (item) => item.sku || 'N/A' },
            { header: 'Stock', accessor: (item) => item.stock || 0 },
            { header: 'Precio', accessor: (item) => `$${(item.price || 0).toFixed(2)}` },
            { header: 'Categoría', accessor: (item) => item.category || 'N/A' },
            { header: 'Estado', accessor: (item) => item.isActive ? 'Activo' : 'Inactivo' }
          ]
          data = products || []
          sheetName = 'Inventario'
          break
        case 'customers':
          columns = [
            { header: '#', accessor: (item, index) => index + 1 },
            { header: 'Nombre', accessor: (item) => item.name || 'N/A' },
            { header: 'Email', accessor: (item) => item.email || 'N/A' },
            { header: 'Teléfono', accessor: (item) => item.phone || 'N/A' },
            { header: 'Dirección', accessor: (item) => {
              const street = item.address?.street || ''
              const city = item.address?.city || ''
              if (street && city) {
                return `${street}, ${city}`
              } else if (street) {
                return street
              } else if (city) {
                return city
              }
              return 'N/A'
            }},
            { header: 'Estado', accessor: (item) => item.isActive ? 'Activo' : 'Inactivo' }
          ]
          data = clients || []
          sheetName = 'Clientes'
          break
        case 'suppliers':
          columns = [
            { header: '#', accessor: (item, index) => index + 1 },
            { header: 'Nombre', accessor: (item) => item.name || 'N/A' },
            { header: 'Categoría', accessor: (item) => item.category || 'N/A' },
            { header: 'Contacto', accessor: (item) => item.contactName || 'N/A' },
            { header: 'Teléfono', accessor: (item) => item.contactPhone || 'N/A' },
            { header: 'Dirección', accessor: (item) => item.address || 'N/A' },
            { header: 'Estado', accessor: (item) => item.isActive ? 'Activo' : 'Inactivo' }
          ]
          data = suppliers || []
          sheetName = 'Proveedores'
          break
        case 'banks':
          columns = [
            { header: '#', accessor: (item, index) => index + 1 },
            { header: 'Nombre', accessor: (item) => item.name || 'N/A' },
            { header: 'Tipo', accessor: (item) => item.type || 'N/A' },
            { header: 'Saldo', accessor: (item) => `$${(item.currentBalance || 0).toFixed(2)}` },
            { header: 'Moneda', accessor: (item) => item.currency || 'USD' },
            { header: 'Estado', accessor: (item) => item.isActive ? 'Activo' : 'Inactivo' }
          ]
          data = banks || []
          sheetName = 'Bancos'
          break
        default:
          // Para otros tabs, exportar datos JSON
          const reportData = generateReportData(activeTab)
          const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${fileName}.json`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          return
      }
      
      if (format === 'csv') {
        const csvContent = convertToCSV(data, columns)
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${fileName}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        const wb = convertToExcel(data, columns, sheetName)
        if (wb) {
          XLSX.writeFile(wb, `${fileName}.xlsx`)
        }
      }
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
      case 'purchases':
        return {
          ...baseData,
          purchases: purchases || [],
          metrics: {
            total: purchases?.length || 0,
            totalAmount: purchases?.reduce((sum, purchase) => sum + (purchase.total || 0), 0) || 0
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
      case 'accounting':
        return {
          ...baseData,
          accounting: {
            incomeStatement: generateIncomeStatement(sales, purchases),
            balanceSheet: generateBalanceSheet(products, sales, purchases),
            generalLedger: generateGeneralLedger(sales, purchases),
            trialBalance: generateTrialBalance(sales, purchases)
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
          return { dashboardStats, banksSummary }
        case 'sales':
          return { sales }
        case 'purchases':
          return { purchases }
        case 'inventory':
          return { products }
        case 'customers':
          return { clients }
        case 'suppliers':
          return { suppliers }
        case 'banks':
          return { banks, banksSummary }
        case 'accounting':
          return { sales, purchases, products, banks, bankTransactions }
        default:
          return {}
      }
    }

    const tabData = getTabData()

    // Determinar el modo de vista por defecto para ciertos tabs
    const getDefaultViewMode = (tab) => {
      const tableTabs = ['sales', 'purchases', 'inventory', 'customers', 'suppliers']
      return tableTabs.includes(tab) ? 'table' : 'visual'
    }

    // Usar el modo de vista por defecto para tabs específicos, o el modo seleccionado por el usuario
    const currentViewMode = getDefaultViewMode(activeTab) === 'table' ? 'table' : viewMode

    // Renderizar según el modo de vista
    if (currentViewMode === 'table') {
      return renderTableView(activeTab, tabData)
    }

    // Vista visual (por defecto)
    switch (activeTab) {
      case 'overview':
        return <OverviewContent dashboardStats={dashboardStats} banksSummary={banksSummary} banks={banks} isMobile={isMobile} />
      case 'sales':
        return <SalesContent sales={sales} isMobile={isMobile} />
      case 'purchases':
        return <PurchasesContent purchases={purchases} isMobile={isMobile} />
      case 'inventory':
        return <InventoryContent products={products} isMobile={isMobile} />
      case 'customers':
        return <CustomersContent clients={clients} isMobile={isMobile} />
      case 'suppliers':
        return <SuppliersContent suppliers={suppliers} isMobile={isMobile} />
      case 'banks':
        return <BanksContent banks={banks} banksSummary={banksSummary} isMobile={isMobile} />
      case 'accounting':
        return <AccountingContent sales={sales} purchases={purchases} products={products} banks={banks} bankTransactions={bankTransactions} isMobile={isMobile} />
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
          { header: 'Cliente', accessor: (item) => item.client?.name || 'N/A' },
          { header: 'Total', accessor: (item) => `$${(item.total || 0).toFixed(2)}` },
          { header: 'Fecha', accessor: (item) => item.saleDate ? new Date(item.saleDate).toLocaleDateString() : 'N/A' },
          { header: 'Estado', accessor: (item) => item.paymentStatus || 'Completada' }
        ])

      case 'purchases':
        return renderTable('Compras', data.purchases, [
          { header: '#', accessor: (item, index) => index + 1 },
          { header: 'ID', accessor: (item) => item._id?.slice(-6) || 'N/A' },
          { header: 'Proveedor', accessor: (item) => item.supplierName || 'N/A' },
          { header: 'Total', accessor: (item) => `$${(item.total || 0).toFixed(2)}` },
          { header: 'Fecha', accessor: (item) => item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A' },
          { header: 'Estado', accessor: (item) => item.status || 'Pendiente' }
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
          { header: 'Dirección', accessor: (item) => {
            const street = item.address?.street || '';
            const city = item.address?.city || '';
            if (street && city) {
              return `${street}, ${city}`;
            } else if (street) {
              return street;
            } else if (city) {
              return city;
            }
            return 'N/A';
          }},
          { header: 'Estado', accessor: (item) => item.isActive ? 'Activo' : 'Inactivo' }
        ])

      case 'suppliers':
        return renderTable('Proveedores', data.suppliers, [
          { header: '#', accessor: (item, index) => index + 1 },
          { header: 'Nombre', accessor: (item) => item.name || 'N/A' },
          { header: 'Categoría', accessor: (item) => item.category || 'N/A' },
          { header: 'Contacto', accessor: (item) => item.contactName || 'N/A' },
          { header: 'Teléfono', accessor: (item) => item.contactPhone || 'N/A' },
          { header: 'Dirección', accessor: (item) => item.address || 'N/A' },
          { header: 'Estado', accessor: (item) => item.isActive ? 'Activo' : 'Inactivo' }
        ])

      case 'banks':
        return renderTable('Cuentas Bancarias', data.banks, [
          { header: '#', accessor: (item, index) => index + 1 },
          { header: 'Nombre', accessor: (item) => item.name || 'N/A' },
          { header: 'Número de Cuenta', accessor: (item) => item.accountNumber || 'N/A' },
          { header: 'Tipo', accessor: (item) => item.accountType || 'N/A' },
          { header: 'Saldo', accessor: (item) => `$${(item.currentBalance || 0).toFixed(2)}` },
          { header: 'Moneda', accessor: (item) => item.currency || 'USD' },
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

      case 'accounting':
        const accountingData = [
          { report: 'Estado de Resultados', status: 'Disponible', lastUpdate: 'Hoy' },
          { report: 'Estado de Situación Financiera', status: 'Disponible', lastUpdate: 'Hoy' },
          { report: 'Libro Diario', status: 'Disponible', lastUpdate: 'Hoy' },
          { report: 'Balanza de Comprobación', status: 'Disponible', lastUpdate: 'Hoy' }
        ]
        return renderTable('Reportes Contables', accountingData, [
          { header: 'Reporte', accessor: (item) => item.report },
          { header: 'Estado', accessor: (item) => item.status },
          { header: 'Última Actualización', accessor: (item) => item.lastUpdate }
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
        <div className="relative">
          <Button
            onClick={() => setShowExportMenu(!showExportMenu)}
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
          
          {showExportMenu && !isExporting && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <div className="py-1">
                <button
                  onClick={() => {
                    handleExport('excel')
                    setShowExportMenu(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Exportar a Excel (.xlsx)
                </button>
                <button
                  onClick={() => {
                    handleExport('csv')
                    setShowExportMenu(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Exportar a CSV (.csv)
                </button>
              </div>
            </div>
          )}
        </div>
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
const OverviewContent = ({ dashboardStats, banksSummary, banks, isMobile }) => (
  <div className={`space-y-8 ${isMobile ? 'space-y-6' : ''}`}>
    <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
      <MetricCard
        title="Total Ventas"
        value={dashboardStats?.sales?.total || 0}
        change="+12%"
        icon={DollarSign}
        color="green"
        isMobile={isMobile}
      />
      <MetricCard
        title="Total Compras"
        value={dashboardStats?.purchases?.total || 0}
        change="+8%"
        icon={ShoppingCart}
        color="orange"
        isMobile={isMobile}
      />
      <MetricCard
        title="Productos"
        value={dashboardStats?.products?.total || 0}
        change="+5%"
        icon={Package}
        color="purple"
        isMobile={isMobile}
      />
      <MetricCard
        title="Clientes"
        value={dashboardStats?.clients?.total || 0}
        change="+15%"
        icon={Users}
        color="blue"
        isMobile={isMobile}
      />
      {banks && banks.length > 0 ? (
        <>
          <MetricCard
            title="Saldo Total"
            value={`$${(banksSummary?.totalBalance || 0).toFixed(2)}`}
            change="+8%"
            icon={Receipt}
            color="cyan"
            isMobile={isMobile}
          />
          <MetricCard
            title="Cuentas Activas"
            value={banksSummary?.activeAccounts || 0}
            change="+3%"
            icon={BookOpenCheck}
            color="teal"
            isMobile={isMobile}
          />
        </>
      ) : (
        <MetricCard
          title="Sin Cuentas Bancarias"
          value="0"
          change=""
          icon={Receipt}
          color="gray"
          isMobile={isMobile}
        />
      )}
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

const PurchasesContent = ({ purchases, isMobile }) => (
  <div className={`space-y-8 ${isMobile ? 'space-y-6' : ''}`}>
    <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
      <MetricCard
        title="Compras Totales"
        value={purchases?.length || 0}
        change="+8%"
        icon={ShoppingCart}
        color="orange"
        isMobile={isMobile}
      />
      <MetricCard
        title="Gastos Totales"
        value={`$${purchases?.reduce((sum, purchase) => sum + (purchase.total || 0), 0).toFixed(2) || '0.00'}`}
        change="+15%"
        icon={DollarSign}
        color="red"
        isMobile={isMobile}
      />
      <MetricCard
        title="Promedio por Compra"
        value={`$${purchases?.length ? (purchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0) / purchases.length).toFixed(2) : '0.00'}`}
        change="+3%"
        icon={TrendingUp}
        color="purple"
        isMobile={isMobile}
      />
    </div>

    {purchases?.length > 0 && (
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-base mb-4' : 'text-lg mb-6'}`}>
          Distribución de Compras por Estado
        </h3>
        <ReportChart
          data={[
            { name: 'Pendientes', value: purchases.filter(p => p.status === 'pendiente').length, color: '#F59E0B' },
            { name: 'Recibidas', value: purchases.filter(p => p.status === 'recibida').length, color: '#10B981' },
            { name: 'Canceladas', value: purchases.filter(p => p.status === 'cancelada').length, color: '#EF4444' }
          ]}
          type="pie"
          height={300}
        />
      </div>
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

const BanksContent = ({ banks, banksSummary, isMobile }) => {
  // Si no hay cuentas bancarias, mostrar mensaje informativo
  if (!banks || banks.length === 0) {
    return (
      <div className={`space-y-8 ${isMobile ? 'space-y-6' : ''}`}>
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'} mb-2`}>
            No hay cuentas bancarias registradas
          </h3>
          <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'} mb-6`}>
            Para ver reportes bancarios, primero necesitas crear al menos una cuenta bancaria.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className={`text-blue-800 ${isMobile ? 'text-sm' : 'text-base'}`}>
              💡 <strong>Tip:</strong> Ve a la sección de Bancos para crear tu primera cuenta bancaria.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${isMobile ? 'space-y-6' : ''}`}>
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
        <MetricCard
          title="Total Cuentas"
          value={banks.length}
          change="+5%"
          icon={Receipt}
          color="cyan"
          isMobile={isMobile}
        />
        <MetricCard
          title="Saldo Total"
          value={`$${(banksSummary?.totalBalance || 0).toFixed(2)}`}
          change="+8%"
          icon={DollarSign}
          color="green"
          isMobile={isMobile}
        />
        <MetricCard
          title="Cuentas Activas"
          value={banksSummary?.activeAccounts || 0}
          change="+3%"
          icon={Activity}
          color="teal"
          isMobile={isMobile}
        />
      </div>

      <ReportChart
        title="Distribución de Saldos por Cuenta"
        data={banks.map((bank, index) => ({
          label: bank.name || `Cuenta ${index + 1}`,
          value: bank.currentBalance || 0
        }))}
        type="pie"
        height={300}
      />

      <div className={`bg-white rounded-xl border border-gray-100 ${isMobile ? 'p-4' : 'p-6'}`}>
        <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-base mb-3' : 'text-lg mb-4'}`}>Resumen de Cuentas</h3>
        <div className="space-y-4">
          {banks.map((bank, index) => (
            <div key={bank._id || index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
              <div>
                <span className={`font-medium text-gray-900 ${isMobile ? 'text-sm' : ''}`}>{bank.name || 'Cuenta sin nombre'}</span>
                <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>{bank.accountNumber || 'Sin número'}</p>
              </div>
              <div className="text-right">
                <span className={`font-semibold ${isMobile ? 'text-sm' : ''}`}>${(bank.currentBalance || 0).toFixed(2)}</span>
                <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>{bank.currency || 'USD'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const TransactionsContent = ({ bankTransactions, transactionStats, isMobile }) => {
  // Si no hay transacciones bancarias, mostrar mensaje informativo
  if (!bankTransactions || bankTransactions.length === 0) {
    return (
      <div className={`space-y-8 ${isMobile ? 'space-y-6' : ''}`}>
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpenCheck className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'} mb-2`}>
            No hay transacciones bancarias registradas
          </h3>
          <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'} mb-6`}>
            Para ver reportes de transacciones, primero necesitas crear cuentas bancarias y realizar transacciones.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className={`text-blue-800 ${isMobile ? 'text-sm' : 'text-base'}`}>
              💡 <strong>Tip:</strong> Ve a la sección de Bancos para crear cuentas y realizar transacciones.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${isMobile ? 'space-y-6' : ''}`}>
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
        <MetricCard
          title="Total Transacciones"
          value={bankTransactions.length}
          change="+12%"
          icon={BookOpenCheck}
          color="teal"
          isMobile={isMobile}
        />
        <MetricCard
          title="Ingresos Totales"
          value={`$${transactionStats?.totalIncome || 0}`}
          change="+18%"
          icon={TrendingUp}
          color="green"
          isMobile={isMobile}
        />
        <MetricCard
          title="Egresos Totales"
          value={`$${transactionStats?.totalExpenses || 0}`}
          change="+5%"
          icon={TrendingUp}
          color="red"
          trend="down"
          isMobile={isMobile}
        />
      </div>

      <ReportChart
        title="Evolución de Transacciones"
        data={bankTransactions.slice(0, 10).map((transaction, index) => ({
          label: `T${index + 1}`,
          value: transaction.amount || 0
        }))}
        type="line"
        height={300}
      />

      <div className={`bg-white rounded-xl border border-gray-100 ${isMobile ? 'p-4' : 'p-6'}`}>
        <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-base mb-3' : 'text-lg mb-4'}`}>Últimas Transacciones</h3>
        <div className="space-y-3">
          {bankTransactions.slice(0, 5).map((transaction, index) => (
            <div key={transaction._id || index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
              <div>
                <span className={`font-medium text-gray-900 ${isMobile ? 'text-sm' : ''}`}>{transaction.description || 'Sin descripción'}</span>
                <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {transaction.date ? new Date(transaction.date).toLocaleDateString() : 'Sin fecha'}
                </p>
              </div>
              <div className="text-right">
                <span className={`font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'} ${isMobile ? 'text-sm' : ''}`}>
                  ${Math.abs(transaction.amount || 0).toFixed(2)}
                </span>
                <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>{transaction.type || 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const TrendsContent = ({ sales, products, banks, bankTransactions, isMobile }) => (
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

const AccountingContent = ({ sales, purchases, products, banks, bankTransactions, isMobile }) => {
  const incomeStatement = generateIncomeStatement(sales, purchases)
  const balanceSheet = generateBalanceSheet(products, sales, purchases, banks)
  const generalLedger = generateGeneralLedger(sales, purchases)
  const trialBalance = generateTrialBalance(sales, purchases)

  return (
    <div className={`space-y-8 ${isMobile ? 'space-y-6' : ''}`}>
      {/* Estado de Resultados */}
      <div className={`bg-white rounded-xl border border-gray-100 ${isMobile ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}>Estado de Resultados</h3>
            <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Ingresos, costos y utilidades del período</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className={`text-gray-700 ${isMobile ? 'text-sm' : ''}`}>Ingresos por Ventas</span>
            <span className={`font-semibold text-green-600 ${isMobile ? 'text-sm' : ''}`}>
              ${incomeStatement.revenue.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className={`text-gray-700 ${isMobile ? 'text-sm' : ''}`}>Costo de Ventas</span>
            <span className={`font-semibold text-red-600 ${isMobile ? 'text-sm' : ''}`}>
              ${incomeStatement.costOfGoodsSold.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <span className={`font-semibold text-gray-900 ${isMobile ? 'text-sm' : ''}`}>Utilidad Bruta</span>
            <span className={`font-bold text-blue-600 ${isMobile ? 'text-sm' : ''}`}>
              ${incomeStatement.grossProfit.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className={`text-gray-700 ${isMobile ? 'text-sm' : ''}`}>Gastos Operativos</span>
            <span className={`font-semibold text-red-600 ${isMobile ? 'text-sm' : ''}`}>
              ${incomeStatement.operatingExpenses.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center py-4 bg-gray-50 rounded-lg px-4">
            <span className={`font-bold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}>Utilidad Neta</span>
            <span className={`font-bold text-emerald-600 ${isMobile ? 'text-base' : 'text-lg'}`}>
              ${incomeStatement.netIncome.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Estado de Situación Financiera */}
      <div className={`bg-white rounded-xl border border-gray-100 ${isMobile ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Scale className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}>Estado de Situación Financiera</h3>
            <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Activos, pasivos y patrimonio</p>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Activos */}
          <div>
            <h4 className={`font-semibold text-gray-900 mb-4 ${isMobile ? 'text-sm' : ''}`}>ACTIVOS</h4>
            <div className="space-y-3">
              {balanceSheet.assets.cash > 0 && (
                <div className="flex justify-between items-center">
                  <span className={`text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>Efectivo</span>
                  <span className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    ${balanceSheet.assets.cash.toFixed(2)}
                  </span>
                </div>
              )}
              {balanceSheet.assets.bankAccounts > 0 && (
                <div className="flex justify-between items-center">
                  <span className={`text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>Cuentas Bancarias</span>
                  <span className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    ${balanceSheet.assets.bankAccounts.toFixed(2)}
                  </span>
                </div>
              )}
              {balanceSheet.assets.cardAccounts > 0 && (
                <div className="flex justify-between items-center">
                  <span className={`text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>Tarjetas de Crédito</span>
                  <span className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    ${balanceSheet.assets.cardAccounts.toFixed(2)}
                  </span>
                </div>
              )}
              {balanceSheet.assets.cash === 0 && balanceSheet.assets.bankAccounts === 0 && balanceSheet.assets.cardAccounts === 0 && (
                <div className="flex justify-between items-center py-2 text-gray-500">
                  <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>Sin cuentas financieras registradas</span>
                  <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>$0.00</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className={`text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>Cuentas por Cobrar</span>
                <span className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  ${balanceSheet.assets.accountsReceivable.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>Inventario</span>
                <span className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  ${balanceSheet.assets.inventory.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-gray-200">
                <span className={`font-semibold text-gray-900 ${isMobile ? 'text-sm' : ''}`}>Total Activos</span>
                <span className={`font-bold text-blue-600 ${isMobile ? 'text-sm' : ''}`}>
                  ${balanceSheet.assets.totalAssets.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Pasivos y Patrimonio */}
          <div>
            <h4 className={`font-semibold text-gray-900 mb-4 ${isMobile ? 'text-sm' : ''}`}>PASIVOS Y PATRIMONIO</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>Cuentas por Pagar</span>
                <span className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  ${balanceSheet.liabilities.accountsPayable.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-gray-200">
                <span className={`font-semibold text-gray-900 ${isMobile ? 'text-sm' : ''}`}>Total Pasivos</span>
                <span className={`font-bold text-red-600 ${isMobile ? 'text-sm' : ''}`}>
                  ${balanceSheet.liabilities.totalLiabilities.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>Utilidades Retenidas</span>
                <span className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  ${balanceSheet.equity.retainedEarnings.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-gray-200">
                <span className={`font-semibold text-gray-900 ${isMobile ? 'text-sm' : ''}`}>Total Patrimonio</span>
                <span className={`font-bold text-emerald-600 ${isMobile ? 'text-sm' : ''}`}>
                  ${balanceSheet.equity.totalEquity.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Libro Diario */}
      <div className={`bg-white rounded-xl border border-gray-100 ${isMobile ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}>Libro Diario</h3>
            <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Registro cronológico de transacciones</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className={`text-left font-medium text-gray-500 uppercase tracking-wider ${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-xs'}`}>
                  Fecha
                </th>
                <th className={`text-left font-medium text-gray-500 uppercase tracking-wider ${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-xs'}`}>
                  Cuenta
                </th>
                <th className={`text-left font-medium text-gray-500 uppercase tracking-wider ${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-xs'}`}>
                  Descripción
                </th>
                <th className={`text-right font-medium text-gray-500 uppercase tracking-wider ${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-xs'}`}>
                  Débito
                </th>
                <th className={`text-right font-medium text-gray-500 uppercase tracking-wider ${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-xs'}`}>
                  Crédito
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {generalLedger.slice(0, 10).map((entry, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className={`whitespace-nowrap text-gray-900 ${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-sm'}`}>
                    {new Date(entry.date).toLocaleDateString()}
                  </td>
                  <td className={`whitespace-nowrap text-gray-900 ${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-sm'}`}>
                    {entry.account}
                  </td>
                  <td className={`text-gray-900 ${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-sm'}`}>
                    {entry.description}
                  </td>
                  <td className={`text-right text-gray-900 ${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-sm'}`}>
                    {entry.debit > 0 ? `$${entry.debit.toFixed(2)}` : '-'}
                  </td>
                  <td className={`text-right text-gray-900 ${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-sm'}`}>
                    {entry.credit > 0 ? `$${entry.credit.toFixed(2)}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {generalLedger.length > 10 && (
          <div className={`bg-gray-50 text-gray-500 text-center ${isMobile ? 'px-4 py-2 text-xs' : 'px-6 py-3 text-sm'}`}>
            Mostrando 10 de {generalLedger.length} registros
          </div>
        )}
      </div>

      {/* Balanza de Comprobación */}
      <div className={`bg-white rounded-xl border border-gray-100 ${isMobile ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <BookOpenCheck className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}>Balanza de Comprobación</h3>
            <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Verificación de saldos de cuentas</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className={`text-left font-medium text-gray-500 uppercase tracking-wider ${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-xs'}`}>
                  Cuenta
                </th>
                <th className={`text-right font-medium text-gray-500 uppercase tracking-wider ${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-xs'}`}>
                  Débito
                </th>
                <th className={`text-right font-medium text-gray-500 uppercase tracking-wider ${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-xs'}`}>
                  Crédito
                </th>
                <th className={`text-right font-medium text-gray-500 uppercase tracking-wider ${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-xs'}`}>
                  Saldo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trialBalance.map((account, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className={`whitespace-nowrap text-gray-900 ${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-sm'}`}>
                    {account.account}
                  </td>
                  <td className={`text-right text-gray-900 ${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-sm'}`}>
                    ${account.debit.toFixed(2)}
                  </td>
                  <td className={`text-right text-gray-900 ${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-sm'}`}>
                    ${account.credit.toFixed(2)}
                  </td>
                  <td className={`text-right font-semibold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'} ${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-sm'}`}>
                    ${Math.abs(account.balance).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
