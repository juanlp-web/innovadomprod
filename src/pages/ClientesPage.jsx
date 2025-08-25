import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useClients } from '@/hooks/useClients';
import { ClientModal } from '@/components/ClientModal';
import { ClientDetailModal } from '@/components/ClientDetailModal';
import { Search, Plus, Filter, Eye, Edit, Trash2, AlertCircle, X, ToggleLeft, ToggleRight } from 'lucide-react';

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
      console.log('Guardando cliente:', clientData);
      
      if (editingClient) {
        console.log('Actualizando cliente existente:', editingClient._id);
        const result = await updateClient(editingClient._id, clientData);
        console.log('Resultado de actualización:', result);
      } else {
        console.log('Creando nuevo cliente');
        const result = await createClient(clientData);
        console.log('Resultado de creación:', result);
      }
      
      setShowModal(false);
      setEditingClient(null);
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      // El error se maneja automáticamente en el hook useClients
    }
  };

  // Manejar eliminar cliente
  const handleDeleteClient = async (client) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al cliente "${client.name}"?`)) {
      try {
        await deleteClient(client._id);
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
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
      console.error('Error al cambiar estado del cliente:', error);
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

  // Debug: Log del estado actual
  console.log('Estado actual de ClientesPage:', {
    clients: clients.length,
    loading,
    error,
    pagination,
    searchTerm,
    filters
  });

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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => {
              console.log('Probando conexión con backend...');
              fetchClients().then(() => {
                console.log('Conexión exitosa, clientes cargados:', clients.length);
              }).catch(err => {
                console.error('Error de conexión:', err);
              });
            }}
          >
            🔍 Probar Conexión
          </Button>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleNewClient}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Cliente
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

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Clientes', value: stats.total, icon: '👥', color: 'bg-blue-500' },
          { title: 'Clientes Activos', value: stats.active, icon: '✅', color: 'bg-green-500' },
          { title: 'Clientes Inactivos', value: stats.inactive, icon: '❌', color: 'bg-red-500' },
          { title: 'Empresas', value: stats.empresa, icon: '🏢', color: 'bg-purple-500' }
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
          <div className="p-6">
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
                            variant="outline" 
                            onClick={() => handleViewClient(client)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEditClient(client)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusChange(client)}
                            className={client.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
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
                            variant="outline"
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

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changePage(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                  >
                    Anterior
                  </Button>
                  
                  <span className="text-sm text-gray-600">
                    Página {pagination.currentPage} de {pagination.totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changePage(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
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
    </div>
  );
}
