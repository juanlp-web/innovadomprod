import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  FileText,
  Package,
  Box,
  DollarSign,
  ShoppingCart,
  Users,
  Factory,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

export function Sidebar({ onLogout, userData, onCollapseChange }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Notificar al componente padre cuando cambie el estado
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed)
    }
  }, [isCollapsed, onCollapseChange])

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, description: 'Vista general del negocio', path: '/dashboard' },
    { id: 'recetas', label: 'Recetas', icon: FileText, description: 'Gestión de formulaciones', path: '/recetas' },
    { id: 'productos', label: 'Productos', icon: Package, description: 'Catálogo de productos', path: '/productos' },
    { id: 'inventario', label: 'Inventario', icon: Box, description: 'Control de stock', path: '/inventario' },
    { id: 'ventas', label: 'Ventas', icon: DollarSign, description: 'Registro de ventas', path: '/ventas' },
    { id: 'compras', label: 'Compras', icon: ShoppingCart, description: 'Gestión de compras', path: '/compras' },
    { id: 'clientes', label: 'Clientes', icon: Users, description: 'Base de clientes', path: '/clientes' },
    { id: 'proveedores', label: 'Proveedores', icon: Factory, description: 'Gestión de proveedores', path: '/proveedores' },
    { id: 'perfil', label: 'Perfil', icon: User, description: 'Configuración personal', path: '/perfil' }
  ]

  const handleCollapse = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
  }

  const handleMenuClick = (item) => {
    navigate(item.path)
  }

  // Determinar la pestaña activa basada en la ruta actual
  const getActiveTab = () => {
    const currentPath = location.pathname
    const menuItem = menuItems.find(item => item.path === currentPath)
    return menuItem ? menuItem.id : 'dashboard'
  }

  const activeTab = getActiveTab()

  return (
    <div className={`bg-white shadow-soft transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-72'
    } min-h-screen fixed left-0 top-0 z-40 border-r border-gray-100`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-medium">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Innovadom</h1>
                <p className="text-xs text-gray-500">Sistema de Gestión</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCollapse}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
            title={isCollapsed ? 'Expandir' : 'Colapsar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </Button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="mt-6 flex-1 overflow-y-auto px-3">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => handleMenuClick(item)}
                  className={`w-full sidebar-item ${
                    isActive ? 'active' : ''
                  } group`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <IconComponent className="w-5 h-5 mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                  {!isCollapsed && (
                    <div className="flex-1 text-left">
                      <span className="font-medium">{item.label}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    </div>
                  )}
                </button>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-l-full"></div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  )
}
