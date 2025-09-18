import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { TenantSelector } from '@/components/TenantSelector'
import { useMobile } from '@/hooks/useMobile'
import {
  BarChart3,
  FileText,
  Package,
  Package2,
  Box,
  DollarSign,
  ShoppingCart,
  Users,
  Factory,
  User,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileBarChart,
  ChevronDown,
  ChevronUp,
  Layers,
  Settings,
  X,
  Menu
} from 'lucide-react'

export function Sidebar({ onCollapseChange, isCollapsed }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [expandedMenus, setExpandedMenus] = useState({})
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isMobile, isTablet } = useMobile()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, description: 'Vista general del negocio', path: '/dashboard' },
    { id: 'recetas', label: 'Recetas', icon: BookOpen, description: 'Gestión de recetas de producción', path: '/recetas' },
    { id: 'ventas', label: 'Ventas', icon: DollarSign, description: 'Registro de ventas', path: '/ventas' },
    { id: 'compras', label: 'Compras', icon: ShoppingCart, description: 'Gestión de compras', path: '/compras' },
    { 
      id: 'productos', 
      label: 'Productos', 
      icon: Package, 
      description: 'Catálogo de productos', 
      path: '/productos',
      hasSubmenu: true,
      submenu: [
        { id: 'productos-list', label: 'Lista de Productos', path: '/productos' },
        { id: 'paquetes', label: 'Paquetes', path: '/paquetes' },
        { id: 'lotes', label: 'Lotes', path: '/lotes' }
      ]
    },
    { id: 'clientes', label: 'Clientes', icon: Users, description: 'Base de clientes', path: '/clientes' },
    { id: 'proveedores', label: 'Proveedores', icon: Factory, description: 'Gestión de proveedores', path: '/proveedores' },
    { id: 'reporteria', label: 'Reportería', icon: FileBarChart, description: 'Informes y reportes del sistema', path: '/reporteria' },
    { id: 'configuracion', label: 'Configuración', icon: Settings, description: 'Configuración del sistema', path: '/configuracion' },
    { id: 'perfil', label: 'Perfil', icon: User, description: 'Configuración personal', path: '/perfil' }
  ]

  const handleCollapse = () => {
    if (onCollapseChange) {
      onCollapseChange(!isCollapsed)
    }
  }

  const handleMenuClick = (item) => {
    if (item.hasSubmenu) {
      setExpandedMenus(prev => ({
        ...prev,
        [item.id]: !prev[item.id]
      }))
    } else {
      navigate(item.path)
      // Cerrar menú móvil después de navegar
      if (isMobile) {
        setIsMobileMenuOpen(false)
      }
    }
  }

  const handleSubmenuClick = (submenuItem) => {
    navigate(submenuItem.path)
    // Cerrar menú móvil después de navegar
    if (isMobile) {
      setIsMobileMenuOpen(false)
    }
  }

  // Determinar la pestaña activa basada en la ruta actual
  const getActiveTab = () => {
    const currentPath = location.pathname
    
    // Buscar en elementos principales
    const menuItem = menuItems.find(item => item.path === currentPath)
    if (menuItem) return menuItem.id
    
    // Buscar en submenús
    for (const item of menuItems) {
      if (item.hasSubmenu && item.submenu) {
        const submenuItem = item.submenu.find(sub => sub.path === currentPath)
        if (submenuItem) return submenuItem.id
      }
    }
    
    return 'dashboard'
  }

  const activeTab = getActiveTab()

  // En móvil, mostrar solo el botón hamburger
  if (isMobile) {
    return (
      <>
        {/* Botón hamburger para móvil */}
        <div className="fixed top-4 left-4 z-50 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-3 bg-white shadow-lg border border-gray-200 rounded-xl hover:bg-gray-50"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </Button>
        </div>

        {/* Overlay para móvil */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar móvil */}
        <div className={`fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Header móvil */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src="/ProductOneXIco.png"
                  alt="ProductOneX"
                  className="w-12 h-12 rounded-xl object-contain bg-white p-1 shadow-medium border border-gray-200"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">ProductOneX</h1>
                  <p className="text-xs text-gray-500">Sistema de Gestión</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </Button>
            </div>
          </div>

          {/* Tenant Selector móvil */}
          <div className="px-6 py-4 border-b border-gray-100">
            <TenantSelector />
          </div>

          {/* Menu Items móvil */}
          <nav className="mt-6 flex-1 overflow-y-auto px-3 pb-6">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                const isExpanded = expandedMenus[item.id];
                const hasActiveSubmenu = item.hasSubmenu && item.submenu && 
                  item.submenu.some(sub => activeTab === sub.id);

                return (
                  <div key={item.id} className="relative">
                    <button
                      onClick={() => handleMenuClick(item)}
                      className={`w-full sidebar-item ${
                        isActive || hasActiveSubmenu ? 'active' : ''
                      } group`}
                    >
                      <IconComponent className="w-5 h-5 mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                      <div className="flex-1 text-left">
                        <span className="font-medium">{item.label}</span>
                        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                      </div>
                      {item.hasSubmenu && (
                        <div className="ml-2">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      )}
                    </button>

                    {/* Active indicator */}
                    {(isActive || hasActiveSubmenu) && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-l-full"></div>
                    )}

                    {/* Submenu */}
                    {item.hasSubmenu && isExpanded && item.submenu && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.submenu.map((submenuItem) => {
                          const isSubmenuActive = activeTab === submenuItem.id;
                          return (
                            <button
                              key={submenuItem.id}
                              onClick={() => handleSubmenuClick(submenuItem)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                isSubmenuActive
                                  ? 'bg-blue-50 text-blue-700 font-medium'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              {submenuItem.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        </div>
      </>
    )
  }

  // Sidebar desktop/tablet
  return (
    <div className={`bg-white shadow-soft transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-72'
    } min-h-screen fixed left-0 top-0 z-40 border-r border-gray-100 hidden lg:block`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <img
                src="/ProductOneXIco.png"
                alt="ProductOneX"
                className="w-12 h-12 rounded-xl object-contain bg-white p-1 shadow-medium border border-gray-200"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">ProductOneX</h1>
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

      {/* Tenant Selector */}
      {!isCollapsed && (
        <div className="px-6 py-4 border-b border-gray-100">
          <TenantSelector />
        </div>
      )}

      {/* Menu Items */}
      <nav className="mt-6 flex-1 overflow-y-auto px-3">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            const isExpanded = expandedMenus[item.id];
            const hasActiveSubmenu = item.hasSubmenu && item.submenu && 
              item.submenu.some(sub => activeTab === sub.id);

            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => handleMenuClick(item)}
                  className={`w-full sidebar-item ${
                    isActive || hasActiveSubmenu ? 'active' : ''
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
                  {!isCollapsed && item.hasSubmenu && (
                    <div className="ml-2">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  )}
                </button>

                {/* Active indicator */}
                {(isActive || hasActiveSubmenu) && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-l-full"></div>
                )}

                {/* Submenu */}
                {!isCollapsed && item.hasSubmenu && isExpanded && item.submenu && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.submenu.map((submenuItem) => {
                      const isSubmenuActive = activeTab === submenuItem.id;
                      return (
                        <button
                          key={submenuItem.id}
                          onClick={() => handleSubmenuClick(submenuItem)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            isSubmenuActive
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          {submenuItem.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  )
}
