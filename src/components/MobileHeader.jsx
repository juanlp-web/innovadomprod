import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useMobile } from '@/hooks/useMobile';
import { 
  Menu, 
  X, 
  Bell, 
  User, 
  LogOut, 
  Search,
  Settings,
  Home,
  ChevronDown
} from 'lucide-react';

export function MobileHeader({ onMenuToggle, isMenuOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isMobile } = useMobile();
  const [showUserMenu, setShowUserMenu] = useState(false);

  if (!isMobile) return null;

  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      '/dashboard': 'Dashboard',
      '/productos': 'Productos',
      '/paquetes': 'Paquetes',
      '/lotes': 'Lotes',
      '/clientes': 'Clientes',
      '/proveedores': 'Proveedores',
      '/recetas': 'Recetas',
      '/ventas': 'Ventas',
      '/compras': 'Compras',
      '/inventario': 'Inventario',
      '/reporteria': 'Reportería',
      '/configuracion': 'Configuración',
      '/perfil': 'Perfil'
    };
    return titles[path] || 'ProductOneX';
  };

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
    }
    setShowUserMenu(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left side - Menu button and title */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 text-gray-700" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" />
            )}
          </Button>
          
          <div className="flex items-center space-x-2">
            <img
              src="/ProductOneXIco.png"
              alt="ProductOneX"
              className="w-8 h-8 rounded-lg object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">
                {getPageTitle()}
              </h1>
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          {/* Quick actions */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Ir al inicio"
          >
            <Home className="w-5 h-5 text-gray-600" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-gray-100 rounded-lg relative"
            title="Notificaciones"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </Button>

          {/* User menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-1 p-2 hover:bg-gray-100 rounded-lg"
            >
              <User className="w-5 h-5 text-gray-600" />
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </Button>

            {/* User dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email || 'usuario@example.com'}
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    navigate('/perfil');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>Mi Perfil</span>
                </button>
                
                <button
                  onClick={() => {
                    navigate('/configuracion');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Configuración</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
}
