import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import './App.css';

// Importar tus componentes originales
import { Login } from '@/components/Login';
import { ResetPassword } from '@/components/ResetPassword';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProductosPage } from '@/pages/ProductosPage';
import { PaquetesPage } from '@/pages/PaquetesPage';
import { ClientesPage } from '@/pages/ClientesPage';
import { ProveedoresPage } from '@/pages/ProveedoresPage';
import { RecetasPage } from '@/pages/RecetasPage';
import { InventarioPage } from '@/pages/InventarioPage';
import { VentasPage } from '@/pages/VentasPage';
import { ComprasPage } from '@/pages/ComprasPage';
import { LotesPage } from '@/pages/LotesPage';
import { ReporteriaPage } from '@/pages/ReporteriaPage';
import { PerfilPage } from '@/pages/PerfilPage';
import { ConfiguracionPage } from '@/pages/ConfiguracionPage';
import { BancosPage } from '@/pages/BancosPage';
import { CatalogoCuentasPage } from '@/pages/CatalogoCuentasPage';
import { AdminPage } from '@/pages/AdminPage';
import { Sidebar } from '@/components/Sidebar';
import { MobileHeader } from '@/components/MobileHeader';

// PWA Components
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { OfflinePage } from '@/components/OfflinePage';

// Importar el hook de autenticación y sidebar
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/hooks/useSidebar';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useMobile } from '@/hooks/useMobile';

function App() {
  const { user, loading, logout } = useAuth();
  const { isCollapsed, setCollapsed, getSidebarMargin } = useSidebar();
  const isOnline = useOnlineStatus();
  const { isMobile } = useMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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

  // Mostrar página offline si no hay conexión
  if (!isOnline) {
    return <OfflinePage />;
  }

  // Fallback para cuando no hay usuario y no está cargando
  if (!user && !loading) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <PWAInstallPrompt />
      </Router>
    );
  }

  // Función para renderizar el layout con sidebar
  const renderLayout = (Component) => (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Header */}
      {isMobile && (
        <MobileHeader 
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMenuOpen={isMobileMenuOpen}
        />
      )}
      
      <Sidebar 
        onCollapseChange={setCollapsed} 
        isCollapsed={isCollapsed}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      
      <div className={`flex-1 ${isMobile ? 'ml-0' : getSidebarMargin()} flex flex-col overflow-hidden transition-all duration-300`}>
        <main className={`flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 ${isMobile ? 'p-4 mt-16' : 'p-6'}`}>
          <Component />
        </main>
      </div>
    </div>
  );

  // Solo llegamos aquí si hay usuario y no está cargando
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={renderLayout(DashboardPage)} />
        <Route path="/productos" element={renderLayout(ProductosPage)} />
        <Route path="/paquetes" element={renderLayout(PaquetesPage)} />
        <Route path="/clientes" element={renderLayout(ClientesPage)} />
        <Route path="/proveedores" element={renderLayout(ProveedoresPage)} />
        <Route path="/recetas" element={renderLayout(RecetasPage)} />
        <Route path="/inventario" element={renderLayout(InventarioPage)} />
        <Route path="/ventas" element={renderLayout(VentasPage)} />
        <Route path="/compras" element={renderLayout(ComprasPage)} />
        <Route path="/lotes" element={renderLayout(LotesPage)} />
        <Route path="/reporteria" element={renderLayout(ReporteriaPage)} />
        <Route path="/configuracion" element={renderLayout(ConfiguracionPage)} />
        <Route path="/bancos" element={renderLayout(BancosPage)} />
        <Route path="/catalogo-cuentas" element={renderLayout(CatalogoCuentasPage)} />
        <Route path="/admin" element={renderLayout(AdminPage)} />
        <Route path="/perfil" element={renderLayout(PerfilPage)} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </Router>
  );
}

export default App;
