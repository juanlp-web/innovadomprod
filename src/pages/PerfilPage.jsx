import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { useMobile } from '@/hooks/useMobile';
import { toast } from 'react-hot-toast';
import { LogOut, User, Settings, Shield, Bell } from 'lucide-react';

export function PerfilPage() {
  const { 
    profile, 
    loading, 
    error, 
    updateProfile, 
    changePassword,
    updateNotifications,
    updateTheme
  } = useProfile();
  
  const { logout, user } = useAuth();
  const { isMobile } = useMobile();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    birthDate: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Inicializar formData cuando se carga el perfil
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        address: profile.address || '',
        birthDate: profile.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : ''
      });
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    const result = await updateProfile(formData);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    const result = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });

    if (result.success) {
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  const handleNotificationChange = async (type, value) => {
    await updateNotifications({ [type]: value });
  };

  const handleThemeChange = async (darkMode) => {
    await updateTheme({ darkMode });
  };

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar el perfil</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'flex-row lg:items-center lg:justify-between gap-4'}`}>
        <div className="flex-1">
          <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>Perfil de Usuario</h1>
          <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-sm sm:text-base'}`}>Gestiona tu información personal y configuración</p>
        </div>
        <div className={`flex-shrink-0 ${isMobile ? 'flex flex-col space-y-2' : 'flex space-x-2'}`}>
          <Button 
            className={`bg-purple-600 hover:bg-purple-700 ${isMobile ? 'w-full text-sm py-2' : 'w-full lg:w-auto'}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? '❌ Cancelar' : '✏️ Editar Perfil'}
          </Button>
          <Button 
            variant="outline"
            className={`border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 ${isMobile ? 'w-full text-sm py-2' : 'w-full lg:w-auto'}`}
            onClick={handleLogout}
          >
            <LogOut className={`${isMobile ? 'w-4 h-4 mr-1' : 'w-4 h-4 mr-2'}`} />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Información del perfil */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Tarjeta de perfil principal */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="text-center">
              <div className="mx-auto h-20 w-20 sm:h-24 sm:w-24 bg-gradient-to-r from-pink-400 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <User className="text-white w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h2 className={`font-semibold text-gray-900 mb-2 ${isMobile ? 'text-lg' : 'text-lg sm:text-xl'}`}>
                {profile?.username || user?.name || 'Usuario'}
              </h2>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-4 bg-purple-100 text-purple-800">
                {profile?.role === 'admin' ? '👑 Administrador' : 
                 profile?.role === 'manager' ? '👔 Gerente' : '👤 Usuario'}
              </div>
              <div className="space-y-3 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center justify-center">
                  <span className="mr-2">📧</span>
                  <span className="truncate">{profile?.email || user?.email || 'usuario@example.com'}</span>
                </div>
                {profile?._id && (
                  <div className="flex items-center justify-center">
                    <span className="mr-2">🆔</span>
                    <span className="font-mono text-xs">{profile._id.substring(0, 8)}...</span>
                  </div>
                )}
                <div className="flex items-center justify-center">
                  <span className="mr-2">📅</span>
                  <span>Miembro desde: {formatDate(profile?.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información detallada */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información personal */}
          <div className="bg-white shadow rounded-lg border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
            {isEditing ? (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'space-x-3'}`}>
                  <Button type="submit" className={`bg-purple-600 hover:bg-purple-700 ${isMobile ? 'w-full' : ''}`}>
                    💾 Guardar Cambios
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className={isMobile ? 'w-full' : ''}
                  >
                    ❌ Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={profile?.firstName && profile?.lastName ? `${profile.firstName} ${profile.lastName}` : 'No especificado'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={profile?.phone || 'No especificado'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    value={profile?.address || 'No especificado'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={profile?.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                    disabled
                  />
                </div>
              </div>
            )}
          </div>

          {/* Configuración de cuenta */}
          <div className="bg-white shadow rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <Settings className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-lg' : 'text-lg'}`}>Configuración de Cuenta</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="w-4 h-4 text-blue-500 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">Notificaciones por Email</h4>
                    <p className="text-sm text-gray-600">Recibir notificaciones importantes por correo</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={profile?.emailNotifications || false}
                    onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="w-4 h-4 text-green-500 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">Notificaciones Push</h4>
                    <p className="text-sm text-gray-600">Recibir notificaciones en tiempo real</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={profile?.pushNotifications || false}
                    onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Settings className="w-4 h-4 text-gray-500 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">Modo Oscuro</h4>
                    <p className="text-sm text-gray-600">Cambiar a tema oscuro</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={profile?.darkMode || false}
                    onChange={(e) => handleThemeChange(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones de seguridad */}
      <div className="bg-white shadow rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center mb-4">
          <Shield className="w-5 h-5 text-red-600 mr-2" />
          <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-lg' : 'text-lg'}`}>Seguridad</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="justify-start border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400"
            onClick={() => setIsChangingPassword(!isChangingPassword)}
          >
            <Shield className="w-4 h-4 mr-2" />
            Cambiar Contraseña
          </Button>
        </div>

        {/* Modal de cambio de contraseña */}
        {isChangingPassword && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Cambiar Contraseña</h4>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'space-x-3'}`}>
                <Button type="submit" className={`bg-purple-600 hover:bg-purple-700 ${isMobile ? 'w-full' : ''}`}>
                  🔒 Cambiar Contraseña
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsChangingPassword(false)}
                  className={isMobile ? 'w-full' : ''}
                >
                  ❌ Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
