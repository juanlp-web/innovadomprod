export function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Cards de Cantidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Productos */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Productos</p>
              <p className="text-3xl font-bold text-gray-900">156</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">🧴</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm font-medium">+12%</span>
            <span className="text-gray-500 text-sm ml-2">vs mes anterior</span>
          </div>
        </div>

        {/* Materia Prima */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Materia Prima</p>
              <p className="text-3xl font-bold text-gray-900">89</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-2xl">🌿</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm font-medium">+8%</span>
            <span className="text-gray-500 text-sm ml-2">vs mes anterior</span>
          </div>
        </div>

        {/* Productos Terminados */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Productos Terminados</p>
              <p className="text-3xl font-bold text-gray-900">67</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <span className="text-2xl">✨</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm font-medium">+15%</span>
            <span className="text-gray-500 text-sm ml-2">vs mes anterior</span>
          </div>
        </div>

        {/* Clientes */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes</p>
              <p className="text-3xl font-bold text-gray-900">234</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <span className="text-2xl">👥</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm font-medium">+5%</span>
            <span className="text-gray-500 text-sm ml-2">vs mes anterior</span>
          </div>
        </div>
      </div>

      {/* Cards de Proveedores y Total */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Proveedores */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Proveedores</p>
              <p className="text-3xl font-bold text-gray-900">45</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <span className="text-2xl">🏭</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm font-medium">+3%</span>
            <span className="text-gray-500 text-sm ml-2">vs mes anterior</span>
          </div>
        </div>

        {/* Total General */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total General</p>
              <p className="text-3xl font-bold text-gray-900">591</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <span className="text-2xl">📊</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm font-medium">+9%</span>
            <span className="text-gray-500 text-sm ml-2">vs mes anterior</span>
          </div>
        </div>
      </div>

      {/* Cards de Ventas y Ganancia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ventas del Mes */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">Ventas del Mes</p>
              <p className="text-3xl font-bold">$24,580</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <span className="text-2xl">💰</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-100 text-sm font-medium">+18%</span>
            <span className="text-green-200 text-sm ml-2">vs mes anterior</span>
          </div>
        </div>

        {/* Ganancia del Mes */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100">Ganancia del Mes</p>
              <p className="text-3xl font-bold">$8,420</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <span className="text-2xl">📈</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-purple-100 text-sm font-medium">+22%</span>
            <span className="text-purple-200 text-sm ml-2">vs mes anterior</span>
          </div>
        </div>
      </div>
    </div>
  )
}
