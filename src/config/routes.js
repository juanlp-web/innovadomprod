export const ROUTES = {
  // Rutas públicas
  LOGIN: '/',
  FORGOT_PASSWORD: '/forgot-password',
  
  // Rutas protegidas del dashboard
  DASHBOARD: '/dashboard',
  RECETAS: '/dashboard/recetas',
  PRODUCTOS: '/dashboard/productos',
  PAQUETES: '/dashboard/paquetes',
  INVENTARIO: '/dashboard/inventario',
  VENTAS: '/dashboard/ventas',
  COMPRAS: '/dashboard/compras',
  CLIENTES: '/dashboard/clientes',
  PROVEEDORES: '/dashboard/proveedores',
  LOTES: '/dashboard/lotes',
  PERFIL: '/dashboard/perfil'
}

export const MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: 'BarChart3',
    description: 'Vista general del negocio'
  },
  {
    id: 'recetas',
    label: 'Recetas',
    path: ROUTES.RECETAS,
    icon: 'FileText',
    description: 'Gestión de formulaciones'
  },
  {
    id: 'productos',
    label: 'Productos',
    path: ROUTES.PRODUCTOS,
    icon: 'Package',
    description: 'Catálogo de productos'
  },
  {
    id: 'inventario',
    label: 'Inventario',
    path: ROUTES.INVENTARIO,
    icon: 'Box',
    description: 'Control de stock'
  },
  {
    id: 'ventas',
    label: 'Ventas',
    path: ROUTES.VENTAS,
    icon: 'DollarSign',
    description: 'Registro de ventas'
  },
  {
    id: 'compras',
    label: 'Compras',
    path: ROUTES.COMPRAS,
    icon: 'ShoppingCart',
    description: 'Gestión de compras'
  },
  {
    id: 'clientes',
    label: 'Clientes',
    path: ROUTES.CLIENTES,
    icon: 'Users',
    description: 'Base de clientes'
  },
  {
    id: 'proveedores',
    label: 'Proveedores',
    path: ROUTES.PROVEEDORES,
    icon: 'Factory',
    description: 'Gestión de proveedores'
  },
  {
    id: 'lotes',
    label: 'Lotes',
    path: ROUTES.LOTES,
    icon: 'Package2',
    description: 'Gestión de lotes de producción'
  },
  {
    id: 'perfil',
    label: 'Perfil',
    path: ROUTES.PERFIL,
    icon: 'User',
    description: 'Configuración personal'
  }
]

export const getRouteByTab = (tab) => {
  const menuItem = MENU_ITEMS.find(item => item.id === tab)
  return menuItem ? menuItem.path : ROUTES.DASHBOARD
}

export const getTabByRoute = (path) => {
  const menuItem = MENU_ITEMS.find(item => path.includes(item.id))
  return menuItem ? menuItem.id : 'dashboard'
}


