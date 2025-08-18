import { Button } from '@/components/ui/button'

export function ProveedoresPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Proveedores</h1>
        <Button className="bg-purple-600 hover:bg-purple-700">
          + Nuevo Proveedor
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar proveedores..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>Todas las categorías</option>
              <option>Ingredientes</option>
              <option>Embalajes</option>
              <option>Equipos</option>
              <option>Servicios</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>Todos los estados</option>
              <option>Activo</option>
              <option>Inactivo</option>
              <option>Pendiente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de proveedores */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Proveedores Registrados</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Beauty Supplies Co.',
                category: 'Ingredientes',
                contact: 'Juan Pérez',
                phone: '+1 809-555-0100',
                email: 'info@beautysupplies.com',
                status: 'Activo',
                rating: 4.8,
                lastOrder: 'Hace 2 días'
              },
              {
                name: 'Natural Ingredients Ltd.',
                category: 'Ingredientes',
                contact: 'María García',
                phone: '+1 809-555-0200',
                email: 'contact@naturalingredients.com',
                status: 'Activo',
                rating: 4.6,
                lastOrder: 'Hace 1 semana'
              },
              {
                name: 'Cosmetic World',
                category: 'Embalajes',
                contact: 'Carlos López',
                phone: '+1 809-555-0300',
                email: 'sales@cosmeticworld.com',
                status: 'Activo',
                rating: 4.4,
                lastOrder: 'Hace 3 días'
              },
              {
                name: 'Organic Beauty',
                category: 'Ingredientes',
                contact: 'Ana Martínez',
                phone: '+1 809-555-0400',
                email: 'hello@organicbeauty.com',
                status: 'Pendiente',
                rating: 4.2,
                lastOrder: 'Hace 2 semanas'
              },
              {
                name: 'Packaging Solutions',
                category: 'Embalajes',
                contact: 'Luis Rodríguez',
                phone: '+1 809-555-0500',
                email: 'info@packagingsolutions.com',
                status: 'Activo',
                rating: 4.7,
                lastOrder: 'Hace 5 días'
              },
              {
                name: 'Lab Equipment Pro',
                category: 'Equipos',
                contact: 'Roberto Silva',
                phone: '+1 809-555-0600',
                email: 'sales@labequipment.com',
                status: 'Inactivo',
                rating: 3.9,
                lastOrder: 'Hace 1 mes'
              }
            ].map((proveedor, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900">{proveedor.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    proveedor.status === 'Activo' ? 'bg-green-100 text-green-800' :
                    proveedor.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {proveedor.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">🏷️</span>
                    {proveedor.category}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">👤</span>
                    {proveedor.contact}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📱</span>
                    {proveedor.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📧</span>
                    {proveedor.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">⭐</span>
                    {proveedor.rating}/5.0
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📦</span>
                    Último pedido: {proveedor.lastOrder}
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

      {/* Estadísticas de proveedores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Proveedores', value: '24', icon: '🏢', color: 'bg-blue-500' },
          { title: 'Proveedores Activos', value: '20', icon: '✅', color: 'bg-green-500' },
          { title: 'Pendientes', value: '3', icon: '⏳', color: 'bg-yellow-500' },
          { title: 'Inactivos', value: '1', icon: '❌', color: 'bg-red-500' }
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
