import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useClients } from '@/hooks/useClients';
import { ClientModal } from '@/components/ClientModal';
import { ClientDetailModal } from '@/components/ClientDetailModal';
import { Search, Plus, Filter, Eye, Edit, Trash2, AlertCircle, X, ToggleLeft, ToggleRight, Users, UserCheck, UserX, Building2, Upload } from 'lucide-react';
import { useImport } from '@/hooks/useImport';
import { ImportModal } from '@/components/ImportModal';

export function ClientesPage() {
  const {
    clients,
    loading,
    error,
    pagination,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    changeClientStatus,
    searchClients,
    changePage,
    clearError
  } = useClients();

  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'Todos los tipos',
    status: 'Todos los estados'
  });

  // Hook para importación
  const {
    loading: importLoading,
    importModalOpen,
    openImportModal,
    closeImportModal,
    importData
  } = useImport('clients');

  // Configuración para importación
  const importConfig = {
    title: "Importar Clientes",
    description: "Importa clientes desde un archivo CSV o Excel",
    sampleData: [
      {
        name: "Juan Pérez",
        email: "juan.perez@email.com",
        phone: "555-0123",
        address: "Calle Principal 123",
        type: "individual",
        status: "Activo"
      },
      {
        name: "Empresa ABC S.A.",
        email: "contacto@empresaabc.com",
        phone: "555-0456",
        address: "Av. Comercial 456",
        type: "empresa",
        status: "Activo"
      },
      {
        name: "Distribuidora XYZ",
        email: "ventas@distribuidoraxyz.com",
        phone: "555-0321",
        address: "Av. Industrial 321",
        type: "distribuidor",
        status: "Pendiente"
      }
    ],
    columns: [
      { key: 'name', header: 'nombre', required: true },
      { key: 'email', header: 'correo', required: false },
      { key: 'phone', header: 'telefono', required: false },
      { key: 'address', header: 'direccion', required: false },
      { key: 'type', header: 'tipo', required: false },
      { key: 'status', header: 'estado', required: false }
    ]
  };

  // Obtener color del estado
  const getStatusColor = (client) => {
    // Si el cliente tiene un campo status específico, usarlo
    if (client && client.status) {
      const statusColors = {
        'Activo': 'bg-green-100 text-green-800',
        'Pendiente': 'bg-yellow-100 text-yellow-800',
        'Inactivo': 'bg-gray-100 text-gray-800',
        'Bloqueado': 'bg-red-100 text-red-800'
      };
      return statusColors[client.status] || statusColors['Inactivo'];
    }
    
    // Fallback al estado booleano isActive
    return client.isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  // Obtener color del tipo
  const getTypeColor = (type) => {
    switch (type) {
      case 'individual':
        return 'bg-blue-100 text-blue-800';
      case 'empresa':
        return 'bg-purple-100 text-purple-800';
      case 'distribuidor':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener etiqueta del tipo
  const getTypeLabel = (type) => {
    const typeLabels = {
      individual: 'Individual',
      empresa: 'Empresa',
      distribuidor: 'Distribuidor'
    };
    return typeLabels[type] || type;
  };

  // Obtener etiqueta del estado
  const getStatusLabel = (client) => {
    // Si el cliente tiene un campo status específico, usarlo
    if (client && client.status) {
      return client.status;
    }
    
    // Fallback al estado booleano isActive
    return client.isActive ? 'Activo' : 'Inactivo';
  };

  // Manejar búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchClients(searchTerm, {
        type: filters.type !== 'Todos los tipos' ? filters.type : undefined,
        status: filters.status !== 'Todos los estados' ? filters.status : undefined
      });
    } else {
      fetchClients();
    }
  };

  // Manejar cambio de filtros
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    // Aplicar filtros inmediatamente
    const searchQuery = searchTerm.trim() || undefined;
    const filterParams = {
      type: filterType === 'type' ? value : filters.type,
      status: filterType === 'status' ? value : filters.status
    };
    
    if (searchQuery) {
      searchClients(searchQuery, filterParams);
    } else {
      fetchClients(filterParams);
    }
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      type: 'Todos los tipos',
      status: 'Todos los estados'
    });
    setSearchTerm('');
    fetchClients();
  };

  // Manejar nuevo cliente
  const handleNewClient = () => {
    setEditingClient(null);
    setShowModal(true);
  };

  // Manejar editar cliente
  const handleEditClient = (client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  // Manejar ver cliente
  const handleViewClient = (client) => {
    setSelectedClient(client);
    setShowDetailModal(true);
  };

  // Manejar guardar cliente
  const handleSaveClient = async (clientData) => {
    try {
      
      if (editingClient) {
        const result = await updateClient(editingClient._id, clientData);
      } else {
        const result = await createClient(clientData);
      }
      
      setShowModal(false);
      setEditingClient(null);
    } catch (error) {
      // El error se maneja automáticamente en el hook useClients
    }
  };

  // Manejar eliminar cliente
  const handleDeleteClient = async (client) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al cliente "${client.name}"?`)) {
      try {
        await deleteClient(client._id);
      } catch (error) {
      }
    }
  };

  // Manejar cambio de estado
  const handleStatusChange = async (client) => {
    try {
      // Determinar el nuevo estado basado en el estado actual
      let newStatus;
      if (client.status) {
        // Si tiene campo status, rotar entre los estados
        const statusOrder = ['Activo', 'Pendiente', 'Inactivo', 'Bloqueado'];
        const currentIndex = statusOrder.indexOf(client.status);
        const nextIndex = (currentIndex + 1) % statusOrder.length;
        newStatus = statusOrder[nextIndex];
      } else {
        // Fallback al comportamiento anterior (toggle activo/inactivo)
        newStatus = client.isActive ? 'Inactivo' : 'Activo';
      }
      
      // Convertir el nuevo status a isActive para el backend
      const isActive = newStatus === 'Activo';
      
      // Actualizar en el backend
      await changeClientStatus(client._id, isActive);
      
      // El estado local se actualiza automáticamente en el hook useClients
    } catch (error) {
      // El error se maneja automáticamente en el hook useClients
    }
  };

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount);
  };

  // Obtener badge de estado
  const getStatusBadge = (client) => {
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(client)}`}>
        {getStatusLabel(client)}
      </span>
    );
  };

  // Obtener badge de tipo
  const getTypeBadge = (type) => {
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(type)}`}>
        {getTypeLabel(type)}
      </span>
    );
  };

  // Calcular estadísticas
  const stats = {
    total: clients.length,
    active: clients.filter(client => client.isActive).length,
    inactive: clients.filter(client => !client.isActive).length,
    individual: clients.filter(client => client.type === 'individual').length,
    empresa: clients.filter(client => client.type === 'empresa').length,
    distribuidor: clients.filter(client => client.type === 'distribuidor').length
  };

  if (loading && clients.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <Button className="bg-purple-600 hover:bg-purple-700" disabled>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando clientes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600 text-sm sm:text-base">Administra la base de datos de clientes</p>
        </div>
        <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={openImportModal}
            variant="outline"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 shadow-medium hover:shadow-strong transform hover:-translate-y-1 transition-all duration-300"
          >
            <Upload className="w-5 h-5" />
            <span className="hidden sm:inline">Importar</span>
            <span className="sm:hidden">Importar</span>
          </Button>
          <Button 
            onClick={handleNewClient}
            className={`btn-primary flex items-center justify-center space-x-2 shadow-medium hover:shadow-strong transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto`}
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nuevo Cliente</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ✕
            </Button>
          </div>
        </div>
      )}


      {/* Filtros y búsqueda */}
      <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar clientes por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                Buscar
              </Button>
            </div>
          </div>

          {/* Filtros expandibles */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Cliente
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option>Todos los tipos</option>
                  <option value="individual">Individual</option>
                  <option value="empresa">Empresa</option>
                  <option value="distribuidor">Distribuidor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option>Todos los estados</option>
                  <option>Activo</option>
                  <option>Pendiente</option>
                  <option>Inactivo</option>
                  <option>Bloqueado</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Lista de clientes */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Clientes Registrados ({pagination.totalItems})
            </h2>
            {loading && (
              <div className="flex items-center text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                Actualizando...
              </div>
            )}
          </div>
        </div>
        
        {clients.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron clientes
            </h3>
            <p className="text-gray-500">
              {searchTerm || filters.type !== 'Todos los tipos' || filters.status !== 'Todos los estados'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay clientes registrados aún'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Vista de tarjetas para móviles */}
            <div className="lg:hidden p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {clients.map((client) => (
                  <div key={client._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    {/* Header de la tarjeta */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{client.name}</h4>
                        <p className="text-xs text-gray-600">{client.email || 'Sin email'}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getTypeBadge(client.type)}
                        {getStatusBadge(client)}
                      </div>
                    </div>
                    
                    {/* Información adicional */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-600">
                        Límite: {formatCurrency(client.creditLimit || 0)}
                      </p>
                    </div>
                    
                    {/* Acciones */}
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        variant="outline-blue"
                        onClick={() => handleViewClient(client)}
                        className="flex-1 text-xs p-2"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline-yellow"
                        onClick={() => handleEditClient(client)}
                        className="flex-1 text-xs p-2"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant={client.isActive ? 'outline-red' : 'outline-green'}
                        onClick={() => handleStatusChange(client)}
                        className={`flex-1 text-xs p-2 ${
                          client.isActive 
                            ? 'text-red-600 hover:text-red-800' 
                            : 'text-green-600 hover:text-green-800'
                        }`}
                      >
                        {(() => {
                          if (client.status) {
                            const statusOrder = ['Activo', 'Pendiente', 'Inactivo', 'Bloqueado'];
                            const currentIndex = statusOrder.indexOf(client.status);
                            const nextIndex = (currentIndex + 1) % statusOrder.length;
                            const nextStatus = statusOrder[nextIndex];
                            return (
                              <>
                                <ToggleLeft className="w-3 h-3 mr-1" />
                                {nextStatus}
                              </>
                            );
                          } else {
                            return client.isActive ? (
                              <>
                                <ToggleLeft className="w-3 h-3 mr-1" />
                                Desactivar
                              </>
                            ) : (
                              <>
                                <ToggleRight className="w-3 h-3 mr-1" />
                                Activar
                              </>
                            );
                          }
                        })()}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline-red"
                        onClick={() => handleDeleteClient(client)}
                        className="flex-1 text-xs p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Vista de tabla para desktop */}
            <div className="hidden lg:block p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Límite de Crédito
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clients.map((client) => (
                      <tr key={client._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{client.name}</div>
                          <div className="text-sm text-gray-500">{client.email || 'Sin email'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getTypeBadge(client.type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(client)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(client.creditLimit || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline-blue"
                              onClick={() => handleViewClient(client)}
                              className=""
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline-yellow"
                              onClick={() => handleEditClient(client)}
                              className=""
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                            <Button 
                              size="sm" 
                              variant={client.isActive ? 'outline-red' : 'outline-green'}
                              onClick={() => handleStatusChange(client)}
                              className={client.isActive 
                                ? 'text-red-600 hover:text-red-800' 
                                : 'text-green-600 hover:text-green-800'
                              }
                            >
                              {(() => {
                                if (client.status) {
                                  const statusOrder = ['Activo', 'Pendiente', 'Inactivo', 'Bloqueado'];
                                  const currentIndex = statusOrder.indexOf(client.status);
                                  const nextIndex = (currentIndex + 1) % statusOrder.length;
                                  const nextStatus = statusOrder[nextIndex];
                                  return (
                                    <>
                                      <ToggleLeft className="w-4 h-4 mr-1" />
                                      Cambiar a {nextStatus}
                                    </>
                                  );
                                } else {
                                  return client.isActive ? (
                                    <>
                                      <ToggleLeft className="w-4 h-4 mr-1" />
                                      Desactivar
                                    </>
                                  ) : (
                                    <>
                                      <ToggleRight className="w-4 h-4 mr-1" />
                                      Activar
                                    </>
                                  );
                                }
                              })()}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline-red"
                              onClick={() => handleDeleteClient(client)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className=""
              >
                Anterior
              </Button>
              
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Página {pagination.currentPage} de {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className=""
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { title: 'Total Clientes', value: stats.total, icon: Users, color: 'bg-blue-500' },
          { title: 'Clientes Activos', value: stats.active, icon: UserCheck, color: 'bg-green-500' },
          { title: 'Clientes Inactivos', value: stats.inactive, icon: UserX, color: 'bg-red-500' },
          { title: 'Empresas', value: stats.empresa, icon: Building2, color: 'bg-purple-500' }
        ].map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white shadow rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center text-center sm:text-left">
                <div className={`h-12 w-12 ${stat.color} rounded-lg flex items-center justify-center mx-auto sm:mx-0 sm:mr-4 mb-3 sm:mb-0`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de cliente */}
      <ClientModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingClient(null);
        }}
        onSave={handleSaveClient}
        client={editingClient}
        loading={loading}
      />

      {/* Modal de detalle */}
      <ClientDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        onEdit={handleEditClient}
      />

      {/* Modal de Importación */}
      <ImportModal
        isOpen={importModalOpen}
        onClose={closeImportModal}
        onImport={importData}
        title={importConfig.title}
        description={importConfig.description}
        sampleData={importConfig.sampleData}
        columns={importConfig.columns}
        loading={importLoading}
      />
    </div>
  );
}
