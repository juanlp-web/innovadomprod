import { Button } from '@/components/ui/button'

export function ClientesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <Button className="bg-purple-600 hover:bg-purple-700">
          + Nuevo Cliente
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar clientes..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>Todos los estados</option>
              <option>Activo</option>
              <option>Inactivo</option>
              <option>VIP</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>Todas las ciudades</option>
              <option>Santo Domingo</option>
              <option>Santiago</option>
              <option>La Romana</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Base de Clientes</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'María González',
                email: 'maria@email.com',
                phone: '+1 809-555-0123',
                city: 'Santo Domingo',
                status: 'VIP',
                purchases: 15,
                totalSpent: '$450.00'
              },
              {
                name: 'Carlos López',
                email: 'carlos@email.com',
                phone: '+1 809-555-0456',
                city: 'Santiago',
                status: 'Activo',
                purchases: 8,
                totalSpent: '$234.50'
              },
              {
                name: 'Ana Martínez',
                email: 'ana@email.com',
                phone: '+1 809-555-0789',
                city: 'La Romana',
                status: 'Activo',
                purchases: 12,
                totalSpent: '$389.99'
              },
              {
                name: 'Luis Pérez',
                email: 'luis@email.com',
                phone: '+1 809-555-0321',
                city: 'Santo Domingo',
                status: 'Inactivo',
                purchases: 3,
                totalSpent: '$89.97'
              },
              {
                name: 'Carmen Rodríguez',
                email: 'carmen@email.com',
                phone: '+1 809-555-0654',
                city: 'Santiago',
                status: 'VIP',
                purchases: 22,
                totalSpent: '$678.45'
              },
              {
                name: 'Roberto Silva',
                email: 'roberto@email.com',
                phone: '+1 809-555-0987',
                city: 'La Romana',
                status: 'Activo',
                purchases: 6,
                totalSpent: '$156.75'
              }
            ].map((cliente, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900">{cliente.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    cliente.status === 'VIP' ? 'bg-purple-100 text-purple-800' :
                    cliente.status === 'Activo' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {cliente.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📧</span>
                    {cliente.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📱</span>
                    {cliente.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">🏙️</span>
                    {cliente.city}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">🛒</span>
                    {cliente.purchases} compras
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">💰</span>
                    {cliente.totalSpent} gastado
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    👁️ Ver
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    ✏️ Editar
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    📊 Historial
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Estadísticas de clientes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Clientes', value: '156', icon: '👥', color: 'bg-blue-500' },
          { title: 'Clientes Activos', value: '142', icon: '✅', color: 'bg-green-500' },
          { title: 'Clientes VIP', value: '23', icon: '👑', color: 'bg-purple-500' },
          { title: 'Clientes Inactivos', value: '14', icon: '❌', color: 'bg-red-500' }
        ].map((stat, index) => (
          <div key={index} className="bg-white shadow rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`h-12 w-12 ${stat.color} rounded-lg flex items-center justify-center mr-4`}>
                <span className="text-white text-xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
