import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Importar tus componentes originales
import { Login } from '@/components/Login';
import { ResetPassword } from '@/components/ResetPassword';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProductosPage } from '@/pages/ProductosPage';
import { ClientesPage } from '@/pages/ClientesPage';
import { ProveedoresPage } from '@/pages/ProveedoresPage';
import { RecetasPage } from '@/pages/RecetasPage';
import { InventarioPage } from '@/pages/InventarioPage';
import { VentasPage } from '@/pages/VentasPage';
import { ComprasPage } from '@/pages/ComprasPage';
import { LotesPage } from '@/pages/LotesPage';
import { PerfilPage } from '@/pages/PerfilPage';
import { Sidebar } from '@/components/Sidebar';
import { Breadcrumb } from '@/components/Breadcrumb';

// Importar el hook de autenticación y sidebar
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/hooks/useSidebar';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';

function App() {
  const { user, loading, logout } = useAuth();
  const { isCollapsed, setCollapsed, getSidebarMargin } = useSidebar();
  
  // Hook para persistencia de sesión
  useSessionPersistence();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Función para renderizar el layout con sidebar
  const renderLayout = (Component) => (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onCollapseChange={setCollapsed} isCollapsed={isCollapsed} />
      <div className={`flex-1 ${getSidebarMargin()} flex flex-col overflow-hidden transition-all duration-300`}>
        <Breadcrumb />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Component />
        </main>
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        {user ? (
          // Rutas protegidas cuando el usuario está logueado
          <>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={renderLayout(DashboardPage)} />
            <Route path="/productos" element={renderLayout(ProductosPage)} />
            <Route path="/clientes" element={renderLayout(ClientesPage)} />
            <Route path="/proveedores" element={renderLayout(ProveedoresPage)} />
            <Route path="/recetas" element={renderLayout(RecetasPage)} />
            <Route path="/inventario" element={renderLayout(InventarioPage)} />
            <Route path="/ventas" element={renderLayout(VentasPage)} />
            <Route path="/compras" element={renderLayout(ComprasPage)} />
            <Route path="/lotes" element={renderLayout(LotesPage)} />
            <Route path="/perfil" element={renderLayout(PerfilPage)} />
            <Route path="/login" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </>
        ) : (
          // Rutas públicas cuando no hay usuario logueado
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
      
      {/* Botón de logout cuando el usuario está logueado */}
      {user && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Hola, {user.name}
            </span>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;
