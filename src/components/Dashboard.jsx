import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Breadcrumb } from './Breadcrumb'
import { useNavigation } from '@/hooks/useNavigation'
import { DashboardPage } from '@/pages/DashboardPage'
import { RecetasPage } from '@/pages/RecetasPage'
import { ProductosPage } from '@/pages/ProductosPage'
import { InventarioPage } from '@/pages/InventarioPage'
import { VentasPage } from '@/pages/VentasPage'
import { ComprasPage } from '@/pages/ComprasPage'
import { ClientesPage } from '@/pages/ClientesPage'
import { ProveedoresPage } from '@/pages/ProveedoresPage'
import { PerfilPage } from '@/pages/PerfilPage'
import { 
  User, 
  Bell, 
  Settings, 
  LogOut 
} from 'lucide-react'

export function Dashboard({ userData, onLogout }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const navigate = useNavigate()
  const { getActiveTab, navigateToTab } = useNavigation()

  const handleTabChange = (tab) => {
    navigateToTab(tab)
  }

  const handleLogout = () => {
    onLogout()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen gradient-secondary">
      <Sidebar
        activeTab={getActiveTab()}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        userData={userData}
        onCollapseChange={setIsSidebarCollapsed}
      />
      
      <div className="flex-1 min-w-0">
        {/* Header Superior */}
        <header className="bg-white shadow-soft border-b border-gray-100 sticky top-0 z-30">
          <div className={`transition-all duration-300 ${
            isSidebarCollapsed ? 'ml-20' : 'ml-72'
          }`}>
            <div className="flex items-center justify-between px-6 py-4">
              {/* Título del Sistema */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-medium">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Innovadom</h1>
                  <p className="text-sm text-gray-600">Sistema de Gestión</p>
                </div>
              </div>

              {/* Información del Usuario */}
              <div className="flex items-center space-x-4">
                {/* Notificaciones */}
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>

                {/* Configuración */}
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200">
                  <Settings className="w-5 h-5" />
                </button>

                {/* Separador */}
                <div className="w-px h-8 bg-gray-200"></div>

                {/* Usuario */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{userData?.username}</p>
                    <p className="text-xs text-gray-600 capitalize">{userData?.role}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-medium">
                    {userData?.username?.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Separador */}
                <div className="w-px h-8 bg-gray-200"></div>

                {/* Cerrar Sesión */}
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido Principal */}
        <main className={`transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-72'
        } min-w-0`}>
          <div className="container-padding py-8">
            <Breadcrumb />
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/recetas" element={<RecetasPage />} />
              <Route path="/productos" element={<ProductosPage />} />
              <Route path="/inventario" element={<InventarioPage />} />
              <Route path="/ventas" element={<VentasPage />} />
              <Route path="/compras" element={<ComprasPage />} />
              <Route path="/clientes" element={<ClientesPage />} />
              <Route path="/proveedores" element={<ProveedoresPage />} />
              <Route path="/perfil" element={<PerfilPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}
