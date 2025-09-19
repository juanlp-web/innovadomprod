import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSuppliers } from '@/hooks/useSuppliers';
import { Search, Plus, Filter, Eye, Edit, History, Trash2, AlertCircle, X, Save, User, Phone, Mail, MapPin, Tag, FileText, Building2, UserCheck, UserX, Clock } from 'lucide-react';

export function ProveedoresPage() {
  const {
    suppliers,
    loading,
    error,
    stats,
    pagination,
    filters,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    changeSupplierStatus,
    searchSuppliers,
    updateFilters,
    changePage,
    clearError
  } = useSuppliers();

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);
  const [showViewSupplierModal, setShowViewSupplierModal] = useState(false);
  const [showEditSupplierModal, setShowEditSupplierModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [newSupplierForm, setNewSupplierForm] = useState({
    name: '',
    address: '',
    contactName: '',
    contactPhone: '',
    status: 'Activo',
    rating: 0,
    paymentTerms: '30 días',
    creditLimit: 0,
    taxId: '',
    notes: '',
    tags: []
  });
  const [editSupplierForm, setEditSupplierForm] = useState({
    name: '',
    address: '',
    contactName: '',
    contactPhone: '',
    status: 'Activo',
    rating: 0,
    paymentTerms: '30 días',
    creditLimit: 0,
    taxId: '',
    notes: '',
    tags: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manejar búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchSuppliers(searchTerm, {
        category: filters.category !== 'Todas las categorías' ? filters.category : undefined,
        status: filters.status !== 'Todos los estados' ? filters.status : undefined
      });
    } else {
      fetchSuppliers();
    }
  };

  // Manejar cambio de filtros
  const handleFilterChange = (filterType, value) => {
    updateFilters({ [filterType]: value });
    // Aplicar filtros inmediatamente
    const searchQuery = searchTerm.trim() || undefined;
    searchSuppliers(searchQuery, {
      category: filterType === 'category' ? value : filters.category,
      status: filterType === 'status' ? value : filters.status
    });
  };

  // Limpiar filtros
  const clearFilters = () => {
    updateFilters({
      category: 'Todas las categorías',
      status: 'Todos los estados'
    });
    setSearchTerm('');
    fetchSuppliers();
  };

  // Manejar cambios en el formulario
  const handleFormChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setNewSupplierForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setNewSupplierForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
    // Limpiar error del campo
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    
    if (!newSupplierForm.name.trim()) {
      errors.name = 'El nombre del proveedor es requerido';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Enviar formulario
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await createSupplier(newSupplierForm);
      
      if (result.success) {
                 // Limpiar formulario y cerrar modal
         setNewSupplierForm({
           name: '',
           address: '',
           contactName: '',
           contactPhone: '',
           status: 'Activo',
           rating: 0,
           paymentTerms: '30 días',
           creditLimit: 0,
           taxId: '',
           notes: '',
           tags: []
         });
        setFormErrors({});
        setShowNewSupplierModal(false);
      }
    } catch (error) {
      console.error('Error al crear proveedor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cerrar modal y limpiar formulario
  const handleCloseModal = () => {
    setShowNewSupplierModal(false);
    setNewSupplierForm({
      name: '',
      address: '',
      contactName: '',
      contactPhone: '',
      status: 'Activo',
      rating: 0,
      paymentTerms: '30 días',
      creditLimit: 0,
      taxId: '',
      notes: '',
      tags: []
    });
    setFormErrors({});
  };

  // Abrir modal de vista
  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setShowViewSupplierModal(true);
  };

  // Abrir modal de edición
  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setEditSupplierForm({
      name: supplier.name,
      address: supplier.address || '',
      contactName: supplier.contactName || '',
      contactPhone: supplier.contactPhone || '',
      status: supplier.status,
      rating: supplier.rating || 0,
      paymentTerms: supplier.paymentTerms || '30 días',
      creditLimit: supplier.creditLimit || 0,
      taxId: supplier.taxId || '',
      notes: supplier.notes || '',
      tags: supplier.tags || []
    });
    setShowEditSupplierModal(true);
  };

  // Cerrar modales
  const handleCloseViewModal = () => {
    setShowViewSupplierModal(false);
    setSelectedSupplier(null);
  };

  const handleCloseEditModal = () => {
    setShowEditSupplierModal(false);
    setSelectedSupplier(null);
    setEditSupplierForm({
      name: '',
      address: '',
      contactName: '',
      contactPhone: '',
      status: 'Activo',
      rating: 0,
      paymentTerms: '30 días',
      creditLimit: 0,
      taxId: '',
      notes: '',
      tags: []
    });
  };

  // Manejar cambios en el formulario de edición
  const handleEditFormChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditSupplierForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditSupplierForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Enviar formulario de edición
  const handleSubmitEditForm = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      const result = await updateSupplier(selectedSupplier._id, editSupplierForm);
      
      if (result.success) {
        handleCloseEditModal();
        fetchSuppliers(); // Recargar la lista
      }
    } catch (error) {
      console.error('Error al actualizar proveedor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hace 1 día';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.ceil(diffDays / 30)} meses`;
    return `Hace ${Math.ceil(diffDays / 365)} años`;
  };

  // Obtener color del estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'Activo':
        return 'bg-green-100 text-green-800';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inactivo':
        return 'bg-gray-100 text-gray-800';
      case 'Bloqueado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && suppliers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Proveedores</h1>
          <Button className="bg-purple-600 hover:bg-purple-700" disabled>
            <Plus className="w-4 h-4 mr-2" />
             Nuevo Proveedor
          </Button>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando proveedores...</p>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Proveedores</h1>
          <p className="text-gray-600 text-sm sm:text-base">Administra la base de datos de proveedores</p>
        </div>
        <div className="flex-shrink-0">
          <Button 
            onClick={() => setShowNewSupplierModal(true)}
            className={`btn-primary flex items-center justify-center space-x-2 shadow-medium hover:shadow-strong transform hover:-translate-y-1 transition-all duration-300 w-full lg:w-auto`}
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nuevo Proveedor</span>
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
      <div className="bg-white shadow rounded-lg border border-gray-200 p-4 sm:p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar proveedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filtros</span>
                <span className="sm:hidden">Filtros</span>
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto">
                Buscar
              </Button>
            </div>
          </div>

          {/* Filtros expandibles */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option>Todas las categorías</option>
                  <option>Ingredientes</option>
                  <option>Embalajes</option>
                  <option>Equipos</option>
                  <option>Servicios</option>
                  <option>Otros</option>
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
                  <option>Inactivo</option>
                  <option>Pendiente</option>
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

      {/* Lista de proveedores */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Proveedores Registrados ({pagination.totalItems})
            </h2>
            {loading && (
              <div className="flex items-center text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                Actualizando...
              </div>
            )}
          </div>
        </div>
        
        {suppliers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron proveedores
            </h3>
            <p className="text-gray-500">
              {searchTerm || filters.category !== 'Todas las categorías' || filters.status !== 'Todos los estados'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay proveedores registrados aún'
              }
            </p>
          </div>
                 ) : (
          <>
            {/* Vista de tarjetas para móviles */}
            <div className="lg:hidden p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {suppliers.map((proveedor) => (
                  <div key={proveedor._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    {/* Header de la tarjeta */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{proveedor.name}</h4>
                        <p className="text-xs text-gray-600">{proveedor.category}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(proveedor.status)}`}>
                        {proveedor.status}
                      </span>
                    </div>
                    
                    {/* Información adicional */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-600">
                        Calificación: {proveedor.rating ? `${proveedor.rating}/5.0` : 'Sin calificación'}
                      </p>
                    </div>
                    
                    {/* Acciones */}
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleViewSupplier(proveedor)}
                        className="flex-1 text-xs p-2"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEditSupplier(proveedor)}
                        className="flex-1 text-xs p-2"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-xs p-2">
                        <History className="w-3 h-3 mr-1" />
                        Historial
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
                        Proveedor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Calificación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {suppliers.map((proveedor) => (
                      <tr key={proveedor._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{proveedor.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{proveedor.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(proveedor.status)}`}>
                            {proveedor.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {proveedor.rating ? `${proveedor.rating}/5.0` : 'Sin calificación'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleViewSupplier(proveedor)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEditSupplier(proveedor)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                            <Button size="sm" variant="outline">
                              <History className="w-4 h-4 mr-1" />
                              Historial
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

      {/* Estadísticas de proveedores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Proveedores', value: stats.total, icon: Building2, color: 'bg-blue-500' },
          { title: 'Proveedores Activos', value: stats.active, icon: UserCheck, color: 'bg-green-500' },
          { title: 'Pendientes', value: stats.pending, icon: Clock, color: 'bg-yellow-500' },
          { title: 'Inactivos', value: stats.inactive + stats.blocked, icon: UserX, color: 'bg-red-500' }
        ].map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white shadow rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`h-12 w-12 ${stat.color} rounded-lg flex items-center justify-center mr-4`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para nuevo proveedor */}
      {showNewSupplierModal && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-content">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Nuevo Proveedor</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-6">
              {/* Información básica */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Proveedor *
                </label>
                <input
                  type="text"
                  value={newSupplierForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Beauty Supplies Co."
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              

                             {/* Dirección */}
               <div className="border-t border-gray-200 pt-6">
                 <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                   <MapPin className="w-5 h-5 mr-2" />
                   Dirección
                 </h3>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Dirección Completa
                   </label>
                   <textarea
                     value={newSupplierForm.address}
                     onChange={(e) => handleFormChange('address', e.target.value)}
                     rows={3}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                     placeholder="Ej: Calle Principal 123, Santo Domingo, Distrito Nacional, 10101"
                   />
                 </div>
               </div>

                             {/* Información adicional */}
               <div className="border-t border-gray-200 pt-6">
                 <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                   <FileText className="w-5 h-5 mr-2" />
                   Información Adicional
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Nombre de Contacto
                     </label>
                     <input
                       type="text"
                       value={newSupplierForm.contactName}
                       onChange={(e) => handleFormChange('contactName', e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                       placeholder="Ej: Juan Pérez"
                     />
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Número de Teléfono
                     </label>
                     <input
                       type="tel"
                       value={newSupplierForm.contactPhone}
                       onChange={(e) => handleFormChange('contactPhone', e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                       placeholder="Ej: +1 809-555-0100"
                     />
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Estado
                     </label>
                     <select
                       value={newSupplierForm.status}
                       onChange={(e) => handleFormChange('status', e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                     >
                       <option>Activo</option>
                       <option>Pendiente</option>
                       <option>Inactivo</option>
                       <option>Bloqueado</option>
                     </select>
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Términos de Pago
                     </label>
                     <select
                       value={newSupplierForm.paymentTerms}
                       onChange={(e) => handleFormChange('paymentTerms', e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                     >
                       <option>15 días</option>
                       <option>30 días</option>
                       <option>45 días</option>
                       <option>60 días</option>
                       <option>90 días</option>
                     </select>
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Límite de Crédito
                     </label>
                     <input
                       type="number"
                       value={newSupplierForm.creditLimit}
                       onChange={(e) => handleFormChange('creditLimit', parseFloat(e.target.value) || 0)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                       placeholder="0"
                     />
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       ID Fiscal
                     </label>
                     <input
                       type="text"
                       value={newSupplierForm.taxId}
                       onChange={(e) => handleFormChange('taxId', e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                       placeholder="Ej: 123-456-789"
                     />
                   </div>
                 </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas
                  </label>
                  <textarea
                    value={newSupplierForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Información adicional sobre el proveedor..."
                  />
                </div>
              </div>

              {/* Botones del formulario */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Crear Proveedor
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
                 </div>
       )}

                       {/* Modal para ver proveedor */}
         {showViewSupplierModal && selectedSupplier && (
           <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-content">
             {/* Header del modal */}
             <div className="flex items-center justify-between p-6 border-b border-gray-200">
               <h2 className="text-2xl font-bold text-gray-900">Detalles del Proveedor</h2>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={handleCloseViewModal}
                 className="text-gray-400 hover:text-gray-600"
               >
                 <X className="w-6 h-6" />
               </Button>
             </div>

             {/* Contenido del modal */}
             <div className="p-6 space-y-6">
               {/* Información básica */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Proveedor</label>
                   <p className="text-lg text-gray-900">{selectedSupplier.name}</p>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                   <p className="text-lg text-gray-900">{selectedSupplier.category}</p>
                 </div>
               </div>

               

                               {/* Dirección */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Dirección
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dirección Completa</label>
                    <p className="text-lg text-gray-900">{selectedSupplier.address || 'N/A'}</p>
                  </div>
                </div>

                               {/* Información adicional */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Información Adicional
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de Contacto</label>
                      <p className="text-lg text-gray-900">{selectedSupplier.contactName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Número de Teléfono</label>
                      <p className="text-lg text-gray-900">{selectedSupplier.contactPhone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                      <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(selectedSupplier.status)}`}>
                        {selectedSupplier.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Calificación</label>
                      <p className="text-lg text-gray-900">
                        {selectedSupplier.rating ? `${selectedSupplier.rating}/5.0` : 'Sin calificación'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Términos de Pago</label>
                      <p className="text-lg text-gray-900">{selectedSupplier.paymentTerms || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Límite de Crédito</label>
                      <p className="text-lg text-gray-900">
                        {selectedSupplier.creditLimit ? `$${selectedSupplier.creditLimit.toLocaleString()}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ID Fiscal</label>
                      <p className="text-lg text-gray-900">{selectedSupplier.taxId || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Último Pedido</label>
                      <p className="text-lg text-gray-900">{formatDate(selectedSupplier.lastOrder)}</p>
                    </div>
                  </div>
                 {selectedSupplier.notes && (
                   <div className="mt-4">
                     <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
                     <p className="text-lg text-gray-900">{selectedSupplier.notes}</p>
                   </div>
                 )}
               </div>

               {/* Botones del modal */}
               <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                 <Button
                   variant="outline"
                   onClick={handleCloseViewModal}
                 >
                   Cerrar
                 </Button>
                 <Button
                   className="bg-purple-600 hover:bg-purple-700"
                   onClick={() => {
                     handleCloseViewModal();
                     handleEditSupplier(selectedSupplier);
                   }}
                 >
                   <Edit className="w-4 h-4 mr-2" />
                   Editar
                 </Button>
               </div>
             </div>
           </div>
         </div>
       )}

               {/* Modal para editar proveedor */}
        {showEditSupplierModal && selectedSupplier && (
          <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-content">
             {/* Header del modal */}
             <div className="flex items-center justify-between p-6 border-b border-gray-200">
               <h2 className="text-2xl font-bold text-gray-900">Editar Proveedor</h2>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={handleCloseEditModal}
                 className="text-gray-400 hover:text-gray-600"
               >
                 <X className="w-6 h-6" />
               </Button>
             </div>

             {/* Formulario de edición */}
             <form onSubmit={handleSubmitEditForm} className="p-6 space-y-6">
               {/* Información básica */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Nombre del Proveedor *
                 </label>
                 <input
                   type="text"
                   value={editSupplierForm.name}
                   onChange={(e) => handleEditFormChange('name', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                   placeholder="Ej: Beauty Supplies Co."
                 />
               </div>

               

                               {/* Dirección */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Dirección
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección Completa
                    </label>
                    <textarea
                      value={editSupplierForm.address}
                      onChange={(e) => handleEditFormChange('address', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ej: Calle Principal 123, Santo Domingo, Distrito Nacional, 10101"
                    />
                  </div>
                </div>

                               {/* Información adicional */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Información Adicional
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de Contacto
                      </label>
                      <input
                        type="text"
                        value={editSupplierForm.contactName}
                        onChange={(e) => handleEditFormChange('contactName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Ej: Juan Pérez"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Teléfono
                      </label>
                      <input
                        type="tel"
                        value={editSupplierForm.contactPhone}
                        onChange={(e) => handleEditFormChange('contactPhone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Ej: +1 809-555-0100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      <select
                        value={editSupplierForm.status}
                        onChange={(e) => handleEditFormChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option>Activo</option>
                        <option>Pendiente</option>
                        <option>Inactivo</option>
                        <option>Bloqueado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Términos de Pago
                      </label>
                      <select
                        value={editSupplierForm.paymentTerms}
                        onChange={(e) => handleEditFormChange('paymentTerms', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option>15 días</option>
                        <option>30 días</option>
                        <option>45 días</option>
                        <option>60 días</option>
                        <option>90 días</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Límite de Crédito
                      </label>
                      <input
                        type="number"
                        value={editSupplierForm.creditLimit}
                        onChange={(e) => handleEditFormChange('creditLimit', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Fiscal
                      </label>
                      <input
                        type="text"
                        value={editSupplierForm.taxId}
                        onChange={(e) => handleEditFormChange('taxId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Ej: 123-456-789"
                      />
                    </div>
                  </div>

                 <div className="mt-4">
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Notas
                   </label>
                   <textarea
                     value={editSupplierForm.notes}
                     onChange={(e) => handleEditFormChange('notes', e.target.value)}
                     rows={3}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                     placeholder="Información adicional sobre el proveedor..."
                   />
                 </div>
               </div>

               {/* Botones del formulario */}
               <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                 <Button
                   type="button"
                   variant="outline"
                   onClick={handleCloseEditModal}
                   disabled={isSubmitting}
                 >
                   Cancelar
                 </Button>
                 <Button
                   type="submit"
                   className="bg-purple-600 hover:bg-purple-700"
                   disabled={isSubmitting}
                 >
                   {isSubmitting ? (
                     <>
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                       Actualizando...
                     </>
                   ) : (
                     <>
                       <Save className="w-4 h-4 mr-2" />
                       Actualizar Proveedor
                     </>
                   )}
                 </Button>
               </div>
             </form>
           </div>
         </div>
       )}
     </div>
   );
 }
