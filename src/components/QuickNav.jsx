import { useNavigation } from '@/hooks/useNavigation'
import { 
  BarChart3, 
  FileText, 
  Package, 
  Box, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Factory, 
  User 
} from 'lucide-react'

export function QuickNav() {
  const { navigateToTab, isActiveTab } = useNavigation()

  const quickNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'bg-blue-500' },
    { id: 'recetas', label: 'Recetas', icon: FileText, color: 'bg-green-500' },
    { id: 'productos', label: 'Productos', icon: Package, color: 'bg-purple-500' },
    { id: 'inventario', label: 'Inventario', icon: Box, color: 'bg-orange-500' },
    { id: 'ventas', label: 'Ventas', icon: DollarSign, color: 'bg-emerald-500' },
    { id: 'compras', label: 'Compras', icon: ShoppingCart, color: 'bg-indigo-500' },
    { id: 'clientes', label: 'Clientes', icon: Users, color: 'bg-pink-500' },
    { id: 'proveedores', label: 'Proveedores', icon: Factory, color: 'bg-cyan-500' },
    { id: 'perfil', label: 'Perfil', icon: User, color: 'bg-gray-500' }
  ]

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Navegación Rápida</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-3">
        {quickNavItems.map((item) => {
          const IconComponent = item.icon
          const isActive = isActiveTab(item.id)
          
          return (
            <button
              key={item.id}
              onClick={() => navigateToTab(item.id)}
              className={`flex flex-col items-center p-4 rounded-xl transition-all duration-200 hover:scale-105 ${
                isActive 
                  ? 'bg-white shadow-medium border-2 border-blue-500' 
                  : 'bg-white hover:shadow-medium'
              }`}
              title={item.label}
            >
              <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-2 shadow-sm`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <span className={`text-xs font-medium text-center ${
                isActive ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}


