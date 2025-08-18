import { Button } from '@/components/ui/button'

export function PerfilPage({ userData }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Perfil de Usuario</h1>
        <Button className="bg-purple-600 hover:bg-purple-700">
          ✏️ Editar Perfil
        </Button>
      </div>

      {/* Información del perfil */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarjeta de perfil principal */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 bg-gradient-to-r from-pink-400 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-3xl font-bold">
                  {userData?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {userData?.username || 'Usuario'}
              </h2>
              <p className="text-gray-600 mb-4">
                {userData?.role === 'admin' ? 'Administrador' : 'Usuario'}
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center">
                  <span className="mr-2">📧</span>
                  {userData?.email || 'usuario@example.com'}
                </div>
                <div className="flex items-center justify-center">
                  <span className="mr-2">👤</span>
                  ID: {userData?.id || 'N/A'}
                </div>
                <div className="flex items-center justify-center">
                  <span className="mr-2">📅</span>
                  Miembro desde: Enero 2024
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información detallada */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información personal */}
          <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value="Usuario Ejemplo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value="+1 809-555-0000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value="Santo Domingo, República Dominicana"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                <input
                  type="date"
                  value="1990-01-01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Configuración de cuenta */}
          <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Cuenta</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Notificaciones por Email</h4>
                  <p className="text-sm text-gray-600">Recibir notificaciones importantes por correo</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Notificaciones Push</h4>
                  <p className="text-sm text-gray-600">Recibir notificaciones en tiempo real</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Modo Oscuro</h4>
                  <p className="text-sm text-gray-600">Cambiar a tema oscuro</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Actividad reciente */}
          <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
            <div className="space-y-3">
              {[
                { action: 'Inicio de sesión', time: 'Hace 2 horas', icon: '🔐' },
                { action: 'Actualización de perfil', time: 'Hace 1 día', icon: '✏️' },
                { action: 'Cambio de contraseña', time: 'Hace 1 semana', icon: '🔒' },
                { action: 'Acceso desde nuevo dispositivo', time: 'Hace 2 semanas', icon: '💻' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-sm">{activity.icon}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Acciones de seguridad */}
      <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Seguridad</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline" className="justify-start">
            🔒 Cambiar Contraseña
          </Button>
          <Button variant="outline" className="justify-start">
            🔐 Autenticación de Dos Factores
          </Button>
          <Button variant="outline" className="justify-start">
            📱 Dispositivos Conectados
          </Button>
          <Button variant="outline" className="justify-start">
            📊 Historial de Accesos
          </Button>
        </div>
      </div>
    </div>
  )
}
