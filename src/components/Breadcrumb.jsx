import { useLocation, Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export function Breadcrumb() {
  const location = useLocation()
  
  const getBreadcrumbItems = () => {
    const pathnames = location.pathname.split('/').filter(x => x)
    
    if (pathnames.length === 0) return []
    
    const breadcrumbItems = []
    
    // Agregar Dashboard como primer elemento
    if (pathnames[0] === 'dashboard') {
      breadcrumbItems.push({
        name: 'Dashboard',
        path: '/dashboard',
        isActive: pathnames.length === 1
      })
    } else if (pathnames[0] !== 'login') {
      // Si no es dashboard ni login, agregar la página actual
      const currentPage = pathnames[0]
      const pageNames = {
        'recetas': 'Recetas',
        'productos': 'Productos',
        'inventario': 'Inventario',
        'ventas': 'Ventas',
        'compras': 'Compras',
        'clientes': 'Clientes',
        'proveedores': 'Proveedores',
        'perfil': 'Perfil'
      }
      
      breadcrumbItems.push({
        name: pageNames[currentPage] || currentPage,
        path: `/${currentPage}`,
        isActive: true
      })
    }
    
    return breadcrumbItems
  }
  
  const breadcrumbItems = getBreadcrumbItems()
  
  if (breadcrumbItems.length === 0) return null
  
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
      <Link 
        to="/dashboard" 
        className="flex items-center space-x-1 hover:text-gray-700 transition-colors duration-200"
      >
        <Home className="w-4 h-4" />
        <span>Inicio</span>
      </Link>
      
      {breadcrumbItems.map((item, index) => (
        <div key={item.path} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {item.isActive ? (
            <span className="text-gray-900 font-medium">{item.name}</span>
          ) : (
            <Link 
              to={item.path}
              className="hover:text-gray-700 transition-colors duration-200"
            >
              {item.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}


