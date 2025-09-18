import { useLocation, Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useMobile } from '@/hooks/useMobile'

export function Breadcrumb() {
  const location = useLocation()
  const { isMobile } = useMobile()
  
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
    <nav className={`flex items-center space-x-2 text-sm text-gray-500 ${isMobile ? 'mb-4 px-2' : 'mb-6'}`}>
      <Link 
        to="/dashboard" 
        className={`flex items-center space-x-1 hover:text-gray-700 transition-colors duration-200 ${isMobile ? 'text-xs' : ''}`}
      >
        <Home className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
        {!isMobile && <span>Inicio</span>}
      </Link>
      
      {breadcrumbItems.map((item, index) => (
        <div key={item.path} className="flex items-center space-x-2">
          <ChevronRight className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400`} />
          {item.isActive ? (
            <span className={`text-gray-900 font-medium ${isMobile ? 'text-xs' : ''}`}>
              {isMobile && item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name}
            </span>
          ) : (
            <Link 
              to={item.path}
              className={`hover:text-gray-700 transition-colors duration-200 ${isMobile ? 'text-xs' : ''}`}
            >
              {isMobile && item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}


